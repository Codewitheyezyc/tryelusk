import { createClient } from "@/lib/supabase/server";
import type { CreditTransaction, PricingModel } from "@/types/database.types";

export interface WalletOperationResult {
  success: boolean;
  new_balance?: number;
  error?: string;
}

/**
 * Deduct credits from a user's wallet (calls atomic deduct_credits RPC).
 */
export async function deductCredits(
  userId: string,
  amount: number,
  modelName: string,
  jobId?: string
): Promise<WalletOperationResult> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any).rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_model: modelName,
    p_job_id: jobId || null,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  const result = data as unknown as WalletOperationResult;
  return result;
}

/**
 * Refund credits to a user's wallet (calls atomic refund_credits RPC).
 */
export async function refundCredits(
  userId: string,
  amount: number,
  jobId?: string,
  modelName?: string
): Promise<WalletOperationResult> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any).rpc("refund_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_job_id: jobId || null,
    p_model: modelName || null,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  const result = data as unknown as WalletOperationResult;
  return result;
}

/**
 * Grant promotional or admin credits to a user.
 */
export async function grantCredits(
  userId: string,
  amount: number,
  type: "admin_grant" | "purchase" = "admin_grant",
  jobId?: string
): Promise<WalletOperationResult> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any).rpc("grant_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_job_id: jobId || null,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return data as unknown as WalletOperationResult;
}

/**
 * Get user's current credit balance from profile.
 */
export async function getUserBalance(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("credit_balance")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return 0;
  }

  const profile = data as unknown as { credit_balance: number };
  return profile?.credit_balance ?? 0;
}

/**
 * Get user's transaction history (RLS filtered to own user_id).
 */
export async function getUserTransactions(
  userId: string,
  limit = 20
): Promise<CreditTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as unknown as CreditTransaction[];
}

/**
 * Fetch available model pricing catalog from database.
 */
export async function getPricingCatalog(): Promise<PricingModel[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pricing_table")
    .select("*")
    .eq("is_active", true)
    .order("base_rate", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as unknown as PricingModel[];
}

/**
 * Sweep and reconcile any stale processing generations:
 * Images older than 5 minutes or Videos older than 15 minutes are automatically flipped to 'failed'
 * and trigger atomic credit refunding to the user's wallet.
 */
export async function reconcileStaleGenerations(userId: string): Promise<number> {
  const supabase = await createClient();

  // Find all 'processing' rows for this user
  const { data: stuckRows, error } = await (supabase.from("generations") as any)
    .select("id, type, credits_charged, job_id, model_used, created_at")
    .eq("user_id", userId)
    .eq("status", "processing");

  if (error || !stuckRows || stuckRows.length === 0) {
    return 0;
  }

  const now = Date.now();
  let reconciledCount = 0;

  for (const row of stuckRows) {
    const createdAtMs = new Date(row.created_at).getTime();
    const ageMinutes = (now - createdAtMs) / (1000 * 60);

    const isStaleImage = row.type !== "video" && ageMinutes > 3;
    const isStaleVideo = row.type === "video" && ageMinutes > 5;

    if (isStaleImage || isStaleVideo) {
      const timeoutLimit = row.type === "video" ? 5 : 3;
      const errorMsg = `Generation timed out after ${timeoutLimit} minutes without provider response.`;

      // 1. Mark generation as failed
      await (supabase.from("generations") as any)
        .update({
          status: "failed",
          error_message: errorMsg,
          completed_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      // 2. Automatically refund charged credits
      if (row.credits_charged > 0) {
        await refundCredits(userId, row.credits_charged, row.job_id, row.model_used);
      }

      reconciledCount++;
    }
  }

  return reconciledCount;
}
