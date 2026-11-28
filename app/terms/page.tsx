import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-14 max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-emerald-400 hover:underline">
        ← Back to LeadPilot
      </Link>

      <h1 className="text-3xl font-bold mt-4">Terms &amp; Conditions</h1>
      <p className="text-xs text-slate-400 mt-1">Last updated: November 28, 2026</p>

      <div className="mt-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Service &amp; Plans</h2>
          <p>
            LeadPilot provides software tools for automated WhatsApp AI replies and lead capture across 1-month, 6-month, and 12-month plans, subject to the monthly AI reply limits of the selected tier.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Billing &amp; Meta Messaging Fees</h2>
          <p>
            Subscription fees paid to LeadPilot cover platform access and AI bot usage under your plan. Any WhatsApp messaging charges billed by Meta apply separately to the connected WhatsApp Business Account according to Meta&apos;s official rates and rules.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. Customer Responsibility</h2>
          <p>
            Business clients are responsible for the accuracy of their business information, obtaining proper consent from their contacts, and complying with WhatsApp messaging and local laws.
          </p>
        </section>
      </div>
    </main>
  );
}