"use server";

import { createClient } from "@/lib/supabase/server";
import { refineCharacterWithDirector } from "@/lib/ai/director";
import { FalProvider } from "@/lib/ai/providers/fal";
import { deductCredits, refundCredits, getUserBalance } from "@/lib/wallet/wallet";
import type { Character } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export interface RefineCharacterResponse {
  success: boolean;
  visualSpec?: string;
  turnaroundPrompt?: string;
  suggestedModel?: string;
  reasoning?: string;
  estimatedCredits?: number;
  error?: string;
}

export interface CreateCharacterInput {
  name: string;
  description: string;
  tag?: string;
  role?: string;
  voiceId?: string;
  visualSpec?: string;
  turnaroundPrompt?: string;
  modelName?: string;
}

export interface CreateCharacterResponse {
  success: boolean;
  character?: Character;
  referenceSheetUrl?: string;
  error?: string;
}

/**
 * Step 1: Director refinement for character creation
 */
export async function refineCharacterSpecAction(
  name: string,
  description: string
): Promise<RefineCharacterResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Please sign in to create a character." };
    }

    if (!name.trim()) {
      return { success: false, error: "Character name is required." };
    }

    if (!description.trim()) {
      return { success: false, error: "Character description is required." };
    }

    const refinement = await refineCharacterWithDirector(name, description);

    return {
      success: true,
      visualSpec: refinement.visualSpec,
      turnaroundPrompt: refinement.turnaroundPrompt,
      suggestedModel: refinement.suggestedModel,
      reasoning: refinement.reasoning,
      estimatedCredits: 6, // Nano Banana reference sheet flat cost
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to refine character visual spec." };
  }
}

/**
 * Step 2: Generate locked reference sheet and save character profile
 */
export async function createCharacterAction(
  input: CreateCharacterInput
): Promise<CreateCharacterResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Please sign in to create a character." };
  }

  const name = input.name.trim();
  const description = input.description.trim();
  const modelName = input.modelName || "nano-banana";
  const tag = input.tag || `@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  const voiceId = input.voiceId || "Rachel";
  const role = input.role || "Lead Actor";
  const cost = 6; // Standard image generation rate for Nano Banana reference sheet

  if (!name || !description) {
    return { success: false, error: "Name and description are required." };
  }

  // 1. Check user credit balance
  const currentBalance = await getUserBalance(user.id);
  if (currentBalance < cost) {
    return {
      success: false,
      error: `Insufficient credits. Character reference sheet requires ${cost} credits, but your balance is ${currentBalance}.`,
    };
  }

  // 2. Prepare Directorial prompt
  let turnaroundPrompt = input.turnaroundPrompt;
  let visualSpec = input.visualSpec;

  if (!turnaroundPrompt || !visualSpec) {
    const ref = await refineCharacterWithDirector(name, description);
    turnaroundPrompt = ref.turnaroundPrompt;
    visualSpec = ref.visualSpec;
  }

  // Store metadata JSON payload
  const metadataPayload = JSON.stringify({
    tag,
    role,
    voice_id: voiceId,
    visual_spec: visualSpec,
  });

  const jobId = `job_char_sheet_${Date.now()}`;

  // 3. Deduct credits upfront
  const deduction = await deductCredits(user.id, cost, modelName, jobId);
  if (!deduction.success) {
    return { success: false, error: deduction.error || "Failed to reserve credits." };
  }

  // 4. Create initial generation record (status: processing)
  const { data: initialGen, error: genInsertErr } = await (supabase.from("generations") as any)
    .insert({
      user_id: user.id,
      type: "character",
      model_used: modelName,
      prompt: turnaroundPrompt,
      status: "processing",
      credits_charged: cost,
      job_id: jobId,
      aspect_ratio: "16:9",
      num_outputs: 1,
      technical_params: {
        character_name: name,
        tag,
        voice_id: voiceId,
        visual_spec: visualSpec,
        is_reference_sheet: true,
      },
    })
    .select()
    .single();

  if (genInsertErr || !initialGen) {
    await refundCredits(user.id, cost, jobId, modelName);
    return { success: false, error: "Failed to initialize character generation." };
  }

  // 5. Generate 3-panel locked reference sheet via FalProvider
  try {
    const falProvider = new FalProvider();
    const result = await falProvider.generateImage({
      prompt: turnaroundPrompt,
      modelName,
      aspectRatio: "16:9",
      numOutputs: 1,
    });

    const referenceSheetUrl = result.imageUrl;

    if (!referenceSheetUrl) {
      throw new Error("No image output returned from character reference engine.");
    }

    // 6. Create Character record in database
    const { data: newCharacter, error: charErr } = await (supabase.from("characters") as any)
      .insert({
        user_id: user.id,
        name,
        description,
        visual_spec: metadataPayload,
        reference_sheet_url: referenceSheetUrl,
        reference_sheet_generation_id: initialGen.id,
        status: "ready",
      })
      .select()
      .single();

    if (charErr || !newCharacter) {
      throw new Error(charErr?.message || "Failed to save character profile.");
    }

    // 7. Update generation row to completed with character_id link
    await (supabase.from("generations") as any)
      .update({
        status: "completed",
        output_url: referenceSheetUrl,
        output_urls: [referenceSheetUrl],
        character_id: newCharacter.id,
        completed_at: new Date().toISOString(),
      })
      .eq("id", initialGen.id);

    revalidatePath("/media");
    revalidatePath("/generate");
    revalidatePath("/storyboard");

    return {
      success: true,
      character: newCharacter as Character,
      referenceSheetUrl,
    };
  } catch (err: any) {
    // Automatic Atomic Refund on Provider Failure
    await refundCredits(user.id, cost, jobId, modelName);

    await (supabase.from("generations") as any)
      .update({
        status: "failed",
        error_message: err?.message || "Character generation failed.",
        completed_at: new Date().toISOString(),
      })
      .eq("id", initialGen.id);

    return {
      success: false,
      error: err?.message || "Character creation failed. Credits have been refunded.",
    };
  }
}

/**
 * Update existing character DNA
 */
export async function updateCharacterAction(
  characterId: string,
  data: { name?: string; description?: string; voiceId?: string; role?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: existing } = await (supabase.from("characters") as any)
      .select("*")
      .eq("id", characterId)
      .eq("user_id", user.id)
      .single();

    if (!existing) return { success: false, error: "Character not found" };

    let parsedMeta: any = {};
    try {
      parsedMeta = JSON.parse(existing.visual_spec || "{}");
    } catch {
      parsedMeta = { visual_spec: existing.visual_spec };
    }

    const updatedMeta = {
      ...parsedMeta,
      ...(data.voiceId ? { voice_id: data.voiceId } : {}),
      ...(data.role ? { role: data.role } : {}),
    };

    await (supabase.from("characters") as any)
      .update({
        ...(data.name ? { name: data.name } : {}),
        ...(data.description ? { description: data.description } : {}),
        visual_spec: JSON.stringify(updatedMeta),
      })
      .eq("id", characterId)
      .eq("user_id", user.id);

    revalidatePath("/media");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update character" };
  }
}

/**
 * Fetch all characters for the authenticated user
 */
export async function getCharactersAction(): Promise<Character[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await (supabase.from("characters") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Character[];
}

/**
 * Delete a character profile
 */
export async function deleteCharacterAction(characterId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await (supabase.from("characters") as any)
    .delete()
    .eq("id", characterId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/media");
  revalidatePath("/generate");
  revalidatePath("/storyboard");
  return { success: true };
}
