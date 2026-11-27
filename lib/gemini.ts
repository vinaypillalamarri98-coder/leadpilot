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

export async function analyzeLeadAndDraftReply(params: {
  businessName: string;
  industry?: string | null;
  tone?: string | null;
  leadName?: string | null;
  message: string;
}): Promise<LeadAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: `You are LeadPilot, an AI lead assistant for "${params.businessName}" (${params.industry || "general business"}).
Tone: ${params.tone || "friendly and professional"}.

Analyze this incoming customer inquiry and draft a helpful reply:
Customer Name: ${params.leadName || "Customer"}
Inquiry: ${params.message}

Return JSON with:
- service_needed: concise summary of what they want
- location: city/area if mentioned, else null
- urgency: one of "low", "normal", "high", "urgent"
- preferred_time: timing/schedule if mentioned, else null
- budget: budget/price range if mentioned, else null
- score: integer 1 to 100 indicating lead intent/conversion likelihood
- reply_draft: a clear, natural reply ready to review and send`,
    config: {
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

  return JSON.parse(text) as LeadAnalysis;
}