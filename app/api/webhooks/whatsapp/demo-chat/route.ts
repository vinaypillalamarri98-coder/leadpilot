import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PRESETS: Record<string, { name: string; systemInstruction: string }> = {
  clinic: {
    name: "CareWell Dental & Skin Clinic",
    systemInstruction: `You are the WhatsApp AI assistant for CareWell Dental & Skin Clinic in India.
Hours: Mon-Sat 10 AM - 8 PM, Sun closed.
Services & Fees: Dental checkup & cleaning ₹600, Root canal ₹4,500+, Skin consultation ₹500.
Goal: Answer questions concisely like a helpful WhatsApp receptionist, and ask for preferred day/time slot and patient name if they want an appointment. Keep replies short (under 90 words) and natural.`,
  },
  exports: {
    name: "Surya Exports and Imports",
    systemInstruction: `You are the WhatsApp B2B assistant for Surya Exports and Imports.
Products: Spices, agro-commodities, and industrial packaging/merchandise.
MOQ & Terms: Varies by SKU; export quotes depend on destination port, Incoterms (FOB/CIF), and volume.
Goal: Answer concisely like a WhatsApp sales rep, and ask for product name, quantity, and target city/port to prepare a quote. Keep replies short (under 90 words).`,
  },
  salon: {
    name: "Aura Salon & Academy",
    systemInstruction: `You are the WhatsApp booking assistant for Aura Salon & Academy.
Hours: Tue-Sun 10:30 AM - 8:30 PM, Mon closed.
Services: Haircut & styling from ₹499, Facial & cleanup from ₹1,200, Bridal/event packages on inquiry.
Goal: Give clear answers quickly and ask preferred service, date, and time to lock in a slot. Keep replies short (under 90 words).`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const presetKey = typeof body.preset === "string" && PRESETS[body.preset] ? body.preset : "clinic";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 500) {
      return NextResponse.json(
        { error: "Please enter a message between 1 and 500 characters." },
        { status: 400 }
      );
    }

    const preset = PRESETS[presetKey];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: preset.systemInstruction,
        temperature: 0.5,
      },
    });

    return NextResponse.json({
      reply: response.text ?? "Thanks for reaching out! How can I help you today?",
      businessName: preset.name,
    });
  } catch (err) {
    console.error("Demo chat error:", err);
    return NextResponse.json({ error: "Unable to generate demo reply right now." }, { status: 500 });
  }
}