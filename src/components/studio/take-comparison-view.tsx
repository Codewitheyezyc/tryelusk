"use client";

import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Layers,
  Columns,
  Maximize2,
  CheckCircle2,
  Download,
  Mic,
  Sparkles,
  Film,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaDownloadButton } from "@/components/media/media-download-button";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types/database.types";

interface TakeComparisonViewProps {
  outputUrls: string[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
  mediaType: "image" | "video" | "audio" | "lipsync";
  generation?: Generation;
  onSendToLipSync?: (videoUrl: string) => void;
  onDirectNextScene?: (prompt: string) => void;
}

export function TakeComparisonView({
  outputUrls,
  selectedIndex,
  onSelectIndex,
  mediaType,
  generation,
  onSendToLipSync,
  onDirectNextScene,
}: TakeComparisonViewProps) {
  const [viewMode, setViewMode] = useState<"single" | "split">(
    outputUrls.length >= 2 && mediaType === "video" ? "split" : "single"
  );
  const [isPlayingAll, setIsPlayingAll] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleTogglePlayAll = () => {
    const nextState = !isPlayingAll;
    setIsPlayingAll(nextState);
    videoRefs.current.forEach((v) => {
      if (v) {
        if (nextState) v.play().catch(() => {});
        else v.pause();
      }
    });
  };

  const isVideo = mediaType === "video" || mediaType === "lipsync";
  const isAudio = mediaType === "audio";
  const activeUrl = outputUrls[selectedIndex] || outputUrls[0] || "";

  if (outputUrls.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Top Header: View Mode Switcher (Single vs Split Screen) & Synchronized Controls */}
      {outputUrls.length > 1 && (
        <div className="flex items-center justify-between p-2 rounded-xl border border-[#26262E] bg-[#0B0B0F]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("single")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                viewMode === "single"
                  ? "bg-[#7C5CFF] text-white shadow-sm"
                  : "text-[#8B8B96] hover:text-[#F2F2F5]"
              )}
            >
              <Maximize2 className="h-3 w-3" />
              Focus View
            </button>

            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                viewMode === "split"
                  ? "bg-[#7C5CFF] text-white shadow-sm"
                  : "text-[#8B8B96] hover:text-[#F2F2F5]"
              )}
            >
              <Columns className="h-3 w-3" />
              Side-by-Side Split ({outputUrls.length} Takes)
            </button>
          </div>

          {isVideo && viewMode === "split" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleTogglePlayAll}
              className="h-7 px-2.5 text-[11px] border-[#26262E] bg-[#16161C] text-[#F2F2F5] hover:bg-[#7C5CFF] hover:text-white"
            >
              {isPlayingAll ? (
                <>
                  <Pause className="mr-1 h-3 w-3" />
                  Pause All
                </>
              ) : (
                <>
                  <Play className="mr-1 h-3 w-3 fill-current" />
                  Sync Play All
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* 1. SINGLE FOCUS THEATER VIEW */}
      {viewMode === "single" ? (
        <div className="relative aspect-video rounded-xl bg-[#0B0B0F] border border-[#26262E] overflow-hidden flex items-center justify-center group shadow-xl">
          {isAudio ? (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 w-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/30">
                <Volume2 className="h-8 w-8 text-[#FBBF24]" />
              </div>
              <audio src={activeUrl} controls autoPlay className="w-full max-w-xs" />
            </div>
          ) : isVideo ? (
            <video
              src={activeUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={activeUrl}
              alt={`Take ${selectedIndex + 1}`}
              className="w-full h-full object-cover"
            />
          )}

          {outputUrls.length > 1 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white border border-white/20">
              Master Take {selectedIndex + 1} of {outputUrls.length}
            </div>
          )}
        </div>
      ) : (
        /* 2. SIDE-BY-SIDE MULTI-TAKE COMPARISON SPLIT VIEW */
        <div
          className={cn(
            "grid gap-3",
            outputUrls.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : outputUrls.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-2"
          )}
        >
          {outputUrls.map((url, idx) => {
            const isMaster = selectedIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  "relative aspect-video rounded-xl border overflow-hidden transition-all flex flex-col justify-between group",
                  isMaster
                    ? "border-[#4ADE80] ring-2 ring-[#4ADE80]/30 shadow-lg shadow-[#4ADE80]/10"
                    : "border-[#26262E] hover:border-[#7C5CFF]/60"
                )}
              >
                {isVideo ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[idx] = el;
                    }}
                    src={url}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Take ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Top Badge: Take Index & Master Pill */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-black/80 text-white border border-white/20">
                    Take #{idx + 1}
                  </span>
                  {isMaster && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-[#4ADE80] text-black flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Master
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Action: Select as Master */}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onSelectIndex(idx)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-medium transition-all",
                      isMaster
                        ? "bg-[#4ADE80] text-black font-semibold"
                        : "bg-[#16161C]/90 text-[#F2F2F5] hover:bg-[#7C5CFF] hover:text-white"
                    )}
                  >
                    {isMaster ? "Selected Master" : "Select as Master"}
                  </button>

                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    download={`tryelusk-take-${idx + 1}`}
                    className="p-1 rounded bg-black/60 text-white hover:text-[#7C5CFF]"
                    title="Download Take"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MULTI-TAKE THUMBNAIL SELECTOR BAR (In Single Mode) */}
      {outputUrls.length > 1 && viewMode === "single" && (
        <div className="space-y-2 pt-2 border-t border-[#26262E]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#F2F2F5] flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#7C5CFF]" />
              Select Take:
            </span>
            <span className="text-[10px] text-[#8B8B96] font-mono">
              Take {selectedIndex + 1} of {outputUrls.length}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {outputUrls.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectIndex(idx)}
                className={cn(
                  "relative aspect-video rounded-lg border overflow-hidden transition-all",
                  selectedIndex === idx
                    ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/30 shadow"
                    : "border-[#26262E] opacity-70 hover:opacity-100"
                )}
              >
                {isVideo ? (
                  <video src={url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={url} alt={`Take ${idx + 1}`} className="w-full h-full object-cover" />
                )}
                <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[8px] font-mono bg-black/80 text-white">
                  #{idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. PIPELINE QUICK ACTIONS (Lip-Sync / Direct Sequel / Download) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#26262E]">
        {isVideo && onSendToLipSync && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onSendToLipSync(activeUrl)}
            className="text-xs font-semibold border-[#4ADE80]/40 bg-[#4ADE80]/10 text-[#4ADE80] hover:bg-[#4ADE80] hover:text-black transition-all h-9"
          >
            <Mic className="mr-1.5 h-3.5 w-3.5" />
            Send to Lip-Sync Pass
          </Button>
        )}

        {generation?.prompt && onDirectNextScene && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onDirectNextScene(generation.prompt)}
            className="text-xs font-semibold border-[#7C5CFF]/40 bg-[#7C5CFF]/10 text-[#F2F2F5] hover:bg-[#7C5CFF] hover:text-white transition-all h-9"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#FBBF24]" />
            Direct Sequel Scene
          </Button>
        )}

        <div className={cn("w-full", !isVideo ? "sm:col-span-2" : "")}>
          <MediaDownloadButton
            mediaUrl={activeUrl}
            mediaType={mediaType}
            title={generation?.prompt || `take-${selectedIndex + 1}`}
            currentResolution={generation?.resolution || "1080p"}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
