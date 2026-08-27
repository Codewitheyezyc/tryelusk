"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Sparkles,
  Film,
  FolderKanban,
  Users,
  Layers,
  Image as ImageIcon,
  Video,
  Mic,
  Home,
  Heart,
  Zap,
  Camera,
  ChevronRight,
  ChevronDown,
  Wand2,
  Volume2,
  RefreshCw,
  CreditCard,
  Compass,
} from "lucide-react";
import { MENU_CONFIGS } from "@/components/layout/header-mega-menu";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("quick");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelectModel = (type: string, modelId: string) => {
    setIsOpen(false);
    router.push(`/generate?type=${type}&model=${modelId}`);
  };

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-2xl p-3 sm:p-4 overflow-y-auto custom-scrollbar animate-in fade-in duration-200 flex flex-col items-center justify-start select-none"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-white/[0.12] bg-[#0E0E14] p-4 sm:p-5 space-y-4 shadow-[0_25px_70px_rgba(0,0,0,0.95)] my-4 pb-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#B066FF] flex items-center justify-center text-white font-extrabold shadow-md shadow-[#7C5CFF]/30">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white tracking-tight block">
                TryElusk Navigation
              </span>
              <span className="text-[10px] text-[#8B8B96]">Browse AI Models &amp; Filmmaking Tools</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-[#8B8B96] hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. Primary Filmmaking Apps */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#8B8B96] font-bold px-2 block">
            Filmmaking Studios
          </span>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/generate"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-bold text-white transition-all group"
            >
              <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] group-hover:bg-[#7C5CFF] group-hover:text-white transition-colors">
                <Home className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block truncate">Studio</span>
                <span className="text-[9px] text-[#8B8B96] font-normal">Direct Takes</span>
              </div>
            </Link>

            <Link
              href="/storyboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-bold text-white transition-all group"
            >
              <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] group-hover:bg-[#7C5CFF] group-hover:text-white transition-colors">
                <Film className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block truncate">Storyboard</span>
                <span className="text-[9px] text-[#8B8B96] font-normal">Timeline Cut</span>
              </div>
            </Link>

            <Link
              href="/vibe-director"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#7C5CFF]/10 to-[#EC4899]/10 hover:from-[#7C5CFF]/20 hover:to-[#EC4899]/20 border border-[#7C5CFF]/30 text-xs font-bold text-white transition-all group col-span-2"
            >
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#EC4899] text-white shadow-md shadow-[#7C5CFF]/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="block truncate">Vibe Director AGENT</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#7C5CFF] text-white">
                    PRO
                  </span>
                </div>
                <span className="text-[9px] text-[#8B8B96] font-normal">Autonomous AI Directing &amp; Screenplay</span>
              </div>
            </Link>

            <Link
              href="/projects"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-bold text-white transition-all group"
            >
              <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] group-hover:bg-[#7C5CFF] group-hover:text-white transition-colors">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block truncate">Film Projects</span>
                <span className="text-[9px] text-[#8B8B96] font-normal">Workspaces Hub</span>
              </div>
            </Link>

            <Link
              href="/media"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-bold text-white transition-all group"
            >
              <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] group-hover:bg-[#7C5CFF] group-hover:text-white transition-colors">
                <Layers className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="block truncate">Vault &amp; Hub</span>
                <span className="text-[9px] text-[#8B8B96] font-normal">Cast &amp; Stills</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 2. Collapsible Image Category */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("image")}
            className="w-full p-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#7C5CFF]" />
              <span>Image AI Engines &amp; Cameras</span>
            </div>
            {expandedSection === "image" ? (
              <ChevronDown className="h-4 w-4 text-[#7C5CFF]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#8B8B96]" />
            )}
          </button>

          {expandedSection === "image" && (
            <div className="p-3 pt-0 space-y-2 border-t border-white/[0.04]">
              <div className="grid grid-cols-1 gap-1.5 pt-2">
                {MENU_CONFIGS.image.models.map((model) => (
                  <button
                    key={model.modelId}
                    type="button"
                    onClick={() => handleSelectModel("image", model.modelId)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-left transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{model.name}</span>
                        {model.badge && (
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#EC4899]/20 text-[#EC4899]">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8B8B96]">{model.description}</p>
                    </div>
                    <Wand2 className="h-3.5 w-3.5 text-[#7C5CFF] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Collapsible Video Category */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("video")}
            className="w-full p-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[#38BDF8]" />
              <span>Video AI Engines &amp; Choreography</span>
            </div>
            {expandedSection === "video" ? (
              <ChevronDown className="h-4 w-4 text-[#38BDF8]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#8B8B96]" />
            )}
          </button>

          {expandedSection === "video" && (
            <div className="p-3 pt-0 space-y-2 border-t border-white/[0.04]">
              <div className="grid grid-cols-1 gap-1.5 pt-2">
                {MENU_CONFIGS.video.models.map((model) => (
                  <button
                    key={model.modelId}
                    type="button"
                    onClick={() => handleSelectModel("video", model.modelId)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-left transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{model.name}</span>
                        {model.badge && (
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#7C5CFF]/20 text-[#7C5CFF]">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8B8B96]">{model.description}</p>
                    </div>
                    <Video className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Collapsible Audio & Voice Category */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection("audio")}
            className="w-full p-3 flex items-center justify-between text-xs font-bold text-white hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-[#FBBF24]" />
              <span>Audio, Voice &amp; Lip-Sync</span>
            </div>
            {expandedSection === "audio" ? (
              <ChevronDown className="h-4 w-4 text-[#FBBF24]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#8B8B96]" />
            )}
          </button>

          {expandedSection === "audio" && (
            <div className="p-3 pt-0 space-y-2 border-t border-white/[0.04]">
              <div className="grid grid-cols-1 gap-1.5 pt-2">
                {MENU_CONFIGS.audio.models.map((model) => (
                  <button
                    key={model.modelId}
                    type="button"
                    onClick={() => handleSelectModel(model.type, model.modelId)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-left transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{model.name}</span>
                        {model.badge && (
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#FBBF24]/20 text-[#FBBF24]">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8B8B96]">{model.description}</p>
                    </div>
                    <Volume2 className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Production Plans & Pricing Link */}
        <div className="pt-2 border-t border-white/[0.06]">
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 border border-[#7C5CFF]/30 text-xs font-bold text-white transition-all"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#7C5CFF]" />
              <span>Pricing &amp; Pro Studio Plans</span>
            </div>
            <ChevronRight className="h-4 w-4 text-[#7C5CFF]" />
          </Link>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl border border-white/[0.08] bg-[#0E0E14] text-[#8B8B96] hover:text-white transition-colors"
        aria-label="Toggle Mobile Navigation"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Render via Portal outside header hierarchy */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </div>
  );
}
