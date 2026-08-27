"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Film, Sparkles, X, ArrowUpRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRenderJobs } from "@/context/render-job-context";
import { cn } from "@/lib/utils";

export function RenderCompletionToast() {
  const { latestCompletedJob, dismissLatestCompleted } = useRenderJobs();

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!latestCompletedJob) return;

    const timer = setTimeout(() => {
      dismissLatestCompleted();
    }, 8000);

    return () => clearTimeout(timer);
  }, [latestCompletedJob, dismissLatestCompleted]);

  if (!latestCompletedJob) return null;

  const isVideo = latestCompletedJob.type === "video" || latestCompletedJob.type === "lipsync";
  const primaryUrl =
    (latestCompletedJob.outputUrls && latestCompletedJob.outputUrls[0]) ||
    latestCompletedJob.outputUrl;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="rounded-xl border border-[#4ADE80]/50 bg-[#16161C]/95 p-4 shadow-2xl backdrop-blur-md space-y-3 ring-1 ring-[#4ADE80]/20">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4ADE80]/15 text-[#4ADE80]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-[#F2F2F5]">
              Take Ready ({latestCompletedJob.model})
            </span>
          </div>

          <button
            type="button"
            onClick={dismissLatestCompleted}
            className="p-1 rounded-md text-[#8B8B96] hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Thumbnail & Prompt Preview */}
        <div className="flex gap-3 items-center">
          {primaryUrl && (
            <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border border-[#26262E] bg-[#0B0B0F]">
              {isVideo ? (
                <video src={primaryUrl} className="w-full h-full object-cover" muted autoPlay loop />
              ) : (
                <img src={primaryUrl} alt="Completed Take" className="w-full h-full object-cover" />
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#8B8B96] line-clamp-2 leading-relaxed">
              {latestCompletedJob.prompt}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#26262E]">
          <Link href="/media" className="flex-1">
            <Button
              size="sm"
              onClick={dismissLatestCompleted}
              className="w-full h-7 text-xs font-semibold bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white shadow"
            >
              Open Media Vault
            </Button>
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={dismissLatestCompleted}
            className="h-7 px-3 text-xs border-[#26262E] bg-[#0B0B0F] text-[#8B8B96] hover:text-white"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
