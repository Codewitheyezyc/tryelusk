"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  ChevronDown,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useRenderJobs } from "@/context/render-job-context";
import { cn } from "@/lib/utils";

export function RenderStatusPill() {
  const { activeJobs, completedJobs, dismissJob } = useRenderJobs();
  const [isOpen, setIsOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentJob = activeJobs[0];

  // Elapsed timer tick
  useEffect(() => {
    if (!currentJob) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - currentJob.startedAt) / 1000);
      setElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentJob]);

  if (activeJobs.length === 0 && completedJobs.length === 0) return null;

  return (
    <div className="relative">
      {/* 1. Header Trigger Pill */}
      {activeJobs.length > 0 ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#7C5CFF]/60 bg-[#7C5CFF]/15 text-[#F2F2F5] hover:bg-[#7C5CFF]/25 transition-all text-xs shadow-sm shadow-[#7C5CFF]/20 animate-pulse"
        >
          <Loader2 className="h-3 w-3 text-[#7C5CFF] animate-spin" />
          <span className="font-semibold text-[11px] text-[#7C5CFF]">
            Rendering ({activeJobs.length})
          </span>
          <span className="text-[10px] font-mono text-[#8B8B96]">{elapsedSeconds}s</span>
          <ChevronDown className="h-3 w-3 text-[#8B8B96]" />
        </button>
      ) : completedJobs.length > 0 ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#4ADE80]/50 bg-[#4ADE80]/15 text-[#4ADE80] hover:bg-[#4ADE80]/25 transition-all text-xs shadow-sm shadow-[#4ADE80]/20"
        >
          <CheckCircle2 className="h-3 w-3 text-[#4ADE80]" />
          <span className="font-semibold text-[11px]">Ready ({completedJobs.length})</span>
          <ChevronDown className="h-3 w-3 text-[#4ADE80]/70" />
        </button>
      ) : null}

      {/* 2. Dropdown Queue Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#26262E] bg-[#16161C] p-3 shadow-2xl z-50 space-y-3">
          <div className="flex items-center justify-between border-b border-[#26262E] pb-2">
            <span className="text-xs font-bold text-[#F2F2F5] flex items-center gap-1.5">
              <Film className="h-3.5 w-3.5 text-[#7C5CFF]" />
              Render Queue &amp; Takes
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-[#8B8B96] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Active Tasks */}
          {activeJobs.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7C5CFF]">
                Active In-Flight ({activeJobs.length})
              </span>
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-2.5 rounded-lg border border-[#7C5CFF]/30 bg-[#0B0B0F] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F2F2F5] flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 text-[#7C5CFF] animate-spin" />
                      {job.model}
                    </span>
                    <span className="text-[10px] font-mono text-[#8B8B96]">{elapsedSeconds}s</span>
                  </div>
                  <p className="text-[11px] text-[#8B8B96] line-clamp-2">{job.prompt}</p>
                </div>
              ))}
            </div>
          )}

          {/* Completed Takes */}
          {completedJobs.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4ADE80]">
                Completed Takes ({completedJobs.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-2 hide-scrollbar">
                {completedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-2.5 rounded-lg border border-[#26262E] bg-[#0B0B0F] flex items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-semibold text-[#F2F2F5] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-[#4ADE80]" />
                        {job.model}
                      </span>
                      <p className="text-[10px] text-[#8B8B96] line-clamp-1">{job.prompt}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link href="/media">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-[#7C5CFF] text-white hover:bg-[#6D3EFF] transition-colors"
                        >
                          View
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => dismissJob(job.id)}
                        className="p-1 rounded text-[#8B8B96] hover:text-white"
                        title="Dismiss"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
