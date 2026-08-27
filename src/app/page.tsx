import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InspirationFeed } from "@/components/shared/inspiration-feed";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, Layers, Palette, Database, Sparkles, Film, Wand2, ArrowRight } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const foundations = [
    {
      title: "Claude Director Intelligence",
      desc: "Automatic cinematography reasoning, optics selection, and lighting choreography from natural language.",
      icon: Sparkles,
      color: "text-[#7C5CFF]",
    },
    {
      title: "Character Consistency & Turnarounds",
      desc: "3-panel locked reference sheets with front, rear, and face close-ups enforcing cross-scene identity.",
      icon: Palette,
      color: "text-[#EC4899]",
    },
    {
      title: "2-Stage Lip-Sync Pipeline",
      desc: "Generate high-fidelity motion takes and voice synthesis separately, then run synchronized speech passes.",
      icon: Film,
      color: "text-[#4ADE80]",
    },
    {
      title: "Vibe Director Agent Mode",
      desc: "Conversational multi-step orchestration that automatically plans, renders, and files assets into your vault.",
      icon: Wand2,
      color: "text-[#FBBF24]",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 space-y-16 select-none">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#7C5CFF]/15 blur-[140px] rounded-full" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#26262E] bg-[#16161C] px-4 py-1.5 text-xs font-medium text-[#8B8B96] mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF] animate-pulse"></span>
          <span>AI-Native Filmmaking Studio</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#F2F2F5]">
          Turn your idea into a movie.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#8B8B96] max-w-2xl mx-auto leading-relaxed">
          No camera, no crew, no experience needed. Directed by AI, powered by your imagination.
        </p>

        {/* Dynamic CTA buttons based on auth state */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
          {user ? (
            <>
              <Link
                href="/generate"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#7C5CFF]/30 hover:from-[#6D3EFF] hover:to-[#5B2DEE] transition-all gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Open Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/vibe-director"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-white/[0.12] bg-[#16161C] px-7 py-3.5 text-sm font-semibold text-[#F2F2F5] hover:bg-[#26262E] transition-all gap-2"
              >
                <Wand2 className="h-4 w-4 text-[#FBBF24]" />
                <span>Vibe Director</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#7C5CFF]/30 hover:from-[#6D3EFF] hover:to-[#5B2DEE] transition-all gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-white/[0.12] bg-[#16161C] px-7 py-3.5 text-sm font-semibold text-[#F2F2F5] hover:bg-[#26262E] transition-all gap-2"
              >
                <span>View Pricing &amp; Plans</span>
              </Link>
            </>
          )}
        </div>

        {/* Studio Foundations Grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
          {foundations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="border-[#26262E] bg-[#16161C]/80 backdrop-blur-sm transition-colors hover:border-[#33333D] rounded-2xl">
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#0B0B0F] border border-[#26262E]">
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-2">
                  <CardDescription className="text-xs leading-relaxed text-[#8B8B96]">
                    {item.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cinematic Scene Inspiration Gallery */}
      <div className="relative z-10 mx-auto max-w-6xl w-full pt-8 border-t border-[#26262E]">
        <InspirationFeed
          title="Curated Scene Inspiration"
          subtitle="Explore movie-grade scene recipes created with Claude Director. 1-click Remix directly in the Studio."
        />
      </div>
    </div>
  );
}
