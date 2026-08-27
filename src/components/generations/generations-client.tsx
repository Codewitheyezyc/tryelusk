"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { CinemaSidebar } from "@/components/studio/cinema-sidebar";
import {
  FloatingGenerationPanel,
  type ReferenceItem,
} from "@/components/generations/floating-generation-panel";
import { GenerationDetailModal } from "@/components/generations/generation-detail-modal";
import { generateMediaAction } from "@/app/actions/generation";
import {
  markGenerationViewedAction,
  toggleFavoriteAction,
  deleteGenerationAction,
  moveToTrashAction,
  clearAllGenerationsAction,
} from "@/app/actions/generations-manage";
import { MediaDownloadButton } from "@/components/media/media-download-button";
import { calculateGenerationCost } from "@/lib/wallet/pricing";
import { useCredits } from "@/context/credit-context";
import { useRenderJobs } from "@/context/render-job-context";
import { cn } from "@/lib/utils";
import type { Generation, Character } from "@/types/database.types";
import type { StudioModel } from "@/lib/ai/models";
import {
  Play,
  Sparkles,
  Loader2,
  AlertCircle,
  RotateCcw,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Download,
} from "lucide-react";

interface GenerationsClientProps {
  initialGenerations: Generation[];
  initialCharacters?: Character[];
  models: StudioModel[];
  userEmail?: string;
}

export function GenerationsClient({
  initialGenerations = [],
  initialCharacters = [],
  models = [],
  userEmail = "Creator",
}: GenerationsClientProps) {
  const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Multi-Selection State
  const [selectedGenerationIds, setSelectedGenerationIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Active Reference Selection Tray
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [isReferenceMode, setIsReferenceMode] = useState(false);

  // Scroll Tracking for Panel State A / B / C
  const [isScrolled, setIsScrolled] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  // Generation Panel Form State
  const imageModels = useMemo(() => models.filter((m) => m.mediaType === "image"), [models]);
  const videoModels = useMemo(() => models.filter((m) => m.mediaType === "video"), [models]);

  const [mediaType, setMediaType] = useState<"image" | "video">("video");
  const [prompt, setPrompt] = useState("");
  const [selectedImageModel, setSelectedImageModel] = useState<StudioModel>(imageModels[0] || models[0]);
  const [selectedVideoModel, setSelectedVideoModel] = useState<StudioModel>(videoModels[0] || models[0]);

  const activeModel = mediaType === "image" ? selectedImageModel : selectedVideoModel;

  // Parameters
  const [filmSetup, setFilmSetup] = useState("Drama");
  const [cameraMovement, setCameraMovement] = useState("Auto");
  const [lightingMood, setLightingMood] = useState("Auto");
  const [colorPalette, setColorPalette] = useState("Auto");
  const [duration, setDuration] = useState(5);
  const [hasAudio, setHasAudio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1080p");
  const [quality, setQuality] = useState("High");
  const [takeCount, setTakeCount] = useState(1);

  // Active Pending Job
  const [isPending, startTransition] = useTransition();
  const [activeJobError, setActiveJobError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { balance, setBalance, optimisticDeduct, rollbackDeduct } = useCredits();
  const { addJob, updateJob } = useRenderJobs();
  const router = useRouter();

  // Scroll handler to transition from State A to State B
  const handleScroll = () => {
    if (mainScrollRef.current) {
      const offset = mainScrollRef.current.scrollTop;
      setIsScrolled(offset > 15);
    }
  };

  // Timer for generating card
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPending]);

  // Calculate Whole-Credit Cost
  const totalCost = useMemo(() => {
    const calc = calculateGenerationCost({
      mediaType,
      modelName: activeModel.name,
      durationSeconds: duration,
      resolution,
    });
    return Math.round(calc.totalCredits * takeCount);
  }, [mediaType, activeModel, duration, resolution, takeCount]);

  // Open Detail Modal & Clear New Badge
  const handleOpenDetail = (gen: Generation) => {
    // If user is actively clicking items to add to reference tray
    if (isReferenceMode) {
      const url = gen.output_url || (Array.isArray(gen.output_urls) ? String(gen.output_urls[0]) : "");
      if (url && !references.some((r) => r.id === gen.id) && references.length < 50) {
        setReferences((prev) => [
          ...prev,
          {
            id: gen.id,
            url,
            type: gen.type === "video" ? "video" : "image",
            title: gen.prompt,
          },
        ]);
      }
      return;
    }

    setSelectedGeneration(gen);
    setIsDetailModalOpen(true);

    // Optimistically update viewed_at locally
    const techParams = (gen.technical_params as Record<string, any>) || {};
    if (!techParams.viewed_at) {
      setGenerations((prev) =>
        prev.map((item) =>
          item.id === gen.id
            ? {
                ...item,
                technical_params: {
                  ...((item.technical_params as Record<string, any>) || {}),
                  viewed_at: new Date().toISOString(),
                },
              }
            : item
        )
      );
      markGenerationViewedAction(gen.id).catch(() => {});
    }
  };

  // Recreate Flow: Prefills Generation Panel
  const handleRecreate = (gen: Generation) => {
    setMediaType(gen.type === "video" ? "video" : "image");
    setPrompt(gen.prompt || "");
    if (gen.aspect_ratio) setAspectRatio(gen.aspect_ratio);
    if (gen.resolution) setResolution(gen.resolution);
    if (gen.duration_seconds) setDuration(gen.duration_seconds);

    const matchModel = models.find((m) => m.name === gen.model_used);
    if (matchModel) {
      if (gen.type === "video") setSelectedVideoModel(matchModel);
      else setSelectedImageModel(matchModel);
    }

    // Scroll to top and expand panel
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reference Flow: Clears prompt, loads reference tray, enables multi-select mode
  const handleReference = (gen: Generation) => {
    const url = gen.output_url || (Array.isArray(gen.output_urls) ? String(gen.output_urls[0]) : "");
    if (!url) return;

    setReferences([
      {
        id: gen.id,
        url,
        type: gen.type === "video" ? "video" : "image",
        title: gen.prompt,
      },
    ]);
    setPrompt("");
    setIsReferenceMode(true);
  };

  // Turn to Video Flow (From Image Detail)
  const handleTurnToVideo = (gen: Generation) => {
    const url = gen.output_url || (Array.isArray(gen.output_urls) ? String(gen.output_urls[0]) : "");
    setMediaType("video");
    setPrompt(`Cinematic video animation of: ${gen.prompt}`);
    if (url) {
      setReferences([
        {
          id: gen.id,
          url,
          type: "image",
          title: gen.prompt,
        },
      ]);
    }
    setIsDetailModalOpen(false);
  };

  // Toggle Favorite Action
  const handleToggleFavorite = (genId: string, isFav: boolean) => {
    setGenerations((prev) =>
      prev.map((item) =>
        item.id === genId
          ? {
              ...item,
              technical_params: {
                ...((item.technical_params as Record<string, any>) || {}),
                is_favorite: isFav,
              },
            }
          : item
      )
    );
    toggleFavoriteAction(genId, isFav).catch(() => {});
  };

  // Delete / Move to Trash Action
  const handleDeleteGeneration = (genId: string) => {
    setGenerations((prev) => prev.filter((item) => item.id !== genId));
    setSelectedGenerationIds((prev) => prev.filter((id) => id !== genId));
    moveToTrashAction(genId).catch(() => {});
  };

  // Batch Move to Trash Action
  const handleBatchMoveToTrash = (ids: string[]) => {
    setGenerations((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelectedGenerationIds([]);
    setIsSelectMode(false);
    moveToTrashAction(ids).catch(() => {});
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to move all active generation records to Trash?")) {
      setGenerations([]);
      setSelectedGenerationIds([]);
      await clearAllGenerationsAction().catch(() => {});
    }
  };

  // Submit Generation
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isPending) return;

    if (balance < totalCost) {
      setActiveJobError(
        `Insufficient credit balance. Required: ${totalCost} Credits, Available: ${balance} Credits.`
      );
      return;
    }

    const cost = totalCost;
    optimisticDeduct(cost);
    setActiveJobError(null);

    const jobId = addJob({
      type: mediaType,
      prompt,
      model: activeModel.name,
    });

    startTransition(async () => {
      try {
        const fullPrompt = [
          prompt,
          filmSetup !== "Drama" ? `[Film Genre: ${filmSetup}]` : "",
          cameraMovement !== "Auto" ? `[Camera Movement: ${cameraMovement}]` : "",
          lightingMood !== "Auto" ? `[Lighting: ${lightingMood}]` : "",
          colorPalette !== "Auto" ? `[Color Palette: ${colorPalette}]` : "",
        ]
          .filter(Boolean)
          .join(" ");

        const res = await generateMediaAction({
          prompt: fullPrompt,
          modelName: activeModel.id || activeModel.name,
          mediaType,
          durationSeconds: duration,
          resolution,
          aspectRatio,
          numOutputs: takeCount,
        });

        if (res.success && res.generation) {
          setGenerations((prev) => [res.generation!, ...prev]);
          if (typeof res.newBalance === "number") setBalance(res.newBalance);
          updateJob(jobId, {
            status: "completed",
            outputUrl: res.generation.output_url || undefined,
          });
          // Clear reference mode after successful generation
          setIsReferenceMode(false);
        } else {
          if (!res.refunded) rollbackDeduct(cost);
          setActiveJobError(res.error || "Generation failed");
          updateJob(jobId, {
            status: "failed",
            error: res.error,
          });
        }
      } catch (err: any) {
        rollbackDeduct(cost);
        setActiveJobError(err?.message || "An unexpected error occurred");
        updateJob(jobId, {
          status: "failed",
          error: err?.message,
        });
      }
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#060608] text-[#F2F2F5]">
      {/* 1. LEFT SIDEBAR */}
      <CinemaSidebar
        activeView="generations"
        onChangeView={(view) => {
          if (view === "create") router.push("/generate");
          else if (view === "elements") router.push("/media");
        }}
        onNewProject={() => router.push("/generate")}
      />

      {/* 2. MAIN GENERATIONS WORKSPACE */}
      <div
        ref={mainScrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar relative pb-36 h-[calc(100vh-4rem)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  My Generations
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-[#8B8B96] border border-white/[0.08]">
                  {generations.length} Items
                </span>
              </div>
              <p className="text-xs text-[#8B8B96]">
                Every scene, cinematic shot, and visual take generated with your credits.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {generations.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectMode(!isSelectMode);
                      if (isSelectMode) setSelectedGenerationIds([]);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                      isSelectMode
                        ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-[#A78BFA]"
                        : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white"
                    )}
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{isSelectMode ? "Done Selecting" : "Select Takes"}</span>
                  </button>

                  {isSelectMode && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedGenerationIds.length === generations.length) {
                            setSelectedGenerationIds([]);
                          } else {
                            setSelectedGenerationIds(generations.map((g) => g.id));
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-semibold text-white transition-all"
                      >
                        {selectedGenerationIds.length === generations.length ? (
                          <CheckSquare className="h-3.5 w-3.5 text-[#7C5CFF]" />
                        ) : (
                          <Square className="h-3.5 w-3.5 text-[#8B8B96]" />
                        )}
                        <span>
                          {selectedGenerationIds.length === generations.length
                            ? "Deselect All"
                            : "Select All"}
                        </span>
                      </button>

                      {selectedGenerationIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleBatchMoveToTrash(selectedGenerationIds)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/15 hover:bg-red-500/25 text-xs font-bold text-red-400 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Move to Trash ({selectedGenerationIds.length})</span>
                        </button>
                      )}
                    </>
                  )}

                  {!isSelectMode && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-red-500/15 hover:border-red-500/40 text-xs font-semibold text-[#8B8B96] hover:text-red-400 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Move All to Trash</span>
                    </button>
                  )}
                </>
              )}

              {isReferenceMode && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#7C5CFF]/40 bg-[#7C5CFF]/15 text-xs text-[#7C5CFF]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Reference Selection Active: Click items to attach</span>
                  <button
                    type="button"
                    onClick={() => setIsReferenceMode(false)}
                    className="font-bold hover:underline ml-1"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {activeJobError && (
            <div className="p-3 rounded-2xl border border-[#F87171]/40 bg-[#F87171]/10 text-xs text-[#F87171] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{activeJobError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveJobError(null)}
                className="text-white hover:underline text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 3. RESPONSIVE GRID (4 cols desktop -> 2 cols tablet -> 1 col mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ACTIVE GENERATING CARD (Real-time Lifecycle State) */}
            {isPending && (
              <div className="relative aspect-[9/16] sm:aspect-video lg:aspect-[9/16] rounded-2xl border border-[#7C5CFF]/50 bg-[#0E0E14]/90 overflow-hidden flex flex-col items-center justify-center p-4 text-center shadow-xl shadow-[#7C5CFF]/10 animate-pulse select-none">
                <div className="h-10 w-10 rounded-2xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 flex items-center justify-center text-[#7C5CFF] mb-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                <span className="text-xs font-bold text-white mb-1">
                  Rendering Scene...
                </span>
                <span className="font-mono text-[11px] text-[#7C5CFF]">
                  {elapsedSeconds}s elapsed
                </span>
                <p className="text-[10px] text-[#8B8B96] line-clamp-2 mt-2 px-2">
                  "{prompt}"
                </p>
              </div>
            )}

            {/* COMPLETED GENERATION CARDS */}
            {generations.map((gen) => {
              const url =
                gen.output_url ||
                (Array.isArray(gen.output_urls) && gen.output_urls.length > 0
                  ? String(gen.output_urls[0])
                  : "");

              const isVideo = gen.type === "video";
              const techParams = (gen.technical_params as Record<string, any>) || {};
              const isUnviewed = !techParams.viewed_at;
              const isFav = Boolean(techParams.is_favorite);
              const isAttachedRef = references.some((r) => r.id === gen.id);
              const isSelected = selectedGenerationIds.includes(gen.id);
              const genRatio = techParams.aspect_ratio || "16:9";
              const aspectClass =
                genRatio === "9:16"
                  ? "aspect-[9/16]"
                  : genRatio === "1:1"
                  ? "aspect-square"
                  : genRatio === "21:9"
                  ? "aspect-[21/9]"
                  : "aspect-video";

              return (
                <div
                  key={gen.id}
                  onClick={() => {
                    if (isSelectMode) {
                      setSelectedGenerationIds((prev) =>
                        prev.includes(gen.id)
                          ? prev.filter((id) => id !== gen.id)
                          : [...prev, gen.id]
                      );
                    } else {
                      handleOpenDetail(gen);
                    }
                  }}
                  className={cn(
                    "group relative rounded-2xl border bg-[#0E0E14] cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center hover:z-30",
                    aspectClass,
                    isSelected
                      ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/60 z-20"
                      : isAttachedRef
                      ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/40 z-20"
                      : "border-white/[0.08] hover:border-white/25 hover:shadow-xl"
                  )}
                >
                  {/* Media Visual Container (clips image/video) */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    {url && isVideo ? (
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : url ? (
                      <img
                        src={url}
                        alt={gen.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-black/40">
                        <AlertCircle className="h-6 w-6 text-[#F87171] mb-1" />
                        <span className="text-[10px] text-[#8B8B96]">Failed</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Checkbox overlay if select mode */}
                  {isSelectMode && (
                    <div className="absolute top-2.5 left-2.5 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGenerationIds((prev) =>
                            prev.includes(gen.id)
                              ? prev.filter((id) => id !== gen.id)
                              : [...prev, gen.id]
                          );
                        }}
                        className="p-1 rounded-lg bg-black/80 text-white backdrop-blur-md"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[#7C5CFF]" />
                        ) : (
                          <Square className="h-4 w-4 text-white/70" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Play Icon Overlay for Videos */}
                  {isVideo && !isSelectMode && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="h-10 w-10 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Unviewed "New" Badge */}
                  {isUnviewed && !isSelectMode && (
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-white/15 backdrop-blur-md shadow-lg z-10">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24] shadow-sm shadow-[#FBBF24]" />
                      <span className="text-[9px] font-bold text-white tracking-wide">
                        New
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay with Prompt Info + Direct Action Tools */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between z-20 pointer-events-none">
                    <div className="flex items-center justify-between pointer-events-auto">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-black/70 text-white border border-white/10">
                        {gen.model_used}
                      </span>
                      
                      {/* Top Action Tools: Download with options & Move to Trash */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {url && (
                          <MediaDownloadButton
                            variant="icon"
                            mediaUrl={url}
                            mediaType={gen.type}
                            title={gen.prompt}
                            currentResolution={gen.resolution || "1080p"}
                          />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGeneration(gen.id);
                          }}
                          className="p-1.5 rounded-xl bg-black/80 hover:bg-red-500/80 border border-white/10 text-white shadow-lg backdrop-blur-md transition-all flex items-center justify-center"
                          title="Move to Trash"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 pointer-events-auto">
                      <p className="text-[11px] text-white font-medium line-clamp-2 leading-relaxed">
                        {gen.prompt}
                      </p>
                      <div className="flex items-center justify-between text-[9px] font-mono text-[#8B8B96]">
                        <span>{gen.resolution || "1080p"}</span>
                        <span>{new Date(gen.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {generations.length === 0 && !isPending && (
            <div className="rounded-3xl border border-white/[0.06] bg-[#0E0E14]/40 p-16 text-center space-y-3 backdrop-blur-md">
              <div className="h-12 w-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mx-auto text-[#7C5CFF] shadow-lg">
                <Film className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-white">
                  No Generations Yet
                </h3>
                <p className="text-xs text-[#8B8B96] leading-relaxed">
                  Start directing in the generation dock below. Every completed scene will appear here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. FLOATING DUAL-MODE GENERATION PANEL (Visible on Desktop, hidden on mobile for clean gallery view) */}
        <div className="hidden md:block">
          <FloatingGenerationPanel
            isScrolled={isScrolled}
            mediaType={mediaType}
            onChangeMediaType={setMediaType}
            prompt={prompt}
            onChangePrompt={setPrompt}
            activeModel={activeModel}
            models={mediaType === "image" ? imageModels : videoModels}
            onSelectModel={(m) => {
              if (mediaType === "image") setSelectedImageModel(m);
              else setSelectedVideoModel(m);
            }}
            filmSetup={filmSetup}
            onChangeFilmSetup={setFilmSetup}
            cameraMovement={cameraMovement}
            onChangeCameraMovement={setCameraMovement}
            lightingMood={lightingMood}
            onChangeLightingMood={setLightingMood}
            colorPalette={colorPalette}
            onChangeColorPalette={setColorPalette}
            duration={duration}
            onChangeDuration={setDuration}
            hasAudio={hasAudio}
            onToggleAudio={() => setHasAudio(!hasAudio)}
            aspectRatio={aspectRatio}
            onChangeAspectRatio={setAspectRatio}
            resolution={resolution}
            onChangeResolution={setResolution}
            quality={quality}
            onChangeQuality={setQuality}
            takeCount={takeCount}
            onChangeTakeCount={setTakeCount}
            references={references}
            onRemoveReference={(refId) =>
              setReferences((prev) => prev.filter((r) => r.id !== refId))
            }
            onOpenReferenceSelector={() => setIsReferenceMode(!isReferenceMode)}
            totalCost={totalCost}
            isPending={isPending}
            onSubmit={handleGenerate}
            characters={characters}
            onSelectCharacter={(char) => {
              if (char.reference_sheet_url && !references.some((r) => r.id === char.id)) {
                setReferences((prev) => [
                  {
                    id: char.id,
                    url: char.reference_sheet_url!,
                    type: "character",
                    title: char.name,
                  },
                  ...prev,
                ]);
              }
            }}
          />
        </div>
      </div>

      {/* 5. FULLSCREEN TWO-PANE DETAIL MODAL */}
      <GenerationDetailModal
        generation={selectedGeneration}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedGeneration(null);
        }}
        onRecreate={handleRecreate}
        onReference={handleReference}
        onTurnToVideo={handleTurnToVideo}
        onDelete={handleDeleteGeneration}
        onToggleFavorite={handleToggleFavorite}
        userEmail={userEmail}
        models={models}
      />
    </div>
  );
}
