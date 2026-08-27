"use client";

import React, { useState, useMemo } from "react";
import { Zap, Check, Wand2, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioModel } from "@/lib/ai/models";

export type FilterCategory = "all" | "recommended" | "pro" | "budget";

interface ModelPickerProps {
  models: StudioModel[];
  selectedModelId: string;
  onSelectModel: (model: StudioModel) => void;
  disabled?: boolean;
}

export function ModelPicker({
  models,
  selectedModelId,
  onSelectModel,
  disabled = false,
}: ModelPickerProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter models by category and search term
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesCategory =
        activeFilter === "all" || model.filterGroup === activeFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.categoryTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [models, activeFilter, searchQuery]);

  const categories: { id: FilterCategory; label: string }[] = [
    { id: "all", label: `All (${models.length})` },
    { id: "recommended", label: "Recommended" },
    { id: "pro", label: "Pro Cinema" },
    { id: "budget", label: "Fast Draft" },
  ];

  return (
    <div className="space-y-3.5">
      {/* Header with Title & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] flex items-center gap-1.5 font-mono">
          <Wand2 className="h-3.5 w-3.5 text-[#7C5CFF]" />
          Select AI Engine
        </label>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-white/[0.08] bg-[#0E0E14]/80 overflow-x-auto scrollbar-none backdrop-blur-md">
          {categories.map((cat) => {
            const isActive = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                disabled={disabled}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] text-white shadow-sm shadow-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-white/[0.05]"
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      {models.length > 4 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B8B96]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            placeholder="Search engine by name or capability..."
            className="w-full h-8 pl-8 pr-3 rounded-xl border border-white/[0.08] bg-[#0A0A0E]/80 text-xs text-[#F2F2F5] placeholder:text-[#8B8B96]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7C5CFF] backdrop-blur-md"
          />
        </div>
      )}

      {/* Bounded Scroll Container for Any Number of Models */}
      <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {filteredModels.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-white/[0.08] text-xs text-[#8B8B96]">
            No engines match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredModels.map((model) => {
              const isSelected = selectedModelId === model.id;

              return (
                <button
                  key={model.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectModel(model)}
                  className={cn(
                    "relative flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-200 group",
                    "bg-[#0E0E14]/70 hover:bg-[#14141E] hover:border-[#7C5CFF]/50",
                    isSelected
                      ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/30 bg-[#161624] shadow-lg shadow-[#7C5CFF]/15"
                      : "border-white/[0.06]",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Header inside Card */}
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "p-2 rounded-xl border transition-colors",
                          isSelected
                            ? "border-[#7C5CFF]/50 bg-[#7C5CFF]/20 text-[#7C5CFF]"
                            : "border-white/[0.06] bg-black/40 text-[#8B8B96] group-hover:text-white"
                        )}
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F2F2F5]">
                          {model.name}
                        </h4>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-[#8B8B96] block">
                          {model.categoryTag}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="h-4 w-4 rounded-full bg-[#7C5CFF] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#7C5CFF]/40">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-[#8B8B96] mt-2 mb-3 line-clamp-2 leading-relaxed">
                    {model.description}
                  </p>

                  {/* Footer: Cost & Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] w-full text-[11px]">
                    {model.badge ? (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono",
                          model.badge === "Recommended"
                            ? "bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30"
                            : model.badge === "Budget Friendly" || model.badge === "Cheapest"
                            ? "bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30"
                            : "bg-black/60 text-[#8B8B96] border border-white/10"
                        )}
                      >
                        {model.badge}
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-1 font-bold font-mono text-[#FBBF24]">
                      <Zap className="h-3 w-3" />
                      <span>
                        {model.costFormulaType === "per_second"
                          ? `${model.baseRate} cr/s`
                          : `${model.baseRate} Credits`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
