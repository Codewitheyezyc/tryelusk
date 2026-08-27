"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Film,
  FileCode,
  FileText,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  Settings,
  Play,
  Loader2,
  Video,
} from "lucide-react";
import { generateFCPXML } from "@/lib/export/fcpxml";
import { generateCMX3600EDL } from "@/lib/export/edl";
import { generateShotList } from "@/lib/export/shot-list";
import { stitchStoryboardScenes, type StitchProgress } from "@/lib/export/video-stitcher";
import type { StoryboardScene } from "@/app/actions/storyboard";
import { cn } from "@/lib/utils";

interface ExportCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: StoryboardScene[];
  projectTitle: string;
}

type ExportFormat = "master_mp4" | "fcpxml" | "edl" | "shotlist" | "json";

export function ExportCinemaModal({
  isOpen,
  onClose,
  scenes,
  projectTitle,
}: ExportCinemaModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("master_mp4");
  const [fps, setFps] = useState<24 | 25 | 30 | 60>(24);
  const [resolution, setResolution] = useState<"1080p" | "4k">("1080p");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<StitchProgress | null>(null);
  const [downloadReady, setDownloadReady] = useState<{ url: string; fileName: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setDownloadReady(null);
      setProgress(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalDuration = scenes.reduce((sum, s) => sum + (s.durationSeconds || 5), 0);
  const totalTakes = scenes.filter((s) => Boolean(s.mediaUrl)).length;

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(null);
    setDownloadReady(null);

    const safeTitle = (projectTitle || "untitled-film")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    try {
      // 1. FLAGSHIP: MASTER VIDEO CONCATENATOR (.MP4)
      if (selectedFormat === "master_mp4") {
        const result = await stitchStoryboardScenes(scenes, {
          fps,
          resolution,
          projectTitle,
          onProgress: (p) => setProgress(p),
        });

        setDownloadReady({ url: result.downloadUrl, fileName: result.fileName });

        // Auto trigger download
        const a = document.createElement("a");
        a.href = result.downloadUrl;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setIsExporting(false);
        return;
      }

      // 2. TIMELINE FORMATS (.fcpxml, .edl, .shotlist, .json)
      let fileContent = "";
      let fileName = "";
      let mimeType = "text/plain";

      if (selectedFormat === "fcpxml") {
        fileContent = generateFCPXML(scenes, projectTitle, {
          fps,
          width: resolution === "4k" ? 3840 : 1920,
          height: resolution === "4k" ? 2160 : 1080,
        });
        fileName = `${safeTitle}.fcpxml`;
        mimeType = "application/xml";
      } else if (selectedFormat === "edl") {
        fileContent = generateCMX3600EDL(scenes, projectTitle, fps);
        fileName = `${safeTitle}.edl`;
        mimeType = "text/plain";
      } else if (selectedFormat === "shotlist") {
        fileContent = generateShotList(scenes, projectTitle);
        fileName = `${safeTitle}-shotlist.md`;
        mimeType = "text/markdown";
      } else if (selectedFormat === "json") {
        const manifest = {
          projectTitle,
          exportedAt: new Date().toISOString(),
          fps,
          resolution,
          totalScenes: scenes.length,
          totalDurationSeconds: totalDuration,
          scenes: scenes.map((s, idx) => ({
            sceneNumber: idx + 1,
            title: s.title,
            prompt: s.prompt,
            durationSeconds: s.durationSeconds,
            mediaType: s.mediaType,
            mediaUrl: s.mediaUrl,
            audioUrl: s.audioUrl || null,
          })),
        };
        fileContent = JSON.stringify(manifest, null, 2);
        fileName = `${safeTitle}-manifest.json`;
        mimeType = "application/json";
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Video export failed";
      setProgress({
        stage: "error",
        currentScene: 0,
        totalScenes: scenes.length,
        percent: 0,
        message: msg,
      });
      setIsExporting(false);
    }
  };

  const FORMATS = [
    {
      id: "master_mp4" as ExportFormat,
      title: "Master Movie File (.mp4) — Complete Video Cut",
      description: "Directly stitches all takes into a seamless, high-fidelity MP4 movie ready for distribution.",
      icon: Video,
      badge: "RECOMMENDED",
    },
    {
      id: "fcpxml" as ExportFormat,
      title: "DaVinci Resolve & Premiere Pro (.fcpxml)",
      description: "Apple Final Cut Pro XML with exact cuts, scene durations, and audio sync.",
      icon: Film,
      badge: null,
    },
    {
      id: "edl" as ExportFormat,
      title: "Universal Edit Decision List (.edl)",
      description: "Standard CMX 3600 EDL for universal compatibility with Avid, DaVinci, and Premiere.",
      icon: FileCode,
      badge: null,
    },
    {
      id: "shotlist" as ExportFormat,
      title: "Cinematographer Shot List (.md)",
      description: "Formatted Markdown documentation with shot numbers, camera directions, and prompts.",
      icon: FileText,
      badge: null,
    },
    {
      id: "json" as ExportFormat,
      title: "Pipeline Data Package (.json)",
      description: "Raw timeline metadata with timestamps and direct media URLs for automated pipelines.",
      icon: Package,
      badge: null,
    },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={() => !isExporting && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-white/[0.12] bg-[#0E0E14] shadow-[0_25px_70px_rgba(0,0,0,0.98)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-white/[0.08] bg-[#0E0E14] shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#6D3EFF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7C5CFF]/30 shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Export Master Production Package</span>
              </h2>
              <p className="text-xs text-[#8B8B96] mt-0.5">
                {totalTakes} Takes • {totalDuration}s Total Run Time • {fps} FPS
              </p>
            </div>
          </div>

          {!isExporting && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Active Stitching Progress Banner */}
          {progress && (
            <div
              className={cn(
                "p-4 rounded-2xl border transition-all animate-in fade-in duration-200",
                progress.stage === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : progress.stage === "complete"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-[#7C5CFF]/40 bg-[#7C5CFF]/10 text-white"
              )}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <div className="flex items-center gap-2">
                  {progress.stage === "complete" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : progress.stage === "error" ? (
                    <X className="h-4 w-4 text-red-400" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-[#7C5CFF] animate-spin" />
                  )}
                  <span>{progress.message}</span>
                </div>
                <span className="font-mono text-[11px]">{progress.percent}%</span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300 rounded-full",
                    progress.stage === "complete"
                      ? "bg-emerald-500"
                      : progress.stage === "error"
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-[#7C5CFF] to-[#A78BFF]"
                  )}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Format Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#D1D1DB] uppercase tracking-wider block">
              Choose Master Format
            </label>

            <div className="space-y-2">
              {FORMATS.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = selectedFormat === fmt.id;

                return (
                  <button
                    key={fmt.id}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={cn(
                      "w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3.5",
                      isSelected
                        ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white shadow-md shadow-[#7C5CFF]/15"
                        : "border-white/[0.06] bg-white/[0.02] text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2.5 rounded-xl shrink-0 transition-colors",
                        isSelected
                          ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                          : "bg-white/[0.06] text-[#8B8B96]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white block">
                          {fmt.title}
                        </span>
                        {fmt.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#7C5CFF] text-white">
                            {fmt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8B8B96] mt-0.5 leading-relaxed">
                        {fmt.description}
                      </p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-[#7C5CFF] shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Specs: FPS & Resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
            {/* FPS Target */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#D1D1DB] flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-[#7C5CFF]" />
                <span>Timecode Frame Rate</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {([24, 25, 30, 60] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setFps(f)}
                    className={cn(
                      "h-8 rounded-xl border text-xs font-mono font-bold transition-all",
                      fps === f
                        ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-[#8B8B96] hover:text-white"
                    )}
                  >
                    {f} fps
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#D1D1DB] flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5 text-[#38BDF8]" />
                <span>Render Resolution</span>
              </label>
              <div className="grid grid-cols-2 gap-1">
                {(["1080p", "4k"] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setResolution(res)}
                    className={cn(
                      "h-8 rounded-xl border text-xs font-mono font-bold transition-all uppercase",
                      resolution === res
                        ? "border-[#38BDF8] bg-[#38BDF8]/20 text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-[#8B8B96] hover:text-white"
                    )}
                  >
                    {res === "4k" ? "4K (3840x2160)" : "1080p (FHD)"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] flex items-center justify-between gap-3 bg-[#0E0E14] shrink-0">
          <div className="text-[11px] text-[#8B8B96] hidden sm:block">
            {selectedFormat === "master_mp4"
              ? "Lossless H.264 stream concatenation with audio dub mix"
              : "Industry standard XML/EDL timecode timeline"}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isExporting}
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-[#8B8B96] hover:text-white transition-colors"
            >
              Cancel
            </button>

            {downloadReady ? (
              <a
                href={downloadReady.url}
                download={downloadReady.fileName}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Again ({downloadReady.fileName})</span>
              </a>
            ) : (
              <button
                type="button"
                disabled={isExporting || scenes.length === 0}
                onClick={handleExport}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 flex items-center gap-2 disabled:opacity-40 transition-all"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Compiling Cut...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {selectedFormat === "master_mp4"
                        ? "Export Master Movie (.mp4)"
                        : "Download Package"}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
