"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Film,
  Image as ImageIcon,
  Video as VideoIcon,
  Users,
  Mic,
  Calendar,
  Search,
  Download,
  Sparkles,
  ArrowRight,
  Layers,
  Maximize2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Plus,
  UserCheck,
  Volume2,
  Play,
  Pause,
  Folder,
  FolderOpen,
  MapPin,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Generation, Character } from "@/types/database.types";
import { CharacterForgeModal } from "@/components/characters/character-forge-modal";
import { CharacterCard } from "@/components/characters/character-card";
import { deleteCharacterAction } from "@/app/actions/character";
import { VaultMediaCard } from "@/components/media/vault-media-card";
import { useProjects } from "@/context/project-context";
import { ProjectBreadcrumbs } from "@/components/shared/project-breadcrumbs";
import { useSearchParams } from "next/navigation";
import { CreateLocationModal } from "@/components/elements/create-location-modal";
import { CreatePropModal } from "@/components/elements/create-prop-modal";
import { ElementCard } from "@/components/elements/element-card";
import { parseElementFromCharacterRow, type ProductionElement } from "@/lib/elements";

export type MediaTab =
  | "timeline"
  | "characters"
  | "locations"
  | "props"
  | "images"
  | "videos"
  | "audio";

interface ProjectMediaTabsProps {
  generations: Generation[];
  characters?: Character[];
}

export function ProjectMediaTabs({
  generations,
  characters = [],
}: ProjectMediaTabsProps) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as MediaTab) || "timeline";
  const [activeTab, setActiveTab] = useState<MediaTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Generation | Character | null>(null);

  // Modals state
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);

  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [rawCharacterList, setRawCharacterList] = useState<Character[]>(characters);
  const [isFolderScoped, setIsFolderScoped] = useState(false);

  const { activeProject, activeFolder } = useProjects();

  // Convert raw rows into ProductionElement objects
  const parsedElements = useMemo(() => {
    return rawCharacterList.map(parseElementFromCharacterRow);
  }, [rawCharacterList]);

  const castMembers = useMemo(
    () => parsedElements.filter((e) => e.category === "character"),
    [parsedElements]
  );
  const locations = useMemo(
    () => parsedElements.filter((e) => e.category === "location"),
    [parsedElements]
  );
  const props = useMemo(
    () => parsedElements.filter((e) => e.category === "prop"),
    [parsedElements]
  );

  const handleDeleteCharacter = (charId: string) => {
    setRawCharacterList((prev) => prev.filter((c) => c.id !== charId));
    deleteCharacterAction(charId).catch(() => {});
  };

  const handleDeleteElement = (elemId: string) => {
    setRawCharacterList((prev) => prev.filter((c) => c.id !== elemId));
  };

  // Filter generations based on active space & active folder
  const filteredGenerations = useMemo(() => {
    return generations.filter((gen) => {
      // 1. Tab filtering
      if (activeTab === "images") {
        if (gen.type !== "image") return false;
      } else if (activeTab === "videos") {
        if (gen.type !== "video") return false;
      } else if (activeTab === "audio") {
        if (gen.type !== "audio") return false;
      }

      // 2. Folder Scope filtering
      if (isFolderScoped && activeFolder) {
        const folderId = (gen.technical_params as any)?.folder_id;
        if (folderId && folderId !== activeFolder.id) return false;
      }

      // 3. Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const promptMatch = gen.prompt?.toLowerCase().includes(q);
        const modelMatch = gen.model_used?.toLowerCase().includes(q);
        return promptMatch || modelMatch;
      }

      return true;
    });
  }, [generations, activeTab, searchQuery, isFolderScoped, activeFolder]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      timeline: filteredGenerations.length + rawCharacterList.length,
      characters: castMembers.length,
      locations: locations.length,
      props: props.length,
      images: filteredGenerations.filter((g) => g.type === "image").length,
      videos: filteredGenerations.filter((g) => g.type === "video").length,
      audio: filteredGenerations.filter((g) => g.type === "audio").length,
    };
  }, [filteredGenerations, rawCharacterList, castMembers, locations, props]);

  // Filtered lists for search query
  const filteredCast = useMemo(() => {
    if (!searchQuery.trim()) return rawCharacterList.filter((c) => !c.description?.startsWith("[LOCATION]") && !c.description?.startsWith("[PROP]"));
    const q = searchQuery.toLowerCase();
    return rawCharacterList
      .filter((c) => !c.description?.startsWith("[LOCATION]") && !c.description?.startsWith("[PROP]"))
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.visual_spec?.toLowerCase().includes(q)
      );
  }, [rawCharacterList, searchQuery]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase();
    return locations.filter(
      (l) => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
    );
  }, [locations, searchQuery]);

  const filteredProps = useMemo(() => {
    if (!searchQuery.trim()) return props;
    const q = searchQuery.toLowerCase();
    return props.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [props, searchQuery]);

  const tabs: {
    id: MediaTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    badgeColor?: string;
  }[] = [
    { id: "timeline", label: "Timeline & Takes", icon: Calendar, count: counts.timeline },
    { id: "characters", label: "Cast & Characters", icon: Users, count: counts.characters, badgeColor: "text-[#7C5CFF]" },
    { id: "locations", label: "Locations & Sets", icon: MapPin, count: counts.locations, badgeColor: "text-[#38BDF8]" },
    { id: "props", label: "Props & Objects", icon: Package, count: counts.props, badgeColor: "text-[#EC4899]" },
    { id: "images", label: "Images", icon: ImageIcon, count: counts.images },
    { id: "videos", label: "Videos", icon: VideoIcon, count: counts.videos },
    { id: "audio", label: "Audio", icon: Mic, count: counts.audio },
  ];

  const getAssetUrls = (gen: Generation): string[] => {
    if (Array.isArray(gen.output_urls) && gen.output_urls.length > 0) {
      return gen.output_urls.map(String);
    }
    return gen.output_url ? [gen.output_url] : [];
  };

  const buildRetryUrl = (gen: Generation): string => {
    return `/generate?type=${gen.type}&prompt=${encodeURIComponent(gen.prompt)}&model=${gen.model_used}`;
  };

  return (
    <div className="space-y-6">
      {/* Interactive Breadcrumbs */}
      <ProjectBreadcrumbs showCurrentAction="Media Vault &amp; Cast Room" />

      {/* Tab Switcher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-white/[0.08] bg-[#0E0E14] overflow-x-auto cinema-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                    isActive ? "bg-black/30 text-white font-bold" : "bg-white/[0.06] text-[#8B8B96]"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B8B96]" />
            <input
              type="text"
              placeholder="Search elements or prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-white/[0.08] bg-[#0E0E14] text-xs text-[#F2F2F5] placeholder:text-[#8B8B96]/50 focus:border-[#7C5CFF] focus:outline-none"
            />
          </div>

          {activeTab === "characters" && (
            <Button
              onClick={() => setIsCharacterModalOpen(true)}
              className="h-9 px-3.5 bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-semibold shrink-0 gap-1.5 rounded-xl"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Cast Member
            </Button>
          )}

          {activeTab === "locations" && (
            <Button
              onClick={() => setIsLocationModalOpen(true)}
              className="h-9 px-3.5 bg-[#38BDF8] hover:bg-[#0284C7] text-black font-extrabold text-xs shrink-0 gap-1.5 rounded-xl"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Location Set
            </Button>
          )}

          {activeTab === "props" && (
            <Button
              onClick={() => setIsPropModalOpen(true)}
              className="h-9 px-3.5 bg-[#EC4899] hover:bg-[#DB2777] text-white font-extrabold text-xs shrink-0 gap-1.5 rounded-xl"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Hero Prop
            </Button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. CAST ROOM & CHARACTERS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "characters" && (
        <div>
          {filteredCast.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0E0E14]/40 p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C5CFF]/10 text-[#7C5CFF]">
                <Users className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#F2F2F5]">No Cast Members Created Yet</h3>
                <p className="text-xs text-[#8B8B96] max-w-sm mx-auto">
                  Create single-face identity turnaround sheets with paired voice actors to maintain character continuity across your film.
                </p>
              </div>
              <Button
                onClick={() => setIsCharacterModalOpen(true)}
                className="bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-semibold rounded-xl"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create First Cast Member
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCast.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onDelete={handleDeleteCharacter}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. LOCATIONS & SETS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "locations" && (
        <div>
          {filteredLocations.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0E0E14]/40 p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#38BDF8]/10 text-[#38BDF8]">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#F2F2F5]">No Production Locations Saved</h3>
                <p className="text-xs text-[#8B8B96] max-w-sm mx-auto">
                  Lock architectural environments, lighting temperatures, and background mood tokens for consistent scenes.
                </p>
              </div>
              <Button
                onClick={() => setIsLocationModalOpen(true)}
                className="bg-[#38BDF8] hover:bg-[#0284C7] text-black font-extrabold text-xs rounded-xl"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Lock First Location
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLocations.map((loc) => (
                <ElementCard key={loc.id} element={loc} onDeleted={handleDeleteElement} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. PROPS & OBJECTS TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "props" && (
        <div>
          {filteredProps.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0E0E14]/40 p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EC4899]/10 text-[#EC4899]">
                <Package className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#F2F2F5]">No Hero Props or Vehicles Saved</h3>
                <p className="text-xs text-[#8B8B96] max-w-sm mx-auto">
                  Lock hero objects, weapons, vehicles, and key items for 100% persistent shape &amp; material continuity.
                </p>
              </div>
              <Button
                onClick={() => setIsPropModalOpen(true)}
                className="bg-[#EC4899] hover:bg-[#DB2777] text-white font-extrabold text-xs rounded-xl"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create First Hero Prop
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProps.map((prop) => (
                <ElementCard key={prop.id} element={prop} onDeleted={handleDeleteElement} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MEDIA GRID (TIMELINE, IMAGES, VIDEOS, AUDIO) */}
      {/* ------------------------------------------------------------- */}
      {activeTab !== "characters" && activeTab !== "locations" && activeTab !== "props" && (
        <div>
          {filteredGenerations.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0E0E14]/40 p-12 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-[#8B8B96]">
                <Film className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#F2F2F5]">
                  {isFolderScoped && activeFolder
                    ? `No takes in folder "${activeFolder.name}" yet`
                    : "No Generations Found"}
                </h3>
                <p className="text-xs text-[#8B8B96] max-w-sm mx-auto">
                  {isFolderScoped && activeFolder
                    ? `Direct takes while this folder is active to automatically save them here.`
                    : `Direct cinematic images, video takes, and audio tracks in Elusk Studio to populate your vault.`}
                </p>
              </div>
              <Link href="/generate">
                <Button className="bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-semibold rounded-xl">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[#FBBF24]" />
                  Direct New Scene
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredGenerations.map((gen) => (
                <VaultMediaCard
                  key={gen.id}
                  generation={gen}
                  onPreview={(g) => setSelectedAsset(g)}
                  getAssetUrls={getAssetUrls}
                  buildRetryUrl={buildRetryUrl}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Creation Modals */}
      <CharacterForgeModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onCharacterCreated={(newChar) => {
          setRawCharacterList((prev) => [newChar, ...prev]);
        }}
      />

      <CreateLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onCreated={(newLoc) => {
          setRawCharacterList((prev) => [
            {
              id: newLoc.id,
              user_id: newLoc.user_id,
              name: newLoc.name,
              description: `[LOCATION] ${newLoc.description}`,
              visual_spec: newLoc.visual_spec,
              reference_sheet_url: newLoc.reference_image_url,
              reference_sheet_generation_id: null,
              status: "ready",
              created_at: newLoc.created_at,
              updated_at: newLoc.updated_at,
            },
            ...prev,
          ]);
        }}
      />

      <CreatePropModal
        isOpen={isPropModalOpen}
        onClose={() => setIsPropModalOpen(false)}
        onCreated={(newProp) => {
          setRawCharacterList((prev) => [
            {
              id: newProp.id,
              user_id: newProp.user_id,
              name: newProp.name,
              description: `[PROP] ${newProp.description}`,
              visual_spec: newProp.visual_spec,
              reference_sheet_url: newProp.reference_image_url,
              reference_sheet_generation_id: null,
              status: "ready",
              created_at: newProp.created_at,
              updated_at: newProp.updated_at,
            },
            ...prev,
          ]);
        }}
      />
    </div>
  );
}
