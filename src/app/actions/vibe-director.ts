"use server";

import { createClient } from "@/lib/supabase/server";
import {
  planVibeDirectorSequence,
  type VibeDirectorPlan,
  type VibeProductionStep,
} from "@/lib/ai/director";
import { generateMediaAction } from "@/app/actions/generation";
import { generateAudioAction, generateLipSyncAction } from "@/app/actions/audio";
import { createCharacterAction, getCharactersAction } from "@/app/actions/character";
import { getUserBalance } from "@/lib/wallet/wallet";
import type { Generation, Character } from "@/types/database.types";
import { revalidatePath } from "next/cache";

import {
  createLocationAction,
  createPropAction,
  getAllProductionElementsAction,
} from "@/app/actions/elements";

export interface UserPlanStatus {
  tier: "free" | "starter" | "pro" | "studio";
  isProUnlocked: boolean;
  creditBalance: number;
}

export async function getUserPlanStatusAction(): Promise<UserPlanStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { tier: "free", isProUnlocked: false, creditBalance: 0 };
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("tier, is_admin, credit_balance")
    .eq("id", user.id)
    .single();

  let tier = (profile?.tier || "starter") as "free" | "starter" | "pro" | "studio";
  let isAdmin = Boolean(profile?.is_admin);

  // Grant developer/owner account full unrestricted Pro access
  if (process.env.NODE_ENV === "development" || isAdmin) {
    tier = "pro";
    isAdmin = true;
  }

  const isProUnlocked = isAdmin || tier === "pro" || tier === "studio";

  return {
    tier,
    isProUnlocked,
    creditBalance: profile?.credit_balance || 0,
  };
}

export interface PlanVibeDirectorParams {
  goal?: string;
  mode?: "manual" | "agent";
  inputType?: "brief" | "script";
  scriptText?: string;
  manualSettings?: {
    videoModel?: string;
    imageModel?: string;
    aspectRatio?: string;
    resolution?: string;
    durationSeconds?: number;
    opticsStyle?: string;
  };
}

/**
 * Plan Production Sequence (Gated to Pro / Studio Tier)
 */
export async function planVibeDirectorSequenceAction(
  paramsOrGoal: string | PlanVibeDirectorParams
): Promise<{
  success: boolean;
  plan?: VibeDirectorPlan;
  isProGated?: boolean;
  error?: string;
}> {
  const params: PlanVibeDirectorParams =
    typeof paramsOrGoal === "string"
      ? { goal: paramsOrGoal, mode: "agent", inputType: "brief" }
      : paramsOrGoal;

  const cleanGoal = (params.goal || params.scriptText || "").trim();
  if (!cleanGoal) {
    return { success: false, error: "Please provide a filmmaking brief or screenplay script." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to access Vibe Director." };
  }

  // 1. Pro-Tier Gating Check
  const planStatus = await getUserPlanStatusAction();
  if (!planStatus.isProUnlocked) {
    return {
      success: false,
      isProGated: true,
      error: "Vibe Director mode is an autonomous AI agent feature available exclusively on Pro and Studio plans.",
    };
  }

  // 2. Fetch user's existing elements (Cast, Sets, Props)
  const elements = await getAllProductionElementsAction();
  const elementsContext = {
    characters: elements.characters.map((c) => ({ name: c.name, id: c.id })),
    locations: elements.locations.map((l) => ({ name: l.name, id: l.id })),
    props: elements.props.map((p) => ({ name: p.name, id: p.id })),
  };

  // 3. Plan Sequence with Claude Orchestrator
  const plan = await planVibeDirectorSequence({
    goal: params.goal || "",
    mode: params.mode || "agent",
    inputType: params.inputType || "brief",
    scriptText: params.scriptText,
    manualSettings: params.manualSettings,
    existingElements: elementsContext,
  });

  return {
    success: true,
    plan,
  };
}

/**
 * Execute a Single Step in the Autonomous Production Sequence
 */
export async function executeVibeDirectorStepAction(
  step: VibeProductionStep,
  context: {
    characterId?: string;
    characterName?: string;
    characterSpec?: string;
    lastVideoUrl?: string;
    lastAudioUrl?: string;
  } = {}
): Promise<{
  success: boolean;
  outputUrl?: string;
  generation?: Generation;
  character?: Character;
  error?: string;
  newBalance?: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  // 1. Pro Gating Check
  const planStatus = await getUserPlanStatusAction();
  if (!planStatus.isProUnlocked) {
    return {
      success: false,
      error: "Pro tier subscription required for autonomous execution.",
    };
  }

  // 2. Route step execution to existing pipeline
  try {
    if (step.type === "character") {
      const charName = step.params.name || "Main Character";
      const charDesc = step.params.description || step.title;

      const charRes = await createCharacterAction({
        name: charName,
        description: charDesc,
        modelName: "nano-banana",
      });

      if (!charRes.success || !charRes.character) {
        return { success: false, error: charRes.error || "Character creation step failed." };
      }

      const balance = await getUserBalance(user.id);
      revalidatePath("/media");
      return {
        success: true,
        outputUrl: charRes.referenceSheetUrl || charRes.character.reference_sheet_url || "",
        character: charRes.character,
        newBalance: balance,
      };
    }

    if (step.type === "location") {
      const locName = step.params.name || "Scene Location";
      const locDesc = step.params.description || step.title;

      const locRes = await createLocationAction({
        name: locName,
        description: locDesc,
        atmosphere: step.params.atmosphere,
      });

      if (!locRes.success || !locRes.element) {
        return { success: false, error: locRes.error || "Location creation step failed." };
      }

      const balance = await getUserBalance(user.id);
      revalidatePath("/media");
      return {
        success: true,
        outputUrl: locRes.element.reference_image_url || "",
        newBalance: balance,
      };
    }

    if (step.type === "prop") {
      const propName = step.params.name || "Hero Prop";
      const propDesc = step.params.description || step.title;

      const propRes = await createPropAction({
        name: propName,
        description: propDesc,
        material: step.params.material,
      });

      if (!propRes.success || !propRes.element) {
        return { success: false, error: propRes.error || "Prop creation step failed." };
      }

      const balance = await getUserBalance(user.id);
      revalidatePath("/media");
      return {
        success: true,
        outputUrl: propRes.element.reference_image_url || "",
        newBalance: balance,
      };
    }

    if (step.type === "image" || step.type === "video") {
      const isVideo = step.type === "video";
      const prompt = step.params.prompt || step.title;

      const genRes = await generateMediaAction({
        prompt,
        mediaType: isVideo ? "video" : "image",
        modelName: step.params.modelName || (isVideo ? "kling-2.5-turbo" : "nano-banana"),
        durationSeconds: step.params.durationSeconds || 5,
        aspectRatio: step.params.aspectRatio || "16:9",
        characterId: context.characterId,
      });

      if (!genRes.success || !genRes.generation) {
        return { success: false, error: genRes.error || "Media generation step failed." };
      }

      const outputUrl =
        (Array.isArray(genRes.generation.output_urls) && genRes.generation.output_urls.length > 0
          ? String(genRes.generation.output_urls[0])
          : genRes.generation.output_url) || "";

      revalidatePath("/media");
      return {
        success: true,
        outputUrl,
        generation: genRes.generation,
        newBalance: genRes.newBalance,
      };
    }

    if (step.type === "audio") {
      const prompt = step.params.prompt || step.title;
      const voiceId = step.params.voiceId || "Rachel";

      const audioRes = await generateAudioAction({
        prompt,
        voiceId,
        characterId: context.characterId,
      });

      if (!audioRes.success || !audioRes.generation) {
        return { success: false, error: audioRes.error || "Audio synthesis step failed." };
      }

      revalidatePath("/media");
      return {
        success: true,
        outputUrl: audioRes.audioUrl,
        generation: audioRes.generation,
        newBalance: audioRes.newBalance,
      };
    }

    if (step.type === "lipsync") {
      const videoUrl = step.params.videoUrl || context.lastVideoUrl;
      const audioUrl = step.params.audioUrl || context.lastAudioUrl;

      if (!videoUrl || !audioUrl) {
        return { success: false, error: "Lip-sync step requires prior video and audio outputs." };
      }

      const lipRes = await generateLipSyncAction({
        videoUrl,
        audioUrl,
        modelName: "sync-lipsync-fast",
        durationSeconds: step.params.durationSeconds || 5,
        characterId: context.characterId,
      });

      if (!lipRes.success || !lipRes.generation) {
        return { success: false, error: lipRes.error || "Lip-sync step failed." };
      }

      revalidatePath("/media");
      return {
        success: true,
        outputUrl: lipRes.videoUrl,
        generation: lipRes.generation,
        newBalance: lipRes.newBalance,
      };
    }

    return { success: false, error: `Unknown step type: ${step.type}` };
  } catch (err: any) {
    return { success: false, error: err?.message || "Step execution error." };
  }
}

/**
 * 1-Click Upgrade to Pro (Testing & Demo)
 */
export async function upgradeToProAction(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { error } = await (supabase.from("profiles") as any)
    .update({ tier: "pro", credit_balance: 100 })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/vibe-director");
  revalidatePath("/dashboard");
  return { success: true };
}
