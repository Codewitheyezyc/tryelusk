"use client";

import React from "react";
import {
  Camera,
  SunMedium,
  Move,
  Compass,
  Zap,
  Eye,
  Sunset,
  Moon,
  CloudFog,
  Sun,
  Flame,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CAMERA_CHIPS_DATA,
  LIGHTING_CHIPS_DATA,
  type DirectorChipData,
} from "@/components/studio/director-chips-data";

export interface DirectorChip extends DirectorChipData {
  icon: React.ComponentType<{ className?: string }>;
}

const CAMERA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "push-in": Camera,
  steadicam: Move,
  "drone-orbit": Compass,
  "dutch-angle": Eye,
  "whip-pan": Zap,
  handheld: Flame,
};

const LIGHTING_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "golden-hour": Sunset,
  "cyberpunk-neon": Zap,
  chiaroscuro: Moon,
  "volumetric-haze": CloudFog,
  "high-key": Sun,
};

export const CAMERA_CHIPS: DirectorChip[] = CAMERA_CHIPS_DATA.map((c) => ({
  ...c,
  icon: CAMERA_ICONS[c.id] || Camera,
}));

export const LIGHTING_CHIPS: DirectorChip[] = LIGHTING_CHIPS_DATA.map((l) => ({
  ...l,
  icon: LIGHTING_ICONS[l.id] || SunMedium,
}));

interface DirectorChipsBarProps {
  mediaType: "image" | "video" | "audio" | "lipsync";
  selectedCameraId?: string;
  selectedLightingId?: string;
  onSelectCamera: (chip: DirectorChip | null) => void;
  onSelectLighting: (chip: DirectorChip | null) => void;
  disabled?: boolean;
}

export function DirectorChipsBar({
  mediaType,
  selectedCameraId,
  selectedLightingId,
  onSelectCamera,
  onSelectLighting,
  disabled = false,
}: DirectorChipsBarProps) {
  if (mediaType === "audio" || mediaType === "lipsync") return null;

  return (
    <div className="space-y-3.5 p-4 rounded-xl border border-white/[0.08] bg-[#0E0E14]/70 backdrop-blur-md">
      {/* Lighting Mood Chips (Image & Video) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
            <SunMedium className="h-3.5 w-3.5 text-[#FBBF24]" />
            Director Lighting Mood:
          </span>
          {selectedLightingId && (
            <button
              type="button"
              onClick={() => onSelectLighting(null)}
              className="text-[10px] font-mono text-[#7C5CFF] hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {LIGHTING_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selectedLightingId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onSelectLighting(isSelected ? null : chip)}
                disabled={disabled}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap group",
                  isSelected
                    ? "bg-[#FBBF24]/15 border-[#FBBF24] text-[#FBBF24] ring-2 ring-[#FBBF24]/30 shadow-md shadow-[#FBBF24]/10"
                    : "border-white/[0.06] bg-black/40 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E]"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-[#FBBF24]" : "text-[#8B8B96] group-hover:text-white")} />
                <span>{chip.label}</span>
                {isSelected && <Check className="h-3 w-3 stroke-[3] ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Movement Chips (Video Only) */}
      {mediaType === "video" && (
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
              <Camera className="h-3.5 w-3.5 text-[#7C5CFF]" />
              Camera Movement:
            </span>
            {selectedCameraId && (
              <button
                type="button"
                onClick={() => onSelectCamera(null)}
                className="text-[10px] font-mono text-[#7C5CFF] hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CAMERA_CHIPS.map((chip) => {
              const Icon = chip.icon;
              const isSelected = selectedCameraId === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onSelectCamera(isSelected ? null : chip)}
                  disabled={disabled}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap group",
                    isSelected
                      ? "bg-[#7C5CFF]/15 border-[#7C5CFF] text-[#7C5CFF] ring-2 ring-[#7C5CFF]/30 shadow-md shadow-[#7C5CFF]/10"
                      : "border-white/[0.06] bg-black/40 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E]"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-[#7C5CFF]" : "text-[#8B8B96] group-hover:text-white")} />
                  <span>{chip.label}</span>
                  {isSelected && <Check className="h-3 w-3 stroke-[3] ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
