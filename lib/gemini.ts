import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});

export interface LeadAnalysis {
  service_needed: string;
  location: string | null;
  urgency: "low" | "normal" | "high" | "urgent";
  preferred_time: string | null;
  budget: string | null;
  score: number;
  reply_draft: string;
}

// Lightweight flash-lite first for fast scoring/replies, with flash fallback
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"] as const;

const FALLBACK_ANALYSIS: LeadAnalysis = {
  service_needed: "General inquiry",
  location: null,
  urgency: "normal",
  preferred_time: null,
  budget: null,
  score: 50,
  reply_draft:
    "Thanks for reaching out! We've received your inquiry and will get back to you shortly.",
};

export async function analyzeLeadAndDraftReply(params: {
  businessName: string;
  industry?: string | null;
  tone?: string | null;
  knowledgeBase?: string | null;
  leadName?: string | null;
  message: string;
}): Promise<LeadAnalysis> {
  const businessName = params.businessName.trim();
  const industry = params.industry?.trim() || "general business";
  const tone = params.tone?.trim() || "friendly and professional";
  const knowledgeBase = params.knowledgeBase?.trim() || "";
  const leadName = params.leadName?.trim() || "Customer";
  const message = params.message.trim();

  const kbSection = knowledgeBase
    ? `\n\nCompany Knowledge Base (use these exact prices, services, timings, and policies when answering—do not invent facts outside this):\n${knowledgeBase}`
    : "";

  const systemInstruction = `You are LeadPilot's fast AI assistant for "${businessName}" (${industry}).
Match a ${tone} tone. Keep reply_draft concise (2-4 sentences), helpful, accurate, and ready to send.
Extract accurate details only when present; use null when missing.${kbSection}`;

  const prompt = `Customer: ${leadName}
Inquiry: ${message}`;

  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 400,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              service_needed: { type: Type.STRING },
              location: { type: Type.STRING, nullable: true },
              urgency: {
                type: Type.STRING,
                enum: ["low", "normal", "high", "urgent"],
              },
              preferred_time: { type: Type.STRING, nullable: true },
              budget: { type: Type.STRING, nullable: true },
              score: { type: Type.INTEGER },
              reply_draft: { type: Type.STRING },
            },
            required: ["service_needed", "urgency", "score", "reply_draft"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      const parsed = JSON.parse(text) as Partial<LeadAnalysis>;

      return {
        service_needed: parsed.service_needed || FALLBACK_ANALYSIS.service_needed,
        location: parsed.location ?? null,
        urgency: parsed.urgency ?? "normal",
        preferred_time: parsed.preferred_time ?? null,
        budget: parsed.budget ?? null,
        score:
          typeof parsed.score === "number"
            ? Math.max(1, Math.min(100, Math.round(parsed.score)))
            : 50,
        reply_draft: parsed.reply_draft || FALLBACK_ANALYSIS.reply_draft,
      };
    } catch (err) {
      lastError = err;
    }
  }

  console.error("LeadPilot Gemini analysis failed across models:", lastError);
  return FALLBACK_ANALYSIS;
}