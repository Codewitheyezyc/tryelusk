import type { PricingModel, CostFormulaType } from "@/types/database.types";

export interface StudioModel {
  id: string;
  name: string;
  mediaType: "image" | "video" | "audio" | "lipsync";
  categoryTag: string;
  filterGroup: "recommended" | "pro" | "budget";
  minTier: "free" | "starter" | "pro" | "studio";
  baseRate: number;
  costFormulaType: CostFormulaType;
  supportedResolutions: string[];
  resolutionMultipliers: Record<string, number>;
  supportedDurations: number[];
  description: string;
  badge?: string;
}

// In-house metadata descriptors for real model endpoints (No backend provider infrastructure exposed)
const MODEL_METADATA_MAP: Record<
  string,
  {
    displayName: string;
    categoryTag: string;
    filterGroup: "recommended" | "pro" | "budget";
    minTier: "free" | "starter" | "pro" | "studio";
    description: string;
    badge?: string;
    mediaType?: "image" | "video" | "audio" | "lipsync";
    defaultDurations?: number[];
  }
> = {
  // Video Models — Pro Tier ($0.70/take)
  "kling-3.0": {
    displayName: "Kling 3.0 Cinema Pro",
    categoryTag: "Master Video Engine",
    filterGroup: "pro",
    minTier: "pro",
    description: "Industry-leading physical realism & cinematic camera tracking",
    badge: "Pro Cinema",
    mediaType: "video",
    defaultDurations: [5, 10],
  },
  "luma-ray-2": {
    displayName: "Luma Ray 2",
    categoryTag: "Fluid Motion Engine",
    filterGroup: "recommended",
    minTier: "pro",
    description: "Instant fluid motion, realistic lighting, and smooth camera drift",
    badge: "Fluid Motion",
    mediaType: "video",
    defaultDurations: [5, 9],
  },

  // Video Models — Indie Starter Tier ($0.56 - $2.31/take)
  "kling-2.5-turbo": {
    displayName: "Kling 3.0 Turbo",
    categoryTag: "Fast Motion Engine",
    filterGroup: "recommended",
    minTier: "starter",
    description: "High-speed rendering optimized for kinetic action and camera moves",
    badge: "Recommended",
    mediaType: "video",
    defaultDurations: [5, 10],
  },
  "seedance-video": {
    displayName: "Seedance 2.5 Motion",
    categoryTag: "Kinetic Video Engine",
    filterGroup: "recommended",
    minTier: "starter",
    description: "High-frame rate kinetic motion, character action, and fluid dynamics",
    badge: "30s Master",
    mediaType: "video",
    defaultDurations: [5, 10, 15, 30],
  },
  "seedance-2.5": {
    displayName: "Seedance 2.5 Motion",
    categoryTag: "Kinetic Video Engine",
    filterGroup: "recommended",
    minTier: "starter",
    description: "High-frame rate kinetic motion, character action, and fluid dynamics",
    badge: "30s Master",
    mediaType: "video",
    defaultDurations: [5, 10, 15, 30],
  },

  // Video Models — Free Tier ($0.05/take)
  "wan-2.1": {
    displayName: "Wan 2.1 Direct",
    categoryTag: "Direct Video Engine",
    filterGroup: "budget",
    minTier: "free",
    description: "Cost-efficient cinematic video rendering with realistic physics",
    badge: "Fast Render",
    mediaType: "video",
    defaultDurations: [5, 10],
  },

  // Image Models — Free Tier ($0.002 - $0.04/image)
  "nano-banana-lite": {
    displayName: "Nano Banana Lite",
    categoryTag: "Google Fast Draft",
    filterGroup: "budget",
    minTier: "free",
    description: "Instant sub-second draft frames for rapid scene testing",
    badge: "Fast Draft",
    mediaType: "image",
  },
  "seedream-v4": {
    displayName: "Seedream 5.0 Lite",
    categoryTag: "ByteDance Creative",
    filterGroup: "recommended",
    minTier: "free",
    description: "ByteDance's high-speed image generation model with rich aesthetic coherence",
    badge: "ByteDance",
    mediaType: "image",
  },
  "gpt-image-2": {
    displayName: "GPT Image 2",
    categoryTag: "OpenAI Image Engine",
    filterGroup: "recommended",
    minTier: "free",
    description: "OpenAI's latest image model with precise typographic and graphic adherence",
    badge: "OpenAI",
    mediaType: "image",
  },

  // Image Models — Indie Starter Tier ($0.04 - $0.10/image)
  "nano-banana": {
    displayName: "Nano Banana",
    categoryTag: "Google Creative Image",
    filterGroup: "recommended",
    minTier: "starter",
    description: "Google's flagship creative generation model with high prompt accuracy",
    badge: "Google",
    mediaType: "image",
  },
  "flux-dev": {
    displayName: "Flux 2 Dev",
    categoryTag: "Photoreal Cinema",
    filterGroup: "recommended",
    minTier: "starter",
    description: "Black Forest Labs photorealistic image synthesis and cinematic lighting",
    badge: "Photoreal",
    mediaType: "image",
  },
  "recraft-v3": {
    displayName: "Recraft V3 Design",
    categoryTag: "Design & Vector",
    filterGroup: "recommended",
    minTier: "starter",
    description: "Design-first image model with high-resolution vector and graphic clarity",
    badge: "Design",
    mediaType: "image",
  },

  // Image Models — Pro Tier ($0.06 - $0.20/image)
  "nano-banana-pro": {
    displayName: "Nano Banana Pro",
    categoryTag: "Google Pro Master",
    filterGroup: "pro",
    minTier: "pro",
    description: "Google's high-fidelity master tier for ultra-fine photoreal details",
    badge: "Pro Master",
    mediaType: "image",
  },
  "seedream-pro": {
    displayName: "Seedream 5.0 Pro",
    categoryTag: "ByteDance Pro Master",
    filterGroup: "pro",
    minTier: "pro",
    description: "ByteDance's deep-thinking flagship model for complex scene composition",
    badge: "Pro Flagship",
    mediaType: "image",
  },
  "flux-ultra": {
    displayName: "Flux Ultra 8K",
    categoryTag: "Ultra Photoreal Master",
    filterGroup: "pro",
    minTier: "pro",
    description: "Maximum 8K clarity, fine micro-textures, and theatrical resolution",
    badge: "Ultra 8K",
    mediaType: "image",
  },

  // Voice & Audio Models (Free Tier - $0.03/track)
  "voice-hd": {
    displayName: "Cinema Voice Master HD",
    categoryTag: "Voice & Speech Engine",
    filterGroup: "recommended",
    minTier: "free",
    description: "Multilingual high-fidelity cinematic voiceover and dramatic dialogue synthesis",
    badge: "HD Voice",
    mediaType: "audio",
    defaultDurations: [1],
  },

  // Lip-Sync Models
  "sync-lipsync-fast": {
    displayName: "Fast Motion Lip-Sync",
    categoryTag: "Kinetic Video Lip-Sync",
    filterGroup: "recommended",
    minTier: "starter",
    description: "Fast synchronized mouth and facial motion alignment for character speech",
    badge: "Fast Sync",
    mediaType: "lipsync",
    defaultDurations: [5, 10],
  },
  "sync-lipsync-pro": {
    displayName: "Sync Master Pro Lip-Sync",
    categoryTag: "Master Visual Lip-Sync",
    filterGroup: "pro",
    minTier: "pro",
    description: "Deep visual intelligence with subtle emotional micro-expressions and perfect phoneme sync",
    badge: "Pro Master Sync",
    mediaType: "lipsync",
    defaultDurations: [5, 10],
  },
};

/**
 * Transforms raw database pricing_table records into rich StudioModel descriptors for UI picker.
 */
export function mapPricingToStudioModels(pricingRows: PricingModel[]): StudioModel[] {
  return pricingRows
    .filter((row) => row.is_active)
    .map((row) => {
      const meta = MODEL_METADATA_MAP[row.model_name] || {
        displayName: row.model_name.replace(/-/g, " ").toUpperCase(),
        categoryTag: "AI Model",
        filterGroup: "recommended" as const,
        description: "High-performance generative model.",
      };

      const mediaType: "image" | "video" | "audio" | "lipsync" =
        meta.mediaType ||
        (row.model_name.includes("voice") || row.model_name.includes("audio")
          ? "audio"
          : row.model_name.includes("lipsync") || row.model_name.includes("sync")
          ? "lipsync"
          : row.cost_formula_type === "per_second"
          ? "video"
          : "image");

      const resMultipliers = (row.resolution_multipliers as Record<string, number>) || {};
      const supportedResolutions =
        mediaType === "video" || mediaType === "lipsync"
          ? ["720p", "1080p", "4k"]
          : mediaType === "audio"
          ? ["44.1kHz HD"]
          : ["1K", "2K", "4K"];

      const supportedDurations = meta.defaultDurations || (mediaType === "video" || mediaType === "lipsync" ? [5, 10, 15] : [1]);

      return {
        id: row.model_name,
        name: meta.displayName,
        mediaType,
        categoryTag: meta.categoryTag,
        filterGroup: meta.filterGroup,
        minTier: meta.minTier || "free",
        baseRate: Number(row.base_rate),
        costFormulaType: row.cost_formula_type,
        supportedResolutions,
        resolutionMultipliers: resMultipliers,
        supportedDurations,
        description: meta.description,
        badge: meta.badge,
      };
    });
}

export const mapPricingRowsToStudioModels = mapPricingToStudioModels;
