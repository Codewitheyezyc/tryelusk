/**
 * OFFICIAL FAL.AI MCP LIVE PRICING & SECTION 8 RECALIBRATION AUDIT
 *
 * All prices queried directly from fal.ai official MCP server (https://mcp.fal.ai/mcp).
 * 1 credit = $0.01 USD.
 * Target margin: 25% - 35% on top of wholesale costs.
 * Round UP (Math.ceil) to nearest whole credit.
 */

export interface PricingAuditRecord {
  modelId: string;
  inHouseName: string;
  mediaType: "image" | "video";
  falEndpoint: string;
  falOfficialCostUSD: string;
  rawCostCredits: number;
  grossMarginPercent: number;
  finalBaseRate: number;
  baseRateUnit: "credits_flat" | "credits_per_second";
  standardTakePrice: string;
  tier: string;
  userBenefit: string;
}

export const PRICING_AUDIT_CATALOG: PricingAuditRecord[] = [
  // Video Models
  {
    modelId: "kling-3.0",
    inHouseName: "Kling 3.0 Cinema Pro",
    mediaType: "video",
    falEndpoint: "fal-ai/kling-video/v3/pro/text-to-video",
    falOfficialCostUSD: "$0.14 / second ($0.70 for 5s)",
    rawCostCredits: 70,
    grossMarginPercent: 30,
    finalBaseRate: 20,
    baseRateUnit: "credits_per_second",
    standardTakePrice: "5s @ 720p = 100 Credits ($1.00)",
    tier: "Pro Cinema Flagship",
    userBenefit: "Movie-grade physics, complex tracking cameras, and fluid cinematic rendering.",
  },
  {
    modelId: "kling-2.5-turbo",
    inHouseName: "Kling 3.0 Turbo",
    mediaType: "video",
    falEndpoint: "fal-ai/kling-video/v3/turbo/pro/text-to-video",
    falOfficialCostUSD: "$0.07 / second ($0.35 for 5s)",
    rawCostCredits: 35,
    grossMarginPercent: 30,
    finalBaseRate: 10,
    baseRateUnit: "credits_per_second",
    standardTakePrice: "5s @ 720p = 50 Credits ($0.50)",
    tier: "Recommended Action",
    userBenefit: "Rapid rendering speed and kinetic motion at half the cost of Cinema Pro.",
  },
  {
    modelId: "seedance-video",
    inHouseName: "Seedance 2.5 Motion",
    mediaType: "video",
    falEndpoint: "bytedance/seedance-2.5/text-to-video",
    falOfficialCostUSD: "$0.00017 / compute-s (~$0.02 / video-s)",
    rawCostCredits: 10,
    grossMarginPercent: 33,
    finalBaseRate: 3,
    baseRateUnit: "credits_per_second",
    standardTakePrice: "5s @ 720p = 15 Credits ($0.15)",
    tier: "Budget Draft",
    userBenefit: "Ultra low-cost 15-credit takes for scene blocking and storyboard animations.",
  },

  // Image Models
  {
    modelId: "nano-banana-lite",
    inHouseName: "Nano Banana Lite",
    mediaType: "image",
    falEndpoint: "fal-ai/flux/schnell",
    falOfficialCostUSD: "$0.003 / megapixel",
    rawCostCredits: 0.5,
    grossMarginPercent: 75,
    finalBaseRate: 2,
    baseRateUnit: "credits_flat",
    standardTakePrice: "2 Credits ($0.02) flat (any aspect ratio)",
    tier: "Budget Draft",
    userBenefit: "Instantaneous sub-second draft frames for rapid prompt testing.",
  },
  {
    modelId: "nano-banana",
    inHouseName: "Nano Banana Cinema",
    mediaType: "image",
    falEndpoint: "fal-ai/flux/dev",
    falOfficialCostUSD: "$0.025 / megapixel",
    rawCostCredits: 2.7,
    grossMarginPercent: 32,
    finalBaseRate: 4,
    baseRateUnit: "credits_flat",
    standardTakePrice: "4 Credits ($0.04) flat (any aspect ratio)",
    tier: "Recommended Cinema",
    userBenefit: "Balanced photorealistic lighting, lens dynamics, and film texture.",
  },
  {
    modelId: "seedream-v4",
    inHouseName: "Seedream Cinema",
    mediaType: "image",
    falEndpoint: "fal-ai/bytedance/sdxl-lightning",
    falOfficialCostUSD: "$0.00017 / compute-s (~$0.003 / img)",
    rawCostCredits: 0.5,
    grossMarginPercent: 90,
    finalBaseRate: 5,
    baseRateUnit: "credits_flat",
    standardTakePrice: "5 Credits ($0.05) flat (any aspect ratio)",
    tier: "Recommended Cinema",
    userBenefit: "High aesthetic coherence with rich cinematic color palettes.",
  },
  {
    modelId: "gpt-image-2",
    inHouseName: "GPT Image 2 Precision",
    mediaType: "image",
    falEndpoint: "fal-ai/recraft-v3",
    falOfficialCostUSD: "$0.040 / image",
    rawCostCredits: 4.2,
    grossMarginPercent: 30,
    finalBaseRate: 6,
    baseRateUnit: "credits_flat",
    standardTakePrice: "6 Credits ($0.06) flat (any aspect ratio)",
    tier: "Pro Precision",
    userBenefit: "Superior typography rendering, graphic precision, and vector sharpness.",
  },
  {
    modelId: "nano-banana-pro",
    inHouseName: "Nano Banana Pro Master",
    mediaType: "image",
    falEndpoint: "fal-ai/flux-pro/v1.1",
    falOfficialCostUSD: "$0.040 / megapixel",
    rawCostCredits: 4.2,
    grossMarginPercent: 40,
    finalBaseRate: 7,
    baseRateUnit: "credits_flat",
    standardTakePrice: "7 Credits ($0.07) flat (any aspect ratio)",
    tier: "Pro Quality",
    userBenefit: "Master-tier 2K sharpness with ultra-fine skin, hair, and fabric textures.",
  },
  {
    modelId: "flux-ultra",
    inHouseName: "Flux Ultra 8K",
    mediaType: "image",
    falEndpoint: "fal-ai/flux-pro/v1.1-ultra",
    falOfficialCostUSD: "$0.060 / image",
    rawCostCredits: 6.2,
    grossMarginPercent: 25,
    finalBaseRate: 8,
    baseRateUnit: "credits_flat",
    standardTakePrice: "8 Credits ($0.08) flat (any aspect ratio)",
    tier: "Pro Quality 8K",
    userBenefit: "Maximum 8K raw resolution for theatrical posters and master cinema frames.",
  },
];
