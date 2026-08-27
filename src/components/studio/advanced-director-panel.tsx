"use client";

import React, { useState } from "react";
import { Sliders, ChevronDown, ChevronUp, Camera, SunMedium, Palette, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ManualDirectorOverrides {
  lens: string;
  lighting: string;
  colorPalette: string;
}

interface AdvancedDirectorPanelProps {
  overrides: ManualDirectorOverrides;
  onChangeOverrides: (overrides: ManualDirectorOverrides) => void;
  disabled?: boolean;
}

export function AdvancedDirectorPanel({
  overrides,
  onChangeOverrides,
  disabled = false,
}: AdvancedDirectorPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveOverrides =
    Boolean(overrides.lens.trim()) ||
    Boolean(overrides.lighting.trim()) ||
    Boolean(overrides.colorPalette.trim());

  return (
    <div className="rounded-xl border border-[#26262E] bg-[#0B0B0F]/60 overflow-hidden transition-all">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-[#F2F2F5] hover:bg-[#16161C] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5 text-[#7C5CFF]" />
          <span>Advanced Technical Controls</span>
          {hasActiveOverrides && (
            <span className="px-1.5 py-0.5 rounded bg-[#7C5CFF]/20 text-[#7C5CFF] text-[10px] uppercase font-mono">
              Custom Overrides Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#8B8B96] text-[11px]">
          <span>{isOpen ? "Hide" : "Show"}</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Controls */}
      {isOpen && (
        <div className="p-4 pt-2 border-t border-[#26262E] space-y-4">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#16161C] border border-[#26262E] text-[11px] text-[#8B8B96]">
            <Info className="h-3.5 w-3.5 text-[#7C5CFF] shrink-0 mt-0.5" />
            <span>
              Manual values entered here bypass Claude Director&apos;s auto-selection for that specific field.
            </span>
          </div>

          <div className="space-y-3">
            {/* Camera Lens */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[#8B8B96] flex items-center gap-1.5">
                <Camera className="h-3 w-3 text-[#7C5CFF]" />
                Camera Lens & Optics
              </Label>
              <Input
                value={overrides.lens}
                onChange={(e) =>
                  onChangeOverrides({ ...overrides, lens: e.target.value })
                }
                disabled={disabled}
                placeholder="Auto-directed (e.g., 35mm Anamorphic Prime, 85mm f/1.4)"
                className="h-9 text-xs border-[#26262E] bg-[#0B0B0F] text-[#F2F2F5]"
              />
            </div>

            {/* Lighting Style */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[#8B8B96] flex items-center gap-1.5">
                <SunMedium className="h-3 w-3 text-[#FBBF24]" />
                Lighting Style & Atmosphere
              </Label>
              <Input
                value={overrides.lighting}
                onChange={(e) =>
                  onChangeOverrides({ ...overrides, lighting: e.target.value })
                }
                disabled={disabled}
                placeholder="Auto-directed (e.g., Golden Hour Soft Key, Cyberpunk Neon)"
                className="h-9 text-xs border-[#26262E] bg-[#0B0B0F] text-[#F2F2F5]"
              />
            </div>

            {/* Color Palette */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[#8B8B96] flex items-center gap-1.5">
                <Palette className="h-3 w-3 text-[#4ADE80]" />
                Color Palette & Film Stock
              </Label>
              <Input
                value={overrides.colorPalette}
                onChange={(e) =>
                  onChangeOverrides({ ...overrides, colorPalette: e.target.value })
                }
                disabled={disabled}
                placeholder="Auto-directed (e.g., Warm Amber & Teal, 70s Kodak Portra)"
                className="h-9 text-xs border-[#26262E] bg-[#0B0B0F] text-[#F2F2F5]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
