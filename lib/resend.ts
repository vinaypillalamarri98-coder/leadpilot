import { Resend } from "resend";

export interface LeadAlertPayload {
  businessName: string;
  leadName: string;
  contact: string | null;
  source: "manual" | "public_form";
  serviceNeeded: string | null;
  urgency: string | null;
  preferredTime: string | null;
  budget: string | null;
  score: number | null;
  message: string;
  replyDraft: string;
}

export async function sendNewLeadEmail(payload: LeadAlertPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey || !to) {
    return;
  }

  const resend = new Resend(apiKey);
  const subject = `New Lead (${payload.score ?? "—"}/100): ${payload.leadName} — ${payload.businessName}`;

  const text = [
    `Business: ${payload.businessName}`,
    `Source: ${payload.source === "public_form" ? "Public Inquiry Form" : "Dashboard"}`,
    `Lead: ${payload.leadName}`,
    `Contact: ${payload.contact || "Not provided"}`,
    `Score: ${payload.score ?? "—"}/100 | Urgency: ${payload.urgency || "normal"}`,
    `Service: ${payload.serviceNeeded || "—"}`,
    `Preferred Time: ${payload.preferredTime || "—"}`,
    `Budget: ${payload.budget || "—"}`,
    "",
    "Customer Message:",
    payload.message,
    "",
    "AI Drafted Reply:",
    payload.replyDraft,
  ].join("\n");

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
  });

  if (error) {
    console.error("Failed to send Resend lead alert:", error);
  }
}
