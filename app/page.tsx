'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type BillingCycle = '1m' | '6m' | '12m';
type PlanTier = 'starter' | 'growth' | 'pro';

interface LeadScenario {
  id: string;
  businessType: string;
  channel: string;
  incomingMessage: string;
  extracted: {
    need: string;
    budget: string;
    urgency: string;
    score: string;
  };
  botReply: string;
}

const SCENARIOS: LeadScenario[] = [
  {
    id: 'clinic',
    businessType: 'Dental & Skin Clinic · Hyderabad',
    channel: 'WhatsApp',
    incomingMessage:
      'Hi, need root canal + aligner consultation this week for my brother. Approx budget 45k. What slots are open?',
    extracted: {
      need: 'RCT + Clear Aligners',
      budget: '₹45,000',
      urgency: 'High (This Week)',
      score: '94 / 100 · Hot Lead',
    },
    botReply:
      'Namaste! We have aligner & RCT slots open Thursday at 11:30 AM and Friday at 4:00 PM. Aligners start around ₹42,000–₹65,000 depending on case complexity. Should I lock one of these slots for your brother?',
  },
  {
    id: 'exporter',
    businessType: 'Spices & Agro Exporter · Surat',
    channel: 'Website Lead',
    incomingMessage:
      'Looking for 2 MT organic turmeric powder CIF Dubai next month. Need lab test & COA.',
    extracted: {
      need: '2 MT Organic Turmeric (CIF)',
      budget: 'Export Bulk · High Value',
      urgency: 'Medium (Next Month)',
      score: '91 / 100 · Qualified Buyer',
    },
    botReply:
      'Hello! We supply export-grade organic turmeric with full lab analysis and Certificate of Analysis (COA) for Gulf shipments. Can you share your target port details and preferred packaging size so we can send an exact quote?',
  },
  {
    id: 'salon',
    businessType: 'Bridal & Hair Studio · Bengaluru',
    channel: 'Instagram DM',
    incomingMessage:
      'Bridal makeup + hair package for 2 dates in December, around 35k total. Available?',
    extracted: {
      need: '2-Day Bridal Package',
      budget: '₹35,000',
      urgency: 'High (December Dates)',
      score: '89 / 100 · Ready to Book',
    },
    botReply:
      'Hi there! We have artist availability for select December dates. Our ₹35,000 bridal bundle covers HD/airbrush makeup, hair styling, and trial session. Which two dates are you looking at?',
  },
];

const PLANS: {
  tier: PlanTier;
  name: string;
  quotaLabel: string;
  summary: string;
  prices: Record<BillingCycle, string>;
  perks: string[];
  featured?: boolean;
}[] = [
  {
    tier: 'starter',
    name: 'Starter',
    quotaLabel: '1,500 AI replies / month',
    summary: 'For solo clinics, salons & local shops qualifying daily inquiries.',
    prices: {
      '1m': '₹999',
      '6m': '₹849',
      '12m': '₹699',
    },
    perks: [
      'Contextual lead qualification',
      'Instant WhatsApp & web reply drafts',
      'Monthly quota counter in dashboard',
    ],
  },
  {
    tier: 'growth',
    name: 'Growth',
    quotaLabel: '5,000 AI replies / month',
    summary: 'For growing multi-chair studios, agencies & trade teams.',
    prices: {
      '1m': '₹2,499',
      '6m': '₹2,099',
      '12m': '₹1,799',
    },
    perks: [
      'Everything in Starter',
      'Higher volume qualification & scoring',
      'Priority setup for custom business FAQs',
    ],
    featured: true,
  },
  {
    tier: 'pro',
    name: 'Pro',
    quotaLabel: '15,000 AI replies / month',
    summary: 'For high-volume exporters, chains & busy sales desks.',
    prices: {
      '1m': '₹5,999',
      '6m': '₹4,999',
      '12m': '₹4,299',
    },
    perks: [
      'Everything in Growth',
      'High-capacity monthly reply pool',
      'Built for multi-inquiry peak seasons',
    ],
  },
];

export default function LeadPilotLandingPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [autoPlay, setAutoPlay] = useState(true);
  const [billing, setBilling] = useState<BillingCycle>('1m');

  const active = SCENARIOS[selectedIndex];

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % SCENARIOS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setAutoPlay(false);
  };

  const displayMessage = customInput.trim() ? customInput.trim() : active.incomingMessage;

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] selection:bg-blue-600 selection:text-white">
      <section className="relative h-screen w-full overflow-hidden bg-[#090D16]">
        {/* Background Video (Unstoppable) */}
        <video
          src="/leadpilot-ad.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="pointer-events-none h-full w-full object-cover opacity-60"
        />

        {/* Executive Navy Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090D16]/80 via-[#090D16]/65 to-[#090D16]" />

        {/* Text & Buttons Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise AI Lead Qualification &amp; Follow-Up
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Convert Every Visitor Into{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              Qualified Pipeline
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            LeadPilot engages inbound prospects in real time, qualifies buying intent, and books meetings directly onto your team&apos;s calendar—24/7.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/sign-up"
              className="rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              Start Free Trial
            </a>
            <a
              href="#live-demo"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:border-slate-500 hover:bg-slate-800"
            >
              Try Interactive Demo
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-14 grid grid-cols-3 gap-8 border-t border-white/10 pt-8 text-center sm:gap-14">
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">&lt; 5s</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">Response Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">3.4x</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">Lead Conversion</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">24/7</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">Automated Follow-Up</p>
            </div>
          </div>
          {/* Live Reply Flow Preview */}
          <div className="mt-8 w-full max-w-2xl rounded-xl border border-blue-500/25 bg-[#0F172A]/90 p-4 text-left backdrop-blur-md">
            <div className="mb-2.5 flex items-center justify-between text-xs">
              <span className="font-medium text-blue-400">Live Reply Flow</span>
              <span className="text-slate-400">Auto-reply in 4s</span>
            </div>
            <div className="grid gap-2.5 text-xs sm:grid-cols-2">
              <div className="rounded-lg bg-white/5 p-2.5 text-slate-300">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                  Incoming Lead
                </span>
                Need pricing &amp; availability for 50 seats this month.
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-600/15 p-2.5 text-white">
                <span className="block text-[10px] uppercase tracking-wider text-blue-300">
                  LeadPilot Reply
                </span>
                Sent tier pricing + slot link. Want a 10-min walkthrough today?
              </div>
            </div>
          </div>
        </div>
  </section>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090D16]/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-6 py-4">
          {/* Left: Brand */}
          <a href="#" className="flex items-center gap-2.5 justify-self-start">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-base font-bold tracking-tight text-white">
              LeadPilot
            </span>
          </a>

          {/* Center: Navigation Links */}
          <nav className="hidden items-center justify-center gap-8 text-sm font-medium text-slate-300 md:flex">
            <a href="#bot-in-action" className="transition hover:text-white">
              Bot in action
            </a>
            <a href="#vs-generic" className="transition hover:text-white">
              Why LeadPilot
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing &amp; terms
            </a>
          </nav>
        </div>
      </header>

         {/* Executive Value Section */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 border-b border-white/10 px-6 py-16 md:grid-cols-12 md:py-24">
        <div className="space-y-6 md:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-blue-300">
            Built for Indian clinics, exporters &amp; studios
          </div>

          <h2 className="text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl">
            Stop losing leads to{" "}
            <span className="text-blue-400">slow &amp; robotic</span> replies.
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            LeadPilot reads incoming customer messages, spots real budget, urgency,
            and service needs, and drafts sharp replies—so your team focuses on
            buyers ready to close.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500"
            >
              See plans &amp; start <span>→</span>
            </a>
            <a
              href="#bot-in-action"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#111827] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              Watch live preview
            </a>
          </div>
        </div>

        {/* Clean B2B Workflow Card (No Cartoon / No Animation) */}
        <div className="md:col-span-5">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              How LeadPilot Qualifies
            </p>

            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-[#090D16] p-4">
                <p className="text-sm font-semibold text-white">1. Instant Intent Check</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Flags budget signals, timeline urgency, and exact service requirements from every inquiry.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#090D16] p-4">
                <p className="text-sm font-semibold text-white">2. Context-Aware Drafts</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Prepares clear, natural responses tailored to your business—without generic scripts.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#090D16] p-4">
                <p className="text-sm font-semibold text-white">3. Priority Handoff</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Surfaces high-intent buyers first so your team closes faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="bot-in-action"
        className="mx-auto max-w-6xl border-t border-white/10 px-6 py-16"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Live Bot Preview
            </p>
            <h2 className="mt-1  text-3xl font-bold text-white sm:text-4xl">
              See how LeadPilot qualifies a lead in seconds
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setAutoPlay((v) => !v)}
            className="rounded border border-white/20 bg-[#2C3034] px-4 py-2 text-xs font-medium text-[#E5E8EC] transition hover:border-[#E85D4A]"
          >
            {autoPlay ? 'Auto-cycle: ON (Click to pause)' : 'Auto-cycle: PAUSED (Click to play)'}
          </button>
        </div>

        {/* Scenario Switcher */}
        <div className="mb-6 flex flex-wrap gap-2.5">
          {SCENARIOS.map((item, idx) => {
            const activeTab = idx === selectedIndex && !customInput.trim();
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCustomInput('');
                  setSelectedIndex(idx);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                  activeTab
                    ? 'bg-[#E85D4A] text-white'
                    : 'bg-[#2C3034] text-[#D2D6DC] hover:bg-[#3A3F45]'
                }`}
              >
                {item.businessType}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Incoming Lead & Custom Tester */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0F172A] p-6 lg:col-span-5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Incoming Inquiry · {active.channel}</span>
              <span className="bg-blue-500/15 px-2 py-0.5 text-blue-300">
                {active.businessType}
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#090D16] p-4 text-sm leading-relaxed text-slate-200">
              &ldquo;{displayMessage}&rdquo;
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-2.5 pt-2">
              <label
                htmlFor="test-lead-input"
                className="block text-xs font-medium text-slate-300"
              >
                Try your own sample customer message:
              </label>
              <div className="flex gap-2">
                <input
                  id="test-lead-input"
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g., Need hair smoothening this Sunday, budget 8k..."
              className="w-full rounded-lg border border-white/15 bg-[#090D16] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Preview
                </button>
              </div>
            </form>
          </div>

          {/* Extracted Lead Signals + Draft Reply */}
          <div className="space-y-5 rounded-2xl border border-white/10 bg-[#0F172A] p-6 lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
             <div className="rounded-xl border border-white/10 bg-[#090D16] p-3">
  <p className="text-[11px] text-slate-400">Service Need</p>
                <p className="mt-1 text-xs font-semibold text-white">
                  {customInput.trim() ? 'Custom Inquiry' : active.extracted.need}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#090D16] p-3">
  <p className="text-[11px] text-slate-400">Budget Signal</p>
                <p className="mt-1 text-xs font-semibold text-blue-300">
                  {customInput.trim() ? 'Detected in text' : active.extracted.budget}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#090D16] p-3">
  <p className="text-[11px] text-slate-400">Urgency</p>
                <p className="mt-1 text-xs font-semibold text-white">
                  {customInput.trim() ? 'Flagged for review' : active.extracted.urgency}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#090D16] p-3">
  <p className="text-[11px] text-slate-400">Lead Priority</p>
                <p className="mt-1 text-xs font-semibold text-emerald-400">
                  {customInput.trim() ? 'Qualified Draft' : active.extracted.score}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-600/10 p-4">
  <p className="text-xs font-semibold text-blue-400">
                Drafted Reply Ready for Your Team
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
```[cite: 5]

Press **Ctrl + S** to save, then scroll down past line 454 to see what comes after the draft reply.
                {customInput.trim()
                  ? `Thanks for reaching out! We have noted your request ("${customInput.trim()}") and checked availability. Share your preferred time or date and we will confirm the exact details right away.`
                  : active.botReply}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Difference from Generic Bots */}
      <section
        id="vs-generic"
        className="mx-auto max-w-6xl border-t border-white/10 px-6 py-16"
      >
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
            Difference from Generic Bots
          </p>
          <h2 className="mt-1  text-3xl font-bold text-white sm:text-4xl">
            Not a rigid menu bot. Built for real buying intent.
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-[#090D16] text-xs text-slate-400">
              <tr>
                <th className="px-6 py-4">What happens on an inquiry</th>
                <th className="px-6 py-4">Generic Auto-Reply / Menu Bot</th>
                <th className="px-6 py-4 text-blue-400">LeadPilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              <tr>
                <td className="px-6 py-4 font-medium">Understanding intent</td>
                <td className="px-6 py-4 text-[#9CA3AF]">
```[cite: 6]
                  Forces &ldquo;Press 1 for sales, 2 for timing&rdquo;
                </td>
                <td className="px-6 py-4">
                  Reads natural messages &amp; spots exact service + urgency
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Budget &amp; fit check</td>
                <td className="px-6 py-4 text-slate-400">
                  Treats low-fit and high-budget inquiries identically
                </td>
                <td className="px-6 py-4">
                  Highlights budget signals and key details at a glance
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Reply control</td>
                <td className="px-6 py-4 text-slate-400">
                  Rigid canned templates that feel robotic
                </td>
                <td className="px-6 py-4">
                  Context-aware draft replies + metered monthly AI reply quota
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing & Clear Terms */}
      <section
        id="pricing"
        className="mx-auto max-w-6xl border-t border-white/10 px-6 py-16"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
              Pricing &amp; Terms
            </p>
            <h2 className="mt-1  text-3xl font-bold text-white sm:text-4xl">
              Simple monthly reply quotas, zero guesswork
            </h2>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex rounded-lg border border-white/15 bg-[#2C3034] p-1 text-xs">
```[cite: 8]
            {(
              [
                { id: '1m', label: '1 Month' },
                { id: '6m', label: '6 Months' },
                { id: '12m', label: '12 Months' },
              ] as { id: BillingCycle; label: string }[]
            ).map((cycle) => (
              <button
                key={cycle.id}
                type="button"
                onClick={() => setBilling(cycle.id)}
                className={`rounded-md px-3.5 py-2 font-medium transition ${
                billing === cycle.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              >
                {cycle.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`flex flex-col justify-between rounded-2xl border p-6 ${
                plan.featured
                  ? 'border-blue-500/50 bg-[#0F172A] shadow-lg shadow-blue-950/20'
                  : 'border-white/10 bg-[#090D16]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className=" text-2xl font-bold text-white">
                    {plan.name}
                  </h3>
                  {plan.featured && (
                  <span className="rounded-full bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
```[cite: 8]
                      Popular
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-blue-400">
                  {plan.quotaLabel}
                </p>

                <div>
                  <span className="text-3xl font-bold text-white">
                    {plan.prices[billing]}
                  </span>
                  <span className="ml-1.5 text-xs text-slate-400">
                    / month ({billing})
                  </span>
                </div>

                <p className="text-sm text-slate-400">{plan.summary}</p>

                <ul className="space-y-2 border-t border-white/10 pt-4 text-xs text-slate-200">
? 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-950/30'
                  : 'bg-white/10 text-white hover:bg-white/15'
```[cite: 9]
                  {plan.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/protected?plan=${plan.tier}&billing=${billing}`}
                className={`mt-6 block rounded-lg px-4 py-3 text-center text-sm font-semibold transition ${
                  plan.featured
                    ? 'bg-[#E85D4A] text-white hover:bg-[#d64e3b]'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                Choose {plan.name} ({billing}) →
              </Link>
            </div>
          ))}
        </div>

        {/* Terms Box */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#090D16] p-6 text-xs leading-relaxed">
          <p className="font-semibold text-white">Key Terms</p>
          <ul className="mt-2 space-y-1.5 text-slate-400">
            <li>• 1 AI reply draft = 1 credit toward your monthly cap (1,500 / 5,000 / 15,000).</li>
            <li>• Generations pause at cap until next cycle or upgrade.</li>
            <li>• Selected tier and billing cycle carry into /protected for setup.</li>
          </ul>
       </div>
      </section>
    </div>
    );
}
 