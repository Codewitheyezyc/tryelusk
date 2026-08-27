// Inactive for v1 — fal.ai only. Re-enable when adding multi-provider routing.
// This adapter is preserved for future early-access model optimization per Section 7 of tryelusk-manifesto.md.

import type { AIProviderAdapter, ImageGenerationOptions, ProviderImageResult } from "./types";

export class WaveSpeedProvider implements AIProviderAdapter {
  private apiKey: string;

  constructor() {
    this.apiKey = (process.env.WAVESPEED_API_KEY || "").trim();
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderImageResult> {
    if (!this.apiKey) {
      throw new Error("WAVESPEED_API_KEY is not configured on the server.");
    }

    const url = "https://api.wavespeed.ai/v1/images/generations";

    const payload = {
      prompt: options.prompt,
      model: options.modelName,
      size: options.imageSize === "landscape_16_9" ? "1280x720" : options.imageSize === "portrait_9_16" ? "720x1280" : "1024x1024",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`WaveSpeed generation failed: ${data.error?.message || data.message || response.statusText}`);
    }

    if (!data.data || data.data.length === 0 || !data.data[0].url) {
      throw new Error("No image output returned from WaveSpeed provider.");
    }

    return {
      imageUrl: data.data[0].url,
      jobId: data.id || `wavespeed-${Date.now()}`,
      provider: "wavespeed",
    };
  }
}
