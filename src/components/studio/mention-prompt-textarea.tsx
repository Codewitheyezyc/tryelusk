"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Sparkles, Plus, Check, MapPin, Package, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/database.types";
import { parseElementFromCharacterRow, type ProductionElement } from "@/lib/elements";

interface MentionPromptTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  characters?: Character[];
  onSelectCharacter?: (char: Character) => void;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
}

export function MentionPromptTextarea({
  value,
  onChange,
  placeholder = "Describe your scene — type @ to tag cast, sets & props...",
  characters = [],
  onSelectCharacter,
  disabled = false,
  onKeyDown,
  rows = 2,
  className,
}: MentionPromptTextareaProps) {
  const [mentionActive, setMentionActive] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionCursorIndex, setMentionCursorIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Parse into unified elements
  const allElements = characters.map(parseElementFromCharacterRow);

  // Filter elements matching mention query
  const filteredElements = allElements.filter((el) => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    const nameMatch = el.name.toLowerCase().includes(q);
    const slugMatch = el.slug.toLowerCase().includes(q);
    const descMatch = el.description.toLowerCase().includes(q);
    return nameMatch || slugMatch || descMatch;
  });

  // Check for @ trigger when typing or moving cursor
  const checkMentionTrigger = (text: string, cursor: number) => {
    const textBeforeCursor = text.slice(0, cursor);
    // Find if the cursor is currently at or inside an @word
    const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_-]*)$/);

    if (match) {
      const query = match[1] || "";
      setMentionQuery(query);
      setMentionCursorIndex(cursor);
      setMentionActive(true);
      setSelectedIndex(0);
    } else {
      setMentionActive(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const cursor = e.target.selectionStart || 0;
    onChange(newVal);
    checkMentionTrigger(newVal, cursor);
  };

  const handleSelectMention = (element: ProductionElement) => {
    const cleanTag = `@${element.slug}`;
    const cursor = textareaRef.current?.selectionStart || mentionCursorIndex;
    const textBefore = value.slice(0, cursor);
    const textAfter = value.slice(cursor);

    // Replace the trailing @query with @cleanTag
    const replacedBefore = textBefore.replace(/(?:^|\s)@([a-zA-Z0-9_-]*)$/, (match) => {
      const leadingSpace = match.startsWith(" ") ? " " : "";
      return `${leadingSpace}${cleanTag} `;
    });

    const finalValue = `${replacedBefore}${textAfter}`;
    onChange(finalValue);
    setMentionActive(false);

    // Find original character row to pass to callback
    const origChar = characters.find((c) => c.id === element.id);
    if (origChar) {
      onSelectCharacter?.(origChar);
    }

    // Refocus textarea and place cursor right after inserted tag
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = replacedBefore.length;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 10);
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionActive && filteredElements.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredElements.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredElements.length) % filteredElements.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const selected = filteredElements[selectedIndex];
        if (selected) {
          handleSelectMention(selected);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionActive(false);
        return;
      }
    }

    onKeyDown?.(e);
  };

  // Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setMentionActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse all active mentions in the prompt to display badges
  const detectedTags = React.useMemo(() => {
    const matches = value.match(/@[a-zA-Z0-9_-]+/g);
    if (!matches) return [];
    return Array.from(new Set(matches));
  }, [value]);

  return (
    <div className="relative w-full">
      {/* 1. AUTOCOMPLETE POPUP MODAL (Positioned right above prompt) */}
      {mentionActive && filteredElements.length > 0 && (
        <div
          ref={popupRef}
          className="absolute bottom-full mb-2 left-2 right-2 sm:right-auto sm:w-80 max-h-64 overflow-y-auto custom-scrollbar rounded-2xl border border-white/[0.16] bg-[#14141E] p-1.5 shadow-[0_25px_60px_rgba(0,0,0,0.98)] z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-[#8B8B96] uppercase tracking-wider border-b border-white/[0.06] flex items-center justify-between font-mono">
            <span>Tag Element (Cast, Set or Prop)</span>
            <span className="text-[#7C5CFF]">Tab / Enter to select</span>
          </div>

          {filteredElements.map((elem, idx) => {
            const isSelected = idx === selectedIndex;
            const isLocation = elem.category === "location";
            const isProp = elem.category === "prop";

            return (
              <button
                key={elem.id}
                type="button"
                onClick={() => handleSelectMention(elem)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2.5",
                  isSelected
                    ? isLocation
                      ? "bg-[#38BDF8]/20 text-white ring-1 ring-[#38BDF8]/50"
                      : isProp
                      ? "bg-[#EC4899]/20 text-white ring-1 ring-[#EC4899]/50"
                      : "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {/* Element Thumbnail */}
                {elem.reference_image_url ? (
                  <img
                    src={elem.reference_image_url}
                    alt={elem.name}
                    className="h-8 w-8 rounded-lg object-cover border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center text-white shrink-0">
                    {isLocation ? (
                      <MapPin className="h-4 w-4 text-[#38BDF8]" />
                    ) : isProp ? (
                      <Package className="h-4 w-4 text-[#EC4899]" />
                    ) : (
                      <User className="h-4 w-4 text-[#7C5CFF]" />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-white font-bold">{elem.name}</span>
                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0",
                        isLocation
                          ? "bg-[#38BDF8]/20 text-[#38BDF8]"
                          : isProp
                          ? "bg-[#EC4899]/20 text-[#EC4899]"
                          : "bg-[#7C5CFF]/30 text-[#C4B5FD]"
                      )}
                    >
                      @{elem.slug}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-[10px] truncate",
                      isSelected ? "text-white/80" : "text-[#8B8B96]"
                    )}
                  >
                    {elem.description || (isLocation ? "Production Location" : isProp ? "Hero Prop" : "Cast Actor")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. TEXTAREA WITH MENTION HIGHLIGHTING */}
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDownInternal}
          onKeyUp={(e) => {
            const cursor = (e.target as HTMLTextAreaElement).selectionStart || 0;
            checkMentionTrigger(value, cursor);
          }}
          onClick={(e) => {
            const cursor = (e.target as HTMLTextAreaElement).selectionStart || 0;
            checkMentionTrigger(value, cursor);
          }}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-[#F2F2F5] placeholder:text-[#8B8B96]/60 focus:outline-none resize-none leading-relaxed custom-scrollbar",
            className
          )}
        />
      </div>

      {/* 3. ACTIVE TAGGED PILLS CHIPS */}
      {detectedTags.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 pb-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-[#8B8B96] flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-[#7C5CFF]" />
            <span>Tagged Elements:</span>
          </span>
          {detectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-[#C4B5FD] text-[10px] font-mono font-bold shadow-sm"
            >
              <span>{tag}</span>
              <Check className="h-2.5 w-2.5 text-[#4ADE80]" />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
