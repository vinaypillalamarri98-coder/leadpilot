"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react"; import { Bot, Sparkles, CheckCircle2, XCircle, Play, Pause, RotateCcw, Send, ShieldCheck, Zap, MessageSquare, Sliders, TrendingUp, Clock, IndianRupee, MapPin, ArrowRight, Layers, Award, HelpCircle, Package, } from "lucide-react";
type BillingCycle = "1m" | "6m" | "12m"; type PlanTier = "starter" | "growth" | "pro"; type ScenarioKey = "clinic" | "exports" | "salon";
interface ExtractedLeadData { serviceNeeded: string; budgetOrQuantity: string; urgency: "High" | "Medium" | "Low"; preferredTime: string; location: string; leadScore: number; }
interface ScenarioPreset { key: ScenarioKey; label: string; businessName: string; industry: string; tone: string; knowledgeBaseSummary: string; sampleInquiries: string[]; extracted: ExtractedLeadData; draftReply: string; }
interface PricingPlanConfig { tier: PlanTier; name: string; tagline: string; monthlyQuota: number; quotaLabel: string; monthlyPriceInr: Record<BillingCycle, number>; popular?: boolean; highlights: string[]; }
const SCENARIO_PRESETS: Record<ScenarioKey, ScenarioPreset> = { clinic: { key: "clinic", label: "Dental & Skin Clinic", businessName: "CareWell Dental & Skin Clinic", industry: "Healthcare / Dental & Dermatology", tone: "Warm, reassuring & clinical", knowledgeBaseSummary: "Open Mon-Sat 10 AM - 8 PM (Sun closed). Dental checkup & cleaning ₹600, Root Canal from ₹4,500, Skin consultation ₹500.", sampleInquiries: [ "Hi, I have sharp tooth pain on my lower left side since yesterday and want a checkup + RCT estimate around ₹5,000. Can I come tomorrow evening around 6 PM?", "Hello doctor, looking for skin consultation and pigmentation check around ₹1,500 budget. Any slot this Friday afternoon?", "Need urgent scaling & polishing before a family wedding next week, budget around ₹1,200.", ], extracted: { serviceNeeded: "Dental Checkup & Root Canal (RCT)", budgetOrQuantity: "₹5,000 budget (1 patient)", urgency: "High", preferredTime: "Tomorrow, ~6:00 PM", location: "Local Clinic Catchment", leadScore: 93, }, draftReply: "Namaste! We are sorry to hear about your tooth pain and can prioritize you right away. Routine checkup & cleaning is ₹600, and Root Canal Treatment starts from ₹4,500 after clinical evaluation. We have an opening tomorrow around 6:00 PM at CareWell Dental & Skin Clinic—would you like us to reserve that slot for you?", }, exports: { key: "exports", label: "Exports & Traders", businessName: "Surya Exports & Imports", industry: "B2B Trade, Packaging & Agro-Exports", tone: "Sharp, commercial & responsive", knowledgeBaseSummary: "Supplying spices, agro-commodities, and export-grade packaging. Quotes depend on SKU, quantity/MOQ, and FOB/CIF port terms.", sampleInquiries: [ "Hello team, we need 500 cartons of export-grade corrugated packaging & turmeric quote to Nhava Sheva / Dubai CIF next week. Budget around ₹3.5L.", "Looking for wholesale rate and MOQ for 2,000 kg cumin seeds delivered to Mumbai warehouse by next Tuesday.", "Can you share CIF pricing for 250 cartons of packaging material for shipment this month?", ], extracted: { serviceNeeded: "500 Cartons Export Packaging + Turmeric Quote", budgetOrQuantity: "500 cartons / ₹3,50,000 approx.", urgency: "High", preferredTime: "Next Week Dispatch", location: "Nhava Sheva / Dubai (CIF)", leadScore: 96, }, draftReply: "Hello! Thank you for contacting Surya Exports & Imports. For 500 export-grade cartons and commodity dispatch next week, we can prepare a tailored CIF quote based on exact specs, MOQ, and destination port. Could you share your required dimensions/HSN details and target dispatch date so our team can send a quote quickly?", }, salon: { key: "salon", label: "Salons & Academies", businessName: "Aura Salon & Academy", industry: "Beauty, Grooming & Bridal Studio", tone: "Polite, stylish & helpful", knowledgeBaseSummary: "Open Tue-Sun 10:30 AM - 8:30 PM (Closed Mon). Haircut & styling from ₹499, Facial from ₹1,200, Bridal & event packages custom.", sampleInquiries: [ "Hey! Looking for a party makeup + hair styling combo for a wedding function this Saturday morning around 11 AM, budget around ₹4,500.", "Hi, what is the price for a haircut and cleanup for 2 people this Sunday around 4 PM?", "Need bridal makeup trial booking next week, budget around ₹8,000.", ], extracted: { serviceNeeded: "Party Makeup + Hair Styling Combo", budgetOrQuantity: "₹4,500 budget (1 booking)", urgency: "Medium", preferredTime: "Saturday, ~11:00 AM", location: "Studio Appointment", leadScore: 87, }, draftReply: "Hi there! We would love to get you ready for Saturday's wedding function at Aura Salon & Academy. Our studio opens at 10:30 AM, and we can tailor a party makeup and hair styling look around your ₹4,500 budget. Shall we block the 11:00 AM slot this Saturday for you?", }, };
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
useEffect(() => { if (!autoRunLoop) return; const timeoutId = setTimeout( () => { setStep((prev) => (prev < 3 ? prev + 1 : 1)); }, step === 3 ? 3800 : 1400 ); return () => clearTimeout(timeoutId); }, [autoRunLoop, step]);
const billingCycleLabel: Record<BillingCycle, string> = { "1m": "1m (Monthly)", "6m": "6m (Half-Yearly)", "12m": "12m (Yearly)", };
const billingBadge: Record<BillingCycle, string | null> = { "1m": null, "6m": "Popular • Save ~15%", "12m": "Best Value • Save ~30%", };
return ( <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
{/* Ambient background glow */}
<div className="pointer-events-none fixed inset-0 overflow-hidden">
<div className="absolute -top-32 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
<div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
</div>
  {/* Header */}
  <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#060913]/85 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
      <a href="#" className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/35 bg-emerald-500/15 text-emerald-400">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white">
            LeadPilot
          </span>
          <span className="ml-2 hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 sm:inline-block">
            AI Lead Qualification &amp; Replies
          </span>
        </div>
      </a>

      <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
        <a href="#bot-in-action" className="transition hover:text-emerald-400">
          Bot in Action
        </a>
        <a href="#comparison" className="transition hover:text-emerald-400">
          LeadPilot vs. Generic Bots
        </a>
        <a href="#pricing" className="transition hover:text-emerald-400">
          Pricing &amp; Terms
        </a>
      </nav>

      <a
        href={`/protected?plan=growth&billing=${billingCycle}`}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 sm:text-sm"
      >
        Open Workspace
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  </header>

  <main className="relative z-10">
    {/* Hero */}
    <section className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 lg:px-8 lg:pt-14">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Designed for Indian Clinics, Exporters, Traders &amp; Salons
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Qualify Leads Faster &amp; Draft{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Context-Smart Replies
          </span>{" "}
          Automatically
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg">
          LeadPilot turns messy customer inquiries into structured leads with
          service needs, budget or quantity, urgency, preferred time, and a
          lead score—while drafting replies grounded in your business
          knowledge base and tone.
        </p>
      </div>
    </section>

    {/* 1. PROMINENT INTERACTIVE "BOT IN ACTION" SHOWCASE */}
    <section
      id="bot-in-action"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10"
    >
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/95 to-[#090f1c] p-5 shadow-2xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Bot in Action • Interactive Live Demo
            </div>
            <h2 className="mt-1.5 text-2xl font-bold text-white sm:text-3xl">
              Watch How LeadPilot Reads, Scores &amp; Replies to Inquiries
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Pick a business preset, click a sample inquiry or type your own,
              and watch the animated step-by-step execution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAutoRunLoop((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                autoRunLoop
                  ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
                  : "border-slate-700 bg-slate-800/80 text-slate-200 hover:border-emerald-400/40"
              }`}
            >
              {autoRunLoop ? (
                <>
                  <Pause className="h-4 w-4 text-emerald-400" />
                  Watch Auto-Run Loop: ON
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-emerald-400" />
                  Watch Auto-Run Loop: OFF
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-white sm:text-sm"
            >
              <RotateCcw className="h-4 w-4 text-cyan-400" />
              Replay
            </button>
          </div>
        </div>

        {/* Indian SMB Preset Selector */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(Object.keys(SCENARIO_PRESETS) as ScenarioKey[]).map((key) => {
            const preset = SCENARIO_PRESETS[key];
            const active = selectedScenario === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetChange(key)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-emerald-400 bg-emerald-500/15 shadow-lg shadow-emerald-500/10"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    {preset.label}
                  </span>
                  {active && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-bold text-white">
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
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sample Customer Inquiries for {currentPreset.businessName} (Click to
            test):
          </p>
          <div className="flex flex-wrap gap-2">
            {currentPreset.sampleInquiries.map((sample, idx) => {
              const isCurrent = !isCustomMode && activeInquiry === sample;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSampleInquiryClick(sample)}
                  className={`max-w-full rounded-xl border px-3.5 py-2 text-left text-xs transition ${
                    isCurrent
                      ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200"
                      : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  Sample {idx + 1}: &ldquo;
                  {sample.length > 72
                    ? `${sample.slice(0, 72).trim()}...`
                    : sample}
                  &rdquo;
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Inquiry Form */}
        <form
          onSubmit={handleCustomSubmit}
          className="mt-4 flex flex-col gap-2.5 sm:flex-row"
        >
          <div className="relative flex-1">
            <MessageSquare className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Or type your own customer message (e.g., 'Need 100 boxes or appointment tomorrow at 5 PM for ₹2500')..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/90 py-3 pr-4 pl-10 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <Send className="h-4 w-4" />
            Run Live Bot
          </button>
        </form>

        {/* Stepper Bar */}
        <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
          {[
            {
              num: 1,
              title: "Step 1: Incoming Message",
              desc: "Customer inquiry arrives",
            },
            {
              num: 2,
              title: "Step 2: Extracted Lead Fields",
              desc: "Qualification & lead score",
            },
            {
              num: 3,
              title: "Step 3: Tailored Reply Draft",
              desc: "Grounded in KB & tone",
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
                className={`rounded-2xl border p-3 text-left transition ${
                  activeStep
                    ? "border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400/40"
                    : doneStep
                      ? "border-emerald-500/35 bg-slate-900/80"
                      : "border-slate-800 bg-slate-950/50 opacity-60"
                }`}
              >
                <p className="text-xs font-bold text-white sm:text-sm">
                  {s.title}
                </p>
                <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">
                  {s.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* 3-Stage Animated Execution Panels */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Stage 1: Incoming Message */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
              step === 1
                ? "border-cyan-400/70 bg-slate-950 shadow-lg shadow-cyan-500/10"
                : "border-slate-800 bg-slate-950/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  1. Incoming Message
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                  {isCustomMode ? "Custom Input" : "Customer Chat"}
                </span>
              </div>

              <div className="mt-4 rounded-2xl rounded-tl-none border border-slate-800 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
                &ldquo;{activeInquiry}&rdquo;
              </div>

              <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-900/50 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Business Knowledge Base &amp; Tone
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-300">
                  {currentPreset.businessName} • Tone: {currentPreset.tone}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {currentPreset.knowledgeBaseSummary}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
              <span>Channel: WhatsApp / Web</span>
              <span className="font-semibold text-cyan-300">
                {step >= 1 ? "Captured ✓" : "Waiting"}
              </span>
            </div>
          </div>

          {/* Stage 2: Extracted Lead Fields + Score */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
              step >= 2
                ? step === 2
                  ? "border-emerald-400/80 bg-slate-950 shadow-lg shadow-emerald-500/10 opacity-100"
                  : "border-emerald-500/35 bg-slate-950/90 opacity-100"
                : "border-slate-800/70 bg-slate-950/40 opacity-50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  2. Extracted Lead Fields
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Score: {simulationResult.extracted.leadScore}/100
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-3">
                  <p className="text-[11px] text-slate-400">Service Needed</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {simulationResult.extracted.serviceNeeded}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-3">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Package className="h-3 w-3 text-emerald-400" />
                      Budget / Qty
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-white">
                      {simulationResult.extracted.budgetOrQuantity}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-3">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Zap className="h-3 w-3 text-amber-400" />
                      Urgency
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-amber-300">
                      {simulationResult.extracted.urgency}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-3">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      Preferred Time
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-200">
                      {simulationResult.extracted.preferredTime}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-3">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3 text-rose-400" />
                      Location / Terms
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-200">
                      {simulationResult.extracted.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
              <span>Lead Qualification</span>
              <span className="font-semibold text-emerald-300">
                {step >= 2 ? "Qualified ✓" : "Extracting..."}
              </span>
            </div>
          </div>

          {/* Stage 3: Tailored Reply Draft */}
          <div
            className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
              step >= 3
                ? "border-teal-400/70 bg-slate-950 shadow-lg shadow-teal-500/10 opacity-100"
                : "border-slate-800/70 bg-slate-950/40 opacity-50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  3. Tailored Reply Draft
                </span>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                  KB + Tone Matched
                </span>
              </div>

              <div className="mt-4 rounded-2xl rounded-tr-none border border-emerald-500/25 bg-emerald-950/25 p-4 text-sm leading-relaxed text-slate-100">
                {simulationResult.draftReply}
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Uses {currentPreset.businessName}&apos;s tone &amp; rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Guides customer toward booking or quote confirmation</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
              <span className="text-slate-400">Quota usage: 1 reply</span>
              <a
                href={`/protected?plan=growth&billing=${billingCycle}`}
                className="font-semibold text-emerald-400 hover:underline"
              >
                Try in /protected →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* 2. LEADPILOT VS. GENERIC BOTS COMPARISON */}
    <section
      id="comparison"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Layers className="h-3.5 w-3.5" />
          LeadPilot vs. Generic Bots
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">
          Why Businesses Switch From Generic Bots to LeadPilot
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
          Generic auto-responders send robotic greetings while generic
          chatbots lack business structure. LeadPilot qualifies leads, scores
          intent, and drafts context-accurate replies.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Generic Bots */}
        <div className="rounded-3xl border border-rose-500/25 bg-slate-900/45 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-rose-300">
              Generic Bots &amp; Basic Auto-Replies
            </h3>
            <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300">
              Limited Context
            </span>
          </div>

          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-semibold text-white">
                  No Structured Lead Qualification
                </p>
                <p className="text-xs text-slate-400">
                  Leaves service need, budget/quantity, and preferred timing buried in chat logs.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-semibold text-white">No Lead Scoring</p>
                <p className="text-xs text-slate-400">
                  Harder to spot high-urgency appointments or bulk trade inquiries first.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-semibold text-white">
                  Generic Replies Without Your Knowledge Base
                </p>
                <p className="text-xs text-slate-400">
                  Misses clinic timings, salon pricing tiers, or export quote requirements.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-semibold text-white">
                  Unclear Quota &amp; Reply Controls
                </p>
                <p className="text-xs text-slate-400">
                  Less visibility into monthly reply usage and draft review before sending.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* LeadPilot */}
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-900/75 p-6 sm:p-8 shadow-xl shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              LeadPilot for Indian SMBs
            </h3>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              Qualification + Drafts
            </span>
          </div>

          <ul className="mt-6 space-y-4 text-sm text-slate-200">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">
                  Automatic Field Extraction
                </p>
                <p className="text-xs text-slate-300">
                  Captures service needed, budget/quantity, urgency, preferred time &amp; context.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">
                  Clear Lead Scoring
                </p>
                <p className="text-xs text-slate-300">
                  Scores incoming inquiries so your team focuses on high-intent leads first.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">
                  Custom Knowledge Base &amp; Brand Tone
                </p>
                <p className="text-xs text-slate-300">
                  Drafts replies aligned with your services, rates, hours, and communication style.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">
                  Enforced Monthly Reply Quotas
                </p>
                <p className="text-xs text-slate-300">
                  Predictable plan limits (1,500 / 5,000 / 15,000 replies per month) with live tracking.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    {/* 3. PRICING CARDS (1m, 6m, 12m) + TERMS & QUOTA RULES */}
    <section
      id="pricing"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:pb-20"
    >
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Award className="h-3.5 w-3.5" />
            Pricing &amp; Billing Cycles
          </span>
          <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Choose Your Plan &amp; Billing Cycle
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Select 1m, 6m, or 12m billing and click any plan button to open{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-emerald-300">
              /protected?plan=&lt;tier&gt;&amp;billing=&lt;cycle&gt;
            </code>
            .
          </p>
        </div>

        {/* Billing Cycle Selector: 1m, 6m, 12m */}
        <div
          role="group"
          aria-label="Select billing cycle"
          className="inline-flex flex-wrap rounded-2xl border border-slate-800 bg-slate-900/90 p-1.5"
        >
          {(["1m", "6m", "12m"] as BillingCycle[]).map((cycle) => {
            const active = billingCycle === cycle;
            const badge = billingBadge[cycle];
            return (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  active
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>{billingCycleLabel[cycle]}</span>
                {badge && (
                  <span
                    className={`hidden rounded-full px-1.5 py-0.5 text-[10px] font-bold sm:inline-block ${
                      active
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
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
              className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition ${
                plan.popular
                  ? "border-emerald-400 bg-gradient-to-b from-slate-900 via-slate-900 to-[#0c1926] shadow-2xl shadow-emerald-500/10"
                  : "border-slate-800 bg-slate-900/65 hover:border-slate-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-6 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-slate-950">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold text-white">
                    {plan.name}
                  </h3>
                  <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    {plan.quotaLabel}
                  </span>
                </div>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5 border-b border-slate-800 pb-6">
                  <span className="inline-flex items-center text-4xl font-extrabold text-white">
                    <IndianRupee className="h-7 w-7 text-slate-300" />
                    {price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-slate-400">
                    / month • {billingCycle} cycle
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <a
                  href={planUrl}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                      : "border border-slate-700 bg-slate-800 text-white hover:border-emerald-400/50 hover:bg-slate-700"
                  }`}
                >
                  Get Started with {plan.name} ({billingCycle})
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terms & Quota Rules */}
      <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          Terms &amp; Quota Rules
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 text-sm text-slate-300 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
            <p className="flex items-center gap-1.5 font-semibold text-white">
              <Zap className="h-4 w-4 text-emerald-400" />
              Monthly AI Reply Quotas
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Each plan includes a strict monthly AI reply quota:{" "}
              <strong className="text-slate-200">Starter: 1,500</strong>,{" "}
              <strong className="text-slate-200">Growth: 5,000</strong>, and{" "}
              <strong className="text-slate-200">Pro: 15,000</strong> AI
              replies per month.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
            <p className="flex items-center gap-1.5 font-semibold text-white">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Trial Status
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Workspaces can start in{" "}
              <strong className="text-slate-200">trial</strong> status so
              you can configure your business profile, knowledge base, and
              lead workflow while testing AI replies against your plan cap.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
            <p className="flex items-center gap-1.5 font-semibold text-white">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              When Monthly Quota Is Reached
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Once <code className="text-slate-200">monthly_replies_used</code>{" "}
              reaches <code className="text-slate-200">monthly_reply_limit</code>,
              new AI reply generation is blocked with a quota limit notice
              until your quota resets or you upgrade to a higher plan.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/75 p-4">
            <p className="flex items-center gap-1.5 font-semibold text-white">
              <Sliders className="h-4 w-4 text-purple-400" />
              Billing Cycle &amp; Expiry
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Selecting <strong className="text-slate-200">1m</strong>,{" "}
              <strong className="text-slate-200">6m</strong>, or{" "}
              <strong className="text-slate-200">12m</strong> sets your
              billing cycle, monthly reply limit, and plan expiry date when
              you save your business profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>

  {/* Footer */}
  <footer className="relative z-10 border-t border-slate-800/80 bg-[#050810]">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
      <p>LeadPilot • AI Lead Qualification &amp; Contextual Replies</p>
      <div className="flex items-center gap-5">
        <a href="#bot-in-action" className="hover:text-white">
          Bot in Action
        </a>
        <a href="#comparison" className="hover:text-white">
          Comparison
        </a>
        <a href="#pricing" className="hover:text-white">
          Pricing &amp; Terms
        </a>
      </div>
    </div>
  </footer>
</div>
); }

