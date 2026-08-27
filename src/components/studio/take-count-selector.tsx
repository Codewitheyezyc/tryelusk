"use client";

import React from "react";
import { Copy, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type TakeCount = 1 | 2 | 3 | 4;

interface TakeCountSelectorProps {
  count: TakeCount;
  onChangeCount: (count: TakeCount) => void;
  mediaType: "image" | "video";
  disabled?: boolean;
}

export function TakeCountSelector({
  count,
  onChangeCount,
  mediaType,
  disabled = false,
}: TakeCountSelectorProps) {
  const options: { value: TakeCount; label: string; sub: string }[] = [
    { value: 1, label: "1x", sub: "Single Take" },
    { value: 2, label: "2x", sub: "Dual Takes" },
    { value: 3, label: "3x", sub: "Triple Takes" },
    { value: 4, label: "4x", sub: "Quad Takes" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#8B8B96] flex items-center gap-1.5 uppercase tracking-wider">
          <Layers className="h-3.5 w-3.5 text-[#7C5CFF]" />
          Number of Outputs ({mediaType === "video" ? "Video Takes" : "Image Variations"})
        </label>
        <span className="text-[11px] text-[#8B8B96]">
          {count} {count === 1 ? "take" : "parallel takes"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {options.map((opt) => {
          const isSelected = count === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChangeCount(opt.value)}
              className={cn(
                "py-2 px-2.5 rounded-lg border text-center transition-all duration-150 flex flex-col items-center justify-center",
                isSelected
                  ? "border-[#7C5CFF] bg-[#7C5CFF]/20 text-[#F2F2F5] shadow-sm ring-1 ring-[#7C5CFF]/40"
                  : "border-[#26262E] bg-[#0B0B0F] text-[#8B8B96] hover:text-[#F2F2F5] hover:border-[#7C5CFF]/40",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-xs font-bold text-[#F2F2F5]">{opt.label}</span>
              <span className="text-[9px] text-[#8B8B96] truncate max-w-full">
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
