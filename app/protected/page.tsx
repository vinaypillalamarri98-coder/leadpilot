import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveBusinessProfile, createAndAnalyzeLead } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { SubmitButton } from "@/components/submit-button";
import {
  RealtimeLeadsList,
  type LeadItem,
} from "@/components/realtime-leads-list";

async function LeadPilotWorkspace() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: rawLeads } = business
    ? await supabase
        .from("leads")
        .select("*, messages(*)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const leads = (rawLeads ?? []) as LeadItem[];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">LeadPilot</h1>
          <p className="text-sm text-gray-500">Signed in as {user.email}</p>
        </div>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Business Profile */}
      <section className="space-y-4 rounded-lg border p-5">
        <div>
          <h2 className="text-lg font-semibold">
            {business ? "Business Settings" : "Step 1: Set Up Your Business"}
          </h2>
          <p className="text-sm text-gray-500">
            LeadPilot uses this context and your knowledge base to answer customer questions accurately.
          </p>
        </div>

        <form action={saveBusinessProfile} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Business Name *</label>
            <input
              name="name"
              required
              defaultValue={business?.name ?? ""}
              placeholder="e.g. Peak Dental Clinic"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Industry</label>
            <input
              name="industry"
              defaultValue={business?.industry ?? ""}
              placeholder="e.g. Dental, Real Estate, Agency"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              name="phone"
              defaultValue={business?.phone ?? ""}
              placeholder="e.g. +91 98765 43210"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reply Tone</label>
            <input
              name="tone"
              defaultValue={business?.tone ?? "friendly and professional"}
              placeholder="friendly and professional"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Company Knowledge Base (Services, Pricing, Timings & FAQs)
            </label>
            <textarea
              name="knowledge_base"
              rows={5}
              defaultValue={business?.knowledge_base ?? ""}
              placeholder={"Example:\n- Teeth Cleaning & Scaling: ₹1,500 (takes 30 mins)\n- Teeth Whitening: ₹6,500\n- Timings: Mon–Sat, 10:00 AM to 8:00 PM (Closed Sundays)\n- Location: Banjara Hills Road No. 12, Hyderabad"}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton
              label={business ? "Update Business Profile" : "Save Business Profile"}
              pendingLabel="Saving..."
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            />
          </div>
        </form>
      </section>

      {/* Public Inquiry Link */}
      {business && (
        <section className="space-y-2 rounded-lg border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Public Inquiry Form Link</h2>
              <p className="text-sm text-gray-500">
                Share this link with customers—submissions create leads and draft replies automatically.
              </p>
            </div>
            <CopyButton
              text={`https://leadpilot-pa3k.vercel.app/lead/${business.id}`}
            />
          </div>
          <p className="break-all rounded bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
            /lead/{business.id}
          </p>
        </section>
      )}

      {/* New Incoming Lead */}
      {business && (
        <section className="space-y-4 rounded-lg border p-5">
          <div>
            <h2 className="text-lg font-semibold">New Incoming Lead</h2>
            <p className="text-sm text-gray-500">
              Paste a customer message or inquiry—Gemini will extract details, score urgency, and draft a reply.
            </p>
          </div>

          <form action={createAndAnalyzeLead} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Lead Name</label>
                <input
                  name="leadName"
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Contact (Phone / Email)</label>
                <input
                  name="contact"
                  placeholder="e.g. priya@example.com"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Customer Message *</label>
              <textarea
                name="message"
                required
                rows={3}
                placeholder="Hi, do you have any slots tomorrow morning for teeth cleaning? Looking for something under ₹2,500."
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <SubmitButton
              label="Analyze Lead & Draft Reply"
              pendingLabel="Analyzing..."
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            />
          </form>
        </section>
      )}

      {/* Realtime Leads List */}
      <RealtimeLeadsList businessId={business?.id ?? null} initialLeads={leads} />
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-6 text-sm text-gray-500">
          Loading LeadPilot...
        </div>
      }
    >
      <LeadPilotWorkspace />
    </Suspense>
  );
}
