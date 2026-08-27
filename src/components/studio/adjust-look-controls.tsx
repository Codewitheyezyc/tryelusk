"use client";

import React from "react";
import { Sparkles, Sun, Moon, Flame, Film, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AdjustLookOption {
  id: string;
  label: string;
  instruction: string;
  icon: React.ElementType;
}

export const ADJUST_LOOK_OPTIONS: AdjustLookOption[] = [
  {
    id: "warmer",
    label: "Make it warmer",
    instruction: "Enhance color temperature with warm golden sunset tones and rich amber highlights",
    icon: Flame,
  },
  {
    id: "dramatic",
    label: "Make it more dramatic",
    instruction: "Apply deep Chiaroscuro high-contrast shadows, intense moody lighting, and cinematic edge flare",
    icon: Clapperboard,
  },
  {
    id: "brighten",
    label: "Brighten it up",
    instruction: "Increase luminous exposure with clean soft-diffused daylight and vibrant neutral tones",
    icon: Sun,
  },
  {
    id: "moody",
    label: "Make it moody & dark",
    instruction: "Underexpose shadows with dark noir atmosphere, subtle mist, and atmospheric low-key lighting",
    icon: Moon,
  },
  {
    id: "grain",
    label: "Add 35mm film grain",
    instruction: "Add authentic 35mm analog film grain, vintage lens halation, and Kodak Portra film stock",
    icon: Film,
  },
];

interface AdjustLookControlsProps {
  onApplyAdjustment: (adjustment: AdjustLookOption) => void;
  disabled?: boolean;
}

export function AdjustLookControls({
  onApplyAdjustment,
  disabled = false,
}: AdjustLookControlsProps) {
  return (
    <div className="space-y-2.5 pt-4 border-t border-[#26262E]">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#F2F2F5] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#7C5CFF]" />
          Adjust the Look
        </label>
        <span className="text-[11px] text-[#8B8B96]">
          Directorial 1-Click Tweaks
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ADJUST_LOOK_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <Button
              key={opt.id}
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onApplyAdjustment(opt)}
              className="h-8 text-xs border-[#26262E] bg-[#0B0B0F]/70 text-[#F2F2F5] hover:border-[#7C5CFF]/60 hover:bg-[#7C5CFF]/10 transition-colors"
            >
              <Icon className="mr-1.5 h-3.5 w-3.5 text-[#7C5CFF]" />
              {opt.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
