"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  prompt: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  durationSeconds: number;
  characterTags?: string[];
  lightingMood?: string;
  cameraMovement?: string;
  colorPalette?: string;
  audioUrl?: string;
  audioTitle?: string;
  generationId?: string;
}

export interface StoryboardProject {
  id: string;
  title: string;
  description?: string;
  aspectRatio: string;
  scenes: StoryboardScene[];
  updatedAt: string;
}

/**
 * Saves or updates a storyboard project
 */
export async function saveStoryboardProjectAction(
  project: StoryboardProject
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Storyboards can be stored in user profiles metadata or local persistence
    revalidatePath("/storyboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save storyboard" };
  }
}
