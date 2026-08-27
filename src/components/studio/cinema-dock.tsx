"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Image as ImageIcon,
  Video,
  Camera,
  SunMedium,
  Palette,
  Clapperboard,
  Plus,
  Sparkles,
  Sliders,
  ChevronDown,
  Monitor,
  RectangleHorizontal,
  Clock,
  Volume2,
  VolumeX,
  Loader2,
  Zap,
  User,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioModel } from "@/lib/ai/models";
import type { Character } from "@/types/database.types";
import { ReferenceMediaVisual } from "@/components/media/reference-media-visual";
import { MentionPromptTextarea } from "@/components/studio/mention-prompt-textarea";

interface CinemaDockProps {
  mediaType: "image" | "video";
  onChangeMediaType: (type: "image" | "video") => void;
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  activeModel: StudioModel;
  models: StudioModel[];
  onSelectModel: (model: StudioModel) => void;
  filmSetup: string;
  onChangeFilmSetup: (setup: string) => void;
  cameraMovement: string;
  onChangeCameraMovement: (cam: string) => void;
  lightingMood: string;
  onChangeLightingMood: (light: string) => void;
  colorPalette: string;
  onChangeColorPalette: (palette: string) => void;
  aspectRatio: string;
  onChangeAspectRatio: (ratio: string) => void;
  resolution: string;
  onChangeResolution: (res: string) => void;
  duration: number;
  onChangeDuration: (dur: number) => void;
  takeCount: number;
  onChangeTakeCount: (count: number) => void;
  bypassDirector?: boolean;
  onChangeBypassDirector?: (bypass: boolean) => void;
  totalCost: number;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onOpenCharacterModal?: () => void;
  onOpenReferenceModal?: () => void;
  referenceCount?: number;
  references?: { id: string; url: string; type?: "image" | "video"; title?: string }[];
  onRemoveReference?: (id: string) => void;
  characters?: Character[];
  selectedCharacterId?: string | null;
  onSelectCharacterId?: (id: string | null) => void;
  onTagCharacter?: (char: Character) => void;
}

const FILM_SETUPS = [
  "Drama",
  "Cyberpunk Noir",
  "Sci-Fi Odyssey",
  "Action Thriller",
  "Documentary",
  "Luxury Fashion",
  "Anime Masterpiece",
  "Horror Cinema",
  "Fantasy Epic",
  "Vintage 1970s",
];

const CAMERA_PRESETS = [
  { id: "Auto", label: "Auto" },
  { id: "push-in", label: "Push-In" },
  { id: "steadicam", label: "Steadicam" },
  { id: "drone-orbit", label: "Drone Orbit" },
  { id: "dutch-angle", label: "Dutch Angle" },
  { id: "whip-pan", label: "Whip Pan" },
];

const COLOR_PALETTES = [
  "Auto",
  "Teal & Orange",
  "Cyberpunk Neon",
  "Golden Warm",
  "Bleach Bypass",
  "Monochrome Noir",
];

const LIGHTING_PRESETS = [
  { id: "Auto", label: "Auto" },
  { id: "golden-hour", label: "Golden Hour" },
  { id: "cyberpunk-neon", label: "Cyberpunk Neon" },
  { id: "chiaroscuro", label: "Chiaroscuro Noir" },
  { id: "volumetric-haze", label: "Volumetric Mist" },
  { id: "studio-rim", label: "Studio Rim" },
];

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

export function CinemaDock({
  mediaType,
  onChangeMediaType,
  prompt,
  onChangePrompt,
  activeModel,
  models,
  onSelectModel,
  filmSetup,
  onChangeFilmSetup,
  cameraMovement,
  onChangeCameraMovement,
  lightingMood,
  onChangeLightingMood,
  colorPalette,
  onChangeColorPalette,
  aspectRatio,
  onChangeAspectRatio,
  resolution,
  onChangeResolution,
  duration,
  onChangeDuration,
  takeCount,
  onChangeTakeCount,
  bypassDirector = false,
  onChangeBypassDirector,
  totalCost,
  isPending,
  onSubmit,
  onOpenCharacterModal,
  onOpenReferenceModal,
  referenceCount = 0,
  references = [],
  onRemoveReference,
  characters = [],
  selectedCharacterId = null,
  onSelectCharacterId,
  onTagCharacter,
}: CinemaDockProps) {
  const [isModelDrawerOpen, setIsModelDrawerOpen] = useState(false);
  const [activeChipModal, setActiveChipModal] = useState<
    "film" | "camera" | "color" | "lighting" | "cast" | "resolution" | "aspectRatio" | "duration" | null
  >(null);
  const [modalLeft, setModalLeft] = useState(16);

  const dockRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActiveChipModal(null);
        setIsModelDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const dockRect = dockRef.current?.getBoundingClientRect();
    if (dockRect) {
      setModalLeft(buttonRect.left - dockRect.left);
    }
    setActiveChipModal(modal);
  };

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId);

  return (
    <div ref={dockRef} className="sticky bottom-20 md:bottom-4 z-30 mx-auto w-full max-w-5xl px-3 sm:px-4 relative mb-20 md:mb-0">
      {/* ========================================================================= */}
      {/* GLOBAL HIGH-PRIORITY CHIP MODAL (PORTAL TO PREVENT CLIPPING ON MOBILE) */}
      {/* ========================================================================= */}
      {mounted &&
        activeChipModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
            onClick={() => setActiveChipModal(null)}
          >
            <div
              className="w-full max-w-sm max-h-[80vh] rounded-t-3xl sm:rounded-3xl border border-white/[0.12] bg-[#14141E] shadow-[0_25px_70px_rgba(0,0,0,0.98)] p-4 sm:p-5 space-y-3 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Title & Close button */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {activeChipModal === "cast"
                      ? "Lock Actor Visual DNA"
                      : activeChipModal === "film"
                      ? "Film Atmosphere"
                      : activeChipModal === "camera"
                      ? "Camera Movement Rig"
                      : activeChipModal === "lighting"
                      ? "Lighting Preset"
                      : activeChipModal === "color"
                      ? "Color Grading"
                      : activeChipModal === "resolution"
                      ? "Select Resolution"
                      : activeChipModal === "aspectRatio"
                      ? "Aspect Ratio Format"
                      : "Duration"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveChipModal(null)}
                  className="p-1 rounded-lg text-[#8B8B96] hover:text-white hover:bg-white/[0.06]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 1. CAST MODAL */}
              {activeChipModal === "cast" && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCharacterId?.(null);
                      setActiveChipModal(null);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between",
                      !selectedCharacterId
                        ? "bg-[#7C5CFF] text-white font-bold"
                        : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <span>No Actor Locked (Custom Scene)</span>
                    {!selectedCharacterId && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                  {characters.map((char) => (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => {
                        onSelectCharacterId?.(char.id);
                        setActiveChipModal(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 justify-between",
                        selectedCharacterId === char.id
                          ? "bg-[#7C5CFF] text-white font-bold"
                          : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {char.reference_sheet_url ? (
                          <img
                            src={char.reference_sheet_url}
                            alt={char.name}
                            className="h-5 w-5 rounded-full object-cover border border-white/20 shrink-0"
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-[#7C5CFF]/30 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                            {char.name.charAt(0)}
                          </div>
                        )}
                        <span className="truncate font-medium">{char.name}</span>
                      </div>
                      {selectedCharacterId === char.id && <Check className="h-3.5 w-3.5 text-white shrink-0" />}
                    </button>
                  ))}
                  <div className="pt-1.5 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChipModal(null);
                        onOpenCharacterModal?.();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-[#7C5CFF] hover:bg-[#7C5CFF]/10 transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create New Cast Member</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. FILM SETUP MODAL */}
              {activeChipModal === "film" && (
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                  {FILM_SETUPS.map((setup) => (
                    <button
                      key={setup}
                      type="button"
                      onClick={() => {
                        onChangeFilmSetup(setup);
                        setActiveChipModal(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between",
                        filmSetup === setup
                          ? "bg-[#7C5CFF] text-white font-bold"
                          : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <span>{setup}</span>
                      {filmSetup === setup && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}

              {/* 3. CAMERA MOVEMENT MODAL */}
              {activeChipModal === "camera" && (
                <div className="space-y-1">
                  {CAMERA_PRESETS.map((cam) => (
                    <button
                      key={cam.id}
                      type="button"
                      onClick={() => {
                        onChangeCameraMovement(cam.id);
                        setActiveChipModal(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between",
                        cameraMovement === cam.id
                          ? "bg-[#7C5CFF] text-white font-bold"
                          : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <span>{cam.label}</span>
                      {cameraMovement === cam.id && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              )}

              {/* 4. COLOR PALETTE MODAL */}
              {activeChipModal === "color" && (
                <div className="space-y-1">
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette}
                      type="button"
                      onClick={() => {
                        onChangeColorPalette(palette);
                        setActiveChipModal(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between",
                        colorPalette === palette
                          ? "bg-[#FBBF24] text-black font-bold"
                          : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <span>{palette}</span>
                      {colorPalette === palette && <Check className="h-3.5 w-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              )}

              {/* 5. LIGHTING MODAL */}
              {activeChipModal === "lighting" && (
                <div className="space-y-1">
                  {LIGHTING_PRESETS.map((light) => (
                    <button
                      key={light.id}
                      type="button"
                      onClick={() => {
                        onChangeLightingMood(light.id);
                        setActiveChipModal(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between",
                        lightingMood === light.id
                          ? "bg-[#4ADE80] text-black font-bold"
                          : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <span>{light.label}</span>
                      {lightingMood === light.id && <Check className="h-3.5 w-3.5 text-black" />}
                    </button>
                  ))}
                </div>
              )}

              {/* 6. RESOLUTION MODAL */}
              {activeChipModal === "resolution" && (
                <div className="space-y-1">
                  {(mediaType === "video" ? VIDEO_RESOLUTIONS : IMAGE_RESOLUTIONS).map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => {
                        onChangeResolution(res.id);
                        setActiveChipModal(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between",
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

              {/* 7. ASPECT RATIO MODAL */}
              {activeChipModal === "aspectRatio" && (
                <div className="space-y-1">
                  {ASPECT_RATIO_OPTIONS.map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => {
                        onChangeAspectRatio(ar.id);
                        setActiveChipModal(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between",
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

              {/* 8. DURATION MODAL */}
              {activeChipModal === "duration" && (
                <div className="space-y-1">
                  {(activeModel?.supportedDurations || [5, 10, 15]).map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => {
                        onChangeDuration(dur);
                        setActiveChipModal(null);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between font-mono",
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
          </div>,
          document.body
        )}

      {/* 1. OUTER DOCK SHELL */}
      <div className="rounded-3xl border border-white/[0.1] bg-[#0E0E14]/98 p-3.5 sm:p-4 shadow-2xl backdrop-blur-2xl transition-all space-y-3">
        {/* TOP ROW: Quick Controls Bar (Director Refine Mode, Cast, References, Film Setup, Camera, Color, Lighting) */}
        <div className="flex items-center gap-2 overflow-x-auto cinema-scrollbar pb-1.5 text-xs whitespace-nowrap">
          {/* Director Refine Mode Toggle */}
          <button
            type="button"
            onClick={() => onChangeBypassDirector?.(!bypassDirector)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors text-[11px] shrink-0 font-medium",
              !bypassDirector
                ? "border-[#7C5CFF]/40 bg-[#7C5CFF]/15 text-[#7C5CFF]"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            )}
            title={
              !bypassDirector
                ? "Director AI is enhancing prompts with cinematic camera & lighting parameters"
                : "Raw Prompt Mode active: prompts sent directly to fal.ai without AI expansion"
            }
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{!bypassDirector ? "Director AI: ON" : "Raw Prompt: ON"}</span>
          </button>

          {/* Cast Member Selector Pill */}
          <button
            type="button"
            onClick={(e) => toggleChipModal("cast", e)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors text-[11px] shrink-0",
              activeChipModal === "cast" || selectedCharacter
                ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white shadow-sm shadow-[#7C5CFF]/30 font-bold"
                : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
            )}
          >
            <User className={cn("h-3.5 w-3.5", selectedCharacter ? "text-[#7C5CFF]" : "text-[#8B8B96]")} />
            <span>Cast: <strong className={selectedCharacter ? "text-white" : "text-[#8B8B96]"}>{selectedCharacter ? selectedCharacter.name : "None"}</strong></span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {/* References Button */}
          <button
            type="button"
            onClick={onOpenReferenceModal}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors shrink-0",
              references.length > 0
                ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white shadow-sm font-bold"
                : "border-white/[0.08] bg-black/60 hover:bg-white/[0.08] text-[#8B8B96] hover:text-white"
            )}
          >
            <div className="h-5 w-5 rounded-lg bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center font-bold text-xs">
              <Plus className="h-3 w-3" />
            </div>
            <span className="font-mono text-[11px]">References {references.length}/50</span>
          </button>

          {/* Film Setup Preset */}
          <button
            type="button"
            onClick={(e) => toggleChipModal("film", e)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors text-[11px] shrink-0",
              activeChipModal === "film" || filmSetup !== "Drama"
                ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-[#7C5CFF] font-bold"
                : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
            )}
          >
            <Clapperboard className="h-3.5 w-3.5" />
            <span>Film setup: <strong className="text-white">{filmSetup}</strong></span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {/* Camera Movement Preset */}
          {mediaType === "video" && (
            <button
              type="button"
              onClick={(e) => toggleChipModal("camera", e)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors text-[11px] shrink-0",
                activeChipModal === "camera" || cameraMovement !== "Auto"
                  ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-[#7C5CFF] font-bold"
                  : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
              )}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Camera: <strong className="text-white">{cameraMovement}</strong></span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          )}

          {/* Color Palette Preset */}
          <button
            type="button"
            onClick={(e) => toggleChipModal("color", e)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors text-[11px] shrink-0",
              activeChipModal === "color" || colorPalette !== "Auto"
                ? "border-[#FBBF24] bg-[#FBBF24]/15 text-[#FBBF24] font-bold"
                : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
            )}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Color: <strong className="text-white">{colorPalette}</strong></span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {/* Lighting Mood Preset */}
          <button
            type="button"
            onClick={(e) => toggleChipModal("lighting", e)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors text-[11px] shrink-0",
              activeChipModal === "lighting" || lightingMood !== "Auto"
                ? "border-[#4ADE80] bg-[#4ADE80]/15 text-[#4ADE80] font-bold"
                : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
            )}
          >
            <SunMedium className="h-3.5 w-3.5" />
            <span>Lighting: <strong className="text-white">{lightingMood}</strong></span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </div>

        {/* DEDICATED ATTACHED REFERENCE KEYFRAME TRAY LAYER */}
        {references.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 backdrop-blur-md overflow-x-auto scrollbar-none animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  className="relative group h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border-2 border-[#7C5CFF] shadow-lg shadow-[#7C5CFF]/25 shrink-0 bg-black"
                >
                  <ReferenceMediaVisual url={ref.url} type={ref.type} />
                  <button
                    type="button"
                    onClick={() => onRemoveReference?.(ref.id)}
                    className="absolute inset-0 bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Remove reference"
                  >
                    <X className="h-5 w-5 text-red-400 hover:text-white" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                <Sparkles className="h-3.5 w-3.5 text-[#7C5CFF]" />
                <span>{references.length} Keyframe Reference Attached</span>
              </div>
              <p className="text-[10px] text-[#8B8B96] truncate">
                AI will use this visual asset as the starting keyframe &amp; style anchor.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenReferenceModal}
              className="ml-auto text-[11px] font-semibold text-[#7C5CFF] hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors shrink-0 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add More</span>
            </button>
          </div>
        )}

        {/* 2. PROMPT INPUT & CONTROL ROW */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Left Image vs Video Switcher Toggle */}
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

            {/* Center Prompt Textarea with @ Mentions Autocomplete */}
            <div className="relative flex-1 rounded-2xl border border-white/[0.08] bg-[#060608]/90 p-1 glow-focus min-h-[56px] flex flex-col justify-center">
              <MentionPromptTextarea
                value={prompt}
                onChange={onChangePrompt}
                disabled={isPending}
                rows={1}
                placeholder="Describe your scene in plain English — type @ to tag actors & keyframes..."
                characters={characters}
                onSelectCharacter={(char) => {
                  onSelectCharacterId?.(char.id);
                  onTagCharacter?.(char);
                }}
              />
            </div>
          </div>

          {/* 3. BOTTOM PARAMETERS BAR & HIGH-IMPACT GENERATE BUTTON */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-white/[0.06]">
            {/* Quick Parameter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto cinema-scrollbar pb-1 sm:pb-0 text-[11px] whitespace-nowrap">
              {/* Model Selector Pill */}
              <button
                type="button"
                onClick={() => setIsModelDrawerOpen(!isModelDrawerOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-black/60 text-[#7C5CFF] hover:bg-white/[0.08] font-semibold transition-colors shrink-0 font-mono"
              >
                <Sparkles className="h-3 w-3 text-[#FBBF24]" />
                <span>{activeModel.name}</span>
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

              {/* Duration Pill (Video only) */}
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

              {/* Takes Count / Batch Pill */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-white/[0.08] bg-black/60 text-[#8B8B96] font-mono shrink-0">
                <button
                  type="button"
                  onClick={() => onChangeTakeCount(Math.max(1, takeCount - 1))}
                  className="px-1 hover:text-white"
                >
                  -
                </button>
                <span className="text-white font-bold">{takeCount}/4</span>
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
              className="w-full sm:w-auto h-11 sm:h-10 px-6 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white font-extrabold text-xs shadow-xl shadow-[#7C5CFF]/30 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Rendering...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>DIRECT &amp; RENDER</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-white font-mono font-bold text-[11px]">
                    {totalCost} cr
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* MODEL SELECTION DRAWER */}
      {mounted &&
        isModelDrawerOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none"
            onClick={() => setIsModelDrawerOpen(false)}
          >
            <div
              className="w-full max-w-4xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-white/[0.12] bg-[#14141E] shadow-[0_25px_70px_rgba(0,0,0,0.98)] p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 sticky top-0 bg-[#14141E] z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#7C5CFF]/20 text-[#7C5CFF]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Select AI Directing Engine ({mediaType.toUpperCase()})
                    </h3>
                    <p className="text-xs text-[#8B8B96]">
                      Pick the cinematic AI model optimized for your visual style and movement.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModelDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {models.map((model) => {
                  const isSelected = activeModel.id === model.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onSelectModel(model);
                        setIsModelDrawerOpen(false);
                      }}
                      className={cn(
                        "p-3 rounded-2xl border text-left transition-all space-y-2 relative group",
                        isSelected
                          ? "border-[#7C5CFF] bg-[#7C5CFF]/15 shadow-lg shadow-[#7C5CFF]/20"
                          : "border-white/[0.08] bg-black/40 hover:border-white/20 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-[#7C5CFF] transition-colors">
                          {model.name}
                        </span>
                        {model.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#7C5CFF]/30 text-[#C4B5FD] uppercase font-mono">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8B8B96] leading-relaxed line-clamp-2">
                        {model.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8B8B96] pt-1 border-t border-white/[0.04]">
                        <span>{model.categoryTag}</span>
                        <span className="text-white font-bold">{model.baseRate} cr/take</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
