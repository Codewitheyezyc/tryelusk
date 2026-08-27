"use client";

import React from "react";
import { Users, UserCheck, Plus, X, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/database.types";

interface CharacterPickerProps {
  characters: Character[];
  selectedCharacterId: string | null;
  onSelectCharacter: (character: Character | null) => void;
  onOpenCreateCharacter: () => void;
}

export function CharacterPicker({
  characters,
  selectedCharacterId,
  onSelectCharacter,
  onOpenCreateCharacter,
}: CharacterPickerProps) {
  const activeChar = characters.find((c) => c.id === selectedCharacterId) || null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#EC4899]" />
          <label className="text-xs font-bold uppercase tracking-wider text-[#8B8B96] font-mono">
            Cast Character (Locked Continuity)
          </label>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenCreateCharacter}
          className="h-6 px-2 text-[11px] font-semibold text-[#EC4899] hover:text-white hover:bg-[#EC4899]/20 transition-all gap-1"
        >
          <Plus className="h-3 w-3" />
          New Character
        </Button>
      </div>

      {/* Selected Character Banner */}
      {activeChar ? (
        <div className="p-3 rounded-xl border border-[#EC4899]/50 bg-[#EC4899]/10 flex items-center justify-between gap-3 shadow-lg shadow-[#EC4899]/10">
          <div className="flex items-center gap-3 overflow-hidden">
            {activeChar.reference_sheet_url ? (
              <img
                src={activeChar.reference_sheet_url}
                alt={activeChar.name}
                className="h-11 w-16 rounded-lg object-cover border border-white/20 shrink-0 shadow"
              />
            ) : (
              <div className="h-11 w-11 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-[#EC4899]" />
              </div>
            )}

            <div className="overflow-hidden space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F2F2F5] truncate">
                  {activeChar.name}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30 flex items-center gap-1 shrink-0 font-bold">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Locked Spec
                </span>
              </div>
              <p className="text-[11px] text-[#8B8B96] truncate leading-relaxed">
                {activeChar.visual_spec || activeChar.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectCharacter(null)}
            className="p-1.5 rounded-lg text-[#8B8B96] hover:text-[#F87171] hover:bg-white/[0.08] transition-colors shrink-0"
            title="Remove character casting"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Character Selector Grid / Pill List */
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectCharacter(null)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap",
              !selectedCharacterId
                ? "bg-white/[0.1] border-white/20 text-white shadow-sm"
                : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-[#14141E]"
            )}
          >
            No Character
          </button>

          {characters.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => onSelectCharacter(char)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1.5",
                selectedCharacterId === char.id
                  ? "bg-[#EC4899]/20 border-[#EC4899] text-[#EC4899] ring-2 ring-[#EC4899]/30"
                  : "border-white/[0.08] bg-[#0E0E14]/70 text-[#8B8B96] hover:text-[#EC4899] hover:border-[#EC4899]/40"
              )}
            >
              <UserCheck className="h-3 w-3 text-[#EC4899]" />
              <span>{char.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
