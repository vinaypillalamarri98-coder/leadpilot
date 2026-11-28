"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { analyzeLeadAndDraftReply } from "@/lib/gemini";
import { sendNewLeadEmail } from "@/lib/resend";

export async function saveBusinessProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const name = String(formData.get("name") || "").trim();
  const industry = String(formData.get("industry") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const tone = String(formData.get("tone") || "friendly and professional").trim();
  const knowledgeBase = String(formData.get("knowledge_base") || "").trim();

  if (!name) throw new Error("Business name is required");

  const payload = {
    owner_id: user.id,
    name,
    industry: industry || null,
    phone: phone || null,
    tone,
    knowledge_base: knowledgeBase || null,
  };

  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("businesses").update(payload).eq("id", existing.id)
    : await supabase.from("businesses").insert(payload);

  if (error) throw new Error(error.message);

  revalidatePath("/protected");
}

export async function createAndAnalyzeLead(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const leadName = String(formData.get("leadName") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!message) throw new Error("Inquiry message is required");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!business) throw new Error("Please save your business profile first");

  const analysis = await analyzeLeadAndDraftReply({
    businessName: business.name,
    industry: business.industry,
    tone: business.tone,
    knowledgeBase: business.knowledge_base,
    leadName: leadName || null,
    message,
  });

  const isEmail = contact.includes("@");

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      business_id: business.id,
      name: leadName || "Customer",
      email: isEmail ? contact : null,
      phone: !isEmail && contact ? contact : null,
      source: "manual",
      service_needed: analysis.service_needed,
      message,
      location: analysis.location,
      urgency: analysis.urgency,
      preferred_time: analysis.preferred_time,
      budget: analysis.budget,
      score: analysis.score,
      status: "new",
    })
    .select()
    .single();

  if (leadError || !lead) {
    throw new Error(leadError?.message || "Failed to create lead");
  }

  const { error: msgError } = await supabase.from("messages").insert([
    {
      lead_id: lead.id,
      direction: "inbound",
      channel: isEmail ? "email" : "whatsapp",
      content: message,
      ai_generated: false,
      status: "received",
    },
    {
      lead_id: lead.id,
      direction: "outbound",
      channel: isEmail ? "email" : "whatsapp",
      content: analysis.reply_draft,
      ai_generated: true,
      status: "draft",
    },
  ]);

  if (msgError) throw new Error(msgError.message);

  try {
    await sendNewLeadEmail({
      businessName: business.name,
      leadName: leadName || "Customer",
      contact: contact || null,
      source: "manual",
      serviceNeeded: analysis.service_needed,
      urgency: analysis.urgency,
      preferredTime: analysis.preferred_time,
      budget: analysis.budget,
      score: analysis.score,
      message,
      replyDraft: analysis.reply_draft,
    });
  } catch (err) {
    console.error("Lead email notification error:", err);
  }

  revalidatePath("/protected");
}

export async function updateLeadStatus(formData: FormData) {
  const supabase = await createClient();
  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "new");

  if (!leadId) return;

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/protected");
}

export async function deleteLead(formData: FormData) {
  const supabase = await createClient();
  const leadId = String(formData.get("leadId") || "");

  if (!leadId) return;

  await supabase.from("messages").delete().eq("lead_id", leadId);
  const { error } = await supabase.from("leads").delete().eq("id", leadId);

  if (error) throw new Error(error.message);

  revalidatePath("/protected");
}

export interface PublicLeadResult {
  ok: boolean;
  error?: string;
  replyDraft?: string;
  serviceNeeded?: string;
}

export async function submitPublicLeadAction(
  businessId: string,
  _prevState: PublicLeadResult | null,
  formData: FormData
): Promise<PublicLeadResult> {
  if (!businessId) {
    return { ok: false, error: "Missing business ID." };
  }

  const leadName = String(formData.get("leadName") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!message) {
    return { ok: false, error: "Please enter your message or requirement." };
  }

  const supabase = await createClient();

  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id, name, industry, tone, knowledge_base")
    .eq("id", businessId)
    .maybeSingle();

  if (bizError || !business) {
    return { ok: false, error: "Business not found." };
  }

  const analysis = await analyzeLeadAndDraftReply({
    businessName: business.name,
    industry: business.industry,
    tone: business.tone,
    knowledgeBase: business.knowledge_base,
    leadName: leadName || null,
    message,
  });

  const isEmail = contact.includes("@");

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      business_id: business.id,
      name: leadName || "Customer",
      email: isEmail ? contact : null,
      phone: !isEmail && contact ? contact : null,
      source: "public_form",
      service_needed: analysis.service_needed,
      message,
      location: analysis.location,
      urgency: analysis.urgency,
      preferred_time: analysis.preferred_time,
      budget: analysis.budget,
      score: analysis.score,
      status: "new",
    })
    .select("id")
    .single();

  if (leadError || !lead) {
    return {
      ok: false,
      error: leadError?.message || "Failed to submit inquiry.",
    };
  }

  const { error: msgError } = await supabase.from("messages").insert([
    {
      lead_id: lead.id,
      direction: "inbound",
      channel: isEmail ? "email" : "whatsapp",
      content: message,
      ai_generated: false,
      status: "received",
    },
    {
      lead_id: lead.id,
      direction: "outbound",
      channel: isEmail ? "email" : "whatsapp",
      content: analysis.reply_draft,
      ai_generated: true,
      status: "draft",
    },
  ]);

  if (msgError) {
    return { ok: false, error: msgError.message };
  }

  try {
    await sendNewLeadEmail({
      businessName: business.name,
      leadName: leadName || "Customer",
      contact: contact || null,
      source: "public_form",
      serviceNeeded: analysis.service_needed,
      urgency: analysis.urgency,
      preferredTime: analysis.preferred_time,
      budget: analysis.budget,
      score: analysis.score,
      message,
      replyDraft: analysis.reply_draft,
    });
  } catch (err) {
    console.error("Lead email notification error:", err);
  }

  revalidatePath("/protected");

  return {
    ok: true,
    replyDraft: analysis.reply_draft,
    serviceNeeded: analysis.service_needed,
  };
}

export async function submitPublicLead(businessId: string, formData: FormData) {
  const result = await submitPublicLeadAction(businessId, null, formData);
  if (!result.ok) {
    throw new Error(result.error || "Failed to submit inquiry");
  }
}
