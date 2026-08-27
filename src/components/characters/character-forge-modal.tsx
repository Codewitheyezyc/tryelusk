"use client";

import React, { useState, useTransition } from "react";
import {
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Wand2,
  CheckCircle2,
  User,
  Volume2,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw,
  Camera,
  Play,
} from "lucide-react";
import { refineCharacterSpecAction, createCharacterAction } from "@/app/actions/character";
import { AUDIO_VOICES } from "@/components/audio/audio-studio-client";
import { useCredits } from "@/context/credit-context";
import { useRenderJobs } from "@/context/render-job-context";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/database.types";

interface CharacterForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated?: (character: Character) => void;
}

export function CharacterForgeModal({
  isOpen,
  onClose,
  onCharacterCreated,
}: CharacterForgeModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [role, setRole] = useState("Lead Protagonist");
  const [description, setDescription] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("Rachel");

  // Step 2 refinement
  const [visualSpec, setVisualSpec] = useState("");
  const [turnaroundPrompt, setTurnaroundPrompt] = useState("");
  const [directorReasoning, setDirectorReasoning] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isRefining, startRefining] = useTransition();
  const [isForging, startForging] = useTransition();

  const { balance, setBalance, optimisticDeduct, rollbackDeduct } = useCredits();
  const { addJob, updateJob } = useRenderJobs();

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!tag || tag === `@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`) {
      setTag(`@${val.toLowerCase().replace(/[^a-z0-9]/g, "")}`);
    }
  };

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    setErrorMsg(null);

    startRefining(async () => {
      const res = await refineCharacterSpecAction(name, description);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to refine character visual spec.");
      } else {
        setVisualSpec(res.visualSpec || "");
        setTurnaroundPrompt(res.turnaroundPrompt || "");
        setDirectorReasoning(res.reasoning || "");
        setStep(2);
      }
    });
  };

  const handleForge = () => {
    const cost = 6;
    if (balance < cost) {
      setErrorMsg(`Insufficient credits. Requires ${cost} credits, available: ${balance}.`);
      return;
    }

    optimisticDeduct(cost);
    setErrorMsg(null);

    const jobId = addJob({
      type: "image",
      prompt: `Character DNA Turnaround: ${name}`,
      model: "Nano Banana Pro",
    });

    startForging(async () => {
      const res = await createCharacterAction({
        name,
        description,
        tag,
        role,
        voiceId: selectedVoiceId,
        visualSpec,
        turnaroundPrompt,
      });

      if (!res.success) {
        rollbackDeduct(cost);
        setErrorMsg(res.error || "Failed to forge character identity.");
        updateJob(jobId, { status: "failed", error: res.error });
      } else {
        updateJob(jobId, {
          status: "completed",
          outputUrl: res.referenceSheetUrl,
        });
        if (res.character && onCharacterCreated) {
          onCharacterCreated(res.character);
        }
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl border border-white/[0.1] bg-[#0E0E14] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* 1. FIXED MODAL HEADER */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-white/[0.08] shrink-0 bg-[#0E0E14]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#EC4899] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7C5CFF]/30 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Create Cast Member &amp; Character Identity
              </h2>
              <p className="text-xs text-[#8B8B96] mt-0.5">
                Lock single-face headshot anchor, headless wardrobe views &amp; paired voice actor for your film.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors shrink-0 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. SCROLLABLE FORM BODY */}
        {step === 1 && (
          <form onSubmit={handleRefine} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#D1D1DB] flex items-center justify-between">
                    <span>Character Name</span>
                    <span className="text-[10px] text-[#8B8B96]">Required</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    className="w-full h-10 px-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0A0A10] text-xs sm:text-sm text-white placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all"
                    required
                  />
                </div>

                {/* Tag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#D1D1DB] flex items-center justify-between">
                    <span>Prompt Tag Identifier</span>
                    <span className="text-[10px] text-[#7C5CFF]">Used in Prompts</span>
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. @elena"
                    className="w-full h-10 px-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0A0A10] text-xs sm:text-sm font-mono text-[#7C5CFF] font-semibold placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#D1D1DB]">
                  Archetype &amp; Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Cyberpunk Detective / Tactical Recon Scout"
                  className="w-full h-10 px-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0A0A10] text-xs sm:text-sm text-white placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all"
                />
              </div>

              {/* Physical Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#D1D1DB] flex items-center justify-between">
                  <span>Physical DNA &amp; Signature Wardrobe</span>
                  <span className="text-[10px] text-[#8B8B96]">No prompt engineering needed</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="e.g. 32-year-old woman with sharp emerald green eyes, textured silver-streaked bob haircut, wearing a worn charcoal trench coat with neon cyan lining, high-collar turtleneck, and brass mechanical buckles..."
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.05] focus:bg-[#0A0A10] p-3 text-xs text-white placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] leading-relaxed resize-none transition-all"
                  required
                />
              </div>

              {/* Voice Actor Pairing */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Cast Paired Voice Actor</span>
                  <span className="text-[11px] text-[#7C5CFF] font-medium">Auto-Syncs with Audio Studio</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AUDIO_VOICES.map((v) => {
                    const isSelected = selectedVoiceId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVoiceId(v.id)}
                        className={cn(
                          "p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all",
                          isSelected
                            ? "border-[#7C5CFF] bg-[#7C5CFF]/15 text-white shadow-md shadow-[#7C5CFF]/20 ring-1 ring-[#7C5CFF]/50"
                            : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-[#8B8B96] hover:text-white"
                        )}
                      >
                        <img
                          src={v.avatar}
                          alt={v.name}
                          className="h-8 w-8 rounded-full object-cover shrink-0 border border-white/15"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block text-white truncate">{v.name}</span>
                          <span className="text-[9px] text-[#8B8B96] truncate block">
                            {v.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 text-xs text-[#F87171] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* 3. STICKY MODAL FOOTER */}
            <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0A0A0E] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8B8B96] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRefining || !name.trim() || !description.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Claude Director Planning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
                    <span>Plan Character Turnaround</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW DIRECTOR SPEC & CREATE REFERENCE SHEET */}
        {step === 2 && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 rounded-2xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-[#7C5CFF]">
                    <Sparkles className="h-4 w-4 text-[#FBBF24]" />
                    <span>Director Character Spec</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
                    {tag} • Voice: {selectedVoiceId}
                  </span>
                </div>

                {directorReasoning && (
                  <p className="text-xs text-[#8B8B96] italic leading-relaxed">
                    "{directorReasoning}"
                  </p>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white block">
                    Single-Face Anchor Turnaround Prompt
                  </label>
                  <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-white font-mono leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                    {turnaroundPrompt}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl border border-[#F87171]/30 bg-[#F87171]/10 text-xs text-[#F87171] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* 3. STICKY MODAL FOOTER */}
            <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0A0A0E] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8B8B96] hover:text-white transition-colors"
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handleForge}
                disabled={isForging}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {isForging ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Creating Character Identity (6 credits)...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5 text-[#FBBF24]" />
                    <span>Create &amp; Lock Character (6 credits)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
