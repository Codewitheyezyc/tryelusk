"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Package,
  Sparkles,
  Trash2,
  ExternalLink,
  Film,
  Eye,
  Layers,
} from "lucide-react";
import type { ProductionElement } from "@/lib/elements";
import { deleteProductionElementAction } from "@/app/actions/elements";
import { cn } from "@/lib/utils";

interface ElementCardProps {
  element: ProductionElement;
  onDeleted?: (id: string) => void;
}

export function ElementCard({ element, onDeleted }: ElementCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${element.name}"?`)) return;

    setIsDeleting(true);
    const res = await deleteProductionElementAction(element.id);
    if (res.success) {
      onDeleted?.(element.id);
    }
    setIsDeleting(false);
  };

  const isLocation = element.category === "location";

  return (
    <div className="group relative rounded-3xl border border-white/[0.08] bg-[#0E0E14] overflow-hidden hover:border-[#7C5CFF]/60 hover:shadow-2xl hover:shadow-[#7C5CFF]/15 transition-all duration-300 flex flex-col justify-between">
      {/* Media Preview Box */}
      <div className="relative aspect-video w-full bg-black overflow-hidden">
        {element.reference_image_url ? (
          <img
            src={element.reference_image_url}
            alt={element.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#12121A] to-[#1A1A28] text-[#8B8B96] p-4 text-center">
            {isLocation ? (
              <MapPin className="h-8 w-8 text-[#7C5CFF] mb-2 opacity-60" />
            ) : (
              <Package className="h-8 w-8 text-[#EC4899] mb-2 opacity-60" />
            )}
            <span className="text-xs font-semibold">Visual Keyframe Generating</span>
          </div>
        )}

        {/* Category Tag Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              "px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg backdrop-blur-md flex items-center gap-1.5",
              isLocation
                ? "bg-[#7C5CFF]/80 text-white border border-[#7C5CFF]"
                : "bg-[#EC4899]/80 text-white border border-[#EC4899]"
            )}
          >
            {isLocation ? <MapPin className="h-3 w-3" /> : <Package className="h-3 w-3" />}
            <span>{isLocation ? "Location Set" : "Hero Prop"}</span>
          </span>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 hover:bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Delete element"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Card Info Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white group-hover:text-[#7C5CFF] transition-colors truncate">
              {element.name}
            </h3>
            <span className="text-[10px] font-mono text-[#8B8B96] bg-white/[0.04] px-1.5 py-0.5 rounded-md">
              @{element.slug}
            </span>
          </div>
          <p className="text-xs text-[#8B8B96] line-clamp-2 leading-relaxed">
            {element.description || "No specific details provided."}
          </p>
        </div>

        {/* Action Link to Studio */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
          <Link
            href={`/generate?type=video&prompt=${encodeURIComponent(`Scene at @${element.slug}: `)}`}
            className="w-full"
          >
            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-[#7C5CFF] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 group-hover:bg-[#7C5CFF]"
            >
              <Film className="h-3.5 w-3.5" />
              <span>Direct Scene With Element</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
