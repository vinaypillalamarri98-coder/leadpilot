"use client";

import React, { useState } from "react";
import Link from "next/link";

type PresetKey = "clinic" | "exports" | "salon";
type BillingCycle = "1m" | "6m" | "12m";

interface ChatMsg {
  sender: "user" | "bot";
  text: string;
}

const PRESET_META: Record<
  PresetKey,
  { label: string; header: string; starterBot: string; samplePrompts: string[] }
> = {
  clinic: {
    label: "Clinic & Healthcare",
    header: "CareWell Clinic • Online",
    starterBot:
      "Hi! Welcome to CareWell Dental & Skin Clinic. Ask about timings, fees, or booking an appointment.",
    samplePrompts: [
      "What are your timings and checkup fee?",
      "I need a root canal slot tomorrow evening",
    ],
  },
  exports: {
    label: "Exports & B2B",
    header: "Surya Exports • Online",
    starterBot:
      "Hello! Welcome to Surya Exports and Imports. Share the product, quantity, or destination you're looking for.",
    samplePrompts: [
      "Do you handle bulk export inquiries?",
      "Need CIF pricing for 5 tons",
    ],
  },
  salon: {
    label: "Salon & Local Service",
    header: "Aura Salon • Online",
    starterBot:
      "Hey there! Welcome to Aura Salon. Ask about hair, skin, or booking a slot this week.",
    samplePrompts: [
      "Do you have slots on Saturday?",
      "How much is a haircut and cleanup?",
    ],
  },
};

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    desc: "For solo clinics & small local businesses starting with AI replies.",
    replies: "1,500 AI replies / month",
    monthly: 1499,
    sixMonthTotal: 7499,
    twelveMonthTotal: 11999,
    features: [
      "Instant 24/7 Gemini AI replies",
      "Lead capture table in dashboard",
      "Custom business FAQs & hours",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    desc: "For busy clinics, exporters & multi-staff teams capturing daily leads.",
    replies: "5,000 AI replies / month",
    monthly: 2999,
    sixMonthTotal: 14999,
    twelveMonthTotal: 23999,
    popular: true,
    features: [
      "Everything in Starter",
      "Custom industry persona & qualification flow",
      "Priority webhook & lead export",
    ],
  },
  {
    id: "pro",
    name: "Scale",
    desc: "For high-volume businesses or multi-branch setups.",
    replies: "15,000 AI replies / month",
    monthly: 5999,
    sixMonthTotal: 29999,
    twelveMonthTotal: 47999,
    features: [
      "Everything in Growth",
      "Higher monthly AI reply quota",
      "Dedicated onboarding support",
    ],
  },
];

export default function HomePage() {
  const [preset, setPreset] = useState<PresetKey>("clinic");
  const [billing, setBilling] = useState<BillingCycle>("6m");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { sender: "bot", text: PRESET_META.clinic.starterBot },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const switchPreset = (next: PresetKey) => {
    setPreset(next);
    setMessages([{ sender: "bot", text: PRESET_META[next].starterBot }]);
  };

  const sendDemoMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text: clean }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/demo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset, message: clean }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "Thanks! Please share your name and preferred time.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Demo is busy right now—try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriceLabel = (plan: (typeof PLANS)[number]) => {
    if (billing === "1m") {
      return { main: `₹${plan.monthly.toLocaleString("en-IN")}`, sub: "per month" };
    }
    if (billing === "6m") {
      return {
        main: `₹${plan.sixMonthTotal.toLocaleString("en-IN")}`,
        sub: `for 6 months (~₹${Math.round(plan.sixMonthTotal / 6).toLocaleString("en-IN")}/mo)`,
      };
    }
    return {
      main: `₹${plan.twelveMonthTotal.toLocaleString("en-IN")}`,
      sub: `for 12 months (₹${Math.round(plan.twelveMonthTotal / 12).toLocaleString("en-IN")}/mo)`,
    };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight text-emerald-400">
          LeadPilot
        </span>
        <nav className="flex items-center gap-6 text-sm text-slate-300">
          <a href="#demo" className="hover:text-white">
            Live Demo
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <Link
            href="/auth/login"
            className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-400"
          >
            Client Login
          </Link>
        </nav>
      </header>

      <section
        id="demo"
        className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-2 gap-10 items-center"
      >
        <div>
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300 mb-4">
            WhatsApp AI Receptionist &amp; Lead Bot
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Turn WhatsApp chats into booked appointments &amp; qualified leads 24/7.
          </h1>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Built for clinics, exporters, and service businesses. Test how LeadPilot replies right now, pick a 1-month, 6-month, or 12-month plan, and connect your business WhatsApp number.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(PRESET_META) as PresetKey[]).map((key) => (
              <button
                key={key}
                onClick={() => switchPreset(key)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition ${
                  preset === key
                    ? "bg-emerald-500 text-slate-950 border-emerald-500"
                    : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
                }`}
              >
                {PRESET_META[key].label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {PRESET_META[preset].samplePrompts.map((sample) => (
              <button
                key={sample}
                onClick={() => sendDemoMessage(sample)}
                className="text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-md px-3 py-1.5 text-slate-300"
              >
                Try: &ldquo;{sample}&rdquo;
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="bg-emerald-700 px-4 py-3 font-semibold text-white text-sm">
            {PRESET_META[preset].header}
          </div>
          <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-950/60">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.sender === "bot"
                    ? "bg-slate-800 text-slate-100 mr-auto"
                    : "bg-emerald-600 text-white ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-400">Bot is typing...</div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendDemoMessage(input);
            }}
            className="p-3 border-t border-slate-800 flex gap-2 bg-slate-900"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a customer question..."
              className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </section>

      <section
        id="pricing"
        className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-900"
      >
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold">Simple Plans for Any Growth Stage</h2>
          <p className="text-slate-400 mt-2 text-sm">
            Pay LeadPilot for the AI bot &amp; dashboard. Meta&apos;s first 1,000 service replies/month are free on your WhatsApp account, with 0% markup from us on any extra Meta messaging charges.
          </p>

          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 mt-6">
            {[
              { id: "1m", label: "1 Month" },
              { id: "6m", label: "6 Months (Save ~17%)" },
              { id: "12m", label: "12 Months (Save ~33%)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBilling(tab.id as BillingCycle)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  billing === tab.id
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {PLANS.map((plan) => {
            const price = getPriceLabel(plan);
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border flex flex-col justify-between ${
                  plan.popular
                    ? "bg-slate-900 border-emerald-500"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div>
                  {plan.popular && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-bold mt-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                  <div className="mt-5">
                    <span className="text-3xl font-bold text-white">
                      {price.main}
                    </span>
                    <span className="block text-xs text-slate-400 mt-1">
                      {price.sub}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-medium text-emerald-300">
                    {plan.replies}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {plan.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/auth/login?plan=${plan.id}&billing=${billing}`}
                  className="mt-6 block text-center rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Choose {plan.name}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-900 px-6 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <span>© {new Date().getFullYear()} LeadPilot. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms &amp; Conditions
          </Link>
        </div>
      </footer>
    </main>
  );
}