import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  saveBusinessProfile,
  createAndAnalyzeLead,
  updateLeadStatus,
  deleteLead,
} from "@/app/actions";
import { CopyButton } from "@/components/copy-button";

interface LeadMessage {
  id: string;
  direction: string;
  content: string;
  ai_generated: boolean;
  status: string;
}

interface LeadItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  service_needed: string | null;
  location: string | null;
  urgency: string | null;
  preferred_time: string | null;
  budget: string | null;
  score: number | null;
  status: string | null;
  messages: LeadMessage[] | null;
}

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

      {/* Business Profile / Onboarding */}
      <section className="rounded-lg border p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            {business ? "Business Settings" : "Step 1: Set Up Your Business"}
          </h2>
          <p className="text-sm text-gray-500">
            LeadPilot uses this context to score leads and write replies in your voice.
          </p>
        </div>

        <form action={saveBusinessProfile} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Business Name *</label>
            <input
              name="name"
              required
              defaultValue={business?.name ?? ""}
              placeholder="e.g. Peak Dental Clinic"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <input
              name="industry"
              defaultValue={business?.industry ?? ""}
              placeholder="e.g. Dental, Real Estate, Agency"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              defaultValue={business?.phone ?? ""}
              placeholder="e.g. +91 98765 43210"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reply Tone</label>
            <input
              name="tone"
              defaultValue={business?.tone ?? "friendly and professional"}
              placeholder="friendly and professional"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              {business ? "Update Business Profile" : "Save Business Profile"}
            </button>
          </div>
        </form>
      </section>

      {/* Add & Analyze New Lead */}
      {business && (
        <section className="rounded-lg border p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">New Incoming Lead</h2>
            <p className="text-sm text-gray-500">
              Paste a customer message or inquiry—Gemini will extract details, score urgency, and draft a reply.
            </p>
          </div>

          <form action={createAndAnalyzeLead} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Lead Name</label>
                <input
                  name="leadName"
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact (Phone / Email)</label>
                <input
                  name="contact"
                  placeholder="e.g. priya@example.com"
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Message *</label>
              <textarea
                name="message"
                required
                rows={3}
                placeholder="Hi, do you have any slots tomorrow morning for teeth cleaning? Looking for something under ₹2,500."
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Analyze Lead & Draft Reply
            </button>
          </form>
        </section>
      )}

      {/* Leads List */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Leads ({leads.length})</h2>
        {leads.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            No leads yet. Save your business profile above and add your first inquiry.
          </p>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => {
              const draft = lead.messages?.find((m) => m.ai_generated);
              const contactDisplay = lead.email || lead.phone;
              return (
                <div key={lead.id} className="rounded-lg border p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{lead.name}</h3>
                      {contactDisplay && (
                        <p className="text-xs text-gray-500">{contactDisplay}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                      <span className="rounded bg-gray-100 px-2.5 py-1 text-gray-900">
                        Score: {lead.score ?? "—"}/100
                      </span>
                      <span className="rounded bg-gray-100 px-2.5 py-1 capitalize text-gray-900">
                        Urgency: {lead.urgency ?? "normal"}
                      </span>

                      <form action={updateLeadStatus} className="flex items-center gap-1">
                        <input type="hidden" name="leadId" value={lead.id} />
                        <select
                          name="status"
                          defaultValue={lead.status || "new"}
                          className="rounded border bg-transparent px-2 py-1 text-xs"
                        >
                          <option value="new" className="text-black">New</option>
                          <option value="contacted" className="text-black">Contacted</option>
                          <option value="booked" className="text-black">Booked</option>
                          <option value="closed" className="text-black">Closed</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-800"
                        >
                          Save
                        </button>
                      </form>

                      <form action={deleteLead}>
                        <input type="hidden" name="leadId" value={lead.id} />
                        <button
                          type="submit"
                          className="rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-950"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <span className="text-gray-500">Service: </span>
                      <span>{lead.service_needed || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Timing: </span>
                      <span>{lead.preferred_time || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Budget: </span>
                      <span>{lead.budget || "—"}</span>
                    </div>
                  </div>

                  {draft && (
                    <div className="rounded bg-gray-900 p-3 text-sm text-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase text-gray-400">
                          AI Drafted Reply
                        </p>
                        <CopyButton text={draft.content} />
                      </div>
                      <p className="whitespace-pre-wrap">{draft.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
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