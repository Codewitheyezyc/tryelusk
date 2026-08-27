"use client";

import React, { useState } from "react";
import { Sparkles, Crown, Check, ArrowRight, Loader2, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upgradeToProAction } from "@/app/actions/vibe-director";

interface ProTierGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
}

export function ProTierGateModal({ isOpen, onClose, onUpgraded }: ProTierGateModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await upgradeToProAction();
      if (res.success) {
        if (onUpgraded) onUpgraded();
        onClose();
      }
    } catch {
      //
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-2xl border border-[#7C5CFF]/40 bg-[#16161C] p-6 text-[#F2F2F5] shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#26262E]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30">
              <Crown className="h-5 w-5 text-[#FBBF24]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F2F2F5]">
                  Unlock Vibe Director Mode
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#7C5CFF] text-white font-bold">
                  PRO
                </span>
              </div>
              <p className="text-xs text-[#8B8B96]">
                Autonomous Multi-Tool Filmmaking Co-Pilot
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#26262E] text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#26262E]/50 text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feature Overview */}
        <div className="space-y-3">
          <p className="text-xs text-[#8B8B96] leading-relaxed">
            <strong>Vibe Director</strong> is an autonomous AI agent that translates your story ideas into complete multi-shot movies with locked continuity.
          </p>

          <div className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-[#0E0E14] p-4 text-xs">
            <div className="flex items-center gap-2.5 text-[#F2F2F5]">
              <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
              <span><strong>Autonomous Multi-Tool Sequencing</strong> (Characters → Sets → Video Takes → Voiceover)</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F2F2F5]">
              <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
              <span><strong>Full Model Tier Access</strong> (Kling 3.0 Turbo, Seedance, Nano Banana, Cinema Voice HD)</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F2F2F5]">
              <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
              <span><strong>Automatic Elements Hub Organization</strong> into Cast, Sets, and Props</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#F2F2F5]">
              <Check className="h-4 w-4 text-[#4ADE80] shrink-0" />
              <span><strong>Live Step-by-Step Transparency</strong> with 1-click timeline assembly</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#26262E]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-[#8B8B96] hover:text-[#F2F2F5]"
          >
            Continue with Manual Mode
          </Button>

          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-semibold shadow-lg shadow-[#7C5CFF]/20"
          >
            {isUpgrading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Upgrading Account...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Unlock Pro &amp; Start Directing
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
