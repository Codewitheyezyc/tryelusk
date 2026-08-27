"use client";

import React from "react";
import { AlertTriangle, Lightbulb, X } from "lucide-react";
import type { CreditSavingGuidance } from "@/lib/ai/director";

interface CreditSavingBannerProps {
  guidance: CreditSavingGuidance;
  onDismiss?: () => void;
}

export function CreditSavingBanner({
  guidance,
  onDismiss,
}: CreditSavingBannerProps) {
  return (
    <div className="relative rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-4 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-[#FBBF24]/20 text-[#FBBF24] shrink-0 mt-0.5">
          <Lightbulb className="h-4 w-4" />
        </div>

        <div className="space-y-1.5 flex-1 pr-6">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-[#FBBF24]">
              {guidance.title}
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#FBBF24]/20 text-[#FBBF24]">
              Credit Saver Tip
            </span>
          </div>

          <p className="text-xs text-[#F2F2F5]/90 leading-relaxed">
            {guidance.message}
          </p>

          <div className="p-2.5 rounded-lg bg-[#0B0B0F]/60 border border-[#FBBF24]/20 text-[11px] text-[#FBBF24]">
            <strong>Director&apos;s Recommendation:</strong> {guidance.suggestion}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-3 right-3 text-[#8B8B96] hover:text-[#F2F2F5] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
