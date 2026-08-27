"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CinemaSidebar } from "@/components/studio/cinema-sidebar";
import { SequencePlayer } from "@/components/storyboard/sequence-player";
import { StoryboardTimeline } from "@/components/storyboard/storyboard-timeline";
import { AddTakeModal } from "@/components/storyboard/add-take-modal";
import { ExportCinemaModal } from "@/components/storyboard/export-cinema-modal";
import type { Generation } from "@/types/database.types";
import type { StoryboardScene } from "@/app/actions/storyboard";
import {
  Film,
  Sparkles,
  Plus,
  FolderDown,
  Edit3,
} from "lucide-react";

import { ProjectBreadcrumbs } from "@/components/shared/project-breadcrumbs";

interface StoryboardClientProps {
  initialGenerations: Generation[];
}

export function StoryboardClient({
  initialGenerations = [],
}: StoryboardClientProps) {
  const router = useRouter();

  // Clean empty sequence by default (users explicitly add their chosen takes)
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const [projectTitle, setProjectTitle] = useState("Untitled Cinema Sequence");
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Reorder Scenes in Timeline
  const handleMoveScene = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= scenes.length) return;
    const updated = [...scenes];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Update scene numbering
    const renumbered = updated.map((s, idx) => ({
      ...s,
      sceneNumber: idx + 1,
      title: s.title.startsWith("Scene") ? `Scene ${idx + 1}` : s.title,
    }));

    setScenes(renumbered);
    setActiveSceneIndex(toIndex);
  };

  // Delete Scene
  const handleDeleteScene = (index: number) => {
    const updated = scenes.filter((_, idx) => idx !== index);
    const renumbered = updated.map((s, idx) => ({
      ...s,
      sceneNumber: idx + 1,
    }));
    setScenes(renumbered);
    if (activeSceneIndex >= renumbered.length) {
      setActiveSceneIndex(Math.max(0, renumbered.length - 1));
    }
  };

  // Continuity Action: "Continue Shot"
  const handleContinueShot = (scene: StoryboardScene) => {
    const cleanPrompt = scene.prompt.replace(/\[.*?\]/g, "").trim();
    const continuityQuery = encodeURIComponent(
      `Next shot continuing scene: ${cleanPrompt}, maintaining visual continuity and action`
    );
    router.push(`/generate?type=video&prompt=${continuityQuery}`);
  };

  // Add Scene to Sequence
  const handleAddScene = (newScene: StoryboardScene) => {
    setScenes((prev) => [...prev, newScene]);
    setActiveSceneIndex(scenes.length);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#060608] text-[#F2F2F5]">
      {/* 1. SIDEBAR with correct activeView */}
      <CinemaSidebar activeView="storyboard" />

      {/* 2. MAIN STORYBOARD & TIMELINE WORKSPACE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto pb-36">
        {/* Interactive Breadcrumb Bar */}
        <ProjectBreadcrumbs showCurrentAction="Storyboard Timeline" />

        {/* Top Sequence Title & Export Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full text-lg sm:text-2xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#7C5CFF] focus:outline-none tracking-tight px-0 truncate"
              />
              <Edit3 className="h-4 w-4 text-[#8B8B96] shrink-0" />
            </div>
            <p className="text-xs text-[#8B8B96]">
              Master multi-scene storyboard timeline &amp; continuity sequencer.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors border border-white/[0.08]"
            >
              <Plus className="h-4 w-4" />
              <span>Insert Take</span>
            </button>

            <button
              type="button"
              disabled={scenes.length === 0}
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-md shadow-[#7C5CFF]/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <FolderDown className="h-4 w-4" />
              <span>Export Package</span>
            </button>
          </div>
        </div>

        {/* UPPER: CONTINUOUS SEQUENCE CINEMA MONITOR */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold font-mono text-[#8B8B96]">
            <span className="uppercase tracking-wider">Continuous Cinema Monitor</span>
            <span>Seamless Multi-Take Cut</span>
          </div>

          <SequencePlayer
            scenes={scenes}
            activeSceneIndex={activeSceneIndex}
            onSelectSceneIndex={setActiveSceneIndex}
            onContinueShot={handleContinueShot}
          />
        </div>

        {/* LOWER: INTERACTIVE STORYBOARD TIMELINE */}
        <StoryboardTimeline
          scenes={scenes}
          activeSceneIndex={activeSceneIndex}
          onSelectScene={setActiveSceneIndex}
          onMoveScene={handleMoveScene}
          onDeleteScene={handleDeleteScene}
          onContinueShot={handleContinueShot}
          onAddScene={() => setIsAddModalOpen(true)}
        />
      </main>

      {/* Add Take Modal */}
      <AddTakeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        generations={initialGenerations}
        onAddScene={handleAddScene}
        nextSceneNumber={scenes.length + 1}
      />

      {/* Master Cinema Exporter Modal */}
      <ExportCinemaModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        scenes={scenes}
        projectTitle={projectTitle}
      />
    </div>
  );
}
