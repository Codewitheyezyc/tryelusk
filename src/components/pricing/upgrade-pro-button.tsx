"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upgradeToProAction } from "@/app/actions/vibe-director";

interface UpgradeProButtonProps {
  isAlreadyPro: boolean;
}

export function UpgradeProButton({ isAlreadyPro }: UpgradeProButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (isAlreadyPro) {
    return (
      <Button
        onClick={() => router.push("/vibe-director")}
        className="w-full h-11 rounded-xl bg-[#4ADE80] hover:bg-[#3ECE70] text-black text-xs font-extrabold shadow-lg shadow-[#4ADE80]/20 gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>Pro Active • Open Vibe Director</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    );
  }

  const handleUpgrade = () => {
    setError(null);
    startTransition(async () => {
      const res = await upgradeToProAction();
      if (res.success) {
        router.push("/vibe-director");
        router.refresh();
      } else {
        setError(res.error || "Failed to upgrade.");
      }
    });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleUpgrade}
        disabled={isPending}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#EC4899] hover:from-[#6D3EFF] hover:to-[#DB2777] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Activating Pro Studio...</span>
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 fill-current" />
            <span>Activate Pro Studio (Early Access)</span>
          </>
        )}
      </Button>
      {error && <p className="text-[11px] text-[#F87171] text-center">{error}</p>}
    </div>
  );
}
