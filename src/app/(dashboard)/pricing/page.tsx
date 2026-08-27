import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Check,
  Zap,
  Sparkles,
  Crown,
  Shield,
  Film,
  Layers,
  Wand2,
  Video,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserPlanStatusAction, upgradeToProAction } from "@/app/actions/vibe-director";
import { UpgradeProButton } from "@/components/pricing/upgrade-pro-button";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const planStatus = await getUserPlanStatusAction();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 select-none">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30">
          <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
          <span>PRODUCTION PRICING &amp; PLANS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Filmmaking Power for Every Creator
        </h1>

        <p className="text-sm sm:text-base text-[#8B8B96] leading-relaxed">
          Upgrade to unlock autonomous <strong className="text-white">Vibe Director Mode</strong>, flagship video models, high-priority rendering queues, and massive monthly credit allowances.
        </p>
      </div>

      {/* Pricing Notice */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 text-xs text-[#F2F2F5] max-w-3xl mx-auto">
        <Info className="h-5 w-5 text-[#7C5CFF] shrink-0" />
        <div>
          <span className="font-bold text-white">Transparent Pricing Policy: </span>
          <span>
            We are fine-tuning our live token economics and model costs to ensure the most competitive creator rates without overcharging. Early access users can activate Pro Studio tier below.
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Tier 1: Starter */}
        <Card className="rounded-3xl border border-white/[0.08] bg-[#0E0E14] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#8B8B96] font-bold">Free Tier</span>
              <h3 className="text-xl font-extrabold text-white">Starter</h3>
              <p className="text-xs text-[#8B8B96] leading-relaxed">
                For aspiring creators exploring generative cinema and 1-shot direct takes.
              </p>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-extrabold text-white">$0</span>
              <span className="text-xs text-[#8B8B96] ml-1.5 font-mono">/ forever</span>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/[0.06] text-xs text-[#8B8B96]">
              <div className="flex items-center gap-2 text-white">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>50 Initial Starter Credits</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Manual 1-Shot Directing</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Standard Fast Models</span>
              </div>
              <div className="flex items-center gap-2 text-[#8B8B96]/60">
                <span className="h-4 w-4 shrink-0 text-center font-bold text-[10px]">✕</span>
                <span className="line-through">Vibe Director Autonomous Agent</span>
              </div>
              <div className="flex items-center gap-2 text-[#8B8B96]/60">
                <span className="h-4 w-4 shrink-0 text-center font-bold text-[10px]">✕</span>
                <span className="line-through">Priority Render Queue</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            disabled={planStatus.tier === "starter"}
            className="w-full h-11 rounded-xl border-white/[0.1] bg-white/[0.04] text-xs font-bold text-white"
          >
            {planStatus.tier === "starter" ? "Current Plan" : "Downgrade to Starter"}
          </Button>
        </Card>

        {/* Tier 2: Pro Studio (Featured) */}
        <Card className="relative rounded-3xl border-2 border-[#7C5CFF] bg-[#14141E] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl shadow-[#7C5CFF]/20">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#EC4899] text-white text-[10px] font-bold font-mono uppercase tracking-wider shadow-md">
            Most Popular
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-[#7C5CFF] font-bold">Pro Filmmaker</span>
                <Crown className="h-4 w-4 text-[#FBBF24]" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Pro Studio</h3>
              <p className="text-xs text-[#8B8B96] leading-relaxed">
                Complete access to autonomous filmmaking co-pilots and flagship models.
              </p>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-extrabold text-white">$29</span>
              <span className="text-xs text-[#8B8B96] ml-1.5 font-mono">/ month</span>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/[0.06] text-xs text-white">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span className="font-bold text-[#FBBF24]">Autonomous Vibe Director Room</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>1,500 Credits Included / month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Kling 3.0 Turbo &amp; Seedance 2.5 Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Unlimited Cast, Location Sets &amp; Props</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>High-Priority Instant Render Queue</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Custom API Key (BYOK) Pass-Through</span>
              </div>
            </div>
          </div>

          <UpgradeProButton isAlreadyPro={planStatus.isProUnlocked} />
        </Card>

        {/* Tier 3: Enterprise */}
        <Card className="rounded-3xl border border-white/[0.08] bg-[#0E0E14] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-[#38BDF8] font-bold">Studio Scale</span>
              <h3 className="text-xl font-extrabold text-white">Studio Enterprise</h3>
              <p className="text-xs text-[#8B8B96] leading-relaxed">
                For production houses, ad agencies, and studios needing dedicated compute.
              </p>
            </div>

            <div className="pt-2">
              <span className="text-3xl font-extrabold text-white">Custom</span>
              <span className="text-xs text-[#8B8B96] ml-1.5 font-mono">/ bespoke</span>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/[0.06] text-xs text-[#8B8B96]">
              <div className="flex items-center gap-2 text-white">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Everything in Pro Studio</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Dedicated GPU Render Clusters</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Custom Fine-Tuned Actor Models</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
                <span>Team Multi-Seat Collaborative Vaults</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-xl border-white/[0.1] bg-white/[0.04] text-xs font-bold text-white hover:bg-white/[0.08]"
          >
            Contact Sales
          </Button>
        </Card>
      </div>
    </div>
  );
}
