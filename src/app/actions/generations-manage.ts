"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ManageGenerationResult {
  success: boolean;
  error?: string;
}

/**
 * Marks a generation as viewed to permanently clear the "New" badge.
 */
export async function markGenerationViewedAction(
  generationId: string
): Promise<ManageGenerationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: gen } = await (supabase.from("generations") as any)
      .select("technical_params")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .single();

    if (!gen) {
      return { success: false, error: "Generation not found" };
    }

    const currentParams = (gen.technical_params as Record<string, any>) || {};
    if (currentParams.viewed_at) {
      return { success: true };
    }

    const updatedParams = {
      ...currentParams,
      viewed_at: new Date().toISOString(),
    };

    await (supabase.from("generations") as any)
      .update({ technical_params: updatedParams })
      .eq("id", generationId)
      .eq("user_id", user.id);

    revalidatePath("/generations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to mark as viewed" };
  }
}

/**
 * Toggles the favorite status for a generation.
 */
export async function toggleFavoriteAction(
  generationId: string,
  isFavorite: boolean
): Promise<ManageGenerationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: gen } = await (supabase.from("generations") as any)
      .select("technical_params")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .single();

    if (!gen) {
      return { success: false, error: "Generation not found" };
    }

    const currentParams = (gen.technical_params as Record<string, any>) || {};
    const updatedParams = {
      ...currentParams,
      is_favorite: isFavorite,
    };

    await (supabase.from("generations") as any)
      .update({ technical_params: updatedParams })
      .eq("id", generationId)
      .eq("user_id", user.id);

    revalidatePath("/generations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to toggle favorite" };
  }
}

/**
 * Moves one or multiple generations to the Trash (soft delete).
 */
export async function moveToTrashAction(
  generationIds: string | string[]
): Promise<ManageGenerationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const ids = Array.isArray(generationIds) ? generationIds : [generationIds];
    if (ids.length === 0) return { success: true };

    await (supabase.from("generations") as any)
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .in("id", ids)
      .eq("user_id", user.id);

    revalidatePath("/generations");
    revalidatePath("/media");
    revalidatePath("/trash");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to move to trash" };
  }
}

/**
 * Restores one or multiple generations from Trash back to active.
 */
export async function restoreFromTrashAction(
  generationIds: string | string[]
): Promise<ManageGenerationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const ids = Array.isArray(generationIds) ? generationIds : [generationIds];
    if (ids.length === 0) return { success: true };

    await (supabase.from("generations") as any)
      .update({
        is_deleted: false,
        deleted_at: null,
      })
      .in("id", ids)
      .eq("user_id", user.id);

    revalidatePath("/generations");
    revalidatePath("/media");
    revalidatePath("/trash");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to restore from trash" };
  }
}

/**
 * Permanently deletes one or multiple generations from the database.
 */
export async function permanentlyDeleteAction(
  generationIds: string | string[]
): Promise<ManageGenerationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const ids = Array.isArray(generationIds) ? generationIds : [generationIds];
    if (ids.length === 0) return { success: true };

    await (supabase.from("generations") as any)
      .delete()
      .in("id", ids)
      .eq("user_id", user.id);

    revalidatePath("/generations");
    revalidatePath("/media");
    revalidatePath("/trash");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to permanently delete" };
  }
}

/**
 * Permanently empties all trashed generations for the current user.
 */
export async function emptyTrashAction(): Promise<ManageGenerationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await (supabase.from("generations") as any)
      .delete()
      .eq("user_id", user.id)
      .eq("is_deleted", true);

    revalidatePath("/generations");
    revalidatePath("/media");
    revalidatePath("/trash");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to empty trash" };
  }
}

/**
 * Backward compatibility alias: deleteGenerationAction now moves to trash.
 */
export const deleteGenerationAction = moveToTrashAction;

/**
 * Clears all active generations for the current user by moving them to trash.
 */
export async function clearAllGenerationsAction(): Promise<ManageGenerationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await (supabase.from("generations") as any)
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("is_deleted", false);

    revalidatePath("/generations");
    revalidatePath("/media");
    revalidatePath("/trash");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to clear generations" };
  }
}
