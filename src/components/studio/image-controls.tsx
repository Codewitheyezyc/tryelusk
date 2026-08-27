"use client";

import React from "react";
import { RectangleHorizontal, Sparkles, Smartphone, Square, Film } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageControlsProps {
  aspectRatio: string;
  onChangeAspectRatio: (ratio: string) => void;
  supportedAspectRatios?: string[];
  modelQualityLabel?: string;
  disabled?: boolean;
}

export function ImageControls({
  aspectRatio,
  onChangeAspectRatio,
  supportedAspectRatios = ["16:9", "21:9", "9:16", "1:1", "4:3"],
  modelQualityLabel = "High-Res Master Frame",
  disabled = false,
}: ImageControlsProps) {
  const getAspectIcon = (ratio: string) => {
    switch (ratio) {
      case "9:16":
        return <Smartphone className="h-3.5 w-3.5" />;
      case "1:1":
        return <Square className="h-3.5 w-3.5" />;
      case "21:9":
        return <Film className="h-3.5 w-3.5" />;
      default:
        return <RectangleHorizontal className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-3.5 p-4 rounded-xl border border-white/[0.08] bg-[#0E0E14]/70 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
          <RectangleHorizontal className="h-3.5 w-3.5 text-[#7C5CFF]" />
          Cinematic Aspect Ratio
        </label>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#4ADE80]">
          <Sparkles className="h-3 w-3" />
          <span>{modelQualityLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {supportedAspectRatios.map((ratio) => {
          const isSelected = aspectRatio === ratio;
          return (
            <button
              key={ratio}
              type="button"
              onClick={() => onChangeAspectRatio(ratio)}
              disabled={disabled}
              className={cn(
                "p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1",
                isSelected
                  ? "border-[#7C5CFF] bg-[#161624] ring-2 ring-[#7C5CFF]/30 text-white shadow-md shadow-[#7C5CFF]/15"
                  : "border-white/[0.06] bg-black/40 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E]"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold font-mono">{ratio}</span>
                <div className={isSelected ? "text-[#7C5CFF]" : "text-[#8B8B96]"}>
                  {getAspectIcon(ratio)}
                </div>
              </div>
              <span className="text-[9px] text-[#8B8B96] truncate">
                {ratio === "16:9"
                  ? "Widescreen"
                  : ratio === "21:9"
                  ? "Anamorphic"
                  : ratio === "9:16"
                  ? "Vertical"
                  : ratio === "1:1"
                  ? "Square"
                  : "Classic"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
