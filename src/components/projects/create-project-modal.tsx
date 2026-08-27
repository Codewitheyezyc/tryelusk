"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FolderPlus,
  X,
  Sparkles,
  Sliders,
  Ratio,
  Film,
  Check,
} from "lucide-react";
import { useProjects, type Project } from "@/context/project-context";
import { Button } from "@/components/ui/button";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
}

const GENRE_PRESETS = [
  { label: "Cyberpunk & Sci-Fi", icon: "🌆", value: "Cyberpunk / Sci-Fi" },
  { label: "Cinema Action & Thriller", icon: "⚔️", value: "Action / Thriller" },
  { label: "Commercial & Brand Spot", icon: "🥐", value: "Commercial" },
  { label: "Noir & Mystery", icon: "🕵️", value: "Noir" },
  { label: "Fantasy & Adventure", icon: "🐉", value: "Fantasy" },
  { label: "Horror & Suspense", icon: "🕯️", value: "Horror" },
];

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { createProject } = useProjects();
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Cyberpunk / Sci-Fi");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "21:9" | "1:1">("16:9");
  const [targetFps, setTargetFps] = useState<24 | 25 | 30 | 60>(24);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProj = createProject({
      title: title.trim(),
      description: description.trim() || `Cinematic ${genre} production workspace.`,
      genre,
      aspectRatio,
      targetFps,
    });

    setTitle("");
    setDescription("");

    if (onCreated) {
      onCreated(newProj);
    }
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border border-white/[0.12] bg-[#0E0E14] shadow-[0_25px_70px_rgba(0,0,0,0.98)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-white/[0.08] shrink-0 bg-[#0E0E14]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#6D3EFF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7C5CFF]/30 shrink-0">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                New Film Project Workspace
              </h2>
              <p className="text-xs text-[#8B8B96] mt-0.5">
                Set up a dedicated workspace for scenes, cast members, and timelines.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#D1D1DB] flex items-center justify-between">
                <span>Film Title</span>
                <span className="text-[10px] text-[#8B8B96]">Required</span>
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neo-Shinjuku Noir 2099"
                className="w-full h-10 px-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0A0A10] text-xs sm:text-sm text-white placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all"
                required
              />
            </div>

            {/* Synopsis / Logline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#D1D1DB]">
                Logline &amp; Synopsis
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Describe the core story setup (used by AI Director for styling)..."
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0A0A10] p-3 text-xs sm:text-sm text-white placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all resize-none"
              />
            </div>

            {/* Genre Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#D1D1DB]">
                Genre &amp; Aesthetic
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GENRE_PRESETS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGenre(g.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      genre === g.value
                        ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white shadow-sm"
                        : "border-white/[0.06] bg-white/[0.02] text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="text-base">{g.icon}</span>
                    <span className="truncate">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Specs: Aspect Ratio & FPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#D1D1DB]">
                  Master Canvas Ratio
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["16:9", "9:16", "21:9", "1:1"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`h-9 rounded-xl border text-xs font-mono font-bold transition-all ${
                        aspectRatio === ratio
                          ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target FPS */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#D1D1DB]">
                  Master Frame Rate
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {([24, 25, 30, 60] as const).map((fps) => (
                    <button
                      key={fps}
                      type="button"
                      onClick={() => setTargetFps(fps)}
                      className={`h-9 rounded-xl border text-xs font-mono font-bold transition-all ${
                        targetFps === fps
                          ? "border-[#4ADE80] bg-[#4ADE80]/20 text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      {fps} fps
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-white/[0.08] flex items-center justify-end gap-2.5 bg-[#0E0E14] shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs text-[#8B8B96] hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>Initialize Film Project</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
