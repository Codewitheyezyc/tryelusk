"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deductCredits, refundCredits, getUserBalance } from "@/lib/wallet/wallet";
import { FalProvider } from "@/lib/ai/providers/fal";
import { uploadVideoToStorage } from "@/lib/ai/storage";
import type { Generation } from "@/types/database.types";

export interface GenerateAudioInput {
  prompt: string;
  voiceId?: string;
  characterId?: string;
  modelName?: string;
}

export interface GenerateAudioResponse {
  success: boolean;
  generation?: Generation;
  audioUrl?: string;
  error?: string;
  refunded?: boolean;
  newBalance?: number;
}

export interface GenerateLipSyncInput {
  videoUrl: string;
  audioUrl: string;
  modelName?: string;
  durationSeconds?: number;
  characterId?: string;
  promptDescription?: string;
}

export interface GenerateLipSyncResponse {
  success: boolean;
  generation?: Generation;
  videoUrl?: string;
  error?: string;
  refunded?: boolean;
  newBalance?: number;
}

/**
 * Generate Voice / Speech Audio Track (Section 3 & 7)
 */
export async function generateAudioAction(
  input: GenerateAudioInput
): Promise<GenerateAudioResponse> {
  const prompt = input.prompt?.trim();
  const voiceId = input.voiceId || "Rachel";
  const modelName = input.modelName || "voice-hd";
  const cost = 4; // Flat 4 credits for Voice Master HD

  if (!prompt) {
    return { success: false, error: "Please enter speech dialogue text." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to generate voice tracks." };
  }

  // 1. Check Balance
  const currentBalance = await getUserBalance(user.id);
  if (currentBalance < cost) {
    return {
      success: false,
      error: `Insufficient balance. Voice synthesis requires ${cost} credits, your balance is ${currentBalance}.`,
    };
  }

  const jobId = `job_audio_${Date.now()}`;

  // 2. Deduct credits upfront
  const deductResult = await deductCredits(user.id, cost, modelName, jobId);
  if (!deductResult.success) {
    return { success: false, error: deductResult.error || "Credit deduction failed." };
  }

  // 3. Create 'processing' generation row
  const { data: initialGen, error: insertErr } = await (supabase.from("generations") as any)
    .insert({
      user_id: user.id,
      type: "audio",
      model_used: modelName,
      prompt: `[Voice: ${voiceId}] ${prompt}`,
      status: "processing",
      credits_charged: cost,
      job_id: jobId,
      character_id: input.characterId || null,
      technical_params: {
        voice_id: voiceId,
        script_text: prompt,
        media_type: "audio",
      },
    })
    .select()
    .single();

  if (insertErr || !initialGen) {
    await refundCredits(user.id, cost, jobId, modelName);
    return { success: false, error: "Failed to initialize audio job." };
  }

  // 4. Dispatch to FalProvider
  try {
    const falProvider = new FalProvider();
    const result = await falProvider.generateAudio({
      prompt,
      voiceId,
      modelName,
    });

    const audioUrl = result.audioUrl;

    // 5. Update generation row to completed
    const { data: completedGen } = await (supabase.from("generations") as any)
      .update({
        status: "completed",
        output_url: audioUrl,
        output_urls: [audioUrl],
        completed_at: new Date().toISOString(),
      })
      .eq("id", initialGen.id)
      .select()
      .single();

    const newBalance = await getUserBalance(user.id);
    revalidatePath("/media");
    revalidatePath("/generate");

    return {
      success: true,
      generation: completedGen as Generation,
      audioUrl,
      newBalance,
    };
  } catch (err: any) {
    // Auto-Refund on failure
    await refundCredits(user.id, cost, jobId, modelName);

    await (supabase.from("generations") as any)
      .update({
        status: "failed",
        error_message: err?.message || "Voice generation error",
        completed_at: new Date().toISOString(),
      })
      .eq("id", initialGen.id);

    const newBalance = await getUserBalance(user.id);
    return {
      success: false,
      error: err?.message || "Voice generation failed. Credits refunded.",
      refunded: true,
      newBalance,
    };
  }
}

/**
 * Dedicated Lip-Sync Pass (Section 3 Guardrail)
 */
export async function generateLipSyncAction(
  input: GenerateLipSyncInput
): Promise<GenerateLipSyncResponse> {
  const { videoUrl, audioUrl } = input;
  const modelName = input.modelName || "sync-lipsync-fast";
  const durationSeconds = input.durationSeconds || 5;

  if (!videoUrl || !audioUrl) {
    return { success: false, error: "Both video take and audio dialogue track are required for lip-sync." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to direct lip-sync." };
  }

  // Cost calculation: fast = 1 cr/s (5s = 5 cr), pro = 18 cr/s (5s = 90 cr)
  const ratePerSec = modelName === "sync-lipsync-pro" ? 18 : 1;
  const cost = ratePerSec * durationSeconds;

  // 1. Check Balance
  const currentBalance = await getUserBalance(user.id);
  if (currentBalance < cost) {
    return {
      success: false,
      error: `Insufficient balance. Lip-sync (${durationSeconds}s) requires ${cost} credits, your balance is ${currentBalance}.`,
    };
  }

  const jobId = `job_lipsync_${Date.now()}`;

  // 2. Deduct credits
  const deductResult = await deductCredits(user.id, cost, modelName, jobId);
  if (!deductResult.success) {
    return { success: false, error: deductResult.error || "Credit deduction failed." };
  }

  // 3. Create 'processing' row
  const promptSummary = input.promptDescription || `Synchronized Lip-Sync Pass (${durationSeconds}s)`;
  const { data: initialGen, error: insertErr } = await (supabase.from("generations") as any)
    .insert({
      user_id: user.id,
      type: "video",
      model_used: modelName,
      prompt: `[Lip-Synced Take] ${promptSummary}`,
      status: "processing",
      credits_charged: cost,
      duration_seconds: durationSeconds,
      job_id: jobId,
      character_id: input.characterId || null,
      technical_params: {
        is_lipsync: true,
        source_video_url: videoUrl,
        source_audio_url: audioUrl,
      },
    })
    .select()
    .single();

  if (insertErr || !initialGen) {
    await refundCredits(user.id, cost, jobId, modelName);
    return { success: false, error: "Failed to initialize lip-sync job." };
  }

  // 4. Dispatch to FalProvider
  try {
    const falProvider = new FalProvider();
    const result = await falProvider.generateLipSync({
      videoUrl,
      audioUrl,
      modelName,
      durationSeconds,
    });

    let finalVideoUrl = result.videoUrl;

    // Upload to Supabase Storage
    try {
      finalVideoUrl = await uploadVideoToStorage(user.id, result.videoUrl, "lipsync_take");
    } catch {
      // Keep CDN URL if storage fails
    }

    // 5. Update generation row to completed
    const { data: completedGen } = await (supabase.from("generations") as any)
      .update({
        status: "completed",
        output_url: finalVideoUrl,
        output_urls: [finalVideoUrl],
        completed_at: new Date().toISOString(),
      })
      .eq("id", initialGen.id)
      .select()
      .single();

    const newBalance = await getUserBalance(user.id);
    revalidatePath("/media");
    revalidatePath("/generate");

    return {
      success: true,
      generation: completedGen as Generation,
      videoUrl: finalVideoUrl,
      newBalance,
    };
  } catch (err: any) {
    // Auto-Refund on failure
    await refundCredits(user.id, cost, jobId, modelName);

    await (supabase.from("generations") as any)
      .update({
        status: "failed",
        error_message: err?.message || "Lip-sync generation error",
        completed_at: new Date().toISOString(),
      })
      .eq("id", initialGen.id);

    const newBalance = await getUserBalance(user.id);
    return {
      success: false,
      error: err?.message || "Lip-sync failed. Credits refunded.",
      refunded: true,
      newBalance,
    };
  }
}
