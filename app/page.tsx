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
    <div className="min-h-screen bg-[#34383C] text-[#F4F2EE] selection:bg-[#E85D4A] selection:text-white">
<section className="relative h-screen w-full overflow-hidden bg-[#1F2327]">
        <video
          src="/leadpilot-ad.mp4"
          autoPlay
          loop
          muted
          playsInline
          controls
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </section>      
      {/* Top Bar */}
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 text-sm">
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-xl font-bold tracking-tight text-white">
            LeadPilot
          </span>
          <span className="h-2.5 w-2.5 rounded-full bg-[#E85D4A]" />
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-[#D2D6DC]">
          <a href="#bot-in-action" className="transition hover:text-white">
            Bot in action
          </a>
          <a href="#vs-generic" className="transition hover:text-white">
            Why LeadPilot
          </a>
          <a href="#pricing" className="transition hover:text-white">
            Pricing &amp; terms
          </a>
          <Link
            href="/protected"
            className="rounded bg-[#E85D4A] px-4 py-2 font-medium text-white transition hover:bg-[#d64e3b]"
          >
            Open workspace →
          </Link>
        </nav>
      </header>

      {/* Editorial Split Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 md:grid-cols-12 md:py-20">
        <div className="space-y-6 md:col-span-6">
          <div className="inline-block rounded bg-[#E85D4A]/15 px-3 py-1 text-xs font-medium tracking-wide text-[#F28B7C]">
            Built for Indian clinics, exporters &amp; studios
          </div>

          <h1 className="font-serif text-4xl leading-[1.08] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Stop losing leads to{' '}
            <span className="text-[#E85D4A]">slow &amp; robotic</span> replies.
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-[#CFD4DA] sm:text-lg">
            LeadPilot reads incoming customer messages, spots real budget, urgency,
            and service needs, and drafts sharp replies—so your team focuses on
            buyers ready to close.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded bg-[#E85D4A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d64e3b]"
            >
              See plans &amp; start <span>→</span>
            </a>
            <a
              href="#bot-in-action"
              className="inline-flex items-center gap-2 rounded border border-white/20 px-5 py-3.5 text-sm font-medium text-[#E5E8EC] transition hover:border-white/40 hover:bg-white/5"
            >
              Watch live preview
            </a>
          </div>
        </div>

        {/* Custom Flat Editorial Illustration (Animated) */}
        <div className="md:col-span-6">
          <div className="relative rounded-2xl border border-white/10 bg-[#2C3034] p-5 shadow-2xl">
            <svg
              viewBox="0 0 520 360"
              className="h-auto w-full"
              role="img"
              aria-label="Illustration of LeadPilot qualifying customer leads automatically"
            >
              {/* Soft organic background shape */}
              <path
                d="M95 72 C175 24, 345 20, 425 78 C495 130, 495 250, 420 302 C335 358, 165 352, 88 294 C22 245, 25 118, 95 72 Z"
                fill="#3B4046"
              />

              {/* Floating coral accent circle */}
              <circle cx="422" cy="66" r="18" fill="#E85D4A">
                <animate
                  attributeName="cy"
                  values="66;58;66"
                  dur="3.4s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Desk surface */}
              <rect x="74" y="252" width="372" height="14" rx="7" fill="#F2B84B" />
              <rect x="108" y="266" width="12" height="66" rx="4" fill="#232629" />
              <rect x="400" y="266" width="12" height="66" rx="4" fill="#232629" />

              {/* Laptop on desk */}
              <rect x="150" y="188" width="136" height="64" rx="8" fill="#1E2124" />
              <rect x="158" y="196" width="120" height="48" rx="4" fill="#4B7BEC" />
              {/* Animated chat bars on screen */}
              <rect x="168" y="206" width="66" height="8" rx="4" fill="#FFFFFF" opacity="0.9">
                <animate
                  attributeName="width"
                  values="42;78;66"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </rect>
              <rect x="196" y="220" width="70" height="8" rx="4" fill="#FFD166">
                <animate
                  attributeName="width"
                  values="74;46;70"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </rect>

              {/* Lead qualification card floating above desk */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 0; 0 -6; 0 0"
                  dur="3.6s"
                  repeatCount="indefinite"
                />
                <rect
                  x="306"
                  y="98"
                  width="156"
                  height="104"
                  rx="12"
                  fill="#232629"
                  stroke="#E85D4A"
                  strokeWidth="2"
                />
                <circle cx="326" cy="120" r="6" fill="#4ADE80" />
                <rect x="340" y="115" width="96" height="9" rx="4" fill="#F4F2EE" />
                <rect x="322" y="138" width="122" height="8" rx="4" fill="#9CA3AF" />
                <rect x="322" y="154" width="88" height="8" rx="4" fill="#9CA3AF" />
                <rect x="322" y="172" width="76" height="18" rx="9" fill="#E85D4A" />
              </g>

              {/* Stylized person at desk */}
              <circle cx="195" cy="118" r="24" fill="#F3C6A5" />
              <path
                d="M170 112 C172 88, 218 86, 220 114 C212 104, 182 104, 170 112 Z"
                fill="#232629"
              />
              <path
                d="M162 188 C164 156, 226 156, 228 188 Z"
                fill="#E85D4A"
              />
              {/* Arm typing */}
              <path
                d="M174 174 L148 214 L172 222"
                fill="none"
                stroke="#F3C6A5"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Live Bot in Action Showcase */}
      <section
        id="bot-in-action"
        className="mx-auto max-w-6xl border-t border-white/10 px-6 py-16"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#E85D4A] uppercase">
              Live Bot Preview
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
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
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#2C3034] p-6 lg:col-span-5">
            <div className="flex items-center justify-between text-xs text-[#A8B0B8]">
              <span>Incoming Inquiry · {active.channel}</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[#F4F2EE]">
                {active.businessType}
              </span>
            </div>

            <div className="rounded-xl bg-[#383D42] p-4 text-sm leading-relaxed text-[#F4F2EE]">
              &ldquo;{displayMessage}&rdquo;
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-2.5 pt-2">
              <label
                htmlFor="test-lead-input"
                className="block text-xs font-medium text-[#CFD4DA]"
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
                  className="w-full rounded-lg border border-white/15 bg-[#232629] px-3.5 py-2.5 text-xs text-white placeholder-[#8B939C] focus:border-[#E85D4A] focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-[#E85D4A] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#d64e3b]"
                >
                  Preview
                </button>
              </div>
            </form>
          </div>

          {/* Extracted Lead Signals + Draft Reply */}
          <div className="space-y-5 rounded-2xl border border-white/10 bg-[#2C3034] p-6 lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-[#232629] p-3">
                <p className="text-[11px] text-[#9CA3AF]">Service Need</p>
                <p className="mt-1 text-xs font-semibold text-white">
                  {customInput.trim() ? 'Custom Inquiry' : active.extracted.need}
                </p>
              </div>
              <div className="rounded-xl bg-[#232629] p-3">
                <p className="text-[11px] text-[#9CA3AF]">Budget Signal</p>
                <p className="mt-1 text-xs font-semibold text-[#F28B7C]">
                  {customInput.trim() ? 'Detected in text' : active.extracted.budget}
                </p>
              </div>
              <div className="rounded-xl bg-[#232629] p-3">
                <p className="text-[11px] text-[#9CA3AF]">Urgency</p>
                <p className="mt-1 text-xs font-semibold text-white">
                  {customInput.trim() ? 'Flagged for review' : active.extracted.urgency}
                </p>
              </div>
              <div className="rounded-xl bg-[#232629] p-3">
                <p className="text-[11px] text-[#9CA3AF]">Lead Priority</p>
                <p className="mt-1 text-xs font-semibold text-emerald-400">
                  {customInput.trim() ? 'Qualified Draft' : active.extracted.score}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#E85D4A]/30 bg-[#232629] p-4">
              <p className="text-xs font-semibold text-[#E85D4A]">
                Drafted Reply Ready for Your Team
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#E5E8EC]">
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
          <p className="text-xs font-semibold tracking-wider text-[#E85D4A] uppercase">
            Difference from Generic Bots
          </p>
          <h2 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
            Not a rigid menu bot. Built for real buying intent.
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#2C3034]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-[#232629] text-xs text-[#A8B0B8]">
              <tr>
                <th className="px-6 py-4">What happens on an inquiry</th>
                <th className="px-6 py-4">Generic Auto-Reply / Menu Bot</th>
                <th className="px-6 py-4 text-[#F28B7C]">LeadPilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-[#E5E8EC]">
              <tr>
                <td className="px-6 py-4 font-medium">Understanding intent</td>
                <td className="px-6 py-4 text-[#9CA3AF]">
                  Forces &ldquo;Press 1 for sales, 2 for timing&rdquo;
                </td>
                <td className="px-6 py-4">
                  Reads natural messages &amp; spots exact service + urgency
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Budget &amp; fit check</td>
                <td className="px-6 py-4 text-[#9CA3AF]">
                  Treats low-fit and high-budget inquiries identically
                </td>
                <td className="px-6 py-4">
                  Highlights budget signals and key details at a glance
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium">Reply control</td>
                <td className="px-6 py-4 text-[#9CA3AF]">
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
            <p className="text-xs font-semibold tracking-wider text-[#E85D4A] uppercase">
              Pricing &amp; Terms
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">
              Simple monthly reply quotas, zero guesswork
            </h2>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex rounded-lg border border-white/15 bg-[#2C3034] p-1 text-xs">
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
                    ? 'bg-[#E85D4A] text-white'
                    : 'text-[#CFD4DA] hover:text-white'
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
                  ? 'border-[#E85D4A] bg-[#2B2F34]'
                  : 'border-white/10 bg-[#2C3034]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {plan.name}
                  </h3>
                  {plan.featured && (
                    <span className="rounded bg-[#E85D4A] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      Popular
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-[#F28B7C]">
                  {plan.quotaLabel}
                </p>

                <div>
                  <span className="text-3xl font-bold text-white">
                    {plan.prices[billing]}
                  </span>
                  <span className="ml-1.5 text-xs text-[#A8B0B8]">
                    / month ({billing})
                  </span>
                </div>

                <p className="text-sm text-[#CFD4DA]">{plan.summary}</p>

                <ul className="space-y-2 border-t border-white/10 pt-4 text-xs text-[#E5E8EC]">
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
        <div className="mt-8 rounded-2xl border border-white/10 bg-[#2C3034] p-6 text-xs leading-relaxed text-[#CFD4DA]">
          <p className="font-semibold text-white">Key Terms &amp; Quota Rules</p>
          <ul className="mt-2 space-y-1.5">
            <li>
              • <strong>Monthly Reply Cap:</strong> Each AI reply draft counts 1
              unit toward your monthly plan limit (`1,500`, `5,000`, or
              `15,000` replies) and is tracked live in your dashboard.
            </li>
            <li>
              • <strong>Quota Limit Behaviour:</strong> Once your monthly reply
              allowance is reached, new AI reply generations pause until the next
              cycle or a plan upgrade.
            </li>
            <li>
              • <strong>Billing Cycle &amp; Activation:</strong> Selecting a plan
              carries your chosen tier and billing period (`1m`, `6m`, or `12m`)
              into `/protected` for setup and activation.
            </li>
          </ul>
        </div>
      </section> 
    </div>
  );
}


