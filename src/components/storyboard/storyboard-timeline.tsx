"use client";

import React from "react";
import { Plus, ArrowRight, Layers, Film } from "lucide-react";
import { SceneCard } from "@/components/storyboard/scene-card";
import type { StoryboardScene } from "@/app/actions/storyboard";

interface StoryboardTimelineProps {
  scenes: StoryboardScene[];
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onMoveScene: (fromIndex: number, toIndex: number) => void;
  onDeleteScene: (index: number) => void;
  onContinueShot: (scene: StoryboardScene) => void;
  onAddScene: () => void;
}

export function StoryboardTimeline({
  scenes,
  activeSceneIndex,
  onSelectScene,
  onMoveScene,
  onDeleteScene,
  onContinueShot,
  onAddScene,
}: StoryboardTimelineProps) {
  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs font-bold font-mono text-[#8B8B96]">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-[#7C5CFF]" />
          <span className="uppercase tracking-wider">Scene Storyboard Sequence</span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white border border-white/[0.08]">
            {scenes.length} Scenes
          </span>
        </div>

        <button
          type="button"
          onClick={onAddScene}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#7C5CFF]/40 bg-[#7C5CFF]/15 hover:bg-[#7C5CFF]/25 text-[#7C5CFF] font-bold text-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Scene</span>
        </button>
      </div>

      {/* Horizontal Scrollable Timeline Track */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 custom-scrollbar">
        {scenes.map((scene, idx) => (
          <React.Fragment key={scene.id}>
            <SceneCard
              scene={scene}
              index={idx}
              totalScenes={scenes.length}
              isActive={idx === activeSceneIndex}
              onSelect={() => onSelectScene(idx)}
              onMoveLeft={() => onMoveScene(idx, idx - 1)}
              onMoveRight={() => onMoveScene(idx, idx + 1)}
              onDelete={() => onDeleteScene(idx)}
              onContinueShot={onContinueShot}
            />

            {/* Cut Transition Indicator between scenes */}
            {idx < scenes.length - 1 && (
              <div className="flex flex-col items-center gap-1 shrink-0 px-1 text-[10px] font-mono text-[#8B8B96]/60">
                <ArrowRight className="h-4 w-4" />
                <span>CUT</span>
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Add Scene Card Placeholder */}
        <button
          type="button"
          onClick={onAddScene}
          className="w-56 h-48 shrink-0 rounded-2xl border-2 border-dashed border-white/[0.1] hover:border-[#7C5CFF]/60 bg-[#0E0E14]/40 hover:bg-[#7C5CFF]/5 flex flex-col items-center justify-center gap-2 text-[#8B8B96] hover:text-white transition-all group"
        >
          <div className="h-10 w-10 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-[#7C5CFF]/40 flex items-center justify-center text-[#7C5CFF] group-hover:scale-110 transition-transform">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold font-mono">Add Next Scene</span>
        </button>
      </div>
    </div>
  );
}
