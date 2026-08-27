// Inactive for v1 — fal.ai only. Re-enable when adding multi-provider routing.
// This adapter is preserved for future cost optimization per Section 7 of tryelusk-manifesto.md.

import type { AIProviderAdapter, ImageGenerationOptions, ProviderImageResult } from "./types";

export class SegmindProvider implements AIProviderAdapter {
  private apiKey: string;

  constructor() {
    this.apiKey = (process.env.SEGMIND_API_KEY || "").trim();
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderImageResult> {
    if (!this.apiKey) {
      throw new Error("SEGMIND_API_KEY is not configured on the server.");
    }

    // Map internal model name to Segmind endpoint
    const endpointMap: Record<string, string> = {
      "nano-banana-2-lite": "flux-schnell",
      "seedance-mini": "sdxl",
    };

    const endpoint = endpointMap[options.modelName] || "flux-schnell";
    const url = `https://api.segmind.com/v1/${endpoint}`;

    const payload = {
      prompt: options.prompt,
      samples: 1,
      steps: 4,
      aspect_ratio: options.imageSize === "landscape_16_9" ? "16:9" : options.imageSize === "portrait_9_16" ? "9:16" : "1:1",
      seed: options.seed,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(`Segmind provider error: ${errorData.error || errorData.message || JSON.stringify(errorData)}`);
      }
      const errorText = await response.text();
      throw new Error(`Segmind generation failed with status ${response.status}: ${errorText}`);
    }

    // Segmind returns direct image binary buffer
    if (contentType.includes("image/")) {
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      return {
        imageBuffer,
        mimeType: contentType,
        jobId: `segmind-${Date.now()}`,
        provider: "segmind",
      };
    }

    // Or JSON with base64/url
    const data = await response.json();
    if (data.image) {
      const base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");
      return {
        imageBuffer,
        mimeType: "image/jpeg",
        jobId: `segmind-${Date.now()}`,
        provider: "segmind",
      };
    }

    throw new Error("No valid image output returned from Segmind provider.");
  }
}
