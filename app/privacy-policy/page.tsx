import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-14 max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-emerald-400 hover:underline">
        ← Back to LeadPilot
      </Link>

      <h1 className="text-3xl font-bold mt-4">Privacy Policy</h1>
      <p className="text-xs text-slate-400 mt-1">Last updated: November 28, 2026</p>

      <div className="mt-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h2>
          <p>
            LeadPilot collects business profile details, service information, and FAQs provided by business accounts, along with customer phone numbers, messages, and lead details processed through connected WhatsApp Business accounts to generate automated AI replies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. How We Use Data</h2>
          <p>
            We use this information solely to run automated WhatsApp replies, capture inquiries for the relevant business account, maintain service reliability, and provide customer support. We do not sell customer lead lists to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. WhatsApp & Third-Party Services</h2>
          <p>
            Messages sent through connected WhatsApp numbers are processed via the Meta WhatsApp Cloud API and AI model providers to generate responses. Messaging fees charged by Meta are billed according to Meta&apos;s policies and rates.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Data Retention & Deletion</h2>
          <p>
            Business owners can request updates or deletion of their account data and captured leads by contacting our support team.
          </p>
        </section>
      </div>
    </main>
  );
}