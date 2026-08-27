"use client";

import React, { useState, useTransition, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Wand2,
  Loader2,
  Film,
  UserCheck,
  Video,
  Image as ImageIcon,
  Mic,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Zap,
  ArrowRight,
  Play,
  RotateCcw,
  Compass,
  Camera,
  Layers,
  Volume2,
  Clapperboard,
  Sliders,
  Check,
  ChevronDown,
  ArrowDown,
  MapPin,
  Package,
  FileText,
  Upload,
  Settings2,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  planVibeDirectorSequenceAction,
  executeVibeDirectorStepAction,
  upgradeToProAction,
  type UserPlanStatus,
} from "@/app/actions/vibe-director";
import type { VibeDirectorPlan, VibeProductionStep, VibeSceneGroup } from "@/lib/ai/director";
import { sanitizeAIErrorMessage } from "@/lib/ai/errors";
import { useCredits } from "@/context/credit-context";
import { useRenderJobs } from "@/context/render-job-context";
import { cn } from "@/lib/utils";

interface UIProductionStep extends VibeProductionStep {
  status?: "pending" | "running" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
}

interface VibeDirectorClientProps {
  initialPlanStatus: UserPlanStatus;
}

const INSPIRATION_RECIPES = [
  {
    icon: "🌆",
    genre: "Cyberpunk",
    title: "Neon Rain Infiltration",
    prompt: "Direct an intense 3-shot cyber-thriller chase scene with @elena escaping through a neon-lit rain alleyway, featuring dynamic steadicam tracking and high-contrast cyan and magenta lighting.",
  },
  {
    icon: "⚔️",
    genre: "Action",
    title: "Golden Hour Katana Duel",
    prompt: "Direct an epic martial arts scene at sunset in front of an ancient temple, with a weathered warrior drawing a gleaming katana as cherry blossom petals swirl in the golden rim lighting.",
  },
  {
    icon: "🥐",
    genre: "Commercial",
    title: "Artisan Bakery Brand Spot",
    prompt: "Direct a 30-second commercial for an artisanal sourdough bakery with morning sunlight streaming through flour dust, golden crust close-ups, and a warm, inviting voiceover narration.",
  },
  {
    icon: "🚀",
    genre: "Sci-Fi",
    title: "Deep Space Exploration",
    prompt: "Direct an atmospheric sci-fi sequence of an astronaut discovering glowing alien bioluminescent crystal flora on a foggy obsidian landscape with sweeping aerial camera choreography.",
  },
];

const OPTICS_PRESETS = [
  { id: "35mm Anamorphic", label: "35mm Cine Anamorphic", icon: "🎥" },
  { id: "Vintage 1970s Chemical Film", label: "Vintage 70s 35mm Grain", icon: "🎞️" },
  { id: "Dramatic Noir Chiaroscuro", label: "High-Contrast Noir", icon: "🌑" },
  { id: "Clean High-Key Commercial", label: "Studio Commercial Light", icon: "💡" },
  { id: "IMAX Ultra-Sharp Photoreal", label: "IMAX 8K Large Format", icon: "🌟" },
];

export function VibeDirectorClient({ initialPlanStatus }: VibeDirectorClientProps) {
  const [isPro, setIsPro] = useState(initialPlanStatus.isProUnlocked);
  const [tier, setTier] = useState(initialPlanStatus.tier);

  // Directing Mode: Manual Rig vs Autonomous Agent
  const [directingMode, setDirectingMode] = useState<"manual" | "agent">("agent");

  // Input Type: Story Brief vs Full Screenplay Script
  const [inputType, setInputType] = useState<"brief" | "script">("brief");

  // Story & Script State
  const [outcomePrompt, setOutcomePrompt] = useState("");
  const [scriptText, setScriptText] = useState("");

  // Manual Rig Controls State
  const [manualVideoModel, setManualVideoModel] = useState("kling-2.5-turbo");
  const [manualImageModel, setManualImageModel] = useState("nano-banana");
  const [manualAspectRatio, setManualAspectRatio] = useState("16:9");
  const [manualResolution, setManualResolution] = useState("1080p");
  const [manualDuration, setManualDuration] = useState(5);
  const [manualOptics, setManualOptics] = useState(OPTICS_PRESETS[0].id);

  const [isPlanning, startPlanningTransition] = useTransition();
  const [isExecuting, setIsExecuting] = useState(false);

  const [currentPlan, setCurrentPlan] = useState<VibeDirectorPlan | null>(null);
  const [steps, setSteps] = useState<UIProductionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [spentCredits, setSpentCredits] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);

  const planSectionRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { balance, setBalance, optimisticDeduct } = useCredits();
  const { addJob, updateJob } = useRenderJobs();
  const router = useRouter();

  const handleSelectRecipe = (recipePrompt: string) => {
    setOutcomePrompt(recipePrompt);
    setInputType("brief");
  };

  // Handle Script File Upload (.txt, .pdf, .fountain, .docx, .md)
  const handleScriptFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setScriptText(text);
        setInputType("script");
      }
    };
    reader.readAsText(file);
  };

  const handlePlanSequence = (e: React.FormEvent) => {
    e.preventDefault();
    const activeText = inputType === "script" ? scriptText : outcomePrompt;
    if (!activeText.trim()) return;

    if (!isPro) {
      router.push("/pricing");
      return;
    }

    setErrorMsg(null);
    setCurrentPlan(null);
    setSteps([]);
    setCurrentStepIndex(-1);
    setSpentCredits(0);
    setShowScrollPrompt(false);

    startPlanningTransition(async () => {
      const res = await planVibeDirectorSequenceAction({
        goal: outcomePrompt,
        mode: directingMode,
        inputType,
        scriptText,
        manualSettings:
          directingMode === "manual"
            ? {
                videoModel: manualVideoModel,
                imageModel: manualImageModel,
                aspectRatio: manualAspectRatio,
                resolution: manualResolution,
                durationSeconds: manualDuration,
                opticsStyle: manualOptics,
              }
            : undefined,
      });

      if (!res.success || !res.plan) {
        if (res.isProGated) {
          router.push("/pricing");
        } else {
          setErrorMsg(sanitizeAIErrorMessage(res.error));
        }
      } else {
        setCurrentPlan(res.plan);
        setSteps(
          res.plan.steps.map((s) => ({
            ...s,
            status: "pending",
          }))
        );
        setShowScrollPrompt(true);

        setTimeout(() => {
          planSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    });
  };

  const scrollToPlan = () => {
    planSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleExecuteSequence = async (targetSteps?: UIProductionStep[]) => {
    const stepsToRun = targetSteps || steps;
    if (!currentPlan || stepsToRun.length === 0 || isExecuting) return;

    const pendingSteps = stepsToRun.filter((s) => s.status !== "completed");
    const requiredCredits = pendingSteps.reduce((acc, s) => acc + s.estimatedCredits, 0);

    if (balance < requiredCredits) {
      setErrorMsg(
        `Insufficient credits. This batch requires ${requiredCredits} credits, but your balance is ${balance}.`
      );
      return;
    }

    setIsExecuting(true);
    setErrorMsg(null);

    let runningContext: {
      characterId?: string;
      characterName?: string;
      lastVideoUrl?: string;
      lastAudioUrl?: string;
    } = {};

    let totalSpent = spentCredits;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.status === "completed") continue;
      if (targetSteps && !targetSteps.some((ts) => ts.stepId === step.stepId)) continue;

      setCurrentStepIndex(i);

      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s))
      );

      const renderJobId = addJob({
        type:
          step.type === "character"
            ? "image"
            : (step.type as "image" | "video" | "audio" | "lipsync"),
        prompt: `[Vibe Director] ${step.title}`,
        model: step.params?.modelName || (directingMode === "manual" ? manualVideoModel : "Autonomous Agent"),
      });

      optimisticDeduct(step.estimatedCredits);
      totalSpent += step.estimatedCredits;
      setSpentCredits(totalSpent);

      const res = await executeVibeDirectorStepAction(step, runningContext);

      if (!res.success) {
        const friendlyErr = sanitizeAIErrorMessage(res.error);
        setSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "failed", error: friendlyErr } : s
          )
        );
        updateJob(renderJobId, { status: "failed", error: friendlyErr });
        setErrorMsg(`Step ${i + 1} (${step.title}): ${friendlyErr}`);
        setIsExecuting(false);
        return;
      }

      if (res.character) {
        runningContext.characterId = res.character.id;
        runningContext.characterName = res.character.name;
      }
      if (step.type === "video" && res.outputUrl) {
        runningContext.lastVideoUrl = res.outputUrl;
      }
      if (step.type === "audio" && res.outputUrl) {
        runningContext.lastAudioUrl = res.outputUrl;
      }

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i
            ? {
                ...s,
                status: "completed",
                outputUrl: res.outputUrl,
              }
            : s
        )
      );

      updateJob(renderJobId, {
        status: "completed",
        outputUrl: res.outputUrl,
      });

      if (typeof res.newBalance === "number") {
        setBalance(res.newBalance);
      }
    }

    setIsExecuting(false);
    setCurrentStepIndex(-1);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "character":
        return <UserCheck className="h-4 w-4 text-[#EC4899]" />;
      case "location":
        return <MapPin className="h-4 w-4 text-[#38BDF8]" />;
      case "prop":
        return <Package className="h-4 w-4 text-[#F472B6]" />;
      case "image":
        return <ImageIcon className="h-4 w-4 text-[#7C5CFF]" />;
      case "video":
        return <Video className="h-4 w-4 text-[#38BDF8]" />;
      case "audio":
        return <Mic className="h-4 w-4 text-[#FBBF24]" />;
      case "lipsync":
        return <RefreshCw className="h-4 w-4 text-[#4ADE80]" />;
      default:
        return <Film className="h-4 w-4 text-[#8B8B96]" />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 select-none pb-36">
      {/* 1. ROOM HEADER & MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 sm:pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#7C5CFF] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span>AI Production Co-Pilot</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
              PRO STUDIO
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Vibe Director Room</span>
          </h1>

          <p className="text-xs text-[#8B8B96] max-w-2xl leading-relaxed">
            Direct complete multi-shot movies from a story idea or uploaded screenplay.
          </p>
        </div>

        {/* Dual Mode Switcher: Full-width on mobile */}
        <div className="w-full sm:w-auto flex items-center p-1 rounded-2xl border border-white/[0.1] bg-[#0E0E14] shadow-inner">
          <button
            type="button"
            onClick={() => setDirectingMode("agent")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
              directingMode === "agent"
                ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                : "text-[#8B8B96] hover:text-white"
            )}
          >
            <Zap className="h-3.5 w-3.5 text-[#FBBF24]" />
            <span>Autonomous Agent</span>
          </button>

          <button
            type="button"
            onClick={() => setDirectingMode("manual")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
              directingMode === "manual"
                ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                : "text-[#8B8B96] hover:text-white"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Manual Rig</span>
          </button>
        </div>
      </div>

      {/* 2. DIRECTING CONTROLS CONTAINER */}
      <Card className="rounded-3xl border border-white/[0.08] bg-[#0E0E14] shadow-2xl overflow-hidden">
        {/* Input Switcher (Story Brief vs Screenplay Script) */}
        <div className="px-6 pt-5 pb-3 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-3 bg-black/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputType("brief")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                inputType === "brief"
                  ? "bg-white/[0.08] text-white border border-white/[0.12]"
                  : "text-[#8B8B96] hover:text-white"
              )}
            >
              <Clapperboard className="h-3.5 w-3.5 text-[#7C5CFF]" />
              <span>Story Brief &amp; Concept</span>
            </button>

            <button
              type="button"
              onClick={() => setInputType("script")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                inputType === "script"
                  ? "bg-white/[0.08] text-white border border-white/[0.12]"
                  : "text-[#8B8B96] hover:text-white"
              )}
            >
              <FileText className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>Full Screenplay / Script</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#8B8B96]">
            {directingMode === "manual" ? (
              <span className="text-[#FBBF24] font-semibold">Manual Rig: Custom Models Locked</span>
            ) : (
              <span className="text-[#4ADE80] font-semibold">Agent Mode: Dynamic Auto-Directing</span>
            )}
          </div>
        </div>

        <form onSubmit={handlePlanSequence} className="p-6 sm:p-7 space-y-6">
          {/* MANUAL RIG CONTROLS (Displayed when in Manual Directing Mode) */}
          {directingMode === "manual" && (
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#14141E] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Settings2 className="h-3.5 w-3.5 text-[#7C5CFF]" />
                  <span>Manual Cinema Rig Specs</span>
                </span>
                <span className="text-[11px] text-[#8B8B96]">Applied to all sequence takes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Preferred Video Model */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#8B8B96]">Video Model</label>
                  <select
                    value={manualVideoModel}
                    onChange={(e) => setManualVideoModel(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-white/[0.08] bg-[#0E0E14] text-white text-xs focus:border-[#7C5CFF] focus:outline-none"
                  >
                    <option value="kling-2.5-turbo">Kling 3.0 Turbo (Pro Motion)</option>
                    <option value="seedance-video">Seedance 2.5 (Fast Cinematic)</option>
                  </select>
                </div>

                {/* Preferred Image Model */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#8B8B96]">Concept Stills Engine</label>
                  <select
                    value={manualImageModel}
                    onChange={(e) => setManualImageModel(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-white/[0.08] bg-[#0E0E14] text-white text-xs focus:border-[#7C5CFF] focus:outline-none"
                  >
                    <option value="nano-banana">Nano Banana (8K Photoreal)</option>
                    <option value="nano-banana-pro">Nano Banana Pro (Master Grade)</option>
                  </select>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#8B8B96]">Aspect Ratio</label>
                  <select
                    value={manualAspectRatio}
                    onChange={(e) => setManualAspectRatio(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-white/[0.08] bg-[#0E0E14] text-white text-xs focus:border-[#7C5CFF] focus:outline-none"
                  >
                    <option value="16:9">16:9 Cinema Wide</option>
                    <option value="9:16">9:16 Vertical Reel</option>
                    <option value="21:9">21:9 Ultra Anamorphic</option>
                    <option value="1:1">1:1 Square</option>
                  </select>
                </div>

                {/* Take Duration */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#8B8B96]">Shot Duration</label>
                  <select
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-white/[0.08] bg-[#0E0E14] text-white text-xs focus:border-[#7C5CFF] focus:outline-none"
                  >
                    <option value={5}>5 Seconds / Take</option>
                    <option value={10}>10 Seconds / Take</option>
                  </select>
                </div>
              </div>

              {/* Optics Style Preset */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-[#8B8B96]">Cinema Optics Style</label>
                <div className="flex flex-wrap gap-2">
                  {OPTICS_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setManualOptics(preset.id)}
                      className={cn(
                        "px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
                        manualOptics === preset.id
                          ? "bg-[#7C5CFF] text-white shadow-sm"
                          : "bg-white/[0.04] text-[#8B8B96] hover:text-white hover:bg-white/[0.08]"
                      )}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INPUT FORM: BRIEF MODE VS SCRIPT MODE */}
          {inputType === "brief" ? (
            <div className="space-y-3">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clapperboard className="h-4 w-4 text-[#7C5CFF]" />
                  <span>Story Brief &amp; Scene Vision</span>
                </span>
                <span className="text-[11px] text-[#8B8B96]">
                  Mention cast &amp; sets using <code className="text-[#7C5CFF] font-mono">@name</code>
                </span>
              </label>

              <textarea
                value={outcomePrompt}
                onChange={(e) => setOutcomePrompt(e.target.value)}
                disabled={isPlanning || isExecuting}
                rows={3}
                placeholder="e.g. Direct a 3-shot cyber-thriller chase scene featuring @elena escaping through a neon-lit rain alleyway with intense steadicam tracking, synth-wave atmosphere, and dramatic lighting..."
                className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0A0A10] p-4 text-xs sm:text-sm text-white placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all leading-relaxed resize-none"
                required
              />

              {/* Inspiration Recipe Chips */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B8B96] font-mono block">
                  Quick Directing Recipes
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INSPIRATION_RECIPES.map((recipe, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectRecipe(recipe.prompt)}
                      disabled={isPlanning || isExecuting}
                      className="p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#7C5CFF]/40 text-left transition-all group flex items-start gap-3"
                    >
                      <span className="text-xl p-2 rounded-xl bg-black/40 border border-white/[0.06] shrink-0">
                        {recipe.icon}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-[#7C5CFF] transition-colors truncate">
                            {recipe.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/[0.08] text-[#8B8B96]">
                            {recipe.genre}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8B8B96] line-clamp-1 leading-relaxed mt-0.5">
                          {recipe.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* SCREENPLAY SCRIPT INPUT WITH FILE UPLOAD */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#38BDF8]" />
                  <span>Paste Screenplay or Upload Script File</span>
                </label>

                {/* Upload Script Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.fountain,.docx,.md"
                    onChange={handleScriptFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 rounded-xl border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white font-semibold gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#38BDF8]" />
                    <span>Upload Script File</span>
                  </Button>
                </div>
              </div>

              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                disabled={isPlanning || isExecuting}
                rows={7}
                placeholder={`SCENE 1 - INT. COFFEE SHOP - DAY\nMARCUS sits at a corner booth, staring at a decrypted tablet. The neon reflection buzzes.\n\nMARCUS\n"They found the archive. We have six minutes."\n\nSCENE 2 - EXT. NEON RAINY ALLEY - NIGHT\nMarcus rushes into the downpour as headlights illuminate the wet asphalt...`}
                className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0A0A10] p-4 text-xs font-mono text-white placeholder:text-[#8B8B96]/40 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all leading-relaxed resize-none"
                required
              />
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 text-xs text-[#F87171]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Plan Sequence CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-white/[0.06]">
            <span className="text-xs text-[#8B8B96]">
              {directingMode === "manual"
                ? `Custom rig locked: ${manualVideoModel} • ${manualAspectRatio} • ${manualDuration}s`
                : "Autonomous AI agent will plan scenes, characters, and camera optics"}
            </span>

            <Button
              type="submit"
              disabled={isPlanning || isExecuting || (inputType === "brief" ? !outcomePrompt.trim() : !scriptText.trim())}
              className="w-full sm:w-auto h-11 sm:h-10 px-5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 transition-all gap-2 justify-center"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Planning Multi-Shot Breakdown...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                  <span>Compose Production Plan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* FLOATING SCROLL NOTIFICATION WHEN PLAN IS READY */}
      {currentPlan && showScrollPrompt && (
        <div className="flex items-center justify-center animate-in fade-in slide-in-from-top-3 duration-300">
          <button
            type="button"
            onClick={scrollToPlan}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#EC4899] text-white text-xs font-bold shadow-xl shadow-[#7C5CFF]/40 flex items-center gap-2 hover:scale-105 transition-all group"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
            <span>Production Plan Composed Below — Scroll to Review</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </button>
        </div>
      )}

      {/* 3. MULTI-SHOT BREAKDOWN & SCENE BOARD */}
      {currentPlan && (
        <div ref={planSectionRef} className="scroll-mt-6 space-y-6">
          <Card className="rounded-3xl border border-white/[0.08] bg-[#0E0E14] shadow-2xl overflow-hidden space-y-0">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-white/[0.08] bg-black/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
                    {currentPlan.mode === "manual" ? "MANUAL RIG PRODUCTION" : "AGENT AUTONOMOUS SEQUENCE"}
                  </span>
                  <h3 className="text-base font-extrabold text-white">{currentPlan.title}</h3>
                </div>
                <p className="text-xs text-[#8B8B96] max-w-xl leading-relaxed">{currentPlan.summary}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-2xl border border-white/[0.08] bg-black/80 text-right">
                  <span className="text-[10px] font-mono text-[#8B8B96] block">Est. Cost</span>
                  <span className="text-xs font-bold text-[#FBBF24] font-mono">
                    {currentPlan.totalEstimatedCredits} Credits
                  </span>
                </div>

                {!isExecuting && steps.some((s) => s.status !== "completed") && (
                  <Button
                    type="button"
                    onClick={() => handleExecuteSequence()}
                    className="h-10 px-5 rounded-xl bg-[#4ADE80] hover:bg-[#3ECE70] text-black text-xs font-bold shadow-lg shadow-[#4ADE80]/20 transition-all gap-1.5 uppercase tracking-wider"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Execute Entire Film</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* Progress Summary Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-[#8B8B96] pb-2 border-b border-white/[0.06]">
                <span>
                  Progress: {steps.filter((s) => s.status === "completed").length} / {steps.length} Takes Completed
                </span>
                <span className="text-[#FBBF24]">
                  Credits Spent: {spentCredits} / {currentPlan.totalEstimatedCredits}
                </span>
              </div>

              {/* SCENE BREAKDOWN BOARD (If scenes detected) OR UNIFIED STEPS LIST */}
              {currentPlan.scenes && currentPlan.scenes.length > 0 ? (
                <div className="space-y-6">
                  {currentPlan.scenes.map((scene) => {
                    const sceneSteps = steps.filter((st) =>
                      scene.steps.some((scSt) => scSt.stepId === st.stepId)
                    );
                    const isSceneDone = sceneSteps.every((s) => s.status === "completed");

                    return (
                      <div
                        key={scene.sceneNumber}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 space-y-4"
                      >
                        {/* Scene Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-white/[0.06]">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono text-[#38BDF8]">
                                SCENE {scene.sceneNumber}
                              </span>
                              <span className="text-xs font-bold text-white truncate">{scene.heading}</span>
                            </div>
                            {scene.description && (
                              <p className="text-[11px] text-[#8B8B96]">{scene.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-auto">
                            <span className="text-[11px] font-mono text-[#FBBF24]">
                              {scene.estimatedCredits} cr
                            </span>
                            {!isSceneDone && !isExecuting && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleExecuteSequence(sceneSteps)}
                                className="h-7 px-3 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-black font-extrabold text-[11px] gap-1"
                              >
                                <Play className="h-2.5 w-2.5 fill-current" />
                                <span>Render Scene {scene.sceneNumber}</span>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Scene Takes */}
                        <div className="space-y-2.5">
                          {sceneSteps.map((step) => {
                            const isDone = step.status === "completed";
                            const isFail = step.status === "failed";
                            const isRunning = step.status === "running";

                            return (
                              <div
                                key={step.stepId}
                                className={cn(
                                  "p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                                  isDone
                                    ? "border-[#4ADE80]/40 bg-[#4ADE80]/5"
                                    : isRunning
                                    ? "border-[#7C5CFF] bg-[#7C5CFF]/10 ring-2 ring-[#7C5CFF]/30"
                                    : isFail
                                    ? "border-[#F87171]/50 bg-[#F87171]/10"
                                    : "border-white/[0.06] bg-black/40"
                                )}
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <div
                                    className={cn(
                                      "flex h-8 w-8 items-center justify-center rounded-xl border shrink-0 mt-0.5",
                                      isDone
                                        ? "border-[#4ADE80]/40 bg-[#4ADE80]/20 text-[#4ADE80]"
                                        : isRunning
                                        ? "border-[#7C5CFF] bg-[#7C5CFF] text-white animate-pulse"
                                        : isFail
                                        ? "border-[#F87171] bg-[#F87171]/20 text-[#F87171]"
                                        : "border-white/[0.08] bg-black/60 text-[#8B8B96]"
                                    )}
                                  >
                                    {isRunning ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : isDone ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-[#4ADE80]" />
                                    ) : (
                                      getStepIcon(step.type)
                                    )}
                                  </div>

                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-white truncate">
                                        {step.title}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded text-[8px] font-mono uppercase bg-black/60 text-[#8B8B96] border border-white/10">
                                        {step.type}
                                      </span>
                                      {step.params?.modelName && (
                                        <span className="px-1.5 py-0.2 rounded text-[8px] font-mono text-[#7C5CFF] bg-[#7C5CFF]/10">
                                          {step.params.modelName}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[#8B8B96] line-clamp-2 leading-relaxed">
                                      {step.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                  <span className="text-xs font-mono text-[#FBBF24]">
                                    {step.estimatedCredits} cr
                                  </span>

                                  {step.outputUrl && (
                                    <a
                                      href={step.outputUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1 rounded-lg bg-[#7C5CFF] text-white text-xs font-bold hover:bg-[#6D3EFF] transition-colors flex items-center gap-1 shadow-md shadow-[#7C5CFF]/20"
                                    >
                                      Preview
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* UNIFIED STEPS LIST */
                <div className="space-y-3">
                  {steps.map((step, idx) => {
                    const isDone = step.status === "completed";
                    const isFail = step.status === "failed";
                    const isRunning = step.status === "running";

                    return (
                      <div
                        key={step.stepId || idx}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                          isDone
                            ? "border-[#4ADE80]/40 bg-[#4ADE80]/5"
                            : isRunning
                            ? "border-[#7C5CFF] bg-[#7C5CFF]/10 ring-2 ring-[#7C5CFF]/30"
                            : isFail
                            ? "border-[#F87171]/50 bg-[#F87171]/10"
                            : "border-white/[0.06] bg-white/[0.02]"
                        )}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 mt-0.5",
                              isDone
                                ? "border-[#4ADE80]/40 bg-[#4ADE80]/20 text-[#4ADE80]"
                                : isRunning
                                ? "border-[#7C5CFF] bg-[#7C5CFF] text-white animate-pulse"
                                : isFail
                                ? "border-[#F87171] bg-[#F87171]/20 text-[#F87171]"
                                : "border-white/[0.08] bg-black/60 text-[#8B8B96]"
                            )}
                          >
                            {isRunning ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
                            ) : (
                              getStepIcon(step.type)
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">{step.title}</span>
                              <span className="px-2 py-0.2 rounded text-[9px] font-mono uppercase bg-black/60 text-[#8B8B96] border border-white/10">
                                {step.type}
                              </span>
                              {step.params?.modelName && (
                                <span className="px-2 py-0.2 rounded text-[9px] font-mono text-[#7C5CFF] bg-[#7C5CFF]/10">
                                  {step.params.modelName}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#8B8B96] line-clamp-2 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="text-xs font-mono text-[#FBBF24]">{step.estimatedCredits} cr</span>

                          {step.outputUrl && (
                            <a
                              href={step.outputUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-bold hover:bg-[#6D3EFF] transition-colors flex items-center gap-1 shadow-md shadow-[#7C5CFF]/20"
                            >
                              Preview
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* FINISHED CTA: Assemble in Storyboard Sequencer */}
              {steps.every((s) => s.status === "completed") && (
                <div className="p-5 rounded-2xl border border-[#4ADE80]/40 bg-[#4ADE80]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#4ADE80] shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Cinematic Production Complete!</h4>
                      <p className="text-xs text-[#8B8B96] mt-0.5">
                        All takes, characters, and voiceovers have been generated and filed into your library.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href="/storyboard">
                      <Button className="bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 gap-1.5 rounded-xl">
                        <Film className="h-4 w-4" />
                        <span>Assemble on Storyboard</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
