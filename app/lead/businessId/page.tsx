import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { submitPublicLead } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

interface PublicLeadPageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ submitted?: string }>;
}

export default async function PublicLeadPage({
  params,
  searchParams,
}: PublicLeadPageProps) {
  const { businessId } = await params;
  const { submitted } = await searchParams;

  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, industry, phone")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    await submitPublicLead(businessId, formData);
    const { redirect } = await import("next/navigation");
    redirect(`/lead/${businessId}?submitted=1`);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-lg border border-zinc-800 bg-zinc-950 p-6 space-y-6">
        <div className="space-y-1 border-b border-zinc-800 pb-4">
          <p className="text-xs uppercase tracking-wider text-zinc-400">
            {business.industry || "Inquiry Form"}
          </p>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="text-sm text-zinc-400">
            Share what you need and our team will get back to you shortly.
          </p>
          {business.phone && (
            <p className="text-xs text-zinc-500">Direct phone: {business.phone}</p>
          )}
        </div>

        {submitted === "1" ? (
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-4 space-y-2">
            <h2 className="text-base font-semibold text-emerald-300">
              Inquiry Received
            </h2>
            <p className="text-sm text-zinc-300">
              Thanks for reaching out to {business.name}. Your message has been submitted.
            </p>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Your Name</label>
              <input
                name="leadName"
                placeholder="e.g. Rahul Verma"
                className="w-full rounded border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Phone or Email
              </label>
              <input
                name="contact"
                placeholder="e.g. +91 98765 43210 or rahul@example.com"
                className="w-full rounded border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                How can we help? *
              </label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Tell us what service you need, preferred timing, or budget..."
                className="w-full rounded border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              />
            </div>

            <SubmitButton
              label="Send Inquiry"
              pendingLabel="Submitting..."
              className="w-full rounded bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
            />
          </form>
        )}
      </div>
    </main>
  );
}