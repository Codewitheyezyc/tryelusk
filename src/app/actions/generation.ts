"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deductCredits, refundCredits, getUserBalance } from "@/lib/wallet/wallet";
import { refinePromptWithDirector, type DirectorResult } from "@/lib/ai/director";
import { routeImageGeneration, routeVideoGeneration } from "@/lib/ai/router";
import { uploadImageToStorage, uploadVideoToStorage } from "@/lib/ai/storage";
import { calculateGenerationCost } from "@/lib/wallet/pricing";
import type { Generation, MediaType } from "@/types/database.types";

export interface GenerationRequestParams {
  prompt: string;
  mediaType?: MediaType;
  modelName?: string;
  durationSeconds?: number;
  resolution?: string;
  aspectRatio?: string;
  numOutputs?: number;
  characterId?: string;
  imageUrl?: string;
  sequelContext?: string;
  adjustment?: string;
  bypassDirector?: boolean;
  folderId?: string | null;
  projectId?: string | null;
  manualOverrides?: {
    lens?: string;
    lighting?: string;
    colorPalette?: string;
    cameraMovement?: string;
  };
}

export interface GenerationResponse {
  success: boolean;
  generation?: Generation;
  directorResult?: DirectorResult;
  error?: string;
  refunded?: boolean;
  partialRefundAmount?: number;
  newBalance?: number;
}

export async function generateMediaAction(
  params: GenerationRequestParams | string,
  modelNameArg = "nano-banana"
): Promise<GenerationResponse> {
  // Normalize params
  const prompt = typeof params === "string" ? params : params.prompt;
  const mediaType: MediaType = typeof params === "object" && params.mediaType ? params.mediaType : "image";
  const modelName =
    typeof params === "string"
      ? modelNameArg
      : params.modelName || (mediaType === "video" ? "seedance-video" : "nano-banana-lite");
  const durationSeconds = typeof params === "object" && params.durationSeconds ? params.durationSeconds : (mediaType === "video" ? 5 : 1);
  const resolution = typeof params === "object" && params.resolution ? params.resolution : (mediaType === "video" ? "720p" : "1:1");
  const aspectRatio = typeof params === "object" && params.aspectRatio ? params.aspectRatio : "16:9";
  const numOutputs = typeof params === "object" && params.numOutputs ? Math.max(1, Math.min(4, params.numOutputs)) : 1;
  const characterId = typeof params === "object" ? params.characterId : undefined;
  const imageUrl = typeof params === "object" ? params.imageUrl : undefined;
  const sequelContext = typeof params === "object" ? params.sequelContext : undefined;
  const adjustment = typeof params === "object" ? params.adjustment : undefined;
  const bypassDirector = typeof params === "object" ? params.bypassDirector : undefined;
  const folderId = typeof params === "object" ? params.folderId : undefined;
  const projectId = typeof params === "object" ? params.projectId : undefined;
  const manualOverrides = typeof params === "object" ? params.manualOverrides : undefined;

  if (!prompt || prompt.trim().length === 0) {
    return { success: false, error: "Please provide a scene description prompt." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to generate media." };
  }

  // Check user tier & permissions (chydexxzy2002@gmail.com is permanent Pro owner)
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("tier, is_admin")
    .eq("id", user.id)
    .single();

  const isOwner = user.email === "chydexxzy2002@gmail.com";
  const isAdmin = isOwner || Boolean(profile?.is_admin);
  const userTier = isOwner ? "pro" : ((profile?.tier || "free") as "free" | "starter" | "pro" | "studio");

  const TIER_HIERARCHY: Record<string, number> = {
    free: 0,
    starter: 1,
    pro: 2,
    studio: 3,
  };

  const MODEL_TIER_REQUIREMENT: Record<string, "free" | "starter" | "pro" | "studio"> = {
    // Pro Tier ($0.15 - $0.70)
    "kling-3.0": "pro",
    "Kling 3.0 Cinema Pro": "pro",
    "nano-banana-pro": "pro",
    "seedream-pro": "pro",
    "flux-ultra": "pro",
    "luma-ray-2": "pro",
    "sync-lipsync-pro": "pro",

    // Indie Starter Tier ($0.04 - $0.56)
    "flux-dev": "starter",
    "nano-banana": "starter",
    "recraft-v3": "starter",
    "kling-2.5-turbo": "starter",
    "Kling 3.0 Turbo": "starter",
    "seedance-video": "starter",
    "seedance-2.5": "starter",
    "sync-lipsync-fast": "starter",

    // Free Tier ($0.002 - $0.05)
    "nano-banana-lite": "free",
    "seedream-v4": "free",
    "gpt-image-2": "free",
    "wan-2.1": "free",
    "Wan 2.1 Direct": "free",
    "voice-hd": "free",
  };

  const requiredTier = MODEL_TIER_REQUIREMENT[modelName] || "free";
  const userLevel = TIER_HIERARCHY[userTier] ?? 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier] ?? 0;

  if (!isAdmin && userLevel < requiredLevel) {
    const tierName = requiredTier === "pro" ? "Studio PRO" : "Indie Filmmaker";
    return {
      success: false,
      error: `The "${modelName}" engine requires an active ${tierName} plan. Upgrade your subscription to direct with this model.`,
    };
  }

  // 4K Resolution Gating (Studio PRO / Admin only)
  if (!isAdmin && (resolution === "4k" || resolution === "4K") && userLevel < 2) {
    return {
      success: false,
      error: "4K UHD Master resolution requires a Studio PRO plan. Please select 1080p HD or upgrade.",
    };
  }

  // 1. Fetch Character Visual DNA if character is selected
  let characterSpec: string | undefined;
  let characterName: string | undefined;
  let characterRefUrl: string | undefined;
  if (characterId) {
    const { data: charData } = await (supabase.from("characters") as any)
      .select("name, visual_spec, description, reference_sheet_url")
      .eq("id", characterId)
      .single();
    if (charData) {
      characterSpec = charData.visual_spec || charData.description;
      characterName = charData.name;
      characterRefUrl = charData.reference_sheet_url || undefined;
    }
  }

  // 2. Fetch Project World Context if assigned to a project
  let projectWorldContext: string | undefined;
  if (projectId) {
    const { data: projData } = await (supabase.from("projects") as any)
      .select("name, description")
      .eq("id", projectId)
      .single();
    if (projData) {
      projectWorldContext = `Film Project: "${projData.name}". ${projData.description || ""}`;
    }
  }

  // 3. Route Prompt Through Claude 'Director' Intelligence Layer (with locked Character DNA & World tokens)
  const directorResult = await refinePromptWithDirector({
    prompt: prompt.trim(),
    mediaType,
    durationSeconds,
    resolution,
    adjustment,
    bypassDirector,
    characterSpec,
    characterName,
    projectWorldContext,
    sequelContext,
    referenceImageUrl: imageUrl || characterRefUrl,
    manualOverrides,
  });

  // 2. Fetch Pricing Configuration & Calculate Per-Take Costs
  const { data: pricing } = await (supabase.from("pricing_table") as any)
    .select("base_rate, cost_formula_type, resolution_multipliers, is_active")
    .eq("model_name", modelName)
    .single();

  const costBreakdown = calculateGenerationCost(
    {
      mediaType,
      modelName,
      durationSeconds,
      resolution,
      anthropicCostCredits: directorResult.anthropicCostCredits,
    },
    pricing
  );

  const singleCost = costBreakdown.totalCredits;
  const totalChargedCredits = singleCost * numOutputs;
  const tempJobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 3. Upfront Credit Deduction for the Entire Batch (Atomic Transaction)
  const deductResult = await deductCredits(
    user.id,
    totalChargedCredits,
    modelName,
    tempJobId
  );

  if (!deductResult.success) {
    return {
      success: false,
      error: deductResult.error || `Insufficient balance. Required: ${totalChargedCredits} credits for ${numOutputs} takes.`,
      directorResult,
    };
  }

  // 4. Create 'processing' row in generations table
  const { data: genRow } = await (supabase.from("generations") as any)
    .insert({
      user_id: user.id,
      type: mediaType,
      model_used: modelName,
      prompt: prompt.trim(),
      status: "processing",
      credits_charged: totalChargedCredits,
      anthropic_cost: costBreakdown.anthropicCostCredits,
      provider_cost: costBreakdown.providerCostCredits * numOutputs,
      duration_seconds: durationSeconds,
      resolution,
      aspect_ratio: aspectRatio,
      num_outputs: numOutputs,
      character_id: characterId || null,
      technical_params: {
        lens: directorResult.lens,
        lighting: directorResult.lighting,
        color_palette: directorResult.colorPalette,
        camera_movement: directorResult.cameraMovement,
        shot_type: directorResult.shotType,
        aspect_ratio: aspectRatio,
        num_outputs: numOutputs,
        character_id: characterId || null,
        folder_id: folderId || null,
        project_id: projectId || null,
        reasoning: directorResult.reasoning,
        refined_prompt: directorResult.refinedPrompt,
        adjustment_applied: directorResult.adjustmentApplied,
      },
      job_id: tempJobId,
    })
    .select()
    .single();

  const createdRow = genRow as unknown as { id: string } | null;
  const generationId = createdRow?.id;

  try {
    let outputStorageUrls: string[] = [];
    let providerJobId = tempJobId;

    if (mediaType === "video") {
      // 5a. Video Generation Dispatch
      const videoResult = await routeVideoGeneration({
        prompt: directorResult.refinedPrompt,
        modelName,
        durationSeconds,
        resolution,
        aspectRatio,
        numOutputs,
        cameraMovement: directorResult.cameraMovement,
        imageUrl: imageUrl || characterRefUrl,
      });

      providerJobId = videoResult.jobId || tempJobId;
      const rawUrls = videoResult.outputUrls || [videoResult.videoUrl];

      // Upload each generated video to Supabase Storage
      for (const vUrl of rawUrls) {
        try {
          const storedUrl = await uploadVideoToStorage(
            user.id,
            vUrl,
            modelName.replace(/[^a-zA-Z0-9]/g, "_")
          );
          outputStorageUrls.push(storedUrl);
        } catch {
          outputStorageUrls.push(vUrl);
        }
      }
    } else {
      // 5b. Image Generation Dispatch
      const imageResult = await routeImageGeneration({
        prompt: directorResult.refinedPrompt,
        modelName,
        aspectRatio,
        numOutputs,
        imageUrl: imageUrl || characterRefUrl,
      });

      providerJobId = imageResult.jobId || tempJobId;
      const rawUrls = imageResult.outputUrls || [imageResult.imageUrl || ""];

      for (const imgUrl of rawUrls) {
        if (!imgUrl) continue;
        try {
          const storedUrl = await uploadImageToStorage(
            user.id,
            { imageUrl: imgUrl },
            modelName.replace(/[^a-zA-Z0-9]/g, "_")
          );
          outputStorageUrls.push(storedUrl);
        } catch {
          outputStorageUrls.push(imgUrl);
        }
      }
    }

    // 6. Handle Partial or Complete Success
    const succeededCount = outputStorageUrls.length;
    const failedCount = numOutputs - succeededCount;
    let partialRefundCredits = 0;

    if (failedCount > 0) {
      // Partial failure refund for the missing takes
      partialRefundCredits = failedCount * singleCost;
      await refundCredits(user.id, partialRefundCredits, tempJobId, modelName);
    }

    const { data: completedGen } = await (supabase.from("generations") as any)
      .update({
        status: "completed",
        output_url: outputStorageUrls[0] || null,
        output_urls: outputStorageUrls,
        num_outputs: succeededCount,
        job_id: providerJobId,
        completed_at: new Date().toISOString(),
      })
      .eq("id", generationId)
      .select()
      .single();

    const currentBalance = await getUserBalance(user.id);
    revalidatePath("/dashboard");
    revalidatePath("/generate");

    return {
      success: true,
      generation: completedGen as unknown as Generation,
      directorResult,
      partialRefundAmount: partialRefundCredits > 0 ? partialRefundCredits : undefined,
      newBalance: currentBalance,
    };
  } catch (err: any) {
    console.error("[generateMediaAction error]:", err);
    const errorMessage = err?.message || "Generation could not complete.";

    // 7. Full Failure Recovery: 100% refund
    const refundResult = await refundCredits(
      user.id,
      totalChargedCredits,
      tempJobId,
      modelName
    );

    if (generationId) {
      await (supabase.from("generations") as any)
        .update({
          status: "failed",
          error_message: errorMessage,
        })
        .eq("id", generationId);
    }

    const currentBalance = await getUserBalance(user.id);
    revalidatePath("/dashboard");
    revalidatePath("/generate");

    return {
      success: false,
      error: errorMessage,
      refunded: refundResult.success,
      directorResult,
      newBalance: currentBalance,
    };
  }
}

// Backward compatibility alias for existing image callers
export const generateImageAction = generateMediaAction;
