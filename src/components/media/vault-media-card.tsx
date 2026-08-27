"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Maximize2,
  Download,
  Mic,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  Film,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Video as VideoIcon,
  Play,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomAudioPlayer } from "@/components/shared/custom-audio-player";
import { MediaDownloadButton } from "@/components/media/media-download-button";
import { moveToTrashAction } from "@/app/actions/generations-manage";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types/database.types";

interface VaultMediaCardProps {
  generation: Generation;
  onPreview: (gen: Generation) => void;
  getAssetUrls: (gen: Generation) => string[];
  buildRetryUrl: (gen: Generation) => string;
}

export function VaultMediaCard({
  generation: gen,
  onPreview,
  getAssetUrls,
  buildRetryUrl,
}: VaultMediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const urls = getAssetUrls(gen);
  const primaryUrl = urls[0];
  const isVideo = gen.type === "video" || gen.type === "lipsync";
  const isAudio = gen.type === "audio";
  const isCharacter = gen.type === "character" || Boolean(gen.character_id);
  const isFailed = gen.status === "failed";
  const isProcessing = gen.status === "processing";

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  // Clean prompt for sequel actions
  const cleanPrompt = gen.prompt ? gen.prompt.replace(/\[.*?\]/g, "").trim() : "";

  // 1. FAILED CARD
  if (isFailed) {
    return (
      <Card className="glass-card overflow-hidden flex flex-col justify-between hover:border-[#F87171]/50 transition-all">
        <div className="relative aspect-video bg-[#060608] border-b border-[#22222C] p-4 flex flex-col items-center justify-center text-center space-y-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F87171]/15 border border-[#F87171]/30">
            <AlertCircle className="h-5 w-5 text-[#F87171]" />
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#F2F2F5]">Generation Failed</h4>
            <p className="text-[10px] text-[#4ADE80] flex items-center justify-center gap-1 mt-0.5 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Credits Refunded Automatically
            </p>
          </div>

          <Link href={buildRetryUrl(gen)} className="w-full pt-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-[11px] font-medium border-[#26262E] bg-[#101015] text-[#F2F2F5] hover:bg-[#7C5CFF] hover:text-white hover:border-[#7C5CFF] transition-all"
            >
              <RotateCcw className="mr-1.5 h-3 w-3" />
              Retry Take in Studio
            </Button>
          </Link>
        </div>

        <CardContent className="p-3.5 space-y-1.5">
          <p className="text-xs text-[#8B8B96] line-clamp-2">{gen.prompt}</p>
          <div className="flex items-center justify-between text-[10px] text-[#8B8B96]/80 pt-1 border-t border-[#22222C]/60 font-mono">
            <span className="truncate max-w-[120px]">{gen.model_used}</span>
            <span>{new Date(gen.created_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. PROCESSING CARD
  if (isProcessing) {
    return (
      <Card className="glass-card overflow-hidden flex flex-col justify-between">
        <div className="relative aspect-video bg-[#060608] border-b border-[#22222C] p-4 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-9 w-9 rounded-full border-2 border-[#7C5CFF] border-t-transparent animate-spin shadow-lg shadow-[#7C5CFF]/20" />
          <div>
            <span className="text-xs font-bold text-[#F2F2F5]">
              {isAudio ? "Synthesizing Voice Master Track..." : "Directing &amp; Rendering Take..."}
            </span>
            <p className="text-[10px] text-[#8B8B96] mt-0.5">Auto-refunds if timed out</p>
          </div>
        </div>

        <CardContent className="p-3.5 space-y-1.5">
          <p className="text-xs text-[#8B8B96] line-clamp-2">{gen.prompt}</p>
        </CardContent>
      </Card>
    );
  }

  // 3. AUDIO CARD (Custom Dark Waveform Player — No Ugly Browser Default)
  if (isAudio) {
    return (
      <Card className="glass-card overflow-hidden hover:border-[#FBBF24]/50 transition-all flex flex-col justify-between">
        <div className="p-2 bg-[#060608]">
          {primaryUrl && (
            <CustomAudioPlayer
              src={primaryUrl}
              voiceName={gen.prompt.includes("Voice:") ? gen.prompt.split("]")[0].replace("[", "") : "Voice Track"}
              onDownload={() => {
                const a = document.createElement("a");
                a.href = primaryUrl;
                a.download = "tryelusk-voice.mp3";
                a.click();
              }}
            />
          )}
        </div>

        <CardContent className="p-3.5 space-y-2">
          <p className="text-xs text-[#F2F2F5] line-clamp-2 font-medium">{gen.prompt}</p>

          <div className="flex items-center justify-between text-[10px] text-[#8B8B96] pt-1 border-t border-[#22222C]/60">
            <span className="truncate max-w-[120px] font-mono">{gen.model_used}</span>
            {primaryUrl && (
              <Link href={`/generate?type=lipsync&audioUrl=${encodeURIComponent(primaryUrl)}`}>
                <span className="text-[#4ADE80] font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                  <Mic className="h-3 w-3" />
                  Use in Lip-Sync
                </span>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 4. IMAGE & VIDEO CARD WITH HOVER-TO-PLAY & THEATRICAL OVERLAY
  return (
    <Card
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "glass-card transition-all duration-300 flex flex-col justify-between relative group hover:z-30",
        isVideo ? "hover:border-[#7C5CFF]/70" : "hover:border-[#7C5CFF]/50"
      )}
    >
      <div className="relative aspect-video bg-[#060608] rounded-t-xl overflow-hidden flex items-center justify-center">
        {primaryUrl ? (
          isVideo ? (
            <>
              <video
                ref={videoRef}
                src={primaryUrl}
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Play Icon Badge on Center (Hides on hover play) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-white shadow-lg">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              </div>

              {/* Inline Mute / Unmute Toggle on Video Hover */}
              <button
                type="button"
                onClick={toggleMute}
                className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/80 border border-white/10 text-white hover:bg-[#7C5CFF] transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur-md"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3 text-[#4ADE80]" />}
              </button>
            </>
          ) : (
            <img
              src={primaryUrl}
              alt={gen.prompt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center text-xs text-[#8B8B96]">
            <Film className="h-6 w-6 text-[#8B8B96]/40 mb-1" />
            <span>Rendering Asset</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md",
              isVideo
                ? "bg-[#7C5CFF]/90 text-white shadow-sm shadow-[#7C5CFF]/30"
                : isCharacter
                ? "bg-[#EC4899]/90 text-white shadow-sm shadow-[#EC4899]/30"
                : "bg-black/80 text-[#F2F2F5] border border-white/15"
            )}
          >
            {isCharacter ? "Character" : isVideo ? "Video" : "Image"}
          </span>

          {urls.length > 1 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/80 text-white border border-white/20 flex items-center gap-1 backdrop-blur-md">
              <Layers className="h-2.5 w-2.5" />
              {urls.length} Takes
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 space-y-2 z-10">
          <div className="flex items-center justify-center gap-2">
            {/* 1-Click Preview Full Size */}
            <button
              type="button"
              onClick={() => onPreview(gen)}
              className="flex-1 py-1.5 rounded-lg bg-[#7C5CFF] text-white hover:bg-[#6D3EFF] transition-all shadow-md shadow-[#7C5CFF]/30 flex items-center justify-center gap-1.5 text-xs font-semibold"
              title="Expand Full Screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Inspect</span>
            </button>

            {/* Quick Download with Resolution Options */}
            {primaryUrl && (
              <MediaDownloadButton
                variant="icon"
                mediaUrl={primaryUrl}
                mediaType={gen.type}
                title={gen.prompt}
                currentResolution={gen.resolution || "1080p"}
              />
            )}

            {/* Quick Move to Trash */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                moveToTrashAction(gen.id).catch(() => {});
              }}
              className="p-1.5 rounded-lg bg-[#16161C]/90 hover:bg-red-500/80 border border-white/10 text-[#F2F2F5] hover:text-white transition-all shadow"
              title="Move to Trash"
            >
              <Trash2 className="h-4 w-4 text-red-400 hover:text-white" />
            </button>
          </div>

          {/* Quick Action Pills: Lip-Sync Pass, Sequel, or Animate Still */}
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {isVideo ? (
              <>
                <Link
                  href={`/generate?type=lipsync&prompt=${encodeURIComponent(cleanPrompt)}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-6 px-1.5 text-[10px] font-semibold border-[#4ADE80]/50 bg-[#4ADE80]/15 text-[#4ADE80] hover:bg-[#4ADE80] hover:text-black transition-all"
                  >
                    <Mic className="mr-1 h-2.5 w-2.5" />
                    Lip-Sync
                  </Button>
                </Link>

                {cleanPrompt && (
                  <Link
                    href={`/generate?type=video&prompt=${encodeURIComponent(`Next scene following: ${cleanPrompt}, continuing dynamic narrative action...`)}`}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-6 px-1.5 text-[10px] font-semibold border-[#7C5CFF]/50 bg-[#7C5CFF]/15 text-[#F2F2F5] hover:bg-[#7C5CFF] hover:text-white transition-all"
                    >
                      <Sparkles className="mr-1 h-2.5 w-2.5 text-[#FBBF24]" />
                      Sequel
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              cleanPrompt && (
                <Link
                  href={`/generate?type=video&prompt=${encodeURIComponent(cleanPrompt)}`}
                  className="w-full"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-6 px-2 text-[10px] font-semibold border-[#7C5CFF]/50 bg-[#7C5CFF]/15 text-[#F2F2F5] hover:bg-[#7C5CFF] hover:text-white transition-all"
                  >
                    <VideoIcon className="mr-1.5 h-2.5 w-2.5 text-[#7C5CFF]" />
                    Animate into Video Take
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-3.5 space-y-2">
        <p className="text-xs text-[#F2F2F5] line-clamp-2 font-medium leading-relaxed">{gen.prompt}</p>

        <div className="flex items-center justify-between text-[10px] text-[#8B8B96] pt-1.5 border-t border-[#22222C]/60 font-mono">
          <span className="truncate max-w-[120px]">{gen.model_used}</span>
          <span>{new Date(gen.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
