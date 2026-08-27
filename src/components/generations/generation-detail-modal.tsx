"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Copy,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Heart,
  Share2,
  Download,
  MoreHorizontal,
  Trash2,
  Wand2,
  Clapperboard,
  RotateCcw,
  Video,
  Image as ImageIcon,
  Clock,
  Calendar,
  Monitor,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types/database.types";
import type { StudioModel } from "@/lib/ai/models";
import { MediaDownloadButton } from "@/components/media/media-download-button";

interface GenerationDetailModalProps {
  generation: Generation | null;
  isOpen: boolean;
  onClose: () => void;
  onRecreate: (generation: Generation) => void;
  onReference: (generation: Generation) => void;
  onTurnToVideo?: (generation: Generation) => void;
  onDelete?: (generationId: string) => void;
  onToggleFavorite?: (generationId: string, isFavorite: boolean) => void;
  userEmail?: string;
  models?: StudioModel[];
}

export function GenerationDetailModal({
  generation,
  isOpen,
  onClose,
  onRecreate,
  onReference,
  onTurnToVideo,
  onDelete,
  onToggleFavorite,
  userEmail = "Filmmaker",
  models = [],
}: GenerationDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "edit">("info");
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaContainerRef = useRef<HTMLDivElement | null>(null);

  // Edit Tab Form State
  const [editPrompt, setEditPrompt] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editAspectRatio, setEditAspectRatio] = useState("16:9");
  const [editResolution, setEditResolution] = useState("1080p");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (generation) {
      const techParams = (generation.technical_params as Record<string, any>) || {};
      setIsFavorite(Boolean(techParams.is_favorite));
      setEditPrompt(generation.prompt || "");
      setEditModel(generation.model_used || "");
      setEditAspectRatio(generation.aspect_ratio || "16:9");
      setEditResolution(generation.resolution || "1080p");
      setActiveTab("info");
      setIsPromptExpanded(false);
      setIsPlaying(false);
    }
  }, [generation]);

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

  if (!isOpen || !generation) return null;

  const mediaUrl =
    generation.output_url ||
    (Array.isArray(generation.output_urls) && generation.output_urls.length > 0
      ? String(generation.output_urls[0])
      : "");

  const isVideo = generation.type === "video";

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration) setDuration(videoRef.current.duration || 0);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2, 0.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (!mediaContainerRef.current) return;
    if (!document.fullscreenElement) {
      mediaContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCopyPrompt = () => {
    if (generation.prompt) {
      navigator.clipboard.writeText(generation.prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleToggleFav = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    if (onToggleFavorite) {
      onToggleFavorite(generation.id, next);
    }
  };

  const handleDownload = () => {
    if (!mediaUrl) return;
    const a = document.createElement("a");
    a.href = mediaUrl;
    a.download = `tryelusk-${generation.id}.${isVideo ? "mp4" : "png"}`;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col lg:flex-row w-full max-w-6xl h-full max-h-[94vh] rounded-3xl border border-white/[0.12] bg-[#0E0E14] shadow-[0_25px_70px_rgba(0,0,0,0.98)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* TOP / LEFT PANE: HIGH-IMPACT MEDIA VIEWER */}
        {/* ================================================================= */}
        <div
          ref={mediaContainerRef}
          className="relative w-full h-[40vh] sm:h-[48vh] lg:h-full lg:w-[62%] bg-[#060608] flex items-center justify-center overflow-hidden group select-none shrink-0"
        >
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={mediaUrl}
                className="max-h-full max-w-full object-contain cursor-pointer"
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onClick={togglePlay}
              />

              {/* Center Play Overlay on Pause */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center shadow-2xl backdrop-blur-md hover:scale-110 transition-transform z-20"
                >
                  <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-white translate-x-0.5" />
                </button>
              )}

              {/* Video Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 z-20">
                <input
                  type="range"
                  min={0}
                  max={duration || 10}
                  step={0.01}
                  value={currentTime}
                  onChange={handleScrub}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#7C5CFF]"
                />

                <div className="flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={togglePlay} className="hover:text-[#7C5CFF]">
                      {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    </button>
                    <button type="button" onClick={toggleMute} className="hover:text-[#7C5CFF]">
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={cycleSpeed}
                      className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono hover:bg-white/20"
                    >
                      {playbackSpeed}x
                    </button>
                    <span className="font-mono text-[10px] sm:text-[11px] text-[#8B8B96]">
                      {formatSeconds(currentTime)} / {formatSeconds(duration || 5)}
                    </span>
                  </div>

                  <button type="button" onClick={toggleFullscreen} className="hover:text-[#7C5CFF]">
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : mediaUrl ? (
            <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-4">
              <img
                src={mediaUrl}
                alt={generation.prompt || "Generated Take"}
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-[#8B8B96]" />
              <p className="text-xs text-[#8B8B96]">No media output available for this take.</p>
            </div>
          )}

          {/* Quick Action Badges on Media */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className="px-3 py-1.5 rounded-xl border border-white/20 bg-black/70 hover:bg-black text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1.5 shadow-lg"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            {isVideo ? (
              <button
                type="button"
                onClick={() => onRecreate(generation)}
                className="px-3 py-1.5 rounded-xl border border-white/20 bg-black/70 hover:bg-black text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1.5 shadow-lg"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Extend</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onTurnToVideo && onTurnToVideo(generation)}
                className="px-3 py-1.5 rounded-xl border border-[#7C5CFF]/40 bg-[#7C5CFF]/80 hover:bg-[#7C5CFF] text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1.5 shadow-lg"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Turn to video</span>
              </button>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* BOTTOM / RIGHT PANE: METADATA, PROMPT & DETAILS */}
        {/* ================================================================= */}
        <div className="flex-1 lg:w-[38%] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-[#0E0E14] overflow-y-auto custom-scrollbar">
          {/* Top User Info & Close Bar */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0E0E14]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#EC4899] flex items-center justify-center text-xs font-bold text-white uppercase shadow-md shadow-[#7C5CFF]/30">
                {userEmail.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-white block truncate max-w-[180px]">
                  {userEmail.split("@")[0]}
                </span>
                <span className="text-[9px] font-mono text-[#8B8B96] uppercase">
                  Filmmaker
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Switcher: Info vs Edit */}
          <div className="p-4 pb-0">
            <div className="grid grid-cols-2 p-1 rounded-2xl border border-white/[0.08] bg-black/40">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={cn(
                  "py-1.5 rounded-xl text-xs font-bold transition-all",
                  activeTab === "info"
                    ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-white"
                )}
              >
                Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "py-1.5 rounded-xl text-xs font-bold transition-all",
                  activeTab === "edit"
                    ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-white"
                )}
              >
                Edit Parameters
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "info" ? (
              <>
                {/* Prompt Card */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#8B8B96] font-mono uppercase">
                    <span>Prompt</span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="hover:text-white flex items-center gap-1 normal-case font-sans"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-[#4ADE80]" /> : <Copy className="h-3 w-3" />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-2xl border border-white/[0.08] bg-black/40 text-xs text-[#F2F2F5] leading-relaxed">
                    <p className={cn(!isPromptExpanded && "line-clamp-4")}>
                      {generation.prompt}
                    </p>
                    {generation.prompt && generation.prompt.length > 180 && (
                      <button
                        type="button"
                        onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                        className="text-[11px] text-[#7C5CFF] font-bold hover:underline mt-1 block"
                      >
                        {isPromptExpanded ? "Show less" : "See all"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-[#8B8B96] font-bold block">
                    Technical Specifications
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-[#8B8B96] block">Model Engine</span>
                      <span className="font-bold text-white truncate block">
                        {generation.model_used}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-[#8B8B96] block">Framing &amp; Ratio</span>
                      <span className="font-bold text-white font-mono">
                        {generation.aspect_ratio || "16:9"} • {generation.resolution || "1080p"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-[#8B8B96] block">Duration</span>
                      <span className="font-bold text-white font-mono">
                        {generation.duration_seconds || 5}s
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-[#8B8B96] block">Created Date</span>
                      <span className="font-bold text-white text-[11px]">
                        {new Date(generation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Edit Parameters Form */
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#8B8B96] uppercase font-mono">
                    Refine Prompt
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-black/40 text-xs text-white placeholder:text-[#8B8B96]/50 focus:border-[#7C5CFF] focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#8B8B96] uppercase">Ratio</label>
                    <select
                      value={editAspectRatio}
                      onChange={(e) => setEditAspectRatio(e.target.value)}
                      className="w-full h-8 px-2 rounded-xl border border-white/[0.08] bg-black text-xs text-white focus:outline-none"
                    >
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Vertical</option>
                      <option value="21:9">21:9 Cinema</option>
                      <option value="1:1">1:1 Square</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#8B8B96] uppercase">Resolution</label>
                    <select
                      value={editResolution}
                      onChange={(e) => setEditResolution(e.target.value)}
                      className="w-full h-8 px-2 rounded-xl border border-white/[0.08] bg-black text-xs text-white focus:outline-none"
                    >
                      <option value="1080p">1080p FHD</option>
                      <option value="4k">4K UHD</option>
                      <option value="720p">720p Draft</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onRecreate({
                      ...generation,
                      prompt: editPrompt,
                      aspect_ratio: editAspectRatio,
                      resolution: editResolution,
                    });
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Send to Studio Canvas</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#0E0E14] flex flex-col gap-2 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onRecreate(generation);
                  onClose();
                }}
                className="py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#7C5CFF]" />
                <span>Recreate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onReference(generation);
                  onClose();
                }}
                className="py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Layers className="h-3.5 w-3.5 text-[#FBBF24]" />
                <span>Reference</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {mediaUrl && (
                <div className="flex-1">
                  <MediaDownloadButton
                    mediaUrl={mediaUrl}
                    mediaType={generation.type}
                    title={generation.prompt}
                    currentResolution={generation.resolution || "1080p"}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleToggleFav}
                className={cn(
                  "p-2.5 rounded-xl border transition-colors flex items-center justify-center shrink-0",
                  isFavorite
                    ? "border-[#EC4899]/40 bg-[#EC4899]/20 text-[#EC4899]"
                    : "border-white/[0.08] bg-white/[0.03] text-[#8B8B96] hover:text-white"
                )}
                title={isFavorite ? "Remove from Starred" : "Star Take"}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </button>

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(generation.id);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#8B8B96] hover:text-red-400 hover:border-red-500/30 transition-colors flex items-center justify-center shrink-0"
                  title="Delete Take"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
