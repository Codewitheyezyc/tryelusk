"use client";

import React from "react";
import {
  Sparkles,
  Play,
  Film,
  Volume2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Copy,
  Layers,
  Camera,
  SunMedium,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoryboardScene } from "@/app/actions/storyboard";

interface SceneCardProps {
  scene: StoryboardScene;
  index: number;
  totalScenes: number;
  isActive: boolean;
  onSelect: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDelete: () => void;
  onContinueShot: (scene: StoryboardScene) => void;
  onAttachAudio?: (scene: StoryboardScene) => void;
}

export function SceneCard({
  scene,
  index,
  totalScenes,
  isActive,
  onSelect,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onContinueShot,
  onAttachAudio,
}: SceneCardProps) {
  const isVideo = scene.mediaType === "video";

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative w-64 sm:w-72 shrink-0 rounded-2xl border bg-[#0E0E14] overflow-hidden cursor-pointer transition-all duration-200 shadow-md flex flex-col justify-between",
        isActive
          ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/40 shadow-xl shadow-[#7C5CFF]/15"
          : "border-white/[0.08] hover:border-white/20"
      )}
    >
      {/* 1. TOP HEADER BAR */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-white/[0.06] bg-black/30 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#7C5CFF]" />
          <span className="font-bold text-white font-mono">
            SCENE {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Move Left / Right Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft();
            }}
            className="p-1 rounded hover:bg-white/10 text-[#8B8B96] hover:text-white disabled:opacity-30"
            title="Move Left"
          >
            <ArrowLeft className="h-3 w-3" />
          </button>

          <button
            type="button"
            disabled={index === totalScenes - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight();
            }}
            className="p-1 rounded hover:bg-white/10 text-[#8B8B96] hover:text-white disabled:opacity-30"
            title="Move Right"
          >
            <ArrowRight className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded hover:bg-[#F87171]/20 text-[#8B8B96] hover:text-[#F87171]"
            title="Remove Scene"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 2. MEDIA PREVIEW */}
      <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
        {isVideo ? (
          <video
            src={scene.mediaUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        ) : (
          <img
            src={scene.mediaUrl}
            alt={scene.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Play Icon on Video */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-8 w-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center shadow-lg">
              <Play className="h-3.5 w-3.5 fill-white translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-mono text-white border border-white/15">
          {scene.durationSeconds || 5}s
        </div>

        {/* Audio Badge */}
        {scene.audioUrl && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#4ADE80]/30 text-[10px] font-mono text-[#4ADE80] border border-[#4ADE80]/40 flex items-center gap-1">
            <Volume2 className="h-2.5 w-2.5" />
            <span>Audio</span>
          </div>
        )}
      </div>

      {/* 3. SHOT METADATA & CONTINUITY CTA */}
      <div className="p-3 space-y-2 text-xs">
        <p className="text-[#F2F2F5] font-medium line-clamp-2 text-[11px] leading-relaxed">
          {scene.prompt}
        </p>

        {/* Parameter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap text-[9px] font-mono text-[#8B8B96]">
          {scene.cameraMovement && (
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              {scene.cameraMovement}
            </span>
          )}
          {scene.lightingMood && (
            <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              {scene.lightingMood}
            </span>
          )}
        </div>

        {/* Continuity CTA: "Continue Shot" */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onContinueShot(scene);
          }}
          className="w-full h-7 rounded-xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 text-[#7C5CFF] font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
        >
          <Sparkles className="h-3 w-3 text-[#FBBF24]" />
          <span>Match Cut / Next Shot</span>
        </button>
      </div>
    </div>
  );
}
