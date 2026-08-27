"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  disabled = false,
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition-all",
          "bg-[#0B0B0F] border-[#26262E] text-[#F2F2F5]",
          "hover:border-[#7C5CFF]/60 hover:bg-[#16161C]",
          isOpen && "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-[10px] text-[#8B8B96] font-normal truncate">
              ({selectedOption.sublabel})
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#8B8B96] shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-[#7C5CFF]"
          )}
        />
      </button>

      {/* Dropdown Menu List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-[#26262E] bg-[#16161C] p-1.5 shadow-2xl shadow-black/80 max-h-56 overflow-y-auto space-y-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          {options.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#8B8B96]">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors",
                    isSelected
                      ? "bg-[#7C5CFF]/20 text-[#F2F2F5] font-semibold"
                      : "text-[#8B8B96] hover:bg-[#0B0B0F] hover:text-[#F2F2F5]"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-[#F2F2F5]">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-[#8B8B96]">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {opt.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#26262E] text-[#8B8B96]">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-[#7C5CFF] stroke-[3]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
