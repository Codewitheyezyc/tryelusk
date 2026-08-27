"use client";

import React from "react";
import { Clock, Monitor, RectangleHorizontal, Smartphone, Square, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
  duration: number;
  resolution: string;
  aspectRatio: string;
  supportedDurations?: number[];
  supportedResolutions?: string[];
  supportedAspectRatios?: string[];
  resolutionMultipliers?: Record<string, number>;
  onChangeDuration: (dur: number) => void;
  onChangeResolution: (res: string) => void;
  onChangeAspectRatio: (ratio: string) => void;
  disabled?: boolean;
}

export function VideoControls({
  duration,
  resolution,
  aspectRatio,
  supportedDurations = [5, 10],
  supportedResolutions = ["720p", "1080p"],
  supportedAspectRatios = ["16:9", "9:16", "1:1"],
  resolutionMultipliers = { "720p": 1.0, "1080p": 1.4 },
  onChangeDuration,
  onChangeResolution,
  onChangeAspectRatio,
  disabled = false,
}: VideoControlsProps) {
  const getAspectIcon = (ratio: string) => {
    switch (ratio) {
      case "9:16":
        return <Smartphone className="h-3.5 w-3.5" />;
      case "1:1":
        return <Square className="h-3.5 w-3.5" />;
      default:
        return <RectangleHorizontal className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. DURATION & RESOLUTION ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Duration Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
            <Clock className="h-3.5 w-3.5 text-[#7C5CFF]" />
            Take Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            {supportedDurations.map((sec) => {
              const isSelected = duration === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onChangeDuration(sec)}
                  disabled={disabled}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between",
                    isSelected
                      ? "border-[#7C5CFF] bg-[#161624] ring-2 ring-[#7C5CFF]/30 text-white shadow-md shadow-[#7C5CFF]/15"
                      : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E]"
                  )}
                >
                  <div>
                    <span className="text-xs font-bold font-mono block">{sec}s Beat</span>
                    <span className="text-[10px] text-[#8B8B96]">
                      {sec <= 5 ? "Fast Take" : "Extended"}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-[#7C5CFF] shadow-sm shadow-[#7C5CFF]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resolution Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
            <Monitor className="h-3.5 w-3.5 text-[#4ADE80]" />
            Render Resolution
          </label>
          <div className="grid grid-cols-2 gap-2">
            {supportedResolutions.map((resKey) => {
              const isSelected = resolution === resKey;
              const mult = resolutionMultipliers[resKey] || 1.0;
              return (
                <button
                  key={resKey}
                  type="button"
                  onClick={() => onChangeResolution(resKey)}
                  disabled={disabled}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all flex items-center justify-between",
                    isSelected
                      ? "border-[#4ADE80] bg-[#4ADE80]/10 ring-2 ring-[#4ADE80]/30 text-white shadow-md shadow-[#4ADE80]/15"
                      : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E]"
                  )}
                >
                  <div>
                    <span className="text-xs font-bold font-mono block uppercase">
                      {resKey}
                    </span>
                    <span className="text-[10px] text-[#8B8B96] font-mono">{mult}x rate</span>
                  </div>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-[#4ADE80] shadow-sm shadow-[#4ADE80]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. CINEMATIC ASPECT RATIO */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
          <RectangleHorizontal className="h-3.5 w-3.5 text-[#FBBF24]" />
          Cinematic Aspect Ratio
        </label>

        <div className="grid grid-cols-3 gap-2.5">
          {supportedAspectRatios.map((ratio) => {
            const isSelected = aspectRatio === ratio;
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => onChangeAspectRatio(ratio)}
                disabled={disabled}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5",
                  isSelected
                    ? "border-[#FBBF24] bg-[#FBBF24]/10 ring-2 ring-[#FBBF24]/30 text-white shadow-md shadow-[#FBBF24]/15"
                    : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E]"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold font-mono">{ratio}</span>
                  <div className={isSelected ? "text-[#FBBF24]" : "text-[#8B8B96]"}>
                    {getAspectIcon(ratio)}
                  </div>
                </div>
                <span className="text-[10px] text-[#8B8B96] truncate">
                  {ratio === "16:9" ? "Cinema 16:9" : ratio === "9:16" ? "Vertical 9:16" : "Square 1:1"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
