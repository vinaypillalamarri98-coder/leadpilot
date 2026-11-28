import { Resend } from "resend";

export interface LeadAlertPayload {
  toEmail?: string | null;
  businessName: string;
  leadName: string;
  contact?: string | null;
  source?: string | null;
  urgency?: "low" | "normal" | "high" | "urgent" | string | null;
  score?: number | string | null;
  leadPhone?: string | null;
  leadEmail?: string | null;
  serviceNeeded?: string | null;
  preferredTime?: string | null;
  budget?: string | null;
  message: string;
  replyDraft: string;
  sourceChannel?: "web" | "whatsapp";
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendNewLeadEmail(payload: LeadAlertPayload) {
  const resend = getResendClient();
  if (!resend) {
    return { skipped: true as const };
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "LeadPilot <onboarding@resend.dev>";
  const to = process.env.ALERT_EMAIL || payload.toEmail;
  if (!to) {
    return { skipped: true as const };
  }

  const channelLabel =
    payload.sourceChannel === "whatsapp" ? "WhatsApp" : "Lead Form";

  const subject = `New ${channelLabel} lead: ${payload.leadName} (${payload.businessName})`;

  const text = [
    `New lead received for ${payload.businessName} via ${channelLabel}.`,
    "",
    `Name: ${payload.leadName}`,
    `Contact: ${payload.contact || "Not specified"}`,
    `Source: ${payload.source || channelLabel}`,
    `Urgency: ${payload.urgency || "Not specified"}`,
    `Score: ${payload.score ?? "Not specified"}`,
    `Phone: ${payload.leadPhone || "Not specified"}`,
    `Email: ${payload.leadEmail || "Not specified"}`,
    `Service: ${payload.serviceNeeded || "Not specified"}`,
    `Preferred Time: ${payload.preferredTime || "Not specified"}`,
    `Budget: ${payload.budget || "Not specified"}`,
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
    return { error };
  }

  return { sent: true as const };
}