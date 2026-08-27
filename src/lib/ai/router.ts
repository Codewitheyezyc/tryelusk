import { createClient } from "@/lib/supabase/server";
import { FalProvider } from "./providers/fal";
import { SegmindProvider } from "./providers/segmind";
import { WaveSpeedProvider } from "./providers/wavespeed";
import type {
  ImageGenerationOptions,
  VideoGenerationOptions,
  ProviderImageResult,
  ProviderVideoResult,
  AIProviderAdapter,
} from "./providers/types";
import type { AIProvider } from "@/types/database.types";

const falProvider = new FalProvider();

// Inactive for v1 — fal.ai only. Re-enable when adding multi-provider routing.
const segmindProvider = new SegmindProvider();
const waveSpeedProvider = new WaveSpeedProvider();

/**
 * Route image generation request to the active provider based on pricing_table configuration.
 */
export async function routeImageGeneration(
  options: ImageGenerationOptions
): Promise<ProviderImageResult> {
  const supabase = await createClient();

  // 1. Look up provider routing and is_active flag from pricing_table
  const { data: pricing } = await (supabase.from("pricing_table") as any)
    .select("provider, base_rate, is_active")
    .eq("model_name", options.modelName)
    .single();

  const pricingRow = pricing as unknown as { provider?: AIProvider; is_active?: boolean } | null;

  // Only route to provider if explicitly active in pricing_table; otherwise default to fal.ai
  let providerType: AIProvider = "fal";
  if (pricingRow?.is_active && pricingRow.provider) {
    providerType = pricingRow.provider;
  }

  let providerAdapter: AIProviderAdapter;
  switch (providerType) {
    case "segmind":
      // Inactive for v1 — fal.ai only.
      providerAdapter = pricingRow?.is_active ? segmindProvider : falProvider;
      break;
    case "wavespeed":
      // Inactive for v1 — fal.ai only.
      providerAdapter = pricingRow?.is_active ? waveSpeedProvider : falProvider;
      break;
    case "fal":
    default:
      providerAdapter = falProvider;
      break;
  }

  return await providerAdapter.generateImage(options);
}

/**
 * Route video generation request to the active provider (fal.ai for v1).
 */
export async function routeVideoGeneration(
  options: VideoGenerationOptions
): Promise<ProviderVideoResult> {
  const supabase = await createClient();

  const { data: pricing } = await (supabase.from("pricing_table") as any)
    .select("provider, base_rate, is_active")
    .eq("model_name", options.modelName)
    .single();

  const pricingRow = pricing as unknown as { provider?: AIProvider; is_active?: boolean } | null;

  // All v1 video models are served via falProvider
  if (!falProvider.generateVideo) {
    throw new Error("Video generation is not supported on this provider.");
  }

  return await falProvider.generateVideo(options);
}
