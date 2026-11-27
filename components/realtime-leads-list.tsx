"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateLeadStatus, deleteLead } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { SubmitButton } from "@/components/submit-button";

export interface LeadMessage {
  id: string;
  direction: string;
  content: string;
  ai_generated: boolean;
  status: string;
}

export interface LeadItem {
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

interface RealtimeLeadsListProps {
  businessId: string | null;
  initialLeads: LeadItem[];
}

export function RealtimeLeadsList({
  businessId,
  initialLeads,
}: RealtimeLeadsListProps) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "offline">(
    businessId ? "connecting" : "offline"
  );

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const refreshLeads = useCallback(async () => {
    if (!businessId) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*, messages(*)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLeads(data as LeadItem[]);
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`leads-realtime-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          void refreshLeads();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          void refreshLeads();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setLiveStatus("live");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setLiveStatus("offline");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [businessId, refreshLeads]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Leads ({leads.length})</h2>
        {businessId && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                liveStatus === "live"
                  ? "bg-emerald-500"
                  : liveStatus === "connecting"
                    ? "bg-amber-400"
                    : "bg-gray-400"
              }`}
            />
            {liveStatus === "live"
              ? "Live updates on"
              : liveStatus === "connecting"
                ? "Connecting..."
                : "Offline"}
          </span>
        )}
      </div>

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
              <div key={lead.id} className="space-y-3 rounded-lg border p-5">
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
                        <option value="new" className="text-black">
                          New
                        </option>
                        <option value="contacted" className="text-black">
                          Contacted
                        </option>
                        <option value="booked" className="text-black">
                          Booked
                        </option>
                        <option value="closed" className="text-black">
                          Closed
                        </option>
                      </select>
                      <SubmitButton
                        label="Save"
                        pendingLabel="Saving..."
                        className="rounded border px-2 py-1 text-xs hover:bg-gray-800"
                      />
                    </form>

                    <form action={deleteLead}>
                      <input type="hidden" name="leadId" value={lead.id} />
                      <SubmitButton
                        label="Delete"
                        pendingLabel="Deleting..."
                        className="rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-950"
                      />
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
                  <div className="space-y-2 rounded bg-gray-900 p-3 text-sm text-gray-100">
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
  );
}
