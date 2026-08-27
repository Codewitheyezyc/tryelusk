export type PlanTier = "free" | "starter" | "pro" | "studio";

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  creditBalance: number;
  planTier: PlanTier;
  isAdmin: boolean;
}

export type GenerationMode = "manual" | "vibe_director";

export interface ModelOption {
  id: string;
  name: string;
  provider: "fal" | "segmind" | "wavespeed";
  category: "image" | "video" | "audio";
  description: string;
  minTier: PlanTier;
  supportedResolutions: string[];
}
