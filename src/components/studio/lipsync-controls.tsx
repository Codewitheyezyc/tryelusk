"use client";

import React from "react";
import { Video, Mic, Wand2, Volume2, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types/database.types";

interface LipSyncControlsProps {
  userVideos: Generation[];
  userAudios: Generation[];
  selectedVideoUrl: string;
  selectedAudioUrl: string;
  selectedEngine: string;
  durationSeconds: number;
  onSelectVideo: (url: string, duration?: number) => void;
  onSelectAudio: (url: string) => void;
  onChangeEngine: (engine: string) => void;
  onChangeDuration: (dur: number) => void;
  disabled?: boolean;
}

export function LipSyncControls({
  userVideos,
  userAudios,
  selectedVideoUrl,
  selectedAudioUrl,
  selectedEngine,
  durationSeconds,
  onSelectVideo,
  onSelectAudio,
  onChangeEngine,
  onChangeDuration,
  disabled = false,
}: LipSyncControlsProps) {
  const getMediaUrl = (gen: Generation): string => {
    if (Array.isArray(gen.output_urls) && gen.output_urls.length > 0) {
      return String(gen.output_urls[0]);
    }
    return gen.output_url || "";
  };

  return (
    <div className="space-y-6">
      {/* 1. SELECT VIDEO TAKE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
            <Video className="h-3.5 w-3.5 text-[#7C5CFF]" />
            1. Select Motion Take (Silent Video)
          </label>
          <span className="text-[10px] text-[#8B8B96] font-mono">
            {userVideos.length} takes available
          </span>
        </div>

        {userVideos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
            {userVideos.map((v) => {
              const url = getMediaUrl(v);
              const isSelected = selectedVideoUrl === url;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVideo(url, v.duration_seconds || 5)}
                  disabled={disabled || !url}
                  className={cn(
                    "relative aspect-video rounded-xl border overflow-hidden text-left transition-all group",
                    isSelected
                      ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/30 shadow-lg shadow-[#7C5CFF]/20"
                      : "border-white/[0.08] hover:border-[#7C5CFF]/50 bg-[#0E0E14]/70"
                  )}
                >
                  {url && (
                    <video src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" muted />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 p-2.5 flex flex-col justify-between">
                    <span className="text-[9px] font-mono bg-black/80 px-2 py-0.5 rounded-full text-white self-start border border-white/10 backdrop-blur-md">
                      {v.duration_seconds || 5}s
                    </span>
                    <span className="text-[10px] text-white font-semibold truncate">
                      {v.prompt}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#7C5CFF] flex items-center justify-center text-white shadow-sm">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-white/[0.08] text-center text-xs text-[#8B8B96] bg-[#0E0E14]/50">
            No silent video takes in vault yet. Direct a scene in Video Motion mode first.
          </div>
        )}
      </div>

      {/* 2. SELECT AUDIO DIALOGUE TRACK */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
            <Mic className="h-3.5 w-3.5 text-[#FBBF24]" />
            2. Select Voiceover Dialogue Track
          </label>
          <span className="text-[10px] text-[#8B8B96] font-mono">
            {userAudios.length} tracks available
          </span>
        </div>

        {userAudios.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto pr-1">
            {userAudios.map((a) => {
              const url = getMediaUrl(a);
              const isSelected = selectedAudioUrl === url;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onSelectAudio(url)}
                  disabled={disabled || !url}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 group",
                    isSelected
                      ? "bg-[#FBBF24]/10 border-[#FBBF24] ring-2 ring-[#FBBF24]/30 text-white shadow-md"
                      : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E] hover:border-[#FBBF24]/40"
                  )}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                    <div
                      className={cn(
                        "p-2 rounded-lg border shrink-0",
                        isSelected
                          ? "border-[#FBBF24]/40 bg-[#FBBF24]/20 text-[#FBBF24]"
                          : "border-white/[0.06] bg-black/40 text-[#8B8B96]"
                      )}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium text-[#F2F2F5] truncate">
                      {a.prompt}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8B8B96] shrink-0 font-mono">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-white/[0.08] text-center text-xs text-[#8B8B96] bg-[#0E0E14]/50">
            No audio voice tracks in vault yet. Generate a dialogue clip in Voice Audio mode first.
          </div>
        )}
      </div>

      {/* 3. LIP-SYNC ENGINE SELECTION */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
          <Wand2 className="h-3.5 w-3.5 text-[#4ADE80]" />
          3. Lip-Sync Alignment Engine
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChangeEngine("sync-lipsync-fast")}
            disabled={disabled}
            className={cn(
              "p-3.5 rounded-xl border text-left transition-all",
              selectedEngine === "sync-lipsync-fast"
                ? "bg-[#4ADE80]/10 border-[#4ADE80] ring-2 ring-[#4ADE80]/30 text-white shadow-lg shadow-[#4ADE80]/10"
                : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:border-[#4ADE80]/40"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#F2F2F5]">Fast Motion Lip-Sync</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#4ADE80]">
                1 cr / sec
              </span>
            </div>
            <p className="text-[11px] text-[#8B8B96] leading-relaxed">
              Rapid kinetic mouth alignment for dialogue scenes (5s = 5 Credits)
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChangeEngine("sync-lipsync-pro")}
            disabled={disabled}
            className={cn(
              "p-3.5 rounded-xl border text-left transition-all",
              selectedEngine === "sync-lipsync-pro"
                ? "bg-[#7C5CFF]/10 border-[#7C5CFF] ring-2 ring-[#7C5CFF]/30 text-white shadow-lg shadow-[#7C5CFF]/10"
                : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:border-[#7C5CFF]/40"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#F2F2F5]">Sync Master Pro</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF]">
                18 cr / sec
              </span>
            </div>
            <p className="text-[11px] text-[#8B8B96] leading-relaxed">
              Deep phoneme alignment with micro facial expressions (5s = 90 Credits)
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
