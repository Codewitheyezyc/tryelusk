"use client";

import React from "react";
import { Mic, Volume2, UserCheck, Sparkles, AudioWaveform } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VoiceOption {
  id: string;
  name: string;
  category: string;
  description: string;
  gender: "female" | "male";
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "Rachel",
    name: "Rachel",
    category: "Cinematic Narrator",
    description: "Warm, authoritative, and clear storytelling voice",
    gender: "female",
  },
  {
    id: "Adam",
    name: "Adam",
    category: "Dramatic Protagonist",
    description: "Deep, resonant, and gritty cinematic lead",
    gender: "male",
  },
  {
    id: "Domi",
    name: "Domi",
    category: "Action & Cyberpunk",
    description: "Sharp, intense, and modern character voice",
    gender: "female",
  },
  {
    id: "Drew",
    name: "Drew",
    category: "Documentary & Trailer",
    description: "Confident, engaging, and dynamic film trailer tone",
    gender: "male",
  },
  {
    id: "Nicole",
    name: "Nicole",
    category: "Atmospheric & Whispered",
    description: "Soft, emotional, and intimate cinematic delivery",
    gender: "female",
  },
  {
    id: "Clyde",
    name: "Clyde",
    category: "Veteran Hero",
    description: "Grizzled, seasoned, and gravitas-rich tone",
    gender: "male",
  },
];

interface AudioControlsProps {
  selectedVoice: string;
  onChangeVoice: (voiceId: string) => void;
  disabled?: boolean;
}

export function AudioControls({
  selectedVoice,
  onChangeVoice,
  disabled = false,
}: AudioControlsProps) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
          <Mic className="h-3.5 w-3.5 text-[#FBBF24]" />
          Cast Voice Actor
        </label>
        <span className="text-[11px] text-[#4ADE80] font-mono px-2 py-0.5 rounded-full bg-[#4ADE80]/15 border border-[#4ADE80]/30">
          4 Credits / Clip
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {VOICE_OPTIONS.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChangeVoice(v.id)}
              disabled={disabled}
              className={cn(
                "p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group",
                isSelected
                  ? "bg-[#FBBF24]/10 border-[#FBBF24] ring-2 ring-[#FBBF24]/30 shadow-lg shadow-[#FBBF24]/10 text-white"
                  : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E] hover:border-[#FBBF24]/40"
              )}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg border",
                      isSelected
                        ? "border-[#FBBF24]/40 bg-[#FBBF24]/20 text-[#FBBF24]"
                        : "border-white/[0.06] bg-black/40 text-[#8B8B96]"
                    )}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F2F2F5] block">
                      {v.name}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-[#8B8B96]">
                      {v.category}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-[#FBBF24] shadow-sm shadow-[#FBBF24]" />
                )}
              </div>

              <p className="text-[11px] text-[#8B8B96] line-clamp-2 leading-relaxed">
                {v.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
