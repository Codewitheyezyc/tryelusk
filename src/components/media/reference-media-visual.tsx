"use client";

import React from "react";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferenceMediaVisualProps {
  url: string;
  type?: string;
  className?: string;
}

export function ReferenceMediaVisual({
  url,
  type,
  className,
}: ReferenceMediaVisualProps) {
  const isVideo =
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes("video");

  if (isVideo) {
    return (
      <div className={cn("relative w-full h-full bg-black overflow-hidden select-none", className)}>
        {/* Frozen first frame video poster */}
        <video
          src={`${url}#t=0.001`}
          preload="metadata"
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Subtle Video Badge */}
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[9px] font-bold text-white uppercase flex items-center gap-1 border border-white/20">
          <Film className="h-2.5 w-2.5 text-[#7C5CFF]" />
          <span>Video</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Reference"
      className={cn("w-full h-full object-cover select-none", className)}
      loading="lazy"
    />
  );
}
