"use client";

import React, { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { generateAudioAction, generateLipSyncAction } from "@/app/actions/audio";
import { CustomAudioPlayer } from "@/components/shared/custom-audio-player";
import { LipSyncControls } from "@/components/studio/lipsync-controls";
import { useCredits } from "@/context/credit-context";
import { useRenderJobs } from "@/context/render-job-context";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types/database.types";
import {
  Mic,
  Volume2,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Upload,
  Layers,
  ChevronDown,
  Play,
  Share2,
} from "lucide-react";

export const AUDIO_VOICES = [
  {
    id: "Rachel",
    name: "Rachel",
    category: "Cinematic Narrator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    tone: "Warm, authoritative, clear storytelling voice",
  },
  {
    id: "Wilder",
    name: "Wilder",
    category: "Deep Cinema Trailer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    tone: "Gravelly, resonant, gritty cinematic lead",
  },
  {
    id: "Chloe",
    name: "Chloe",
    category: "Emotional & Soft",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    tone: "Intimate, warm, thoughtful pacing",
  },
  {
    id: "Adam",
    name: "Adam",
    category: "Action Protagonist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    tone: "Dynamic, heroic, impactful delivery",
  },
  {
    id: "Domi",
    name: "Domi",
    category: "Cyberpunk & Modern",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    tone: "Sharp, intense, modern character voice",
  },
  {
    id: "Josh",
    name: "Josh",
    category: "Commercial & Upbeat",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
    tone: "Friendly, engaging, conversational narrator",
  },
];

interface AudioStudioClientProps {
  initialAudios?: Generation[];
  initialVideos?: Generation[];
}

export function AudioStudioClient({
  initialAudios = [],
  initialVideos = [],
}: AudioStudioClientProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "lipsync" ? "lipsync" : "tts";

  const [activeTab, setActiveTab] = useState<"tts" | "voicechange" | "translate" | "lipsync">(initialTab);
  const [selectedVoiceId, setSelectedVoiceId] = useState("Rachel");
  const [scriptPrompt, setScriptPrompt] = useState("");
  const [voiceDetails, setVoiceDetails] = useState("");
  const [batchSize, setBatchSize] = useState(1);
  const [selectedModel, setSelectedModel] = useState("Seed Audio 1.0");

  // Lip-Sync State
  const [selectedLipSyncVideoUrl, setSelectedLipSyncVideoUrl] = useState(searchParams.get("videoUrl") || "");
  const [selectedLipSyncAudioUrl, setSelectedLipSyncAudioUrl] = useState("");
  const [selectedLipSyncEngine, setSelectedLipSyncEngine] = useState("sync-lipsync-fast");
  const [lipSyncDuration, setLipSyncDuration] = useState(5);

  const [audioList, setAudioList] = useState<Generation[]>(initialAudios);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { balance, setBalance, optimisticDeduct, rollbackDeduct } = useCredits();
  const { addJob, updateJob } = useRenderJobs();

  const activeVoice = AUDIO_VOICES.find((v) => v.id === selectedVoiceId) || AUDIO_VOICES[0];
  const audioCost = activeTab === "lipsync"
    ? (selectedLipSyncEngine === "sync-lipsync-pro" ? 18 : 1) * lipSyncDuration
    : 4 * batchSize;

  const handleGenerateAudio = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === "lipsync") {
      if (!selectedLipSyncVideoUrl || !selectedLipSyncAudioUrl) {
        setErrorMsg("Please select both a video take and an audio track for lip-sync pass.");
        return;
      }

      if (balance < audioCost) {
        setErrorMsg(`Insufficient credits. Required: ${audioCost}, Available: ${balance}.`);
        return;
      }

      optimisticDeduct(audioCost);
      const jobId = addJob({
        type: "lipsync",
        prompt: "Lip-Sync Pass",
        model: selectedLipSyncEngine,
      });

      startTransition(async () => {
        const res = await generateLipSyncAction({
          videoUrl: selectedLipSyncVideoUrl,
          audioUrl: selectedLipSyncAudioUrl,
          modelName: selectedLipSyncEngine,
          durationSeconds: lipSyncDuration,
        });

        if (!res.success) {
          rollbackDeduct(audioCost);
          setErrorMsg(res.error || "Lip-sync generation failed.");
          updateJob(jobId, { status: "failed", error: res.error });
        } else {
          if (typeof res.newBalance === "number") setBalance(res.newBalance);
          updateJob(jobId, { status: "completed", outputUrl: res.generation?.output_url || undefined });
        }
      });
      return;
    }

    if (!scriptPrompt.trim()) return;

    if (balance < audioCost) {
      setErrorMsg(`Insufficient credits. Required: ${audioCost}, Available: ${balance}.`);
      return;
    }

    optimisticDeduct(audioCost);
    const jobId = addJob({
      type: "audio",
      prompt: scriptPrompt,
      model: selectedModel,
    });

    startTransition(async () => {
      const res = await generateAudioAction({
        prompt: scriptPrompt,
        voiceId: selectedVoiceId,
      });

      if (!res.success) {
        rollbackDeduct(audioCost);
        setErrorMsg(res.error || "Speech generation failed.");
        updateJob(jobId, { status: "failed", error: res.error });
      } else {
        if (typeof res.newBalance === "number") setBalance(res.newBalance);
        if (res.generation) {
          setAudioList((prev) => [res.generation!, ...prev]);
        }
        updateJob(jobId, {
          status: "completed",
          outputUrl: res.generation?.output_url || undefined,
        });
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP TABS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-white/[0.08] bg-[#0E0E14]/80 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setActiveTab("tts")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "tts"
                ? "bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] text-white shadow-md shadow-[#7C5CFF]/30"
                : "text-[#8B8B96] hover:text-white"
            )}
          >
            Text to Speech
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("voicechange")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "voicechange"
                ? "bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] text-white shadow-md shadow-[#7C5CFF]/30"
                : "text-[#8B8B96] hover:text-white"
            )}
          >
            Voice Change
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("translate")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "translate"
                ? "bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] text-white shadow-md shadow-[#7C5CFF]/30"
                : "text-[#8B8B96] hover:text-white"
            )}
          >
            Translate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lipsync")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === "lipsync"
                ? "bg-[#4ADE80] text-black shadow-md shadow-[#4ADE80]/20"
                : "text-[#8B8B96] hover:text-white"
            )}
          >
            Lip-Sync Pass
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8B8B96]">
          <span className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-black/60">
            Rate: <strong className="text-[#FBBF24]">{audioCost} Credits</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. LEFT GENERATION CONTROL PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleGenerateAudio}
            className="rounded-3xl border border-white/[0.08] bg-[#0E0E14]/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5"
          >
            {activeTab === "lipsync" ? (
              <LipSyncControls
                userVideos={initialVideos}
                userAudios={audioList}
                selectedVideoUrl={selectedLipSyncVideoUrl}
                selectedAudioUrl={selectedLipSyncAudioUrl}
                selectedEngine={selectedLipSyncEngine}
                durationSeconds={lipSyncDuration}
                onSelectVideo={(url, dur) => {
                  setSelectedLipSyncVideoUrl(url);
                  if (dur) setLipSyncDuration(dur);
                }}
                onSelectAudio={setSelectedLipSyncAudioUrl}
                onChangeEngine={setSelectedLipSyncEngine}
                onChangeDuration={setLipSyncDuration}
                disabled={isPending}
              />
            ) : (
              <>
                {/* Upload Media Section */}
                <div className="p-4 rounded-2xl border border-dashed border-white/[0.1] bg-black/40 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-[#8B8B96]">
                    <Upload className="h-4 w-4 text-[#7C5CFF]" />
                    <span className="text-xs font-semibold text-[#F2F2F5]">
                      Upload Reference Voice / Audio
                    </span>
                    <span className="text-[9px] font-mono text-[#8B8B96]">Optional</span>
                  </div>
                  <p className="text-[10px] text-[#8B8B96]">
                    Up to 3 voices/audios or image reference for voice synthesis
                  </p>
                </div>

                {/* Script Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] font-mono">
                    Script
                  </label>
                  <div className="relative rounded-2xl border border-white/[0.08] bg-[#060608] p-1 glow-focus">
                    <textarea
                      value={scriptPrompt}
                      onChange={(e) => setScriptPrompt(e.target.value)}
                      disabled={isPending}
                      rows={5}
                      placeholder="Write exactly what the voice will read out loud in your scene..."
                      className="w-full bg-transparent p-3 text-xs sm:text-sm text-[#F2F2F5] placeholder:text-[#8B8B96]/60 focus:outline-none resize-none leading-relaxed"
                      required
                    />
                  </div>
                </div>

                {/* Engine Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] font-mono">
                    AI Speech Engine
                  </label>
                  <div className="p-3 rounded-2xl border border-white/[0.08] bg-black/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-[#7C5CFF]" />
                      <span className="text-xs font-bold text-[#F2F2F5]">
                        Seed Audio 1.0 Master
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#FBBF24] px-2 py-0.5 rounded-full bg-[#FBBF24]/15">
                      4 cr/clip
                    </span>
                  </div>
                </div>

                {/* Batch Size Selector */}
                <div className="flex items-center justify-between p-3 rounded-2xl border border-white/[0.08] bg-black/60 text-xs">
                  <span className="font-mono text-[#8B8B96]">Batch size</span>
                  <div className="flex items-center gap-2 font-mono">
                    <button
                      type="button"
                      onClick={() => setBatchSize(Math.max(1, batchSize - 1))}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
                    >
                      -
                    </button>
                    <span className="text-white font-bold">{batchSize}/4</span>
                    <button
                      type="button"
                      onClick={() => setBatchSize(Math.min(4, batchSize + 1))}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Voice Details (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] font-mono">
                      Voice Details
                    </label>
                    <span className="text-[10px] text-[#8B8B96] font-mono">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={voiceDetails}
                    onChange={(e) => setVoiceDetails(e.target.value)}
                    placeholder="e.g. Young female voice with British accent, soft and calm..."
                    className="w-full h-9 px-3.5 rounded-xl border border-white/[0.08] bg-[#060608] text-xs text-[#F2F2F5] placeholder:text-[#8B8B96]/60 focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                  />
                </div>
              </>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl border border-[#F87171]/40 bg-[#F87171]/10 text-xs text-[#F87171] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* High-Impact TryElusk Purple Generate Button */}
            <button
              type="submit"
              disabled={isPending || (activeTab !== "lipsync" && !scriptPrompt.trim())}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white font-extrabold text-xs shadow-xl shadow-[#7C5CFF]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>
                    {activeTab === "lipsync"
                      ? `RUN LIP-SYNC (${audioCost} cr)`
                      : `GENERATE SPEECH (${audioCost} cr)`}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 3. RIGHT MAIN WORKSPACE: Voice Selection Cards & Audio Waveforms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Theatrical Header */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#14141E]/80 to-[#0A0A0E]/90 p-6 sm:p-8 text-center space-y-2 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
              Dialogue &amp; Voice Studio
            </h2>
            <p className="text-xs sm:text-sm text-[#8B8B96] max-w-md mx-auto">
              Synthesize lifelike speech from your script with Claude Director.
            </p>
          </div>

          {/* Voice Actor Selection Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold font-mono text-[#8B8B96]">
              <span className="uppercase tracking-wider">Cast a Voice Actor</span>
              <span className="text-[#7C5CFF]">{AUDIO_VOICES.length} Voices Available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AUDIO_VOICES.map((voice) => {
                const isSelected = selectedVoiceId === voice.id;
                return (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setSelectedVoiceId(voice.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all relative flex items-start gap-3.5 group",
                      isSelected
                        ? "border-[#7C5CFF] bg-[#7C5CFF]/15 ring-2 ring-[#7C5CFF]/30 shadow-lg shadow-[#7C5CFF]/15"
                        : "border-white/[0.08] bg-[#0E0E14]/70 hover:bg-[#14141E] hover:border-white/20"
                    )}
                  >
                    <img
                      src={voice.avatar}
                      alt={voice.name}
                      className="h-12 w-12 rounded-full object-cover border border-white/20 shrink-0 shadow-md"
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-[#7C5CFF] transition-colors truncate">
                          {voice.name}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-black/60 text-[#8B8B96] border border-white/10">
                          {voice.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8B8B96] line-clamp-2 leading-relaxed">
                        {voice.tone}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-[#7C5CFF] shadow-sm shadow-[#7C5CFF] shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated Audio Waveform Tracks History */}
          {audioList.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs font-bold font-mono text-[#8B8B96]">
                <span className="uppercase tracking-wider">Generated Voiceover Tracks</span>
                <span>{audioList.length} Tracks</span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {audioList.map((audio) => {
                  const url = audio.output_url || (Array.isArray(audio.output_urls) ? String(audio.output_urls[0]) : "");
                  if (!url) return null;

                  return (
                    <div
                      key={audio.id}
                      className="p-4 rounded-2xl border border-white/[0.08] bg-[#0E0E14]/90 backdrop-blur-md space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white truncate max-w-sm">
                          "{audio.prompt}"
                        </span>
                        <span className="text-[10px] font-mono text-[#8B8B96]">
                          {new Date(audio.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      <CustomAudioPlayer
                        src={url}
                        voiceName="Seed Audio 1.0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
