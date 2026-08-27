"use client";

import React, { useState } from "react";
import { X, Film, Sparkles, Check, Search, Volume2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types/database.types";
import type { StoryboardScene } from "@/app/actions/storyboard";

interface AddTakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  generations: Generation[];
  onAddScene: (scene: StoryboardScene) => void;
  nextSceneNumber: number;
}

export function AddTakeModal({
  isOpen,
  onClose,
  generations,
  onAddScene,
  nextSceneNumber,
}: AddTakeModalProps) {
  const [selectedGenId, setSelectedGenId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "video" | "image">("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filtered = generations.filter((gen) => {
    const matchesType = filterType === "all" || gen.type === filterType;
    const matchesSearch =
      !searchQuery ||
      gen.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gen.model_used.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleConfirm = () => {
    if (!selectedGenId) return;
    const gen = generations.find((g) => g.id === selectedGenId);
    if (!gen) return;

    const url =
      gen.output_url ||
      (Array.isArray(gen.output_urls) && gen.output_urls.length > 0
        ? String(gen.output_urls[0])
        : "");

    const newScene: StoryboardScene = {
      id: `scene-${Date.now()}`,
      sceneNumber: nextSceneNumber,
      title: `Scene ${nextSceneNumber}`,
      prompt: gen.prompt,
      mediaUrl: url,
      mediaType: gen.type === "video" ? "video" : "image",
      durationSeconds: gen.duration_seconds || 5,
      generationId: gen.id,
      lightingMood: (gen.technical_params as any)?.lighting,
      cameraMovement: (gen.technical_params as any)?.camera_movement,
    };

    onAddScene(newScene);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/[0.1] bg-[#0E0E14] shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-[#7C5CFF]" />
            <h3 className="text-sm font-bold text-white">
              Add Take to Storyboard (Scene {nextSceneNumber})
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8B8B96] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-colors",
                filterType === "all" ? "bg-white/[0.1] text-white" : "text-[#8B8B96]"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType("video")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-colors",
                filterType === "video" ? "bg-white/[0.1] text-white" : "text-[#8B8B96]"
              )}
            >
              Videos
            </button>
            <button
              type="button"
              onClick={() => setFilterType("image")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-colors",
                filterType === "image" ? "bg-white/[0.1] text-white" : "text-[#8B8B96]"
              )}
            >
              Images
            </button>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B8B96]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by prompt or model..."
              className="w-full h-8 pl-8 pr-3 rounded-xl border border-white/[0.08] bg-[#060608] text-xs text-white placeholder:text-[#8B8B96]/60 focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
            />
          </div>
        </div>

        {/* Grid of Takes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {filtered.map((gen) => {
            const url =
              gen.output_url ||
              (Array.isArray(gen.output_urls) && gen.output_urls.length > 0
                ? String(gen.output_urls[0])
                : "");
            if (!url) return null;

            const isSelected = selectedGenId === gen.id;

            return (
              <div
                key={gen.id}
                onClick={() => setSelectedGenId(gen.id)}
                className={cn(
                  "relative aspect-video rounded-xl border bg-[#060608] overflow-hidden cursor-pointer transition-all group",
                  isSelected
                    ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/50 shadow-md shadow-[#7C5CFF]/20"
                    : "border-white/[0.08] hover:border-white/20"
                )}
              >
                {gen.type === "video" ? (
                  <video src={url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={url} alt={gen.prompt} className="w-full h-full object-cover" />
                )}

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#7C5CFF] text-white flex items-center justify-center shadow">
                    <Check className="h-3 w-3" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                  <p className="text-[10px] text-white font-medium truncate">
                    {gen.prompt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8B8B96] hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedGenId}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-bold shadow-md shadow-[#7C5CFF]/30 disabled:opacity-50 transition-all"
          >
            Insert Scene
          </button>
        </div>
      </div>
    </div>
  );
}
