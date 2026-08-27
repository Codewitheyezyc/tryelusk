"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Volume2,
  Clapperboard,
  Trash2,
  MoreHorizontal,
  Layers,
  ArrowUpRight,
  User,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AUDIO_VOICES } from "@/components/audio/audio-studio-client";
import type { Character } from "@/types/database.types";

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  let parsedMeta: any = {};
  try {
    parsedMeta = JSON.parse(character.visual_spec || "{}");
  } catch {
    parsedMeta = { visual_spec: character.visual_spec };
  }

  const tag = parsedMeta.tag || `@${character.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const voiceId = parsedMeta.voice_id || "Rachel";
  const role = parsedMeta.role || "Lead Cast";
  const voice = AUDIO_VOICES.find((v) => v.id === voiceId) || AUDIO_VOICES[0];

  const handleDirectScene = () => {
    const promptWithTag = `Cinematic scene featuring ${tag}, dramatic shot...`;
    router.push(
      `/generate?type=video&characterId=${character.id}&prompt=${encodeURIComponent(promptWithTag)}`
    );
  };

  const handleVoiceStudio = () => {
    router.push(`/audio?voiceId=${voiceId}`);
  };

  return (
    <div className="group relative rounded-3xl border border-white/[0.08] bg-[#0E0E14] overflow-hidden hover:border-[#7C5CFF]/60 hover:shadow-2xl hover:shadow-[#7C5CFF]/15 transition-all duration-300 flex flex-col justify-between select-none">
      {/* 1. TOP 3-PANEL TURNAROUND VISUAL */}
      <div className="relative aspect-[16/9] w-full bg-[#040406] overflow-hidden">
        {character.reference_sheet_url ? (
          <img
            src={character.reference_sheet_url}
            alt={character.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black/40 text-[#8B8B96]">
            <User className="h-8 w-8 mb-1 opacity-50 text-[#7C5CFF]" />
            <span className="text-[10px]">Reference Sheet Pending</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-black/80 text-[#7C5CFF] border border-[#7C5CFF]/40 backdrop-blur-md shadow-md">
            {tag}
          </span>

          <div className="flex items-center gap-1 pointer-events-auto">
            {/* Overflow Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-7 w-7 rounded-full bg-black/80 text-white border border-white/15 flex items-center justify-center backdrop-blur-md hover:bg-black transition-colors"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-32 rounded-2xl border border-white/[0.1] bg-[#0E0E14] p-1.5 shadow-2xl z-50 animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${character.name} from your Cast Room?`)) {
                        onDelete(character.id);
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#F87171] hover:bg-[#F87171]/10 text-left"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Cast</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Turnaround Indicator */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/80 text-[10px] font-mono text-white/90 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
          <span>3-Angle Locked DNA</span>
        </div>
      </div>

      {/* 2. CAST INFO & VOICE PAIRING */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white group-hover:text-[#7C5CFF] transition-colors truncate">
              {character.name}
            </h3>
            <span className="text-[11px] font-medium text-[#8B8B96]">
              {role}
            </span>
          </div>
          <p className="text-xs text-[#8B8B96] line-clamp-2 leading-relaxed">
            {character.description}
          </p>
        </div>

        {/* Voice Pairing Pill */}
        <div
          onClick={handleVoiceStudio}
          className="flex items-center justify-between p-2.5 rounded-2xl border border-white/[0.08] bg-black/40 hover:bg-white/[0.04] cursor-pointer transition-all group/voice"
          title="Open Audio Studio with this voice"
        >
          <div className="flex items-center gap-2.5">
            <img
              src={voice.avatar}
              alt={voice.name}
              className="h-6 w-6 rounded-full object-cover border border-white/20 shrink-0"
            />
            <div className="leading-none">
              <span className="text-xs font-bold text-white block group-hover/voice:text-[#7C5CFF] transition-colors">
                {voice.name}
              </span>
              <span className="text-[10px] text-[#8B8B96] block mt-0.5">
                Paired Voice Actor
              </span>
            </div>
          </div>

          <Volume2 className="h-4 w-4 text-[#8B8B96] group-hover/voice:text-[#7C5CFF] transition-colors" />
        </div>

        {/* Primary CTA: "Direct Scene with @Character" */}
        <button
          type="button"
          onClick={handleDirectScene}
          className="w-full h-10 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white font-bold text-xs shadow-lg shadow-[#7C5CFF]/20 flex items-center justify-center gap-2 transition-all tracking-tight"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
          <span>Direct Scene with {tag}</span>
        </button>
      </div>
    </div>
  );
}
