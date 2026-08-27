export interface CostCalculationParams {
  mediaType: "image" | "video" | "audio" | "lipsync";
  modelName: string;
  durationSeconds?: number;
  resolution?: string;
  anthropicCostCredits?: number;
  isAdmin?: boolean;
}

export interface CalculatedCostResult {
  totalCredits: number;
  providerCostCredits: number;
  anthropicCostCredits: number;
  formulaType: "flat" | "per_second" | "per_resolution";
}

/**
 * 1:1 Direct Fal.ai At-Cost Raw Pricing Table (1 credit = $0.01 / 1 cent)
 * Exact provider cost with 0 platform markup during testing & for admin accounts.
 */
export const AT_COST_FAL_RATES: Record<
  string,
  { baseRate: number; formula: "flat" | "per_second" | "per_resolution"; multipliers: Record<string, number> }
> = {
  // Video Engines (Real Fal.ai raw cost: ~$0.01-$0.02 / sec)
  "kling-3.0": {
    baseRate: 2.0, // 2 credits/sec ($0.10 for 5s)
    formula: "per_second",
    multipliers: { "720p": 1.0, "1080p": 1.2, "4k": 1.5 },
  },
  "kling-2.5-turbo": {
    baseRate: 1.5, // 1.5 credits/sec ($0.075 for 5s)
    formula: "per_second",
    multipliers: { "720p": 1.0, "1080p": 1.2, "4k": 1.5 },
  },
  "seedance-video": {
    baseRate: 1.0, // 1 credit/sec ($0.05 for 5s)
    formula: "per_second",
    multipliers: { "720p": 1.0, "1080p": 1.1, "4k": 1.3 },
  },
  "wan-2.1": {
    baseRate: 1.0, // 1 credit/sec
    formula: "per_second",
    multipliers: { "720p": 1.0, "1080p": 1.1, "4k": 1.3 },
  },

  // Image Engines (Real Fal.ai raw cost: ~$0.003 - $0.03 / image)
  "nano-banana-lite": {
    baseRate: 1.0, // Flux Schnell ($0.003 raw -> 1 credit)
    formula: "flat",
    multipliers: { "1:1": 1.0, "16:9": 1.0, "9:16": 1.0 },
  },
  "nano-banana": {
    baseRate: 2.0, // Flux Dev ($0.025 raw -> 2 credits)
    formula: "flat",
    multipliers: { "1:1": 1.0, "16:9": 1.0, "9:16": 1.0 },
  },
  "nano-banana-pro": {
    baseRate: 2.0, // Flux Dev ($0.025 raw -> 2 credits)
    formula: "flat",
    multipliers: { "1:1": 1.0, "16:9": 1.0, "9:16": 1.0 },
  },
  "seedream-v4": {
    baseRate: 2.0,
    formula: "flat",
    multipliers: { "1:1": 1.0, "16:9": 1.0, "9:16": 1.0 },
  },
  "gpt-image-2": {
    baseRate: 2.0,
    formula: "flat",
    multipliers: { "1:1": 1.0, "16:9": 1.0, "9:16": 1.0 },
  },
  "flux-dev": {
    baseRate: 2.0,
    formula: "flat",
    multipliers: { "1:1": 1.0, "16:9": 1.0, "9:16": 1.0 },
  },
  "flux-ultra": {
    baseRate: 4.0, // Flux Pro Ultra ($0.04 raw -> 4 credits)
    formula: "flat",
    multipliers: { "1:1": 1.0, "16:9": 1.0, "9:16": 1.0 },
  },
  "recraft-v3": {
    baseRate: 3.0, // Recraft V3 ($0.03 raw -> 3 credits)
    formula: "flat",
    multipliers: { "1:1": 1.0, "16:9": 1.0, "9:16": 1.0 },
  },

  // Audio Engines (Real Fal.ai raw cost: ~$0.005 / audio)
  "eleven-multilingual-v2": {
    baseRate: 1.0,
    formula: "flat",
    multipliers: { "standard": 1.0 },
  },
  "eleven-turbo-v2_5": {
    baseRate: 1.0,
    formula: "flat",
    multipliers: { "standard": 1.0 },
  },
  "minimax-speech-01": {
    baseRate: 1.0,
    formula: "flat",
    multipliers: { "standard": 1.0 },
  },
};

/**
 * Calculate generation credit cost with 1:1 direct provider at-cost rate.
 */
export function calculateGenerationCost(
  params: CostCalculationParams,
  pricingRow?: { base_rate?: number; cost_formula_type?: string; resolution_multipliers?: any } | null
): CalculatedCostResult {
  const modelConfig =
    AT_COST_FAL_RATES[params.modelName] || {
      baseRate: params.mediaType === "video" ? 1.5 : 2.0,
      formula: params.mediaType === "video" ? ("per_second" as const) : ("flat" as const),
      multipliers: { "720p": 1.0, "1080p": 1.2, "1:1": 1.0, "16:9": 1.0 },
    };

  const baseRate = pricingRow?.base_rate ? Number(pricingRow.base_rate) : modelConfig.baseRate;
  const formula = (pricingRow?.cost_formula_type as "flat" | "per_second" | "per_resolution") || modelConfig.formula;
  const multipliers = (pricingRow?.resolution_multipliers as Record<string, number>) || modelConfig.multipliers;

  const resolutionKey = params.resolution || (params.mediaType === "video" ? "720p" : "1:1");
  const resMultiplier = multipliers[resolutionKey] || 1.0;
  const duration = params.durationSeconds || (params.mediaType === "video" ? 5 : 1);
  const anthropicCost = 0; // 0 Claude surcharge during testing / admin mode

  let totalRawCost = 0;
  let providerCost = 0;

  if (formula === "per_second") {
    providerCost = Number((baseRate * duration * resMultiplier).toFixed(2));
    totalRawCost = providerCost;
  } else {
    providerCost = Number((baseRate * resMultiplier).toFixed(2));
    totalRawCost = providerCost;
  }

  // Round up to nearest whole credit for wallet balance integrity
  const finalWholeCredits = Math.max(1, Math.ceil(totalRawCost));

  return {
    totalCredits: finalWholeCredits,
    providerCostCredits: Math.ceil(providerCost),
    anthropicCostCredits: 0,
    formulaType: formula,
  };
}
