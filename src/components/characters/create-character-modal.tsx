"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Users,
  Layers,
  Wand2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { refineCharacterSpecAction, createCharacterAction } from "@/app/actions/character";
import type { Character } from "@/types/database.types";
import { useRouter } from "next/navigation";

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated?: (character: Character) => void;
}

export function CreateCharacterModal({
  isOpen,
  onClose,
  onCharacterCreated,
}: CreateCharacterModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "review" | "generating" | "complete">("input");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Director Refinement State
  const [isRefining, setIsRefining] = useState(false);
  const [visualSpec, setVisualSpec] = useState("");
  const [turnaroundPrompt, setTurnaroundPrompt] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [estimatedCredits, setEstimatedCredits] = useState(6);

  // Generation State
  const [createdCharacter, setCreatedCharacter] = useState<Character | null>(null);
  const [referenceSheetUrl, setReferenceSheetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefine = async () => {
    if (!name.trim()) {
      setError("Please enter a character name");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your character");
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      const res = await refineCharacterSpecAction(name, description);
      if (!res.success) {
        setError(res.error || "Director refinement failed");
        return;
      }

      setVisualSpec(res.visualSpec || "");
      setTurnaroundPrompt(res.turnaroundPrompt || "");
      setReasoning(res.reasoning || "");
      setEstimatedCredits(res.estimatedCredits || 6);
      setStep("review");
    } catch (e: any) {
      setError(e?.message || "An unexpected error occurred.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateReferenceSheet = async () => {
    setStep("generating");
    setError(null);

    try {
      const res = await createCharacterAction({
        name,
        description,
        visualSpec,
        turnaroundPrompt,
        modelName: "nano-banana",
      });

      if (!res.success || !res.character) {
        setError(res.error || "Failed to generate reference sheet.");
        setStep("review");
        return;
      }

      setCreatedCharacter(res.character);
      setReferenceSheetUrl(res.referenceSheetUrl || res.character.reference_sheet_url);
      setStep("complete");
      if (onCharacterCreated) onCharacterCreated(res.character);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Generation error.");
      setStep("review");
    }
  };

  const handleResetAndClose = () => {
    setStep("input");
    setName("");
    setDescription("");
    setVisualSpec("");
    setTurnaroundPrompt("");
    setReasoning("");
    setError(null);
    setCreatedCharacter(null);
    setReferenceSheetUrl(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleResetAndClose}
    >
      <div
        className="relative max-w-2xl w-full rounded-2xl border border-[#26262E] bg-[#16161C] text-[#F2F2F5] p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#26262E]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EC4899]/10 border border-[#EC4899]/30">
              <Users className="h-4 w-4 text-[#EC4899]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F2F2F5]">
                Guided Character Creation
              </h3>
              <p className="text-xs text-[#8B8B96]">
                Locked 3-panel reference sheet (Front, Rear, Close-up) for continuous scene consistency
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg border border-[#26262E] text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#26262E]/50 text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/20 flex items-start gap-2.5 text-xs text-[#F87171]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: INPUT FORM */}
        {step === "input" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F2F2F5]">
                Character Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Detective Elena Vance, Kaito Tanaka"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#26262E] bg-[#0B0B0F] text-xs text-[#F2F2F5] placeholder:text-[#8B8B96]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#F2F2F5]">
                  Plain-Language Description
                </label>
                <span className="text-[10px] text-[#8B8B96]">
                  No AI jargon needed
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="e.g. 32-year-old cyberpunk detective with sharp emerald green eyes and a silver-streaked bob haircut. Wearing a worn charcoal trench coat with neon teal lining, high-collar turtleneck, and brass mechanical buckles."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#26262E] bg-[#0B0B0F] text-xs text-[#F2F2F5] placeholder:text-[#8B8B96]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#26262E]">
              <div className="text-[11px] text-[#8B8B96] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#7C5CFF]" />
                <span>Claude Director will structure a 3-panel turnaround spec</span>
              </div>

              <Button
                onClick={handleRefine}
                disabled={isRefining || !name.trim() || !description.trim()}
                className="bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-medium"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Director Refining...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                    Refine Visual Spec
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW DIRECTOR SPEC & CONFIRM CREDITS */}
        {step === "review" && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl border border-[#26262E] bg-[#0B0B0F] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F2F2F5]">
                  Director Visual Spec for {name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
                  Locked Continuity
                </span>
              </div>
              <p className="text-xs text-[#8B8B96] leading-relaxed">
                {visualSpec}
              </p>
              {reasoning && (
                <p className="text-[11px] text-[#7C5CFF] italic pt-1 border-t border-[#26262E]/50">
                  Director Note: {reasoning}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl border border-[#26262E] bg-[#16161C] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#EC4899]" />
                <div>
                  <span className="font-medium text-[#F2F2F5]">
                    3-Panel Turnaround Sheet Generation
                  </span>
                  <p className="text-[10px] text-[#8B8B96]">
                    Front view + Rear view + Tight face close-up
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-[#F2F2F5] font-mono text-sm">
                  {estimatedCredits} Credits
                </span>
                <p className="text-[9px] text-[#4ADE80]">Refunded if generation fails</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#26262E]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("input")}
                className="text-xs text-[#8B8B96] hover:text-[#F2F2F5]"
              >
                Back to Edit
              </Button>

              <Button
                onClick={handleGenerateReferenceSheet}
                className="bg-[#EC4899] hover:bg-[#DB2777] text-white text-xs font-medium shadow-md shadow-[#EC4899]/20"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Lock &amp; Generate Reference Sheet
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: GENERATING ANIMATION */}
        {step === "generating" && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-[#EC4899]/20 border-t-[#EC4899] animate-spin" />
              <Users className="absolute inset-0 m-auto h-6 w-6 text-[#EC4899]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#F2F2F5]">
                Rendering 3-Panel Reference Sheet...
              </h4>
              <p className="text-xs text-[#8B8B96] max-w-sm">
                Generating Front View, Rear View, and Close-Up for <strong>{name}</strong> with persistent character conditioning.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: COMPLETE */}
        {step === "complete" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#4ADE80] font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Character Successfully Created &amp; Locked!</span>
            </div>

            {referenceSheetUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#26262E] bg-[#0B0B0F]">
                <img
                  src={referenceSheetUrl}
                  alt={name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white border border-white/20">
                  Locked Reference Sheet
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#26262E]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAndClose}
                className="text-xs border-[#26262E] bg-[#16161C] text-[#F2F2F5]"
              >
                Done
              </Button>

              <Button
                onClick={() => {
                  handleResetAndClose();
                  router.push(`/generate?characterId=${createdCharacter?.id}&characterName=${encodeURIComponent(name)}`);
                }}
                className="bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-medium shadow-md shadow-[#7C5CFF]/20"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Direct Scene with {name}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
