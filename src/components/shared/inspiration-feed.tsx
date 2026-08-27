"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  Play,
  Camera,
  SunMedium,
  Film,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { INSPIRATION_SCENES, type InspirationScene } from "@/lib/data/inspiration-scenes";

interface InspirationCardProps {
  scene: InspirationScene;
}

function InspirationCard({ scene }: InspirationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (scene.videoUrl && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (scene.videoUrl && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(scene.prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const remixUrl = `/generate?type=${scene.mediaType}&prompt=${encodeURIComponent(scene.prompt)}&model=${encodeURIComponent(scene.model)}`;

  return (
    <Card
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group border-[#26262E] bg-[#16161C] overflow-hidden transition-all duration-300 hover:border-[#7C5CFF]/70 hover:shadow-xl hover:shadow-[#7C5CFF]/10 flex flex-col justify-between"
    >
      {/* Video / Image Visual Poster */}
      <div className="relative aspect-video bg-[#0B0B0F] overflow-hidden">
        {scene.videoUrl ? (
          <video
            ref={videoRef}
            src={scene.videoUrl}
            poster={scene.imageUrl}
            muted
            loop
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <img
            src={scene.imageUrl}
            alt={scene.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/80 text-[#FBBF24] border border-[#FBBF24]/30 backdrop-blur-md">
            {scene.genre}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/80 text-white border border-white/20 backdrop-blur-md">
            {scene.model}
          </span>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Link href={remixUrl} className="flex-1">
              <Button
                size="sm"
                className="w-full h-8 text-xs font-semibold bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white shadow-md shadow-[#7C5CFF]/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Remix in Studio
              </Button>
            </Link>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 px-2.5 border-[#26262E] bg-black/70 text-[#F2F2F5] hover:bg-[#16161C] hover:text-white"
              title="Copy Prompt"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <CardContent className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[#F2F2F5] group-hover:text-[#7C5CFF] transition-colors">
            {scene.title}
          </h4>
        </div>

        <p className="text-xs text-[#8B8B96] line-clamp-2 leading-relaxed font-normal">
          {scene.prompt}
        </p>

        {/* Director Specs Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#26262E]/60 text-[10px] text-[#8B8B96]">
          {scene.cameraMovement && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0B0B0F] border border-[#26262E]">
              <Camera className="h-2.5 w-2.5 text-[#7C5CFF]" />
              Camera Move
            </span>
          )}
          {scene.lightingMood && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#0B0B0F] border border-[#26262E]">
              <SunMedium className="h-2.5 w-2.5 text-[#FBBF24]" />
              Lighting Spec
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface InspirationFeedProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function InspirationFeed({
  title = "Director's Inspiration & Scene Remixes",
  subtitle = "Discover cinematic scene presets crafted by Claude Director. Click Remix to direct your version in 1 click.",
  limit,
}: InspirationFeedProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  const genres = ["All", "Cyberpunk", "Action", "Commercial", "Sci-Fi", "Film Noir"];

  const filteredScenes = INSPIRATION_SCENES.filter((s) =>
    selectedGenre === "All" ? true : s.genre === selectedGenre
  );

  const displayedScenes = limit ? filteredScenes.slice(0, limit) : filteredScenes;

  return (
    <div className="space-y-6">
      {/* Header & Genre Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#7C5CFF]/15 border border-[#7C5CFF]/30">
              <Sparkles className="h-3.5 w-3.5 text-[#7C5CFF]" />
            </div>
            <h3 className="text-base font-bold text-[#F2F2F5]">{title}</h3>
          </div>
          <p className="text-xs text-[#8B8B96] max-w-xl">{subtitle}</p>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                selectedGenre === g
                  ? "bg-[#7C5CFF] text-white shadow-sm shadow-[#7C5CFF]/30"
                  : "bg-[#16161C] border border-[#26262E] text-[#8B8B96] hover:text-[#F2F2F5] hover:border-[#7C5CFF]/40"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Scenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedScenes.map((scene) => (
          <InspirationCard key={scene.id} scene={scene} />
        ))}
      </div>
    </div>
  );
}
