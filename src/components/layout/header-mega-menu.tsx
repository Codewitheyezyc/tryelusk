"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Image as ImageIcon,
  Video,
  Mic,
  Film,
  Sparkles,
  Camera,
  Layers,
  Wand2,
  Volume2,
  RefreshCw,
  Zap,
  ChevronDown,
  Palette,
  Clapperboard,
  History,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavMenuConfig {
  id: "image" | "video" | "audio";
  label: string;
  features: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: "TOP" | "NEW";
  }[];
  models: {
    name: string;
    description: string;
    modelId: string;
    type: "image" | "video" | "audio" | "lipsync";
    badge?: "TOP" | "NEW";
  }[];
}

export const MENU_CONFIGS: Record<"image" | "video" | "audio", NavMenuConfig> = {
  image: {
    id: "image",
    label: "Image",
    features: [
      {
        title: "Create Image",
        description: "Generate AI images from text prompts",
        icon: ImageIcon,
        href: "/generate?type=image",
      },
      {
        title: "Cinematic Cameras",
        description: "Image generation with optics & lighting controls",
        icon: Camera,
        href: "/generate?type=image",
        badge: "TOP",
      },
      {
        title: "Character Reference Sheet",
        description: "Generate locked 3-angle character turnaround sheets",
        icon: Layers,
        href: "/media?tab=characters",
        badge: "NEW",
      },
      {
        title: "My Image Library",
        description: "Access and direct all generated project stills",
        icon: History,
        href: "/media?tab=images",
      },
    ],
    models: [
      {
        name: "Nano Banana Pro",
        description: "Ultra-high resolution cinematic photorealism",
        modelId: "nano-banana-pro",
        type: "image",
        badge: "TOP",
      },
      {
        name: "Seedream V4",
        description: "Complex scene composition & volumetric lighting",
        modelId: "seedream-v4",
        type: "image",
      },
      {
        name: "GPT Image 2",
        description: "State of the art typography & complex logic",
        modelId: "gpt-image-2",
        type: "image",
        badge: "NEW",
      },
      {
        name: "Flux Dev",
        description: "Hyper-detailed textures and cinematic dynamic range",
        modelId: "flux-dev",
        type: "image",
      },
    ],
  },
  video: {
    id: "video",
    label: "Video",
    features: [
      {
        title: "Text to Video",
        description: "Generate cinematic takes from natural scene prompts",
        icon: Video,
        href: "/generate?type=video",
      },
      {
        title: "Image to Motion",
        description: "Animate character stills and scenes with camera motion",
        icon: RefreshCw,
        href: "/generate?type=video",
        badge: "TOP",
      },
      {
        title: "Storyboard Sequencer",
        description: "Assemble multi-scene continuous cinema sequences",
        icon: Film,
        href: "/storyboard",
        badge: "NEW",
      },
      {
        title: "My Video Vault",
        description: "Manage generated takes, upscale clips, and retry prompts",
        icon: History,
        href: "/media?tab=videos",
      },
    ],
    models: [
      {
        name: "Kling 2.5 Turbo Video",
        description: "High frame-rate cinematic video with realistic physics",
        modelId: "kling-2.5-turbo",
        type: "video",
        badge: "TOP",
      },
      {
        name: "Seedance 2.5 Motion",
        description: "Advanced camera steering & complex character motion",
        modelId: "seedance-2.5",
        type: "video",
        badge: "NEW",
      },
      {
        name: "Wan 2.1 Direct",
        description: "Cost-efficient cinematic video rendering",
        modelId: "wan-2.1",
        type: "video",
      },
      {
        name: "Luma Ray 2 Fast",
        description: "Instant fluid motion and cinematic lighting",
        modelId: "luma-ray-2",
        type: "video",
      },
    ],
  },
  audio: {
    id: "audio",
    label: "Audio",
    features: [
      {
        title: "Cinematic Voice Studio",
        description: "Expressive AI voice generation for dialog & narration",
        icon: Mic,
        href: "/audio",
        badge: "TOP",
      },
      {
        title: "Foley & Sound Effects",
        description: "Generate cinematic SFX, ambient soundscapes, & impacts",
        icon: Volume2,
        href: "/audio?tab=sfx",
        badge: "NEW",
      },
      {
        title: "Character Voice Cast",
        description: "Pair voices directly with forged character identities",
        icon: Layers,
        href: "/media?tab=characters",
      },
    ],
    models: [
      {
        name: "ElevenLabs Multilingual V2",
        description: "Emotionally dynamic, human-level vocal performances",
        modelId: "eleven-multilingual-v2",
        type: "audio",
        badge: "TOP",
      },
      {
        name: "ElevenLabs Turbo 2.5",
        description: "Ultra low latency high-speed voice synthesis",
        modelId: "eleven-turbo-v2_5",
        type: "audio",
      },
      {
        name: "MiniMax Speech 01",
        description: "Natural rhythm and expressive character acting",
        modelId: "minimax-speech-01",
        type: "audio",
        badge: "NEW",
      },
    ],
  },
};

export function HeaderMegaMenu() {
  const [activeMenu, setActiveMenu] = useState<"image" | "video" | "audio" | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleMouseEnter = (menu: "image" | "video" | "audio") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const handleSelectModel = (type: string, modelId: string) => {
    setActiveMenu(null);
    if (type === "audio" || type === "lipsync") {
      router.push(`/audio?model=${modelId}`);
    } else {
      router.push(`/generate?type=${type}&model=${modelId}`);
    }
  };

  const isCurrent = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <div className="relative flex items-center gap-1 xl:gap-1.5 select-none shrink-0">
      {/* 1. Explore */}
      <Link
        href="/generations"
        className={cn(
          "px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
          isCurrent("/generations")
            ? "text-white bg-white/[0.08]"
            : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
        )}
      >
        Explore
      </Link>

      {/* 2. Image Mega Menu */}
      <div
        className="relative shrink-0"
        onMouseEnter={() => handleMouseEnter("image")}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href="/generate?type=image"
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
            activeMenu === "image"
              ? "bg-white/[0.08] text-white"
              : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span>Image</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Link>
      </div>

      {/* 3. Video Mega Menu */}
      <div
        className="relative shrink-0"
        onMouseEnter={() => handleMouseEnter("video")}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href="/generate?type=video"
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
            activeMenu === "video"
              ? "bg-white/[0.08] text-white"
              : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span>Video</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Link>
      </div>

      {/* 4. Audio Mega Menu */}
      <div
        className="relative shrink-0"
        onMouseEnter={() => handleMouseEnter("audio")}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href="/audio"
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
            activeMenu === "audio" || isCurrent("/audio")
              ? "bg-white/[0.08] text-white"
              : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span>Audio</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Link>
      </div>

      {/* 5. Elusk Studio */}
      <Link
        href="/generate"
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
          isCurrent("/generate")
            ? "text-white bg-[#7C5CFF]/15 border border-[#7C5CFF]/30"
            : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
        )}
      >
        <span>Studio</span>
        <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-[#7C5CFF]/30 text-[#A78BFA]">
          PRO
        </span>
      </Link>

      {/* 6. Projects Hub */}
      <Link
        href="/projects"
        className={cn(
          "px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
          isCurrent("/projects")
            ? "text-white bg-white/[0.08]"
            : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
        )}
      >
        Projects
      </Link>

      {/* 7. Vibe Director AGENT */}
      <Link
        href="/vibe-director"
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
          isCurrent("/vibe-director")
            ? "text-white bg-[#7C5CFF]/15 border border-[#7C5CFF]/30"
            : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
        )}
      >
        <Sparkles className="h-3 w-3 text-[#FBBF24]" />
        <span>Vibe Director</span>
        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#7C5CFF] text-white">
          PRO
        </span>
      </Link>

      {/* 8. Media Vault */}
      <Link
        href="/media"
        className={cn(
          "px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
          isCurrent("/media")
            ? "text-white bg-white/[0.08]"
            : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
        )}
      >
        Vault
      </Link>

      {/* ================================================================= */}
      {/* 2-COLUMN HOVER MEGA DROPDOWN (100% Solid Opaque Background) */}
      {/* ================================================================= */}
      {activeMenu && (
        <div
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          style={{ backgroundColor: "#14141E" }}
          className="absolute left-0 top-full mt-2 w-[520px] rounded-2xl border border-white/[0.16] bg-[#14141E] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.98)] z-[9999] animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="grid grid-cols-2 gap-5">
            {/* Column 1: Features */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B96] font-mono px-2 block">
                Features &amp; Tools
              </span>
              <div className="space-y-1">
                {MENU_CONFIGS[activeMenu].features.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="p-1.5 rounded-lg bg-black/60 border border-white/[0.08] text-[#8B8B96] group-hover:text-[#7C5CFF] group-hover:border-[#7C5CFF]/40 transition-colors shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#F2F2F5] group-hover:text-white truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                "px-1 py-0.2 rounded text-[7px] font-mono font-bold uppercase",
                                item.badge === "TOP"
                                  ? "bg-[#EC4899]/20 text-[#EC4899] border border-[#EC4899]/30"
                                  : "bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#8B8B96] line-clamp-1 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Models & Engines */}
            <div className="space-y-2 border-l border-white/[0.08] pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B96] font-mono px-2 block">
                AI Engines
              </span>
              <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {MENU_CONFIGS[activeMenu].models.map((model, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectModel(model.type, model.modelId)}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors group text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-black/60 border border-white/[0.08] text-[#8B8B96] group-hover:text-[#7C5CFF] group-hover:border-[#7C5CFF]/40 transition-colors shrink-0">
                      <Wand2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#F2F2F5] group-hover:text-white truncate">
                          {model.name}
                        </span>
                        {model.badge && (
                          <span
                            className={cn(
                              "px-1 py-0.2 rounded text-[7px] font-mono font-bold uppercase",
                              model.badge === "TOP"
                                ? "bg-[#EC4899]/20 text-[#EC4899] border border-[#EC4899]/30"
                                : "bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30"
                            )}
                          >
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8B8B96] line-clamp-1 mt-0.5 leading-relaxed">
                        {model.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
