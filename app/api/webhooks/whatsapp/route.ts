import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { analyzeLeadAndDraftReply } from "@/lib/gemini";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { sendNewLeadEmail } from "@/lib/resend";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token && expectedToken && token === expectedToken) {
    return new NextResponse(challenge ?? "OK", { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: {
          phone_number_id?: string;
        };
        contacts?: Array<{
          wa_id?: string;
          profile?: { name?: string };
        }>;
        messages?: Array<{
          id?: string;
          from?: string;
          type?: string;
          text?: { body?: string };
        }>;
      };
    }>;
  }>;
}

export async function POST(req: NextRequest) {
  let payload: WhatsAppWebhookPayload;
  try {
    payload = (await req.json()) as WhatsAppWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const entries = payload.entry ?? [];

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      const messages = value?.messages ?? [];
      const contacts = value?.contacts ?? [];

      if (!phoneNumberId || messages.length === 0) continue;

      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("*")
        .eq("whatsapp_phone_number_id", phoneNumberId)
        .maybeSingle();

      if (bizError || !business) {
        console.warn("No business matched WhatsApp phone_number_id:", phoneNumberId);
        continue;
      }

      for (const msg of messages) {
        const externalId = msg.id;
        const senderPhone = msg.from;
        const incomingText =
          msg.type === "text" ? msg.text?.body?.trim() : `[Unsupported ${msg.type ?? "message"} type]`;

        if (!senderPhone || !incomingText) continue;

        // Skip duplicate webhook deliveries
        if (externalId) {
          const { data: existingMsg } = await supabase
            .from("messages")
            .select("id")
            .eq("external_id", externalId)
            .maybeSingle();

          if (existingMsg) continue;
        }

        const contactMatch = contacts.find((c) => c.wa_id === senderPhone);
        const customerName =
          contactMatch?.profile?.name?.trim() || `WhatsApp (${senderPhone})`;

        const analysis = await analyzeLeadAndDraftReply({
          businessName: business.name,
          industry: business.industry,
          tone: business.tone,
          knowledgeBase: business.knowledge_base,
          leadName: customerName,
          message: incomingText,
        });

        // Find existing lead by phone for this business or create a new one
        const { data: existingLead } = await supabase
          .from("leads")
          .select("id, score")
          .eq("business_id", business.id)
          .eq("phone", senderPhone)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        let leadId: string;
        const isNewLead = !existingLead;

        if (existingLead) {
          leadId = existingLead.id;
          await supabase
            .from("leads")
            .update({
              name: contactMatch?.profile?.name?.trim() || undefined,
              service_needed: analysis.service_needed,
              message: incomingText,
              location: analysis.location,
              urgency: analysis.urgency,
              preferred_time: analysis.preferred_time,
              budget: analysis.budget,
              score: Math.max(existingLead.score ?? 0, analysis.score),
            })
            .eq("id", leadId);
        } else {
          const { data: createdLead, error: createErr } = await supabase
            .from("leads")
            .insert({
              business_id: business.id,
              name: customerName,
              phone: senderPhone,
              source: "whatsapp",
              service_needed: analysis.service_needed,
              message: incomingText,
              location: analysis.location,
              urgency: analysis.urgency,
              preferred_time: analysis.preferred_time,
              budget: analysis.budget,
              score: analysis.score,
              status: "new",
            })
            .select("id")
            .single();

          if (createErr || !createdLead) {
            console.error("Failed to create WhatsApp lead:", createErr);
            continue;
          }
          leadId = createdLead.id;
        }

        // Save inbound customer message
        await supabase.from("messages").insert({
          lead_id: leadId,
          direction: "inbound",
          channel: "whatsapp",
          content: incomingText,
          ai_generated: false,
          status: "received",
          external_id: externalId ?? null,
        });

        // Send automated WhatsApp reply if enabled for this business
        let outboundStatus: "sent" | "draft" | "failed" = "draft";
        let outboundExternalId: string | null = null;

        if (business.whatsapp_enabled) {
          const sendRes = await sendWhatsAppMessage({
            phoneNumberId,
            to: senderPhone,
            body: analysis.reply_draft,
            accessToken: business.whatsapp_access_token,
          });

          if (sendRes.ok) {
            outboundStatus = "sent";
            outboundExternalId = sendRes.messageId ?? null;
          } else {
            outboundStatus = "failed";
            console.error("WhatsApp auto-reply failed:", sendRes.error);
          }
        }

        // Save AI reply (sent or draft)
        await supabase.from("messages").insert({
          lead_id: leadId,
          direction: "outbound",
          channel: "whatsapp",
          content: analysis.reply_draft,
          ai_generated: true,
          status: outboundStatus,
          external_id: outboundExternalId,
        });

        if (isNewLead) {
          try {
            await sendNewLeadEmail({
              businessName: business.name,
              leadName: customerName,
              contact: senderPhone,
              source: "whatsapp",
              serviceNeeded: analysis.service_needed,
              urgency: analysis.urgency,
              preferredTime: analysis.preferred_time,
              budget: analysis.budget,
              score: analysis.score,
              message: incomingText,
              replyDraft: analysis.reply_draft,
            });
          } catch (emailErr) {
            console.error("WhatsApp lead email alert failed:", emailErr);
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}