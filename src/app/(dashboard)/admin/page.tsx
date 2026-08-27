import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPricingCatalog } from "@/lib/wallet/wallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Server,
  Layers,
  Database,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Cpu,
  Coins,
} from "lucide-react";
import type { Profile, PricingModel, Generation, CreditTransaction } from "@/types/database.types";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Gate access to admins only
  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  // Fetch full technical catalog
  const catalog = (await getPricingCatalog()) as PricingModel[];

  // Fetch recent generations with two-layer costs
  const { data: rawGenerations } = await supabase
    .from("generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const generations = (rawGenerations || []) as Generation[];

  // Fetch raw audit ledger
  const { data: rawTransactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  const transactions = (rawTransactions || []) as CreditTransaction[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-[#26262E]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-4 w-4 text-[#7C5CFF]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7C5CFF]">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F2F2F5]">
            Provider Routing &amp; Audit Console
          </h1>
          <p className="mt-1 text-sm text-[#8B8B96]">
            Internal pricing formulas, raw ledger audit logs, and two-layer cost tracking
          </p>
        </div>

        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="border-[#26262E] bg-[#16161C] text-[#8B8B96] hover:text-[#F2F2F5] text-xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Model Routing & Pricing Catalog Table */}
      <Card className="border-[#26262E] bg-[#16161C]/90 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[#7C5CFF]" />
            <CardTitle className="text-base font-semibold text-[#F2F2F5]">
              AI Provider Routing Table (`public.pricing_table`)
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#8B8B96]">
            Configurable backend routing table. Inactive providers are disabled for v1 launch per Section 7.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8B8B96]">
              <thead className="border-b border-[#26262E] text-[11px] uppercase tracking-wider text-[#F2F2F5]">
                <tr>
                  <th className="pb-3 font-semibold">Model Identifier</th>
                  <th className="pb-3 font-semibold">Backend Provider</th>
                  <th className="pb-3 font-semibold">Cost Formula</th>
                  <th className="pb-3 font-semibold">Base Rate (Credits)</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262E]/60">
                {catalog.map((item) => (
                  <tr key={item.id} className="hover:bg-[#0B0B0F]/40 transition-colors">
                    <td className="py-3 font-mono font-medium text-[#F2F2F5]">
                      {item.model_name}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-[#26262E] text-[#F2F2F5]">
                        {item.provider}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px]">
                      {item.cost_formula_type}
                    </td>
                    <td className="py-3 font-semibold text-[#FBBF24]">
                      {item.base_rate}
                    </td>
                    <td className="py-3">
                      {item.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[#4ADE80] font-medium text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active (Launch)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#8B8B96] font-medium text-[11px]">
                          <XCircle className="h-3.5 w-3.5 text-[#F87171]" />
                          Disabled (v2 Optimization)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Two-Layer Cost Breakdown Log */}
      <Card className="border-[#26262E] bg-[#16161C]/90 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#4ADE80]" />
            <CardTitle className="text-base font-semibold text-[#F2F2F5]">
              Two-Layer Generation Cost Ledger
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#8B8B96]">
            Separately tracks Claude Anthropic reasoning cost vs. Media Provider rendering cost per generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8B8B96]">
              <thead className="border-b border-[#26262E] text-[11px] uppercase tracking-wider text-[#F2F2F5]">
                <tr>
                  <th className="pb-3 font-semibold">Generation ID / Job</th>
                  <th className="pb-3 font-semibold">Model</th>
                  <th className="pb-3 font-semibold">Anthropic Cost</th>
                  <th className="pb-3 font-semibold">Provider Cost</th>
                  <th className="pb-3 font-semibold">User Charged</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262E]/60">
                {generations.map((gen) => (
                  <tr key={gen.id} className="hover:bg-[#0B0B0F]/40 transition-colors">
                    <td className="py-3 font-mono text-[11px] text-[#8B8B96]">
                      {gen.job_id || gen.id.slice(0, 13)}
                    </td>
                    <td className="py-3 font-mono text-[#F2F2F5]">
                      {gen.model_used}
                    </td>
                    <td className="py-3 font-mono text-[#7C5CFF]">
                      {gen.anthropic_cost || 0.2} cr
                    </td>
                    <td className="py-3 font-mono text-[#FBBF24]">
                      {gen.provider_cost || 10.0} cr
                    </td>
                    <td className="py-3 font-semibold text-[#F2F2F5]">
                      {gen.credits_charged} cr
                    </td>
                    <td className="py-3 capitalize">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          gen.status === "completed"
                            ? "bg-[#4ADE80]/15 text-[#4ADE80]"
                            : gen.status === "failed"
                            ? "bg-[#F87171]/15 text-[#F87171]"
                            : "bg-[#7C5CFF]/15 text-[#7C5CFF]"
                        }`}
                      >
                        {gen.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Raw Ledger Audit Trail */}
      <Card className="border-[#26262E] bg-[#16161C]/90 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#FBBF24]" />
            <CardTitle className="text-base font-semibold text-[#F2F2F5]">
              Raw Transaction Audit Log (`public.credit_transactions`)
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#8B8B96]">
            Complete immutable database ledger with raw user UUIDs and job hashes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8B8B96]">
              <thead className="border-b border-[#26262E] text-[11px] uppercase tracking-wider text-[#F2F2F5]">
                <tr>
                  <th className="pb-3 font-semibold">Transaction ID</th>
                  <th className="pb-3 font-semibold">User UUID</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Model</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262E]/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#0B0B0F]/40 transition-colors">
                    <td className="py-2.5 font-mono text-[11px] text-[#8B8B96]">
                      {tx.id.slice(0, 8)}...
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-[#8B8B96]">
                      {tx.user_id.slice(0, 8)}...
                    </td>
                    <td className="py-2.5 font-semibold capitalize text-[#F2F2F5]">
                      {tx.type}
                    </td>
                    <td className="py-2.5 font-mono text-[11px]">
                      {tx.model_used || "—"}
                    </td>
                    <td className="py-2.5 font-semibold">
                      <span className={tx.amount > 0 ? "text-[#4ADE80]" : "text-[#F87171]"}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-[#8B8B96]">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
