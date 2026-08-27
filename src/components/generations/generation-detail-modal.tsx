"use client";

import React, { useState, useRef, useEffect } from "react";
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

  // Render prompt with highlighted @tags
  const renderHighlightedPrompt = (text: string) => {
    const parts = text.split(/(@[\w-]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#7C5CFF]/20 text-[#7C5CFF] font-semibold border border-[#7C5CFF]/30 mx-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="relative flex flex-col lg:flex-row w-full max-w-6xl h-full max-h-[92vh] rounded-3xl border border-white/[0.1] bg-[#0E0E14] shadow-2xl overflow-hidden">
        {/* ================================================================= */}
        {/* LEFT PANE (~65%): MEDIA VIEWER (Matching Screenshot 3 & 4) */}
        {/* ================================================================= */}
        <div
          ref={mediaContainerRef}
          className="relative flex-1 lg:w-[65%] bg-[#060608] flex items-center justify-center overflow-hidden group select-none"
        >
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={mediaUrl}
                className="max-h-full max-w-full object-contain"
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
                  className="absolute h-16 w-16 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center shadow-2xl backdrop-blur-md hover:scale-110 transition-transform"
                >
                  <Play className="h-7 w-7 fill-white translate-x-0.5" />
                </button>
              )}

              {/* Bottom Video Controls Scrubber Bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Yellow/Violet Scrubber Slider */}
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
                    <span className="font-mono text-[11px] text-[#8B8B96]">
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
            <div className="relative w-full h-full flex items-center justify-center p-4">
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

          {/* Quick Overlay Action Badges on Top/Bottom of Media */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
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
        {/* RIGHT PANE (~35%): INFO & EDIT PANEL (Matching Screenshot 3 & 4) */}
        {/* ================================================================= */}
        <div className="lg:w-[35%] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/[0.08] bg-[#0E0E14] p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Header with Author & Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#EC4899] flex items-center justify-center text-white text-xs font-bold shadow">
                {userEmail.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold text-white block truncate max-w-[140px]">
                  {userEmail.split("@")[0]}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#8B8B96]">
                  Creator
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Info vs Edit Mode Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl border border-white/[0.08] bg-black/60">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={cn(
                "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "info"
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-[#8B8B96] hover:text-white"
              )}
            >
              Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={cn(
                "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "edit"
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-[#8B8B96] hover:text-white"
              )}
            >
              Edit
            </button>
          </div>

          {/* TAB 1: INFO MODE */}
          {activeTab === "info" ? (
            <div className="space-y-5">
              {/* Prompt Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8B8B96]">
                  <span className="uppercase font-bold tracking-wider">Prompt</span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-[#7C5CFF] hover:underline"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl border border-white/[0.08] bg-[#060608] text-xs text-[#F2F2F5] leading-relaxed">
                  <p className={cn(!isPromptExpanded && "line-clamp-4")}>
                    {renderHighlightedPrompt(generation.prompt)}
                  </p>
                  {generation.prompt.length > 140 && (
                    <button
                      type="button"
                      onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                      className="mt-2 text-[11px] font-semibold text-[#7C5CFF] hover:underline block"
                    >
                      {isPromptExpanded ? "See less" : "See all"}
                    </button>
                  )}
                </div>
              </div>

              {/* Generation Details Section */}
              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B8B96] font-mono block">
                  Details
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B8B96]">Model Engine</span>
                    <span className="font-semibold text-white font-mono">
                      {generation.model_used}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#8B8B96]">Resolution &amp; Framing</span>
                    <span className="font-semibold text-white font-mono">
                      {generation.aspect_ratio || "16:9"} • {generation.resolution || "1080p"}
                    </span>
                  </div>

                  {isVideo && generation.duration_seconds && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#8B8B96]">Duration</span>
                      <span className="font-semibold text-white font-mono">
                        {generation.duration_seconds}s
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[#8B8B96]">Created</span>
                    <span className="font-mono text-[#8B8B96] text-[11px]">
                      {new Date(generation.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Big Primary Action Button */}
              {!isVideo && onTurnToVideo && (
                <button
                  type="button"
                  onClick={() => onTurnToVideo(generation)}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white font-bold text-xs shadow-lg shadow-[#7C5CFF]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Video className="h-4 w-4" />
                  <span>Turn to video</span>
                </button>
              )}
            </div>
          ) : (
            /* TAB 2: EDIT MODE */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8B8B96] font-mono">
                  Prompt Text
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#060608] p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#7C5CFF] leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-[#8B8B96] block mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={editAspectRatio}
                    onChange={(e) => setEditAspectRatio(e.target.value)}
                    className="w-full h-8 px-2 rounded-xl border border-white/[0.08] bg-[#060608] text-xs text-white"
                  >
                    <option value="16:9">16:9 Cinema</option>
                    <option value="9:16">9:16 Vertical</option>
                    <option value="1:1">1:1 Square</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#8B8B96] block mb-1">
                    Resolution
                  </label>
                  <select
                    value={editResolution}
                    onChange={(e) => setEditResolution(e.target.value)}
                    className="w-full h-8 px-2 rounded-xl border border-white/[0.08] bg-[#060608] text-xs text-white"
                  >
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
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
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] text-white font-bold text-xs shadow-lg shadow-[#7C5CFF]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                <span>Render New Take</span>
              </button>
            </div>
          )}

          {/* Action Row at Bottom */}
          <div className="pt-3 border-t border-white/[0.06] space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Recreate Button */}
              <button
                type="button"
                onClick={() => {
                  onRecreate(generation);
                  onClose();
                }}
                className="h-9 px-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#7C5CFF]" />
                <span>Recreate</span>
              </button>

              {/* Reference Button */}
              <button
                type="button"
                onClick={() => {
                  onReference(generation);
                  onClose();
                }}
                className="h-9 px-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Layers className="h-3.5 w-3.5 text-[#FBBF24]" />
                <span>Reference</span>
              </button>
            </div>

            {/* Micro Action Icons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <MediaDownloadButton
                  mediaUrl={mediaUrl}
                  mediaType={generation.type}
                  title={generation.prompt}
                  currentResolution={generation.resolution || "1080p"}
                  className="w-full"
                />
              </div>

              <button
                type="button"
                onClick={handleToggleFav}
                className={cn(
                  "h-9 w-9 rounded-xl border flex items-center justify-center transition-colors",
                  isFavorite
                    ? "border-[#EC4899]/50 bg-[#EC4899]/15 text-[#EC4899]"
                    : "border-white/[0.08] bg-black/60 text-[#8B8B96] hover:text-white"
                )}
                title="Favorite"
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ url: mediaUrl, title: generation.prompt }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(mediaUrl);
                    alert("Media link copied to clipboard!");
                  }
                }}
                className="h-9 w-9 rounded-xl border border-white/[0.08] bg-black/60 hover:bg-white/[0.06] text-[#8B8B96] hover:text-white flex items-center justify-center transition-colors"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>

              {/* Overflow Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="h-9 w-9 rounded-xl border border-white/[0.08] bg-black/60 hover:bg-white/[0.06] text-[#8B8B96] hover:text-white flex items-center justify-center transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 rounded-2xl border border-white/[0.1] bg-[#0E0E14] p-1.5 shadow-2xl z-50">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete && onDelete(generation.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      <span>Move to Trash</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
