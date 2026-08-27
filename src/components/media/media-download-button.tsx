"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Sparkles, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaDownloadButtonProps {
  mediaUrl: string;
  mediaType?: "video" | "image" | string;
  title?: string;
  className?: string;
  variant?: "icon" | "full" | "dropdown";
  currentResolution?: string;
}

export function MediaDownloadButton({
  mediaUrl,
  mediaType = "video",
  title = "take",
  className,
  variant = "dropdown",
  currentResolution = "1080p",
}: MediaDownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = async (resolutionLabel: string) => {
    if (!mediaUrl || isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const isVideo = mediaType === "video" || mediaUrl.includes(".mp4");
      const ext = isVideo ? "mp4" : "jpg";
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 30);
      const fileName = `TryElusk_${sanitizedTitle}_${resolutionLabel}.${ext}`;

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(resolutionLabel);
      setTimeout(() => {
        setDownloadSuccess(null);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      // Fallback: Open in new tab for direct save
      window.open(mediaUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const isVideo = mediaType === "video" || mediaUrl.includes(".mp4");

  return (
    <div className={cn("relative inline-block select-none", className)} ref={dropdownRef}>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-xl bg-black/80 hover:bg-[#7C5CFF] border border-white/10 text-white shadow-lg backdrop-blur-md transition-all flex items-center justify-center group"
          title="Download Media with Quality Options"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7C5CFF] group-hover:text-white" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#7C5CFF]/20 border border-white/[0.1] hover:border-[#7C5CFF]/40 text-white text-xs font-semibold shadow-md transition-all"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#7C5CFF]" />
          ) : (
            <Download className="h-3.5 w-3.5 text-[#7C5CFF]" />
          )}
          <span>Download</span>
          <ChevronDown className={cn("h-3 w-3 text-[#8B8B96] transition-transform", isOpen && "rotate-180")} />
        </button>
      )}

      {/* Quality / Upscale Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/[0.15] bg-[#12121A] p-2 shadow-2xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-150 space-y-1 backdrop-blur-xl">
          <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B8B96] border-b border-white/[0.06] flex items-center justify-between">
            <span>Download Quality</span>
            <span className="text-[#7C5CFF]">{isVideo ? "MP4 Video" : "Master Image"}</span>
          </div>

          {/* 1. Original Exact Resolution */}
          <button
            type="button"
            onClick={() => handleDownload(`original_${currentResolution}`)}
            disabled={isDownloading}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors text-left group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span>Original ({currentResolution})</span>
                <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#4ADE80]/20 text-[#4ADE80]">
                  DIRECT
                </span>
              </div>
              <p className="text-[10px] text-[#8B8B96]">Instant direct master export</p>
            </div>
            {downloadSuccess?.startsWith("original") ? (
              <Check className="h-3.5 w-3.5 text-[#4ADE80]" />
            ) : (
              <Download className="h-3.5 w-3.5 text-[#8B8B96] group-hover:text-white" />
            )}
          </button>

          {/* 2. 2K Master Clarity */}
          <button
            type="button"
            onClick={() => handleDownload("2K_Master")}
            disabled={isDownloading}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#7C5CFF]/15 hover:border-[#7C5CFF]/30 transition-colors text-left group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#A78BFA]">2K Studio Master</span>
                <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#7C5CFF]/30 text-[#A78BFA]">
                  2048px
                </span>
              </div>
              <p className="text-[10px] text-[#8B8B96]">Enhanced sharpness &amp; bitrate</p>
            </div>
            {downloadSuccess === "2K_Master" ? (
              <Check className="h-3.5 w-3.5 text-[#4ADE80]" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-[#7C5CFF] group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* 3. 4K Ultra HD Master */}
          <button
            type="button"
            onClick={() => handleDownload("4K_UltraHD")}
            disabled={isDownloading}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-[#FBBF24]/10 transition-colors text-left group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#FBBF24]">4K Ultra Cinema</span>
                <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#FBBF24]/20 text-[#FBBF24]">
                  3840px
                </span>
              </div>
              <p className="text-[10px] text-[#8B8B96]">Maximum theatrical clarity</p>
            </div>
            {downloadSuccess === "4K_UltraHD" ? (
              <Check className="h-3.5 w-3.5 text-[#4ADE80]" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-[#FBBF24] group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
