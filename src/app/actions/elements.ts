"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateMediaAction } from "@/app/actions/generation";
import type { Character } from "@/types/database.types";

import { parseElementFromCharacterRow, type ProductionElement } from "@/lib/elements";
export type { ProductionElement };

/**
 * Create a new Production Location with automatic concept keyframe render
 */
export async function createLocationAction(params: {
  name: string;
  description: string;
  atmosphere?: string;
  lighting?: string;
  referenceUrl?: string;
}): Promise<{
  success: boolean;
  element?: ProductionElement;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to create a location." };
  }

  if (!params.name || !params.name.trim()) {
    return { success: false, error: "Location name is required." };
  }

  try {
    let referenceUrl = params.referenceUrl?.trim() || "";

    // If no reference image provided, generate an 8K cinematic establishing concept still
    if (!referenceUrl) {
      const locationPrompt = `Cinematic master establishing concept frame of ${params.name.trim()}. ${
        params.description.trim() || "Detailed cinematic location"
      }. ${params.atmosphere ? `Atmosphere: ${params.atmosphere}.` : ""} ${
        params.lighting ? `Lighting: ${params.lighting}.` : "Atmospheric volumetric lighting"
      }, 35mm anamorphic lens, 8k resolution photorealistic architectural cinema still.`;

      const genRes = await generateMediaAction({
        prompt: locationPrompt,
        mediaType: "image",
        modelName: "nano-banana",
        aspectRatio: "16:9",
      });

      if (genRes.success && genRes.generation) {
        referenceUrl =
          (Array.isArray(genRes.generation.output_urls) && genRes.generation.output_urls.length > 0
            ? String(genRes.generation.output_urls[0])
            : genRes.generation.output_url) || "";
      }
    }

    const visualSpec = `[LOCATION] ${params.name}: ${params.description} ${
      params.atmosphere ? `(${params.atmosphere})` : ""
    }`;

    const { data: newRow, error: insertError } = await (supabase.from("characters") as any)
      .insert({
        user_id: user.id,
        name: params.name.trim(),
        description: `[LOCATION] ${params.description.trim()}`,
        visual_spec: visualSpec,
        reference_sheet_url: referenceUrl || null,
        status: "ready",
      })
      .select()
      .single();

    if (insertError || !newRow) {
      return { success: false, error: insertError?.message || "Failed to save location." };
    }

    revalidatePath("/media");
    revalidatePath("/generate");

    return {
      success: true,
      element: parseElementFromCharacterRow(newRow),
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create location." };
  }
}

/**
 * Create a new Production Prop / Hero Object
 */
export async function createPropAction(params: {
  name: string;
  description: string;
  material?: string;
  referenceUrl?: string;
}): Promise<{
  success: boolean;
  element?: ProductionElement;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to create a prop." };
  }

  if (!params.name || !params.name.trim()) {
    return { success: false, error: "Prop name is required." };
  }

  try {
    let referenceUrl = params.referenceUrl?.trim() || "";

    // If no reference image provided, generate an 8K cinematic prop studio hero render
    if (!referenceUrl) {
      const propPrompt = `Cinematic master hero studio product shot of ${params.name.trim()}. ${
        params.description.trim() || "Detailed cinema hero prop"
      }. ${params.material ? `Materials: ${params.material}.` : ""} Isolated studio rim lighting, 85mm macro lens, ultra-fine photorealistic textures, 8k resolution cinema render.`;

      const genRes = await generateMediaAction({
        prompt: propPrompt,
        mediaType: "image",
        modelName: "nano-banana",
        aspectRatio: "1:1",
      });

      if (genRes.success && genRes.generation) {
        referenceUrl =
          (Array.isArray(genRes.generation.output_urls) && genRes.generation.output_urls.length > 0
            ? String(genRes.generation.output_urls[0])
            : genRes.generation.output_url) || "";
      }
    }

    const visualSpec = `[PROP] ${params.name}: ${params.description} ${
      params.material ? `(Materials: ${params.material})` : ""
    }`;

    const { data: newRow, error: insertError } = await (supabase.from("characters") as any)
      .insert({
        user_id: user.id,
        name: params.name.trim(),
        description: `[PROP] ${params.description.trim()}`,
        visual_spec: visualSpec,
        reference_sheet_url: referenceUrl || null,
        status: "ready",
      })
      .select()
      .single();

    if (insertError || !newRow) {
      return { success: false, error: insertError?.message || "Failed to save prop." };
    }

    revalidatePath("/media");
    revalidatePath("/generate");

    return {
      success: true,
      element: parseElementFromCharacterRow(newRow),
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create prop." };
  }
}

/**
 * Fetch all elements grouped by Cast, Locations, and Props
 */
export async function getAllProductionElementsAction(): Promise<{
  characters: ProductionElement[];
  locations: ProductionElement[];
  props: ProductionElement[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { characters: [], locations: [], props: [] };
  }

  const { data: rows } = await (supabase.from("characters") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allElements = (rows || []).map(parseElementFromCharacterRow);

  return {
    characters: allElements.filter((e: ProductionElement) => e.category === "character"),
    locations: allElements.filter((e: ProductionElement) => e.category === "location"),
    props: allElements.filter((e: ProductionElement) => e.category === "prop"),
  };
}

/**
 * Delete any production element (character, location, prop)
 */
export async function deleteProductionElementAction(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { error } = await (supabase.from("characters") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/media");
  revalidatePath("/generate");

  return { success: true };
}
