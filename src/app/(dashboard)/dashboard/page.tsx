import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserTransactions, getPricingCatalog } from "@/lib/wallet/wallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardCreditCard } from "@/components/dashboard/dashboard-credit-card";
import { InspirationFeed } from "@/components/shared/inspiration-feed";
import {
  User,
  Shield,
  History,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Wand2,
  Lock,
  FolderKanban,
  Film,
  Crown,
} from "lucide-react";
import type { Profile, CreditTransaction, PricingModel } from "@/types/database.types";

function formatActivityDescription(tx: CreditTransaction): string {
  const modelName = tx.model_used
    ? tx.model_used
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

  switch (tx.type) {
    case "deduction":
      return modelName ? `Take Render (${modelName})` : "Scene generation";
    case "refund":
      return modelName ? `Automatic refund (${modelName})` : "Automatic refund";
    case "admin_grant":
      return "Welcome grant / promotional bonus";
    case "purchase":
      return "Credit pack purchase";
    default:
      return "Wallet adjustment";
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;
  const transactions = await getUserTransactions(user.id, 10);
  const rawCatalog = await getPricingCatalog();

  // Only display active models to regular users
  const activeCatalog = rawCatalog.filter((item: PricingModel) => item.is_active);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* 1. WELCOME HERO SLATE */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#161622]/80 to-[#0A0A0E]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-black/40 text-xs text-[#8B8B96] mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            <span>Studio Production Desk</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F2F2F5]">
            Welcome back, {profile?.display_name || user.email?.split("@")[0]}
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8B96] max-w-xl leading-relaxed">
            Direct scenes, inspect takes in your Media Vault, or compose multi-shot films with Claude Director.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <Link href="/vibe-director">
            <Button
              size="sm"
              className="h-9 px-3.5 bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-semibold shadow-lg shadow-[#7C5CFF]/25 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
              Vibe Director
              <span className="ml-1 px-1 py-0.2 rounded text-[9px] font-mono bg-black/40 text-white">
                PRO
              </span>
            </Button>
          </Link>

          <Link href="/generate">
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3.5 border-white/[0.1] bg-[#12121A] text-[#F2F2F5] hover:bg-[#7C5CFF] hover:text-white hover:border-[#7C5CFF] transition-all text-xs font-medium gap-1.5"
            >
              <Film className="h-3.5 w-3.5 text-[#7C5CFF]" />
              Open Studio
            </Button>
          </Link>

          <Link href="/media">
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-3.5 border-white/[0.1] bg-[#12121A] text-[#F2F2F5] hover:bg-[#1E1E28] text-xs font-medium gap-1.5"
            >
              <FolderKanban className="h-3.5 w-3.5 text-[#4ADE80]" />
              Media Vault
            </Button>
          </Link>

          {profile?.is_admin && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 border-white/[0.08] bg-black/40 text-[#8B8B96] hover:text-[#7C5CFF] text-xs"
              >
                <Lock className="h-3.5 w-3.5 mr-1 text-[#7C5CFF]" />
                Admin
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 2. USER METRICS ROW */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Profile Card */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#8B8B96]">
              Creator Workspace
            </CardTitle>
            <User className="h-4 w-4 text-[#7C5CFF]" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold text-[#F2F2F5] truncate">
              {profile?.display_name || "Creator"}
            </div>
            <p className="text-[11px] text-[#8B8B96] truncate mt-0.5 font-mono">{user.email}</p>
          </CardContent>
        </Card>

        {/* Credit Balance Card */}
        <DashboardCreditCard initialBalance={profile?.credit_balance ?? 0} />

        {/* Account Plan */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#8B8B96]">
              Membership Tier
            </CardTitle>
            <Crown className="h-4 w-4 text-[#FBBF24]" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold text-[#F2F2F5] flex items-center gap-1.5">
              <span>{profile?.is_admin ? "Studio Administrator" : "Creator Pro Tier"}</span>
            </div>
            <p className="text-[11px] text-[#4ADE80] mt-0.5 font-mono flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Verified Filmmaker Status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. GRID: RECENT ACTIVITY & ENGINE RATES (Compact, Scrollable & Sleek) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#7C5CFF]" />
                <CardTitle className="text-sm font-bold text-[#F2F2F5]">
                  Recent Activity
                </CardTitle>
              </div>
              <span className="text-[10px] font-mono text-[#8B8B96]">
                {transactions.length} events logged
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8B8B96] rounded-xl border border-dashed border-white/[0.08]">
                No generation activity yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.05] bg-[#0A0A0E]/70 hover:bg-[#12121A] transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isPositive
                              ? "bg-[#4ADE80]/15 text-[#4ADE80]"
                              : "bg-[#F87171]/15 text-[#F87171]"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#F2F2F5] truncate">
                            {formatActivityDescription(tx)}
                          </p>
                          <p className="text-[10px] text-[#8B8B96] font-mono">
                            {formatRelativeTime(tx.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-bold font-mono ${
                            isPositive ? "text-[#4ADE80]" : "text-[#F87171]"
                          }`}
                        >
                          {isPositive ? `+${tx.amount}` : tx.amount} cr
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engine Rates Card */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#FBBF24]" />
                <CardTitle className="text-sm font-bold text-[#F2F2F5]">
                  Generation Rates
                </CardTitle>
              </div>
              <span className="text-[10px] font-mono text-[#8B8B96]">
                Transparent cost per frame
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {activeCatalog.map((item: PricingModel) => {
                const formattedName = item.model_name
                  .split("-")
                  .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.05] bg-[#0A0A0E]/70 hover:bg-[#12121A] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#7C5CFF]/15 text-[#7C5CFF] shrink-0">
                        <Wand2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-[#F2F2F5] truncate block">
                          {formattedName}
                        </span>
                        <p className="text-[10px] text-[#8B8B96]">
                          High-fidelity cinematic render
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold font-mono text-[#FBBF24]">
                        {item.base_rate}
                      </span>
                      <span className="text-[10px] text-[#8B8B96] ml-1 font-mono">cr</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. DIRECTOR'S INSPIRATION & SCENE REMIXES */}
      <div className="pt-2">
        <InspirationFeed />
      </div>
    </div>
  );
}
