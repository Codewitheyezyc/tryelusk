"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  ChevronDown,
  Layers,
  Volume2,
  VolumeX,
  X,
  Sliders,
  Camera,
  Sun,
  Palette,
  Film,
  RotateCcw,
  Loader2,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioModel } from "@/lib/ai/models";
import type { Character } from "@/types/database.types";
import { ReferenceMediaVisual } from "@/components/media/reference-media-visual";
import { MentionPromptTextarea } from "@/components/studio/mention-prompt-textarea";

export interface ReferenceItem {
  id: string;
  url: string;
  type: "character" | "style" | "image" | "video";
  title?: string;
}

interface FloatingGenerationPanelProps {
  mediaType: "image" | "video";
  onChangeMediaType: (type: "image" | "video") => void;
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  models: StudioModel[];
  activeModel: StudioModel;
  onSelectModel: (model: StudioModel) => void;

  // Active Reference Tray
  references: ReferenceItem[];
  onRemoveReference: (id: string) => void;
  onOpenReferenceSelector: () => void;

  // Cinematic Parameter State
  filmSetup: string;
  onChangeFilmSetup: (v: string) => void;
  cameraMovement: string;
  onChangeCameraMovement: (v: string) => void;
  lightingMood: string;
  onChangeLightingMood: (v: string) => void;
  colorPalette: string;
  onChangeColorPalette: (v: string) => void;

  // Render Settings
  duration: number;
  onChangeDuration: (d: number) => void;
  hasAudio: boolean;
  onToggleAudio: () => void;
  aspectRatio: string;
  onChangeAspectRatio: (ar: string) => void;
  resolution: string;
  onChangeResolution: (res: string) => void;
  quality: string;
  onChangeQuality: (q: string) => void;
  takeCount: number;
  onChangeTakeCount: (count: number) => void;

  // Status & Actions
  isScrolled: boolean;
  totalCost: number;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  characters?: Character[];
  onSelectCharacter?: (char: Character) => void;
}

const ASPECT_RATIO_OPTIONS = [
  { id: "16:9", label: "16:9 Cinema Landscape" },
  { id: "9:16", label: "9:16 Vertical Reels/Shorts" },
  { id: "1:1", label: "1:1 Square" },
  { id: "4:3", label: "4:3 Classic Academy" },
  { id: "21:9", label: "21:9 Anamorphic Ultrawide" },
];

const VIDEO_RESOLUTIONS = [
  { id: "720p", label: "720p (HD Fast)" },
  { id: "1080p", label: "1080p (Cinema Full HD)" },
  { id: "4k", label: "4K (Ultra HD Master)" },
];

const IMAGE_RESOLUTIONS = [
  { id: "1K", label: "1K (Standard 1024)" },
  { id: "2K", label: "2K (Hi-Res 2048)" },
  { id: "4K", label: "4K (Ultra Master)" },
];

export function FloatingGenerationPanel({
  mediaType,
  onChangeMediaType,
  prompt,
  onChangePrompt,
  models,
  activeModel,
  onSelectModel,
  references,
  onRemoveReference,
  onOpenReferenceSelector,
  filmSetup,
  onChangeFilmSetup,
  cameraMovement,
  onChangeCameraMovement,
  lightingMood,
  onChangeLightingMood,
  colorPalette,
  onChangeColorPalette,
  duration,
  onChangeDuration,
  hasAudio,
  onToggleAudio,
  aspectRatio,
  onChangeAspectRatio,
  resolution,
  onChangeResolution,
  quality,
  onChangeQuality,
  takeCount,
  onChangeTakeCount,
  isScrolled,
  totalCost,
  isPending,
  onSubmit,
  characters = [],
  onSelectCharacter,
}: FloatingGenerationPanelProps) {
  // State C: expanded manually from collapsed pill
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false);
  const [activeChipModal, setActiveChipModal] = useState<
    "film" | "camera" | "color" | "lighting" | "quality" | "resolution" | "aspectRatio" | "duration" | null
  >(null);
  const [modalLeft, setModalLeft] = useState(16);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const modelDrawerRef = useRef<HTMLDivElement | null>(null);

  const toggleChipModal = (
    modal: typeof activeChipModal,
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.stopPropagation();
    if (activeChipModal === modal) {
      setActiveChipModal(null);
      return;
    }
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const panelRect = panelRef.current?.getBoundingClientRect();
    if (panelRect) {
      setModalLeft(buttonRect.left - panelRect.left);
    }
    setActiveChipModal(modal);
  };

  // If user is at top of page, panel is always State A (expanded)
  // If user scrolls down and hasn't manually expanded, panel is State B (collapsed)
  // NEVER collapse if the model drawer or chip modal is open
  const isCollapsed = isScrolled && !isManuallyExpanded && !isModelDrawerOpen && !activeChipModal;

  // Handle click outside to close dropdowns or return to collapsed state when scrolled
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Close model drawer if clicked outside
      if (modelDrawerRef.current && !modelDrawerRef.current.contains(target)) {
        setIsModelDrawerOpen(false);
      }

      // Close chip modal if clicked outside
      if (panelRef.current && !panelRef.current.contains(target)) {
        setActiveChipModal(null);
      }

      // Collapse floating panel ONLY if clicked outside the entire panel card AND not clicking inside the model drawer
      if (panelRef.current && !panelRef.current.contains(target)) {
        if (isScrolled && isManuallyExpanded && !isModelDrawerOpen && !activeChipModal) {
          setIsManuallyExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isScrolled, isManuallyExpanded, isModelDrawerOpen, activeChipModal]);

  // =========================================================================
  // STATE B: COLLAPSED FLOATING PILL (Triggered when scrolled)
  // =========================================================================
  if (isCollapsed) {
    return (
      <div className="fixed bottom-5 inset-x-0 pointer-events-none z-40 flex justify-center md:pl-64 px-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div
          onClick={() => setIsManuallyExpanded(true)}
          className="w-full max-w-xl pointer-events-auto flex items-center justify-between gap-3 p-2.5 pl-4 rounded-full border border-white/[0.12] bg-[#0E0E14]/95 shadow-2xl backdrop-blur-2xl cursor-pointer hover:border-[#7C5CFF]/60 hover:bg-[#161624] transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs text-[#8B8B96] group-hover:text-white truncate font-medium">
              {prompt.trim() ? prompt : "Describe the scene you imagine..."}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="h-8 w-8 rounded-full bg-[#7C5CFF] text-white flex items-center justify-center shadow-lg shadow-[#7C5CFF]/30 group-hover:scale-105 transition-transform"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE A & C: FULL EXPANDED FLOATING DOCK
  // =========================================================================
  return (
    <div
      ref={panelRef}
      className="fixed bottom-4 inset-x-0 pointer-events-none z-40 flex justify-center md:pl-64 px-3 sm:px-4"
    >
      <div className="w-full max-w-4xl relative pointer-events-auto rounded-3xl border border-white/[0.14] bg-[#0E0E14]/98 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-200">
        {/* ACTIVE DROPDOWN MODAL (ANCHORED AT CARD LEVEL TO PREVENT OVERFLOW CLIPPING) */}
        {activeChipModal && (
          <div
            style={{
              left: `${Math.max(12, Math.min(modalLeft, (panelRef.current?.clientWidth || 600) - 270))}px`,
            }}
            className="absolute bottom-[calc(100%+8px)] z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
          >
            {/* Aspect Ratio Modal */}
            {activeChipModal === "aspectRatio" && (
              <div className="w-60 rounded-2xl border border-white/[0.16] bg-[#14141E] p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.98)] space-y-1">
                <div className="px-2 py-1 text-[9px] font-bold text-[#8B8B96] uppercase tracking-wider border-b border-white/[0.06]">
                  Aspect Ratio Format
                </div>
                {ASPECT_RATIO_OPTIONS.map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => {
                      onChangeAspectRatio(ar.id);
                      setActiveChipModal(null);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between",
                      aspectRatio === ar.id
                        ? "bg-[#7C5CFF] text-white font-bold"
                        : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <span>{ar.label}</span>
                    {aspectRatio === ar.id && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}

            {/* Resolution Modal */}
            {activeChipModal === "resolution" && (
              <div className="w-52 rounded-2xl border border-white/[0.16] bg-[#14141E] p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.98)] space-y-1">
                <div className="px-2 py-1 text-[9px] font-bold text-[#8B8B96] uppercase tracking-wider border-b border-white/[0.06]">
                  Select Resolution
                </div>
                {(mediaType === "video" ? VIDEO_RESOLUTIONS : IMAGE_RESOLUTIONS).map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => {
                      onChangeResolution(res.id);
                      setActiveChipModal(null);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between",
                      resolution.toLowerCase() === res.id.toLowerCase()
                        ? "bg-[#7C5CFF] text-white font-bold"
                        : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <span>{res.label}</span>
                    {resolution.toLowerCase() === res.id.toLowerCase() && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Duration Modal */}
            {activeChipModal === "duration" && (
              <div className="w-40 rounded-2xl border border-white/[0.16] bg-[#14141E] p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.98)] space-y-1">
                <div className="px-2 py-1 text-[9px] font-bold text-[#8B8B96] uppercase tracking-wider border-b border-white/[0.06]">
                  Shot Duration
                </div>
                {(activeModel?.supportedDurations || [5, 10, 15]).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      onChangeDuration(dur);
                      setActiveChipModal(null);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between font-mono",
                      duration === dur
                        ? "bg-[#7C5CFF] text-white font-bold"
                        : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <span>{dur} Seconds</span>
                    {duration === dur && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} className="p-3 sm:p-4 space-y-3">
          {/* Top Bar: References Tray & Quality Chips */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto cinema-scrollbar pb-1">
            {/* References Tray Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenReferenceSelector}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shrink-0",
                  references.length > 0
                    ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white shadow-sm font-bold"
                    : "border-white/[0.08] bg-white/[0.04] text-[#8B8B96] hover:text-white hover:bg-white/[0.08]"
                )}
              >
                <Plus className="h-3.5 w-3.5 text-[#7C5CFF]" />
                <span>References {references.length}/50</span>
              </button>
            </div>

            {/* Quality Preset Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => toggleChipModal("quality", e)}
                className={cn(
                  "px-2.5 py-1 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1 font-mono",
                  activeChipModal === "quality"
                    ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white"
                    : "border-white/[0.08] bg-white/[0.03] text-[#8B8B96] hover:text-white"
                )}
              >
                <span className="text-[10px] text-[#8B8B96]">Quality:</span>
                <span className="font-bold text-white">{quality}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </div>
          </div>

          {/* DEDICATED ATTACHED REFERENCE KEYFRAME TRAY LAYER */}
          {references.length > 0 && (
            <div className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 backdrop-blur-md overflow-x-auto scrollbar-none animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="relative group h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden border-2 border-[#7C5CFF] shadow-md shadow-[#7C5CFF]/20 shrink-0 bg-black"
                  >
                    <ReferenceMediaVisual url={ref.url} type={ref.type} />
                    <button
                      type="button"
                      onClick={() => onRemoveReference(ref.id)}
                      className="absolute inset-0 bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Remove reference"
                    >
                      <X className="h-4 w-4 text-red-400 hover:text-white" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1 text-xs font-bold text-white truncate">
                  <Sparkles className="h-3 w-3 text-[#7C5CFF] shrink-0" />
                  <span>{references.length} Keyframe Reference Attached</span>
                </div>
                <p className="text-[10px] text-[#8B8B96] truncate">
                  AI will use this visual asset as the starting keyframe &amp; style anchor.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenReferenceSelector}
                className="ml-auto text-[10px] font-semibold text-[#7C5CFF] hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors shrink-0 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add More</span>
              </button>
            </div>
          )}

          {/* Prompt Box with Left Image/Video Toggle Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Image / Video Switcher */}
            <div className="flex sm:flex-col gap-1 p-1 rounded-2xl border border-white/[0.08] bg-black/60 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => onChangeMediaType("image")}
                className={cn(
                  "p-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1",
                  mediaType === "image"
                    ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-white"
                )}
                title="Image Mode"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="sm:hidden text-[10px]">Image</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeMediaType("video")}
                className={cn(
                  "p-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1",
                  mediaType === "video"
                    ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-white"
                )}
                title="Video Mode"
              >
                <Video className="h-4 w-4" />
                <span className="sm:hidden text-[10px]">Video</span>
              </button>
            </div>

            {/* Main Prompt Textarea with @ Mentions */}
            <div className="flex-1 relative rounded-2xl border border-white/[0.08] bg-black/40 p-1 glow-focus min-h-[56px] flex flex-col justify-center">
              <MentionPromptTextarea
                value={prompt}
                onChange={onChangePrompt}
                disabled={isPending}
                rows={2}
                placeholder="Describe your scene — type @ to tag actors & locations..."
                characters={characters}
                onSelectCharacter={onSelectCharacter}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isPending && prompt.trim()) {
                      onSubmit(e);
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Bottom Bar: Model Selector, Format Pills, and Generate CTA */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-white/[0.06]">
            {/* Left Controls: Model Picker & Format Pills */}
            <div className="flex items-center gap-2 overflow-x-auto cinema-scrollbar pb-1 sm:pb-0 text-xs whitespace-nowrap">
              {/* Active AI Model Pill */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModelDrawerOpen(!isModelDrawerOpen);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.12] bg-[#161622] text-xs font-bold text-white hover:border-[#7C5CFF] hover:bg-[#1E1E2E] transition-all shrink-0"
              >
                <Sparkles className="h-3 w-3 text-[#FBBF24]" />
                <span>{activeModel?.name || "Select AI Model"}</span>
                <ChevronDown className={cn("h-3 w-3 opacity-60 transition-transform", isModelDrawerOpen && "rotate-180")} />
              </button>

              {/* Aspect Ratio Pill */}
              <button
                type="button"
                onClick={(e) => toggleChipModal("aspectRatio", e)}
                className={cn(
                  "px-2.5 py-1.5 rounded-xl border transition-colors font-mono flex items-center gap-1.5 shrink-0",
                  activeChipModal === "aspectRatio"
                    ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white shadow-sm shadow-[#7C5CFF]/30 font-bold"
                    : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
                )}
              >
                <span className="text-[10px] text-[#8B8B96]">Ratio:</span>
                <span className="text-white font-bold">{aspectRatio}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* Resolution / Fidelity Pill */}
              <button
                type="button"
                onClick={(e) => toggleChipModal("resolution", e)}
                className={cn(
                  "px-2.5 py-1.5 rounded-xl border transition-colors font-mono flex items-center gap-1.5 shrink-0",
                  activeChipModal === "resolution"
                    ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white shadow-sm shadow-[#7C5CFF]/30 font-bold"
                    : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
                )}
              >
                <span className="text-[10px] text-[#8B8B96]">Res:</span>
                <span className="text-white font-bold">{resolution.toUpperCase()}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {/* Video Duration Pill */}
              {mediaType === "video" && (
                <button
                  type="button"
                  onClick={(e) => toggleChipModal("duration", e)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl border transition-colors font-mono flex items-center gap-1.5 shrink-0",
                    activeChipModal === "duration"
                      ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white shadow-sm shadow-[#7C5CFF]/30 font-bold"
                      : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
                  )}
                >
                  <span className="text-[10px] text-[#8B8B96]">Dur:</span>
                  <span className="text-white font-bold">{duration}s</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              )}

              {/* Audio Toggle (Video Only) */}
              {mediaType === "video" && (
                <button
                  type="button"
                  onClick={onToggleAudio}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-colors font-mono shrink-0",
                    hasAudio
                      ? "border-[#4ADE80]/50 bg-[#4ADE80]/15 text-[#4ADE80]"
                      : "border-white/[0.08] bg-black/60 text-[#8B8B96]"
                  )}
                >
                  {hasAudio ? (
                    <>
                      <Volume2 className="h-3 w-3" />
                      <span>Audio On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-3 w-3" />
                      <span>Silent</span>
                    </>
                  )}
                </button>
              )}

              {/* Batch Count Pill */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-xl border border-white/[0.08] bg-black/60 text-[#8B8B96] font-mono shrink-0">
                <button
                  type="button"
                  onClick={() => onChangeTakeCount(Math.max(1, takeCount - 1))}
                  className="px-1 hover:text-white"
                >
                  -
                </button>
                <span>{takeCount}/4</span>
                <button
                  type="button"
                  onClick={() => onChangeTakeCount(Math.min(4, takeCount + 1))}
                  className="px-1 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* High-Impact TryElusk Purple Generate Button */}
            <button
              type="submit"
              suppressHydrationWarning
              disabled={isPending || !prompt.trim()}
              className="h-10 px-6 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white font-extrabold text-xs shadow-xl shadow-[#7C5CFF]/30 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 uppercase tracking-wider"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Directing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>GENERATE</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-white font-mono font-bold text-[11px]">
                    {totalCost} cr
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Model Selection Drawer Overlay (Positioned inside relative card with pointer-events-auto) */}
        {isModelDrawerOpen && (
          <div
            ref={modelDrawerRef}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{ backgroundColor: "#14141E" }}
            className="absolute bottom-full mb-3 left-3 sm:left-4 right-3 sm:right-auto sm:w-[480px] rounded-2xl border border-white/[0.18] bg-[#14141E] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.98)] z-[9999] pointer-events-auto space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-bold font-mono text-[#8B8B96]">
              <span>SWITCH AI ENGINE</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModelDrawerOpen(false);
                }}
                className="p-1 rounded-lg text-[#8B8B96] hover:text-white hover:bg-white/[0.08] transition-colors flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar"
              onWheel={(e) => e.stopPropagation()}
            >
              {models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectModel(model);
                    setIsModelDrawerOpen(false);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between group",
                    activeModel?.id === model.id
                      ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white ring-1 ring-[#7C5CFF]/40"
                      : "border-white/[0.08] bg-[#1A1A24] text-[#8B8B96] hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold block text-white truncate">{model.name}</span>
                    <span className="text-[9px] uppercase font-mono text-[#8B8B96] block truncate">
                      {model.categoryTag}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#FBBF24] shrink-0">
                    {model.baseRate} cr
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
