import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicLeadForm } from "@/components/public-lead-form";

interface PublicLeadPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function PublicLeadPage({ params }: PublicLeadPageProps) {
  const { businessId } = await params;

  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, industry, phone")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
      <section
        aria-labelledby="business-heading"
        className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-xl"
      >
        <header className="space-y-1.5 border-b border-zinc-800 pb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {business.industry || "Inquiry Form"}
          </p>
          <h1 id="business-heading" className="text-2xl font-bold text-white">
            {business.name}
          </h1>
          <p className="text-sm text-zinc-300">
            Share what you need and get an instant response right away.
          </p>
          {business.phone && (
            <p className="text-xs text-zinc-300">
              Direct phone:{" "}
              <a
                href={`tel:${business.phone}`}
                className="underline decoration-zinc-500 underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
              >
                {business.phone}
              </a>
            </p>
          )}
        </header>

        <PublicLeadForm
          businessId={business.id}
          businessName={business.name}
        />
      </section>
    </main>
  );
}