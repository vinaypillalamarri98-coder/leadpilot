export interface SendWhatsAppParams {
  phoneNumberId: string;
  to: string;
  body: string;
  accessToken?: string | null;
}

export async function sendWhatsAppMessage({
  phoneNumberId,
  to,
  body,
  accessToken,
}: SendWhatsAppParams): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const token = accessToken?.trim() || process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const cleanRecipient = to.replace(/[^\d]/g, "");

  if (!token) {
    return { ok: false, error: "Missing WhatsApp access token" };
  }

  if (!cleanRecipient) {
    return { ok: false, error: "Invalid recipient phone number" };
  }

  const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(phoneNumberId)}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanRecipient,
      type: "text",
      text: {
        preview_url: false,
        body,
      },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    return {
      ok: false,
      error: data.error?.message || `WhatsApp API error (${res.status})`,
    };
  }

  return {
    ok: true,
    messageId: data.messages?.[0]?.id,
  };
}