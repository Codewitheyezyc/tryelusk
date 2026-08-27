"use client";

import React, { useState, useTransition } from "react";
import { X, Sparkles, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPropAction } from "@/app/actions/elements";
import type { ProductionElement } from "@/lib/elements";

interface CreatePropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (element: ProductionElement) => void;
}

const MATERIAL_PRESETS = [
  "Damascus Steel & Gold Inlay",
  "Weathered Obsidian & Carbon Fiber",
  "Vintage 1980s Matte Chrome",
  "Glowing Bioluminescent Crystal",
  "Worn Leather & Brass",
  "Futuristic Holographic Polymer",
];

export function CreatePropModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePropModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState(MATERIAL_PRESETS[0]);
  const [referenceUrl, setReferenceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a name for this prop.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await createPropAction({
        name,
        description,
        material,
        referenceUrl,
      });

      if (!res.success || !res.element) {
        setError(res.error || "Failed to create prop.");
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
            <div className="flex items-center gap-2 text-xs font-bold text-[#EC4899] uppercase tracking-wider font-mono">
              <Package className="h-4 w-4" />
              <span>Hero Props &amp; Objects</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Create Prop / Hero Object</h2>
            <p className="text-xs text-[#8B8B96]">
              Lock hero object materials and shape for persistent continuity across motion shots.
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
            <label className="text-xs font-semibold text-[#8B8B96]">Prop / Object Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cyber Katana / Vintage Detective Revolver"
              disabled={isPending}
              className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#14141E] text-xs text-white placeholder:text-[#8B8B96]/40 focus:border-[#EC4899] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B8B96]">Hero Material Preset</label>
            <div className="flex flex-wrap gap-1.5">
              {MATERIAL_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMaterial(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    material === preset
                      ? "bg-[#EC4899] text-white font-bold shadow-sm"
                      : "bg-white/[0.04] text-[#8B8B96] hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B8B96]">Prop Design &amp; Fine Details</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Etched curved blade with glowing neon blue laser edge, black carbon-fiber handle, subtle scratches from battle..."
              rows={3}
              disabled={isPending}
              className="w-full p-3 rounded-xl border border-white/[0.08] bg-[#14141E] text-xs text-white placeholder:text-[#8B8B96]/40 focus:border-[#EC4899] focus:outline-none resize-none"
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
              placeholder="https://... (or leave blank for 8K Studio Hero Render)"
              disabled={isPending}
              className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#14141E] text-xs text-white placeholder:text-[#8B8B96]/40 focus:border-[#EC4899] focus:outline-none font-mono"
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
              className="bg-gradient-to-r from-[#EC4899] to-[#D946EF] hover:from-[#DB2777] hover:to-[#C026D3] text-white font-extrabold text-xs px-5 rounded-xl shadow-lg shadow-[#EC4899]/30 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Rendering Hero Prop...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
                  <span>Lock Prop Token</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
