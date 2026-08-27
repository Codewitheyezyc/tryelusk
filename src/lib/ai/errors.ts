/**
 * Human-Friendly Error Sanitizer (Removes technical AI jargon & backend provider names)
 * Client-safe (no Node.js dependencies)
 */
export function sanitizeAIErrorMessage(err: any): string {
  if (!err) return "Render engine was unable to complete the take. Credits have been refunded.";
  const msg = (typeof err === "string" ? err : err?.message || JSON.stringify(err)).toLowerCase();

  if (
    msg.includes("402") ||
    msg.includes("403") ||
    msg.includes("top_up") ||
    msg.includes("locked") ||
    msg.includes("payment") ||
    msg.includes("balance") ||
    msg.includes("insufficient") ||
    msg.includes("exhausted") ||
    msg.includes("no image output") ||
    msg.includes("no video output") ||
    msg.includes("no audio output")
  ) {
    if (msg.includes("top_up") || msg.includes("locked")) {
      return "The backend rendering engine balance has reached zero and requires a top-up. All user credits have been automatically refunded.";
    }
    return "The render engine is currently at peak capacity or undergoing scheduled maintenance. Your credits have been automatically refunded to your wallet.";
  }

  if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("api_key") || msg.includes("apikey")) {
    return "Render service is temporarily offline for maintenance. Your credits have been refunded.";
  }

  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Render service is experiencing high traffic. Please try again in a moment. Your credits have been refunded.";
  }

  if (msg.includes("timeout") || msg.includes("aborted") || msg.includes("timed out")) {
    return "Render took longer than expected and timed out. Your credits have been automatically refunded.";
  }

  if (
    msg.includes("safety") ||
    msg.includes("nsfw") ||
    msg.includes("policy") ||
    msg.includes("flagged") ||
    msg.includes("copyright") ||
    msg.includes("violation") ||
    msg.includes("rejected")
  ) {
    return "The prompt was flagged by the model's content/copyright safety filter. Please adjust the scene description or dialogue. Your credits have been automatically refunded.";
  }

  return "Unable to complete the cinematic take at this moment. Your credits have been automatically refunded to your wallet.";
}
