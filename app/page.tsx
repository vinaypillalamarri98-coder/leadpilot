"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react"; import { Bot, Sparkles, CheckCircle2, XCircle, Play, Pause, RotateCcw, Send, ShieldCheck, Zap, MessageSquare, Sliders, TrendingUp, Clock, IndianRupee, MapPin, ArrowRight, Layers, Award, HelpCircle, Package, } from "lucide-react";
type BillingCycle = "1m" | "6m" | "12m"; type PlanTier = "starter" | "growth" | "pro"; type ScenarioKey = "clinic" | "exports" | "salon";
interface ExtractedLeadData { serviceNeeded: string; budgetOrQuantity: string; urgency: "High" | "Medium" | "Low"; preferredTime: string; location: string; leadScore: number; }
interface ScenarioPreset { key: ScenarioKey; label: string; businessName: string; industry: string; tone: string; knowledgeBaseSummary: string; sampleInquiries: string[]; extracted: ExtractedLeadData; draftReply: string; }
interface PricingPlanConfig { tier: PlanTier; name: string; tagline: string; monthlyQuota: number; quotaLabel: string; monthlyPriceInr: Record<BillingCycle, number>; popular?: boolean; highlights: string[]; }
const SCENARIO_PRESETS: Record<ScenarioKey, ScenarioPreset> = { clinic: { key: "clinic", label: "Dental & Skin Clinic", businessName: "CareWell Dental & Skin Clinic", industry: "Healthcare • Dental & Dermatology", tone: "Warm, reassuring & clinical", knowledgeBaseSummary: "Mon–Sat 10 AM – 8 PM (Sun closed) • Checkup & cleaning ₹600 • Root Canal from ₹4,500 • Skin consult ₹500", sampleInquiries: [ "Hi, I have sharp tooth pain on my lower left side since yesterday and want a checkup + RCT estimate around ₹5,000. Can I come tomorrow evening around 6 PM?", "Hello doctor, looking for skin consultation and pigmentation check around ₹1,500 budget. Any slot this Friday afternoon?", "Need urgent scaling & polishing before a family wedding next week, budget around ₹1,200.", ], extracted: { serviceNeeded: "Dental Checkup & Root Canal (RCT)", budgetOrQuantity: "₹5,000 budget • 1 patient", urgency: "High", preferredTime: "Tomorrow, ~6:00 PM", location: "Local Clinic Catchment", leadScore: 93, }, draftReply: "Namaste! We are sorry to hear about your tooth pain and can prioritize you right away. Routine checkup & cleaning is ₹600, and Root Canal Treatment starts from ₹4,500 after clinical evaluation. We have an opening tomorrow around 6:00 PM at CareWell Dental & Skin Clinic—would you like us to reserve that slot for you?", }, exports: { key: "exports", label: "Exports & Traders", businessName: "Surya Exports & Imports", industry: "B2B Trade • Packaging & Agro-Exports", tone: "Sharp, commercial & responsive", knowledgeBaseSummary: "Spices, agro-commodities & export-grade packaging • Quotes tailored to SKU, MOQ & FOB/CIF port terms", sampleInquiries: [ "Hello team, we need 500 cartons of export-grade corrugated packaging & turmeric quote to Nhava Sheva / Dubai CIF next week. Budget around ₹3.5L.", "Looking for wholesale rate and MOQ for 2,000 kg cumin seeds delivered to Mumbai warehouse by next Tuesday.", "Can you share CIF pricing for 250 cartons of packaging material for shipment this month?", ], extracted: { serviceNeeded: "500 Cartons Export Packaging + Turmeric", budgetOrQuantity: "500 cartons • ~₹3,50,000", urgency: "High", preferredTime: "Next Week Dispatch", location: "Nhava Sheva / Dubai (CIF)", leadScore: 96, }, draftReply: "Hello! Thank you for contacting Surya Exports & Imports. For 500 export-grade cartons and commodity dispatch next week, we can prepare a tailored CIF quote based on exact specs, MOQ, and destination port. Could you share your required dimensions/HSN details and target dispatch date so our team can send a quote quickly?", }, salon: { key: "salon", label: "Salons & Academies", businessName: "Aura Salon & Academy", industry: "Beauty, Grooming & Bridal Studio", tone: "Polite, stylish & helpful", knowledgeBaseSummary: "Tue–Sun 10:30 AM – 8:30 PM (Closed Mon) • Haircut & styling from ₹499 • Facial from ₹1,200 • Bridal custom", sampleInquiries: [ "Hey! Looking for a party makeup + hair styling combo for a wedding function this Saturday morning around 11 AM, budget around ₹4,500.", "Hi, what is the price for a haircut and cleanup for 2 people this Sunday around 4 PM?", "Need bridal makeup trial booking next week, budget around ₹8,000.", ], extracted: { serviceNeeded: "Party Makeup + Hair Styling Combo", budgetOrQuantity: "₹4,500 budget • 1 booking", urgency: "Medium", preferredTime: "Saturday, ~11:00 AM", location: "Studio Appointment", leadScore: 87, }, draftReply: "Hi there! We would love to get you ready for Saturday's wedding function at Aura Salon & Academy. Our studio opens at 10:30 AM, and we can tailor a party makeup and hair styling look around your ₹4,500 budget. Shall we block the 11:00 AM slot this Saturday for you?", }, };
const PRICING_PLANS: PricingPlanConfig[] = [ { tier: "starter", name: "Starter", tagline: "Ideal for single-location clinics, salons & shops starting with AI lead qualification and replies.", monthlyQuota: 1500, quotaLabel: "1,500 AI replies / month", monthlyPriceInr: { "1m": 999, "6m": 849, "12m": 699, }, highlights: [ "1,500 monthly AI replies quota", "Automatic lead extraction & intent scoring", "Custom knowledge base & reply tone", "Draft replies ready for review & sending", ], }, { tier: "growth", name: "Growth", tagline: "Built for busy clinics, traders & multi-service teams handling steady daily inquiries.", monthlyQuota: 5000, quotaLabel: "5,000 AI replies / month", monthlyPriceInr: { "1m": 2499, "6m": 2099, "12m": 1749, }, popular: true, highlights: [ "5,000 monthly AI replies quota", "Priority lead qualification & scoring", "Detailed pricing, timings & SOP grounding", "Live quota counter & lead pipeline tracking", ], }, { tier: "pro", name: "Pro", tagline: "High-volume capacity for exporters, multi-branch operators & high-inquiry businesses.", monthlyQuota: 15000, quotaLabel: "15,000 AI replies / month", monthlyPriceInr: { "1m": 5499, "6m": 4599, "12m": 3899, }, highlights: [ "15,000 monthly AI replies quota", "High-velocity lead scoring & qualification", "Rich multi-service & catalog knowledge base", "Built for scaling multi-inquiry teams", ], }, ];
function buildCustomLeadSimulation( preset: ScenarioPreset, inquiryText: string ): { extracted: ExtractedLeadData; draftReply: string } { try { const trimmed = inquiryText.trim(); const lower = trimmed.toLowerCase();
const isUrgent = [
  "urgent",
  "pain",
  "today",
  "tomorrow",
  "asap",
  "emergency",
  "immediately",
  "this week",
].some((word) => lower.includes(word));

const budgetQtyMatch = trimmed.match(
  /(?:₹|rs\.?|inr)\s*[\d,]+(?:\s*(?:k|l|lac|lakh))?|\b\d[\d,]*\s*(?:kg|cartons?|units?|pcs|pieces|people|slots?)\b/i
);
const detectedBudgetOrQty = budgetQtyMatch
  ? budgetQtyMatch[0].replace(/\s+/g, " ")
  : preset.extracted.budgetOrQuantity;

const timeMatch = trimmed.match(
  /\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|morning|afternoon|evening|\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i
);
const detectedTime = timeMatch ? timeMatch[0] : "Flexible / To Confirm";

const computedScore = Math.min(
  98,
  Math.max(74, 80 + (isUrgent ? 9 : 2) + (budgetQtyMatch ? 6 : 0))
);

const shortSummary =
  trimmed.length > 56 ? `${trimmed.slice(0, 56).trim()}...` : trimmed;

return {
  extracted: {
    serviceNeeded: shortSummary || preset.extracted.serviceNeeded,
    budgetOrQuantity: detectedBudgetOrQty,
    urgency: isUrgent ? "High" : "Medium",
    preferredTime: detectedTime,
    location: preset.extracted.location,
    leadScore: computedScore,
  },
  draftReply: `Thank you for reaching out to ${preset.businessName}! We have noted your inquiry regarding "${shortSummary}" (${detectedBudgetOrQty}). Based on our business details (${preset.knowledgeBaseSummary}), our team can assist you—could you confirm your preferred timing (${detectedTime}) and contact details so we can follow up promptly?`,
};
} catch { return { extracted: preset.extracted, draftReply: preset.draftReply, }; } }
export default function HomePage() { const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("clinic");
const [activeInquiry, setActiveInquiry] = useState<string>(
SCENARIO_PRESETS.clinic.sampleInquiries[0]
);
const [customInput, setCustomInput] = useState<string>("");
const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
const [step, setStep] = useState<number>(3);
const [autoRunLoop, setAutoRunLoop] = useState<boolean>(true);
const [billingCycle, setBillingCycle] = useState<BillingCycle>("6m");
const currentPreset = SCENARIO_PRESETS[selectedScenario];
const simulationResult = useMemo(() => { if (isCustomMode && activeInquiry.trim().length > 0) { return buildCustomLeadSimulation(currentPreset, activeInquiry); } return { extracted: currentPreset.extracted, draftReply: currentPreset.draftReply, }; }, [isCustomMode, activeInquiry, currentPreset]);
const handlePresetChange = (key: ScenarioKey) => { setSelectedScenario(key); setIsCustomMode(false); setCustomInput(""); setActiveInquiry(SCENARIO_PRESETS[key].sampleInquiries[0]); setStep(1); setAutoRunLoop(true); };
const handleSampleInquiryClick = (sampleText: string) => { setIsCustomMode(false); setCustomInput(""); setActiveInquiry(sampleText); setStep(1); setAutoRunLoop(true); };
const handleCustomSubmit = (e: React.FormEvent) => { e.preventDefault(); const cleaned = customInput.trim(); if (!cleaned) return; setActiveInquiry(cleaned); setIsCustomMode(true); setStep(1); setAutoRunLoop(true); };
const handleReplay = useCallback(() => { setStep(1); }, []);
useEffect(() => { if (!autoRunLoop) return; const timeoutId = setTimeout( () => { setStep((prev) => (prev < 3 ? prev + 1 : 1)); }, step === 3 ? 4000 : 1450 ); return () => clearTimeout(timeoutId); }, [autoRunLoop, step]);
const billingCycleLabel: Record<BillingCycle, string> = { "1m": "Monthly (1m)", "6m": "Half-Yearly (6m)", "12m": "Annual (12m)", };
const billingBadge: Record<BillingCycle, string | null> = { "1m": null, "6m": "Save ~15%", "12m": "Save ~30%", };
return ( <div className="relative min-h-screen overflow-x-clip bg-[#070b14] text-slate-100 antialiased selection:bg-emerald-400/25 selection:text-emerald-200">
{/* Subtle editorial ambient light & grain veil */}
<div
aria-hidden="true"
className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
>
<div className="absolute -top-40 left-1/2 h-[34rem] w-[62rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[140px]" />
<div className="absolute top-[38%] -right-32 h-[28rem] w-[28rem] rounded-full bg-teal-400/[0.05] blur-[130px]" />
<div className="absolute bottom-0 -left-32 h-[26rem] w-[26rem] rounded-full bg-sky-400/[0.04] blur-[130px]" />
</div>
  {/* Header */}
  <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070b14]/75 backdrop-blur-xl">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <a href="#" className="group flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300 transition duration-300 group-hover:border-emerald-400/45 group-hover:bg-emerald-400/[0.14]">
          <Bot className="h-4 w-4" />
        </div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
            LeadPilot
          </span>
          <span className="hidden rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-slate-400 sm:inline-block">
            Lead Intelligence
          </span>
        </div>
      </a>

      <nav className="hidden items-center gap-8 text-[13px] font-medium text-slate-400 md:flex">
        <a
          href="#bot-in-action"
          className="transition-colors duration-200 hover:text-white"
        >
          Bot in Action
        </a>
        <a
          href="#comparison"
          className="transition-colors duration-200 hover:text-white"
        >
          Comparison
        </a>
        <a
          href="#pricing"
          className="transition-colors duration-200 hover:text-white"
        >
          Pricing &amp; Terms
        </a>
      </nav>

      <a
        href={`/protected?plan=growth&billing=${billingCycle}`}
        className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.12] px-4 py-2 text-xs font-medium text-emerald-200 transition duration-200 hover:border-emerald-300/60 hover:bg-emerald-400/[0.2] hover:text-white sm:text-[13px]"
      >
        <span>Open Workspace</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  </header>

  <main className="relative z-10">
    {/* Hero */}
    <section className="mx-auto max-w-6xl px-5 pt-16 pb-10 sm:px-8 lg:pt-24 lg:pb-12">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Crafted for Indian Clinics, Exporters, Traders &amp; Salons
        </div>

        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
          Qualify every inquiry.{" "}
          <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-200 bg-clip-text font-normal italic text-transparent">
            Reply with quiet precision.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed font-normal text-slate-400 sm:text-[17px]">
          LeadPilot structures raw customer messages into clear service
          needs, budget or quantity, urgency, preferred timing, and a lead
          score—drafting replies shaped by your business knowledge base and
          voice.
        </p>
      </div>
    </section>

    {/* 1. AESTHETIC INTERACTIVE "BOT IN ACTION" SHOWCASE */}
    <section
      id="bot-in-action"
      className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:py-8"
    >
      <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="flex flex-col justify-between gap-5 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-emerald-300/90 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Bot in Action • Interactive Preview
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              See a single message become a qualified lead
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              Switch business presets, click a sample inquiry, or type your
              own message to watch each stage unfold.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoRunLoop((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition duration-200 ${
                autoRunLoop
                  ? "border-emerald-400/35 bg-emerald-400/[0.1] text-emerald-200"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/[0.16] hover:text-white"
              }`}
            >
              {autoRunLoop ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Auto-Loop On</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-slate-300" />
                  <span>Auto-Loop Paused</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-300 transition duration-200 hover:border-white/[0.16] hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Replay</span>
            </button>
          </div>
        </div>

        {/* Business Preset Selector */}
        <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {(Object.keys(SCENARIO_PRESETS) as ScenarioKey[]).map((key) => {
            const preset = SCENARIO_PRESETS[key];
            const active = selectedScenario === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetChange(key)}
                className={`group rounded-2xl border p-4 text-left transition duration-200 ${
                  active
                    ? "border-emerald-400/40 bg-emerald-400/[0.07]"
                    : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.14] hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-medium tracking-wider uppercase ${
                      active ? "text-emerald-300" : "text-slate-400"
                    }`}
                  >
                    {preset.label}
                  </span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                <p className="mt-1.5 text-sm font-medium text-white">
                  {preset.businessName}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {preset.industry}
                </p>
              </button>
            );
          })}
        </div>

        {/* Sample Inquiry Chips */}
        <div className="mt-6">
          <p className="mb-2.5 text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
            Sample inquiries for {currentPreset.businessName}
          </p>
          <div className="flex flex-wrap gap-2">
            {currentPreset.sampleInquiries.map((sample, idx) => {
              const isCurrent = !isCustomMode && activeInquiry === sample;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleInquiryClick(sample)}
                  className={`max-w-full rounded-full border px-3.5 py-2 text-left text-xs transition duration-200 ${
                    isCurrent
                      ? "border-emerald-400/40 bg-emerald-400/[0.1] text-emerald-100"
                      : "border-white/[0.07] bg-white/[0.02] text-slate-300 hover:border-white/[0.15] hover:text-white"
                  }`}
                >
                  <span className="text-slate-500">0{idx + 1}</span> · “
                  {sample.length > 68
                    ? `${sample.slice(0, 68).trim()}...`
                    : sample}
                  ”
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Inquiry Input */}
        <form
          onSubmit={handleCustomSubmit}
          className="mt-4 flex flex-col gap-2.5 sm:flex-row"
        >
          <div className="relative flex-1">
            <MessageSquare className="pointer-events-none absolute top-3.5 left-4 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type a custom customer message (e.g., 'Need root canal estimate around ₹4,500 tomorrow evening')..."
              className="w-full rounded-2xl border border-white/[0.08] bg-[#060911]/80 py-3 pr-4 pl-11 text-sm text-white placeholder-slate-500 transition focus:border-emerald-400/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-400/[0.14] px-5 py-3 text-sm font-medium text-emerald-200 transition duration-200 hover:border-emerald-300/60 hover:bg-emerald-400/[0.22] hover:text-white"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Simulate</span>
          </button>
        </form>

        {/* Step Selector Pills */}
        <div className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-4">
          {[
            {
              num: 1,
              title: "01 · Incoming Inquiry",
              desc: "Raw message & business context",
            },
            {
              num: 2,
              title: "02 · Lead Qualification",
              desc: "Fields extracted & intent scored",
            },
            {
              num: 3,
              title: "03 · Tailored Draft",
              desc: "Grounded reply ready to send",
            },
          ].map((s) => {
            const activeStep = step === s.num;
            const doneStep = step >= s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  setAutoRunLoop(false);
                  setStep(s.num);
                }}
                className={`rounded-2xl border px-3.5 py-3 text-left transition duration-200 sm:px-4 ${
                  activeStep
                    ? "border-emerald-400/45 bg-emerald-400/[0.09]"
                    : doneStep
                      ? "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.15]"
                      : "border-white/[0.05] bg-white/[0.01] opacity-55"
                }`}
              >
                <p className="text-xs font-medium text-white sm:text-sm">
                  {s.title}
                </p>
                <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                  {s.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* 3-Column Stage Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Stage 1 */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 transition duration-300 ${
              step === 1
                ? "border-white/[0.18] bg-[#090e1a]"
                : "border-white/[0.07] bg-[#080c16]/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium tracking-[0.12em] text-slate-300 uppercase">
                  Incoming Message
                </span>
                <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-slate-400">
                  {isCustomMode ? "Custom" : "Inquiry"}
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-sm leading-relaxed text-slate-200">
                “{activeInquiry}”
              </div>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">
                <p className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                  Knowledge Base &amp; Tone
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-200/90">
                  {currentPreset.businessName} · {currentPreset.tone}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {currentPreset.knowledgeBaseSummary}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-400">
              <span>WhatsApp / Web</span>
              <span className="text-slate-300">
                {step >= 1 ? "Received" : "Pending"}
              </span>
            </div>
          </div>

          {/* Stage 2 */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 transition duration-300 ${
              step >= 2
                ? step === 2
                  ? "border-emerald-400/45 bg-[#090e1a] opacity-100"
                  : "border-white/[0.09] bg-[#080c16]/90 opacity-100"
                : "border-white/[0.05] bg-[#080c16]/50 opacity-45"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium tracking-[0.12em] text-emerald-300 uppercase">
                  Extracted Lead
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/[0.09] px-2.5 py-0.5 text-xs font-medium text-emerald-200">
                  <TrendingUp className="h-3 w-3" />
                  {simulationResult.extracted.leadScore}/100
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[11px] text-slate-400">
                    Service Needed
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-white">
                    {simulationResult.extracted.serviceNeeded}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Package className="h-3 w-3 text-slate-400" />
                      Budget / Qty
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-200">
                      {simulationResult.extracted.budgetOrQuantity}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Zap className="h-3 w-3 text-amber-300/80" />
                      Urgency
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-amber-200/90">
                      {simulationResult.extracted.urgency}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Preferred Time
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-200">
                      {simulationResult.extracted.preferredTime}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      Location / Terms
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-200">
                      {simulationResult.extracted.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-400">
              <span>Qualification</span>
              <span className="text-emerald-300/90">
                {step >= 2 ? "Structured" : "Analyzing"}
              </span>
            </div>
          </div>

          {/* Stage 3 */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 transition duration-300 ${
              step >= 3
                ? "border-emerald-400/35 bg-[#090e1a] opacity-100"
                : "border-white/[0.05] bg-[#080c16]/50 opacity-45"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium tracking-[0.12em] text-emerald-300 uppercase">
                  Drafted Reply
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-0.5 text-[11px] text-emerald-200">
                  KB Grounded
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4 text-sm leading-relaxed text-slate-100">
                {simulationResult.draftReply}
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span>Matches {currentPreset.businessName}’s tone</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span>Prompts next step for booking or quote</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
              <span className="text-slate-400">Counts as 1 reply</span>
              <a
                href={`/protected?plan=growth&billing=${billingCycle}`}
                className="font-medium text-emerald-300 transition hover:text-emerald-200"
              >
                Open in workspace →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* 2. LEADPILOT VS. GENERIC BOTS */}
    <section
      id="comparison"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-slate-300">
          <Layers className="h-3.5 w-3.5 text-emerald-300" />
          Comparison
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
          Beyond generic auto-replies
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
          Standard auto-responders greet visitors without understanding intent.
          LeadPilot extracts key details, scores leads, and drafts replies
          rooted in your business rules.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-medium text-slate-300">
              Generic Bots &amp; Basic Auto-Replies
            </h3>
            <span className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-xs text-slate-400">
              Surface-level
            </span>
          </div>

          <ul className="mt-6 space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300/70" />
              <div>
                <p className="font-medium text-slate-200">
                  Unstructured inquiry details
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Service need, budget or quantity, and timing stay buried in
                  raw text.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300/70" />
              <div>
                <p className="font-medium text-slate-200">
                  No intent or lead scoring
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  High-urgency appointments and serious quotes look no
                  different from casual browsing.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300/70" />
              <div>
                <p className="font-medium text-slate-200">
                  Disconnected from your knowledge base
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Misses clinic hours, service tiers, or export quote terms.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300/70" />
              <div>
                <p className="font-medium text-slate-200">
                  Opaque reply volume &amp; draft workflow
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Less clarity on monthly reply caps and review before
                  sending.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-[24px] border border-emerald-400/25 bg-gradient-to-b from-emerald-400/[0.06] to-white/[0.02] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-medium text-white">
              LeadPilot for Indian SMBs
            </h3>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/[0.1] px-3 py-1 text-xs font-medium text-emerald-200">
              Structured &amp; Contextual
            </span>
          </div>

          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <div>
                <p className="font-medium text-white">
                  Automatic field extraction
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Captures service needed, budget/quantity, urgency, and
                  preferred time cleanly.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <div>
                <p className="font-medium text-white">
                  Clear lead scoring
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Prioritizes high-intent leads so your team responds to
                  what matters first.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <div>
                <p className="font-medium text-white">
                  Knowledge base &amp; tone alignment
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Drafts replies using your actual pricing, hours, policies,
                  and brand voice.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <div>
                <p className="font-medium text-white">
                  Predictable monthly reply quotas
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  1,500, 5,000, or 15,000 monthly AI replies tracked live in
                  your workspace.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    {/* 3. PRICING & TERMS */}
    <section
      id="pricing"
      className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:pb-24"
    >
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-slate-300">
            <Award className="h-3.5 w-3.5 text-emerald-300" />
            Pricing &amp; Billing
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
            Transparent plans &amp; billing cycles
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
            Pick a billing cycle and plan to continue directly to{" "}
            <code className="rounded bg-white/[0.05] px-1.5 py-0.5 text-xs text-emerald-200">
              /protected?plan=&lt;tier&gt;&amp;billing=&lt;cycle&gt;
            </code>
            .
          </p>
        </div>

        {/* Billing Cycle Switcher */}
        <div
          role="group"
          aria-label="Select billing cycle"
          className="inline-flex flex-wrap rounded-full border border-white/[0.08] bg-white/[0.025] p-1"
        >
          {(["1m", "6m", "12m"] as BillingCycle[]).map((cycle) => {
            const active = billingCycle === cycle;
            const badge = billingBadge[cycle];
            return (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition duration-200 sm:text-[13px] ${
                  active
                    ? "bg-emerald-400/[0.16] text-emerald-200 border border-emerald-400/35"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <span>{billingCycleLabel[cycle]}</span>
                {badge && (
                  <span className="hidden rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-emerald-200/90 sm:inline-block">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const price = plan.monthlyPriceInr[billingCycle];
          const planUrl = `/protected?plan=${plan.tier}&billing=${billingCycle}`;

          return (
            <div
              key={plan.tier}
              className={`relative flex flex-col justify-between rounded-[24px] border p-6 transition duration-200 sm:p-8 ${
                plan.popular
                  ? "border-emerald-400/35 bg-gradient-to-b from-emerald-400/[0.07] via-white/[0.02] to-white/[0.015]"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-6 rounded-full border border-emerald-400/35 bg-[#0c1618] px-3 py-0.5 text-[11px] font-medium text-emerald-200">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold text-white">
                    {plan.name}
                  </h3>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                    {plan.quotaLabel}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5 border-b border-white/[0.07] pb-6">
                  <span className="inline-flex items-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    <IndianRupee className="h-6 w-6 text-slate-400" />
                    {price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-slate-400 sm:text-sm">
                    / month · {billingCycle}
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300/90" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href={planUrl}
                  className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition duration-200 ${
                    plan.popular
                      ? "border border-emerald-300/40 bg-emerald-400/[0.16] text-emerald-100 hover:bg-emerald-400/[0.24] hover:text-white"
                      : "border border-white/[0.1] bg-white/[0.04] text-slate-200 hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <span>
                    Choose {plan.name} ({billingCycle})
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terms & Quota Rules */}
      <div className="mt-10 rounded-[24px] border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-base font-medium text-white">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <span>Terms &amp; Quota Rules</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 text-sm text-slate-300 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.06] bg-[#070b14]/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Zap className="h-3.5 w-3.5 text-emerald-300" />
              Monthly Reply Quotas
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Monthly AI reply caps are{" "}
              <span className="text-slate-200">1,500</span> on Starter,{" "}
              <span className="text-slate-200">5,000</span> on Growth, and{" "}
              <span className="text-slate-200">15,000</span> on Pro.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#070b14]/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              Trial Status
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              New workspaces can start in{" "}
              <span className="text-slate-200">trial</span> status to
              configure your business profile, knowledge base, and lead
              workflow while testing replies within your plan limit.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#070b14]/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-white">
              <HelpCircle className="h-3.5 w-3.5 text-amber-300/90" />
              Quota Limit Reached
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              When <code className="text-slate-200">monthly_replies_used</code>{" "}
              reaches <code className="text-slate-200">monthly_reply_limit</code>,
              new AI reply generation pauses until quota renewal or plan
              upgrade.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#070b14]/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Sliders className="h-3.5 w-3.5 text-slate-300" />
              Billing Cycle &amp; Expiry
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Choosing <span className="text-slate-200">1m</span>,{" "}
              <span className="text-slate-200">6m</span>, or{" "}
              <span className="text-slate-200">12m</span> sets your billing
              cycle, monthly quota, and expiry date when saving your
              profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>

  {/* Footer */}
  <footer className="relative z-10 border-t border-white/[0.06] bg-[#060911]">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:px-8">
      <p>LeadPilot · Lead Qualification &amp; Contextual Reply Drafting</p>
      <div className="flex items-center gap-6">
        <a href="#bot-in-action" className="transition hover:text-slate-300">
          Bot in Action
        </a>
        <a href="#comparison" className="transition hover:text-slate-300">
          Comparison
        </a>
        <a href="#pricing" className="transition hover:text-slate-300">
          Pricing &amp; Terms
        </a>
      </div>
    </div>
  </footer>
</div>
); }


