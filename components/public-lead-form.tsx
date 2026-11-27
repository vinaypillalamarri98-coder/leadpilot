"use client";

import { useState, type FormEvent } from "react";
import { submitPublicLeadAction, type PublicLeadResult } from "@/app/actions";

interface PublicLeadFormProps {
  businessId: string;
  businessName: string;
}

export function PublicLeadForm({
  businessId,
  businessName,
}: PublicLeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PublicLeadResult | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await submitPublicLeadAction(businessId, null, formData);
      setResult(res);
    } catch (err) {
      setResult({
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setResult(null);
    setFormKey((prev) => prev + 1);
  }

  return (
    <div className="space-y-5">
      {isSubmitting && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100"
        >
          <span
            aria-hidden="true"
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-500 border-t-white"
          />
          <span>Sending your inquiry and generating an instant reply...</span>
        </div>
      )}

      {result && !isSubmitting && !result.ok && result.error && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-700 bg-red-950/50 p-4 text-sm text-red-200"
        >
          {result.error}
        </div>
      )}

      {result && !isSubmitting && result.ok && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-emerald-700 bg-emerald-950/40 p-5 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-emerald-300">
              Inquiry Received — Instant Reply
            </h2>
            {result.serviceNeeded && (
              <span className="rounded bg-emerald-900/70 px-2 py-0.5 text-xs text-emerald-200">
                {result.serviceNeeded}
              </span>
            )}
          </div>

          <p className="text-sm text-zinc-200">
            Thanks for reaching out to {businessName}. Here is our response:
          </p>

          <blockquote className="rounded-md border border-emerald-800/70 bg-black/60 p-3.5 text-sm text-white leading-relaxed">
            {result.replyDraft}
          </blockquote>

          <button
            type="button"
            onClick={handleReset}
            className="mt-1 inline-flex min-h-10 items-center rounded-lg border border-emerald-600/60 px-3.5 py-2 text-xs font-medium text-emerald-200 transition hover:bg-emerald-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 cursor-pointer"
          >
            Send another inquiry
          </button>
        </div>
      )}

      {!result?.ok && (
        <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="leadName"
              className="mb-1.5 block text-sm font-medium text-zinc-200"
            >
              Your Name
            </label>
            <input
              id="leadName"
              name="leadName"
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
              placeholder="e.g. Rahul Verma"
              className="w-full rounded-lg border border-zinc-700 bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 disabled:opacity-60 focus:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="mb-1.5 block text-sm font-medium text-zinc-200"
            >
              Phone or Email
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              autoComplete="email"
              disabled={isSubmitting}
              placeholder="e.g. +91 98765 43210 or rahul@example.com"
              className="w-full rounded-lg border border-zinc-700 bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 disabled:opacity-60 focus:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block text-sm font-medium text-zinc-200"
            >
              How can we help? <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              aria-required="true"
              rows={4}
              disabled={isSubmitting}
              placeholder="Tell us what service you need, preferred timing, or budget..."
              className="w-full rounded-lg border border-zinc-700 bg-black px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 disabled:opacity-60 focus:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="min-h-11 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          >
            {isSubmitting && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-black"
              />
            )}
            <span>{isSubmitting ? "Generating Reply..." : "Send Inquiry"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
