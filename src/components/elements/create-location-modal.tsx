"use client";

import React, { useState, useTransition } from "react";
import { X, Sparkles, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLocationAction } from "@/app/actions/elements";
import type { ProductionElement } from "@/lib/elements";

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (element: ProductionElement) => void;
}

const ATMOSPHERE_PRESETS = [
  "Rainy Neon Cyberpunk",
  "Golden Hour Sunrise",
  "Foggy Noir Midnight",
  "Sci-Fi Alien Landscape",
  "Cozy European Autumn",
  "High-Key Commercial Studio",
];

export function CreateLocationModal({
  isOpen,
  onClose,
  onCreated,
}: CreateLocationModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [atmosphere, setAtmosphere] = useState(ATMOSPHERE_PRESETS[0]);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a name for this location.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await createLocationAction({
        name,
        description,
        atmosphere,
        referenceUrl,
      });

      if (!res.success || !res.element) {
        setError(res.error || "Failed to create location.");
        return;
      }

      onCreated?.(res.element);
      setName("");
      setDescription("");
      setReferenceUrl("");
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.12] bg-[#0E0E14] shadow-2xl p-6 space-y-5 text-white animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] uppercase tracking-wider font-mono">
              <MapPin className="h-4 w-4" />
              <span>Environment &amp; Sets</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Create Location Token</h2>
            <p className="text-xs text-[#8B8B96]">
              Lock architectural environment and lighting DNA for consistent multi-scene continuity.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B8B96] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B8B96]">Location Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Neo-Tokyo Subway Terminal"
              disabled={isPending}
              className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#14141E] text-xs text-white placeholder:text-[#8B8B96]/40 focus:border-[#38BDF8] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B8B96]">Scene Atmosphere Preset</label>
            <div className="flex flex-wrap gap-1.5">
              {ATMOSPHERE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAtmosphere(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    atmosphere === preset
                      ? "bg-[#38BDF8] text-black font-bold shadow-sm"
                      : "bg-white/[0.04] text-[#8B8B96] hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B8B96]">Architectural &amp; Lighting Details</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Wet concrete platform, buzzing overhead neon tube lights, steam rising from tracks, vintage turnstiles..."
              rows={3}
              disabled={isPending}
              className="w-full p-3 rounded-xl border border-white/[0.08] bg-[#14141E] text-xs text-white placeholder:text-[#8B8B96]/40 focus:border-[#38BDF8] focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B8B96]">
              Optional Custom Image URL <span className="text-[#8B8B96]/60 font-normal">(Auto-generated if empty)</span>
            </label>
            <input
              type="text"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://... (or leave blank for 8K AI Concept Render)"
              disabled={isPending}
              className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#14141E] text-xs text-white placeholder:text-[#8B8B96]/40 focus:border-[#38BDF8] focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="text-xs text-[#8B8B96] hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-black font-extrabold text-xs px-5 rounded-xl shadow-lg shadow-[#38BDF8]/30 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Generating Concept...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-black" />
                  <span>Lock Location Token</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
