"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Plus,
  Sparkles,
  Layers,
  Search,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types/database.types";

import { ReferenceMediaVisual } from "@/components/media/reference-media-visual";

export interface ReferenceItem {
  id: string;
  url: string;
  type: "image" | "video";
  title?: string;
}

interface ReferencePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  generations: Generation[];
  activeReferences: ReferenceItem[];
  onAddReference: (item: ReferenceItem) => void;
  onRemoveReference: (id: string) => void;
}

export function ReferencePickerModal({
  isOpen,
  onClose,
  generations = [],
  activeReferences = [],
  onAddReference,
  onRemoveReference,
}: ReferencePickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const imageGenerations = generations.filter(
    (g) =>
      g.status === "completed" &&
      !g.is_deleted &&
      (g.type === "image" || g.type === "video" || g.type === "character" || g.output_url)
  );

  const filteredGenerations = imageGenerations.filter((g) =>
    searchQuery ? g.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create local object URL for instant preview & attachment
      const objectUrl = URL.createObjectURL(file);
      const newRef: ReferenceItem = {
        id: `upload_${Date.now()}`,
        url: objectUrl,
        type: file.type.startsWith("video") ? "video" : "image",
        title: file.name,
      };
      onAddReference(newRef);
    } catch {
      // Ignore
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isAttached = (id: string) => activeReferences.some((r) => r.id === id);

  const toggleAttachment = (gen: Generation) => {
    const url = gen.output_url || (Array.isArray(gen.output_urls) ? String(gen.output_urls[0]) : "");
    if (!url) return;

    if (isAttached(gen.id)) {
      onRemoveReference(gen.id);
    } else {
      if (activeReferences.length >= 50) return;
      onAddReference({
        id: gen.id,
        url,
        type: gen.type === "video" ? "video" : "image",
        title: gen.prompt,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-3 sm:p-6 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-white/[0.1] bg-[#0E0E14] shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* 1. MODAL HEADER */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-white/[0.08] shrink-0 bg-[#0E0E14]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#6D3EFF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#7C5CFF]/30 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Visual Reference &amp; Keyframe Vault
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
                  {activeReferences.length}/50 Attached
                </span>
              </div>
              <p className="text-xs text-[#8B8B96] mt-0.5">
                Attach visual stills or previous take frames to drive starting motion and style consistency.
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

        {/* 2. TAB TOGGLE & UPLOAD BAR */}
        <div className="p-4 border-b border-white/[0.06] bg-[#0A0A0E] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B8B96]" />
              <input
                type="text"
                placeholder="Search visual takes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-xl border border-white/[0.08] bg-[#14141E] text-xs text-white placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF]"
              />
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading || activeReferences.length >= 50}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto h-8 px-3.5 rounded-xl bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              <span>Upload Custom Reference Still</span>
            </button>
          </div>
        </div>

        {/* 3. ATTACHED REFERENCES TRAY */}
        {activeReferences.length > 0 && (
          <div className="p-3 bg-[#12121A] border-b border-white/[0.06] shrink-0">
            <div className="text-[10px] font-bold text-[#8B8B96] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Active Attached References</span>
              <button
                type="button"
                onClick={() => {
                  for (const ref of activeReferences) {
                    onRemoveReference(ref.id);
                  }
                }}
                className="text-[10px] text-red-400 hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {activeReferences.map((ref) => (
                <div
                  key={ref.id}
                  className="relative group h-14 w-14 rounded-xl overflow-hidden border-2 border-[#7C5CFF] shadow-sm shrink-0 bg-black"
                >
                  <ReferenceMediaVisual url={ref.url} type={ref.type} />
                  <button
                    type="button"
                    onClick={() => onRemoveReference(ref.id)}
                    className="absolute inset-0 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-4 w-4 text-red-400 hover:text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SCROLLABLE GENERATION VAULT GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5">
          {filteredGenerations.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.06] bg-[#0A0A0E]/50 p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mx-auto text-[#7C5CFF]">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm font-bold text-white">No Stills Found</h3>
                <p className="text-xs text-[#8B8B96]">
                  Upload a photo from your computer or generate concept images in Nano Banana to use them as keyframe references.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredGenerations.map((gen) => {
                const url = gen.output_url || (Array.isArray(gen.output_urls) ? String(gen.output_urls[0]) : "");
                if (!url) return null;
                const attached = isAttached(gen.id);

                return (
                  <div
                    key={gen.id}
                    onClick={() => toggleAttachment(gen)}
                    className={cn(
                      "group relative aspect-square rounded-2xl border bg-[#12121A] overflow-hidden cursor-pointer transition-all duration-200",
                      attached
                        ? "border-[#7C5CFF] ring-2 ring-[#7C5CFF]/70 shadow-lg shadow-[#7C5CFF]/20"
                        : "border-white/[0.08] hover:border-white/30 hover:scale-[1.02]"
                    )}
                  >
                    <ReferenceMediaVisual
                      url={url}
                      type={gen.type}
                    />

                    {/* Attached Checkbox Badge */}
                    <div
                      className={cn(
                        "absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center transition-all z-10",
                        attached
                          ? "bg-[#7C5CFF] text-white shadow-md"
                          : "bg-black/60 text-white/70 border border-white/30 opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {attached ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </div>

                    {/* Bottom Prompt Label - only on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <p className="text-[10px] text-white font-medium line-clamp-2">
                        {gen.prompt}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. STICKY MODAL FOOTER */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0A0A0E] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#8B8B96]">
            {activeReferences.length} of 50 maximum references selected
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 hover:opacity-95 transition-all"
          >
            Apply References ({activeReferences.length})
          </button>
        </div>
      </div>
    </div>
  );
}
