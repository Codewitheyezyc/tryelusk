"use client";

import React from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCredits } from "@/context/credit-context";

interface CreditBadgeProps {
  balance?: number;
  className?: string;
  size?: "sm" | "md";
}

export function CreditBadge({
  balance: propBalance,
  className,
  size = "md",
}: CreditBadgeProps) {
  let contextBalance: number | undefined;
  let isAnimating = false;

  try {
    const credits = useCredits();
    contextBalance = credits.balance;
    isAnimating = credits.isAnimating;
  } catch {
    // Render gracefully if used outside provider
  }

  const effectiveBalance =
    typeof propBalance === "number" ? propBalance : contextBalance ?? 0;
  const isZero = effectiveBalance === 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition-all duration-300 select-none",
        isZero
          ? "border-[#26262E] bg-[#16161C] text-[#8B8B96]"
          : "border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24] shadow-sm shadow-[#FBBF24]/5",
        isAnimating && "scale-105 ring-2 ring-[#7C5CFF]/60",
        size === "sm" ? "text-xs py-0.5 px-2.5" : "text-xs sm:text-sm",
        className
      )}
    >
      <Coins
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-transform",
          isZero ? "text-[#8B8B96]" : "text-[#FBBF24]",
          isAnimating && "rotate-12 scale-110"
        )}
      />
      <span className="font-semibold tabular-nums">
        {effectiveBalance.toLocaleString()}
      </span>
      <span className="text-[10px] sm:text-xs opacity-80">credits</span>
    </div>
  );
}
