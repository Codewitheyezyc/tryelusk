"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateMediaAction, type GenerationResponse } from "@/app/actions/generation";
import { CinemaSidebar } from "@/components/studio/cinema-sidebar";
import { CinemaDock } from "@/components/studio/cinema-dock";
import { TakeComparisonView } from "@/components/studio/take-comparison-view";
import { CharacterForgeModal } from "@/components/characters/character-forge-modal";
import { ReferencePickerModal, type ReferenceItem } from "@/components/studio/reference-picker-modal";
import { calculateGenerationCost } from "@/lib/wallet/pricing";
import { useCredits } from "@/context/credit-context";
import { useRenderJobs } from "@/context/render-job-context";
import { useProjects } from "@/context/project-context";
import { ProjectBreadcrumbs } from "@/components/shared/project-breadcrumbs";
import { cn } from "@/lib/utils";
import type { StudioModel } from "@/lib/ai/models";
import type { Character, Generation } from "@/types/database.types";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Film,
  Layers,
  Wand2,
  Volume2,
  Play,
  Heart,
  Plus,
  Clapperboard,
} from "lucide-react";

interface StudioClientProps {
  initialModels: StudioModel[];
  initialCharacters?: Character[];
  initialGenerations?: Generation[];
}

export function StudioClient({
  initialModels = [],
  initialCharacters = [],
  initialGenerations = [],
}: StudioClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeProject, activeFolder } = useProjects();
  const queryCharId = searchParams.get("characterId");
  const queryPrompt = searchParams.get("prompt");
  const queryType = searchParams.get("type") as "image" | "video" | null;
  const queryModelId = searchParams.get("model");

  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [generationsList, setGenerationsList] = useState<Generation[]>(initialGenerations);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(queryCharId || null);
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [activeSidebarView, setActiveSidebarView] = useState<"create" | "storyboard" | "generations" | "elements" | "favorites" | "projects">("create");

  const imageModels = useMemo(
    () => initialModels.filter((m) => m.mediaType === "image"),
    [initialModels]
  );
  const videoModels = useMemo(
    () => initialModels.filter((m) => m.mediaType === "video"),
    [initialModels]
  );

  const [mediaType, setMediaType] = useState<"image" | "video">(
    queryType === "video" ? "video" : "image"
  );
  const [prompt, setPrompt] = useState("");

  const [selectedImageModel, setSelectedImageModel] = useState<StudioModel>(() => {
    if (queryModelId) {
      const match = imageModels.find((m) => m.id === queryModelId);
      if (match) return match;
    }
    return imageModels[0] || initialModels[0];
  });

  const [selectedVideoModel, setSelectedVideoModel] = useState<StudioModel>(() => {
    if (queryModelId) {
      const match = videoModels.find((m) => m.id === queryModelId);
      if (match) return match;
    }
    return videoModels[1] || videoModels[0] || initialModels[0];
  });

  const activeModel = mediaType === "image" ? selectedImageModel : selectedVideoModel;

  // Cinema Parameters
  const [filmSetup, setFilmSetup] = useState("Drama");
  const [cameraMovement, setCameraMovement] = useState("Auto");
  const [lightingMood, setLightingMood] = useState("Auto");
  const [colorPalette, setColorPalette] = useState("Auto");
  const [duration, setDuration] = useState<number>(activeModel.supportedDurations[0] || 5);
  const [resolution, setResolution] = useState<string>(mediaType === "video" ? "1080p" : "2K");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [takeCount, setTakeCount] = useState<number>(1);
  const [bypassDirector, setBypassDirector] = useState<boolean>(false);

  const handleMediaTypeChange = (type: "image" | "video") => {
    setMediaType(type);
    if (type === "video") {
      setResolution("1080p");
    } else {
      setResolution("2K");
    }
  };

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [selectedTakeIndex, setSelectedTakeIndex] = useState(0);

  const { balance, setBalance, optimisticDeduct, rollbackDeduct } = useCredits();
  const { addJob, updateJob } = useRenderJobs();

  useEffect(() => {
    if (queryPrompt) setPrompt(queryPrompt);
    if (queryType === "video") setMediaType("video");
    if (queryType === "image") setMediaType("image");
  }, [queryPrompt, queryType]);

  const totalCost = useMemo(() => {
    const calc = calculateGenerationCost({
      mediaType,
      modelName: activeModel.name,
      durationSeconds: duration,
      resolution,
    });
    return calc.totalCredits * takeCount;
  }, [mediaType, activeModel, duration, resolution, takeCount]);

  const outputUrls: string[] = useMemo(() => {
    if (!result?.generation) return [];
    if (
      Array.isArray(result.generation.output_urls) &&
      result.generation.output_urls.length > 0
    ) {
      return result.generation.output_urls as string[];
    }
    if (result.generation.output_url) {
      return [result.generation.output_url];
    }
    return [];
  }, [result]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isPending) return;

    if (balance < totalCost) {
      setResult({
        success: false,
        error: `Insufficient credit balance. Required: ${totalCost} Credits, Available: ${balance} Credits.`,
      });
      return;
    }

    const cost = totalCost;
    optimisticDeduct(cost);

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
          bypassDirector,
          characterId: selectedCharacterId || undefined,
          imageUrl: references.length > 0 ? references[0].url : undefined,
          folderId: activeFolder?.id || null,
          projectId: activeProject.id,
        });

        setResult(res);
        setSelectedTakeIndex(0);

        updateJob(jobId, {
          status: res.success ? "completed" : "failed",
          outputUrl: res.generation?.output_url || undefined,
          outputUrls: Array.isArray(res.generation?.output_urls)
            ? (res.generation?.output_urls as string[])
            : undefined,
          error: res.error,
        });

        if (typeof res.newBalance === "number") {
          setBalance(res.newBalance);
        } else if (!res.success && !res.refunded) {
          rollbackDeduct(cost);
        }

        if (res.generation) {
          setGenerationsList((prev) => [res.generation!, ...prev]);
        }

        router.refresh();
      } catch (err: any) {
        rollbackDeduct(cost);
        updateJob(jobId, {
          status: "failed",
          error: err?.message || "Network error",
        });
        setResult({
          success: false,
          error: err?.message || "An unexpected network error occurred.",
          refunded: true,
        });
      }
    });
  };

  const handleTagCharacter = (char: Character) => {
    setSelectedCharacterId(char.id);
    if (char.reference_sheet_url && !references.some((r) => r.id === char.id)) {
      setReferences((prev) => [
        {
          id: char.id,
          url: char.reference_sheet_url!,
          type: "image",
          title: char.name,
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#060608] text-[#F2F2F5]">
      {/* 1. LEFT SIDEBAR */}
      <CinemaSidebar
        activeView={activeSidebarView}
        onChangeView={(view) => {
          if (view === "generations") {
            router.push("/generations");
          } else if (view === "elements") {
            router.push("/media?tab=characters");
          } else if (view === "projects") {
            router.push("/projects");
          } else if (view === "storyboard") {
            router.push("/storyboard");
          } else {
            setActiveSidebarView(view);
          }
        }}
        onNewProject={() => {
          setPrompt("");
          setResult(null);
        }}
      />

      {/* 2. MAIN CINEMA WORKSPACE */}
      <main className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar relative pb-36">
        {/* UPPER SECTION: Theatrical Takes Canvas */}
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 space-y-6">
          {/* Active Project & Folder Breadcrumbs */}
          <ProjectBreadcrumbs showCurrentAction="Studio Canvas" />

          {/* Active Generation Loading State */}
          {isPending && (
            <div className="rounded-3xl border border-[#7C5CFF]/40 bg-[#0E0E14]/90 p-12 text-center space-y-4 shadow-2xl backdrop-blur-xl animate-pulse">
              <div className="h-14 w-14 rounded-2xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 flex items-center justify-center mx-auto text-[#7C5CFF] shadow-lg shadow-[#7C5CFF]/25">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  Rendering Theatrical Takes...
                </h3>
                <p className="text-xs text-[#8B8B96]">
                  Claude Director + {activeModel.name} is rendering your scene.
                </p>
              </div>
            </div>
          )}

          {/* GENERATION TAKE VIEWER */}
          {result?.success && result.generation && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <TakeComparisonView
                generation={result.generation}
                outputUrls={
                  Array.isArray(result.generation.output_urls) &&
                  result.generation.output_urls.length > 0
                    ? (result.generation.output_urls as string[])
                    : result.generation.output_url
                    ? [result.generation.output_url]
                    : []
                }
                selectedIndex={selectedTakeIndex}
                onSelectIndex={setSelectedTakeIndex}
                mediaType={mediaType}
                onSendToLipSync={(videoUrl) => {
                  router.push(`/audio?tab=lipsync&videoUrl=${encodeURIComponent(videoUrl)}`);
                }}
                onDirectNextScene={(prevPrompt) => {
                  const clean = prevPrompt.replace(/\[.*?\]/g, "").trim();
                  setPrompt(`Next scene following: ${clean}, continuing the action...`);
                }}
              />
            </div>
          )}

          {/* ERROR DISPLAY */}
          {result?.error && (
            <div className="p-4 rounded-2xl border border-[#F87171]/40 bg-[#F87171]/10 flex items-center gap-3 text-xs text-[#F87171]">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}

          {/* EMPTY CANVAS STATE (Clean, minimal & no overflow before generation) */}
          {!result && !isPending && (
            <div className="rounded-3xl border border-white/[0.06] bg-[#0E0E14]/40 p-12 sm:p-16 text-center space-y-3 backdrop-blur-md">
              <div className="h-12 w-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mx-auto text-[#7C5CFF] shadow-lg">
                <Clapperboard className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-white">
                  Studio Canvas Ready
                </h3>
                <p className="text-xs text-[#8B8B96] leading-relaxed">
                  Compose your scene and director controls below, then click Direct &amp; Render to generate your takes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. FLOATING BOTTOM CINEMA CONTROL DOCK */}
        <CinemaDock
          mediaType={mediaType}
          onChangeMediaType={handleMediaTypeChange}
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
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          resolution={resolution}
          onChangeResolution={setResolution}
          duration={duration}
          onChangeDuration={setDuration}
          takeCount={takeCount}
          onChangeTakeCount={setTakeCount}
          bypassDirector={bypassDirector}
          onChangeBypassDirector={setBypassDirector}
          totalCost={totalCost}
          isPending={isPending}
          onSubmit={handleGenerate}
          onOpenCharacterModal={() => setIsCharacterModalOpen(true)}
          onOpenReferenceModal={() => setIsReferenceModalOpen(true)}
          references={references}
          onRemoveReference={(refId) =>
            setReferences((prev) => prev.filter((r) => r.id !== refId))
          }
          referenceCount={references.length}
          characters={characters}
          selectedCharacterId={selectedCharacterId}
          onSelectCharacterId={setSelectedCharacterId}
          onTagCharacter={handleTagCharacter}
        />
      </main>

      {/* Guided Character Reference Creation Modal */}
      <CharacterForgeModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onCharacterCreated={(newChar) => {
          setCharacters((prev) => [newChar, ...prev]);
          setSelectedCharacterId(newChar.id);
        }}
      />

      {/* Visual Reference & Keyframe Vault Modal */}
      <ReferencePickerModal
        isOpen={isReferenceModalOpen}
        onClose={() => setIsReferenceModalOpen(false)}
        generations={generationsList}
        activeReferences={references}
        onAddReference={(item) => setReferences((prev) => [...prev, item])}
        onRemoveReference={(id) =>
          setReferences((prev) => prev.filter((r) => r.id !== id))
        }
      />
    </div>
  );
}
