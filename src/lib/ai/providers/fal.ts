import dns from "node:dns";
import type {
  AIProviderAdapter,
  ImageGenerationOptions,
  VideoGenerationOptions,
  ProviderImageResult,
  ProviderVideoResult,
} from "./types";

// Ensure resilient DNS resolution for fal.run across various network and Windows environments
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore in environments where setServers is restricted
}

export interface AudioGenerationOptions {
  prompt: string; // The script / dialogue text
  voiceId?: string; // e.g. "Rachel", "Adam", "Drew", "Elena"
  modelName?: string;
}

export interface ProviderAudioResult {
  audioUrl: string;
  jobId: string;
  provider: string;
  durationSeconds?: number;
}

export interface LipSyncGenerationOptions {
  videoUrl: string;
  audioUrl: string;
  modelName?: string;
  durationSeconds?: number;
}

export interface ProviderLipSyncResult {
  videoUrl: string;
  jobId: string;
  provider: string;
  durationSeconds?: number;
}

import { sanitizeAIErrorMessage } from "@/lib/ai/errors";
export { sanitizeAIErrorMessage };

export class FalProvider implements AIProviderAdapter {
  private apiKey: string;

  constructor() {
    this.apiKey = (process.env.FAL_API_KEY || "").trim();
  }

  async generateImage(options: ImageGenerationOptions): Promise<ProviderImageResult> {
    if (!this.apiKey) {
      throw new Error("Render service is temporarily undergoing maintenance.");
    }

    const endpointMap: Record<string, string> = {
      // Fast image models
      "nano-banana-lite": "fal-ai/flux/schnell",
      "Nano Banana Lite": "fal-ai/flux/schnell",
      // Master high-fidelity photoreal models
      "nano-banana": "fal-ai/flux/dev",
      "Nano Banana": "fal-ai/flux/dev",
      "nano-banana-pro": "fal-ai/flux-pro/v1.1",
      "Nano Banana Pro": "fal-ai/flux-pro/v1.1",
      "flux-dev": "fal-ai/flux/dev",
      "Flux 2 Dev": "fal-ai/flux/dev",
      "Flux Dev": "fal-ai/flux/dev",
      "flux-ultra": "fal-ai/flux-pro/v1.1-ultra",
      "Flux Pro Ultra": "fal-ai/flux-pro/v1.1-ultra",
      // Creative & Vector models
      "seedream-v4": "fal-ai/bytedance/sdxl-lightning",
      "Seedream 5.0 Lite": "fal-ai/bytedance/sdxl-lightning",
      "seedream-pro": "fal-ai/flux-pro/v1.1-ultra",
      "Seedream 5.0 Pro": "fal-ai/flux-pro/v1.1-ultra",
      "gpt-image-2": "fal-ai/recraft-v3",
      "GPT Image 2": "fal-ai/recraft-v3",
      "recraft-v3": "fal-ai/recraft-v3",
      "Recraft V3": "fal-ai/recraft-v3",
    };

    const endpoint =
      endpointMap[options.modelName] ||
      endpointMap[options.modelName.toLowerCase()] ||
      "fal-ai/flux/schnell"; // Safe economical default ($0.003)
    const url = `https://fal.run/${endpoint}`;

    const ratioMap: Record<string, string> = {
      "16:9": "landscape_16_9",
      "21:9": "landscape_16_9",
      "9:16": "portrait_16_9",
      "1:1": "square_hd",
      "4:3": "landscape_4_3",
      "3:2": "landscape_4_3",
    };

    const selectedRatio = options.aspectRatio || "16:9";
    let imageSize: any = ratioMap[selectedRatio] || "landscape_16_9";

    // High fidelity 2K / 4K resolution scaling
    if (options.resolution === "2K") {
      imageSize =
        selectedRatio === "16:9"
          ? { width: 2048, height: 1152 }
          : selectedRatio === "9:16"
          ? { width: 1152, height: 2048 }
          : selectedRatio === "21:9"
          ? { width: 2560, height: 1080 }
          : { width: 2048, height: 2048 };
    } else if (options.resolution === "4K") {
      imageSize =
        selectedRatio === "16:9"
          ? { width: 3840, height: 2160 }
          : selectedRatio === "9:16"
          ? { width: 2160, height: 3840 }
          : selectedRatio === "21:9"
          ? { width: 4096, height: 1714 }
          : { width: 3840, height: 3840 };
    }

    const count = options.numOutputs || 1;
    const timeoutMs = 300_000;

    const tasks = Array.from({ length: count }, (_, i) => {
      const payload = {
        prompt: options.prompt,
        image_size: imageSize,
        enable_safety_checker: true,
        seed: options.seed ? options.seed + i * 100 : Math.floor(Math.random() * 1000000),
      };

      return fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errBody = await res.text().catch(() => "");
            throw new Error(`Provider HTTP ${res.status}: ${errBody}`);
          }
          return res.json();
        })
        .catch((err) => {
          throw new Error(sanitizeAIErrorMessage(err));
        });
    });

    const results = await Promise.allSettled(tasks);
    const successfulUrls: string[] = [];
    let lastErrorMessage = "";

    for (const r of results) {
      if (r.status === "fulfilled") {
        const val = r.value;
        const imgUrl =
          val?.images?.[0]?.url ||
          (Array.isArray(val?.images) ? val.images[0]?.url : undefined) ||
          val?.image?.url;
        if (imgUrl) successfulUrls.push(imgUrl);
      } else {
        lastErrorMessage = r.reason?.message || "Generation error";
      }
    }

    if (successfulUrls.length === 0) {
      throw new Error(sanitizeAIErrorMessage(lastErrorMessage));
    }

    return {
      imageUrl: successfulUrls[0],
      outputUrls: successfulUrls,
      jobId: `fal-batch-${Date.now()}`,
      provider: "fal",
    };
  }

  async generateVideo(options: VideoGenerationOptions): Promise<ProviderVideoResult> {
    if (!this.apiKey) {
      throw new Error("Render service is temporarily undergoing maintenance.");
    }

    const isImageToVideo = Boolean(options.imageUrl || options.referenceImageUrl);
    const sourceImageUrl = options.imageUrl || options.referenceImageUrl;

    const endpointMap: Record<string, string> = {
      // ByteDance Seedance 2.5
      "seedance-video": isImageToVideo ? "bytedance/seedance-2.5/image-to-video" : "bytedance/seedance-2.5/text-to-video",
      "seedance-2.5": isImageToVideo ? "bytedance/seedance-2.5/image-to-video" : "bytedance/seedance-2.5/text-to-video",
      "Seedance 2.5 Motion": isImageToVideo ? "bytedance/seedance-2.5/image-to-video" : "bytedance/seedance-2.5/text-to-video",
      "Seedance Video": isImageToVideo ? "bytedance/seedance-2.5/image-to-video" : "bytedance/seedance-2.5/text-to-video",
      // Kling 3.0 Pro & Kling 2.5 Turbo
      "kling-3.0": isImageToVideo ? "fal-ai/kling-video/v3/pro/image-to-video" : "fal-ai/kling-video/v3/pro/text-to-video",
      "Kling 3.0 Cinema Pro": isImageToVideo ? "fal-ai/kling-video/v3/pro/image-to-video" : "fal-ai/kling-video/v3/pro/text-to-video",
      "Kling 3.0 Pro": isImageToVideo ? "fal-ai/kling-video/v3/pro/image-to-video" : "fal-ai/kling-video/v3/pro/text-to-video",
      "kling-2.5-turbo": isImageToVideo ? "fal-ai/kling-video/v3/pro/image-to-video" : "fal-ai/kling-video/v3/turbo/pro/text-to-video",
      "Kling 3.0 Turbo": isImageToVideo ? "fal-ai/kling-video/v3/pro/image-to-video" : "fal-ai/kling-video/v3/turbo/pro/text-to-video",
      "Kling 2.5 Turbo": isImageToVideo ? "fal-ai/kling-video/v3/pro/image-to-video" : "fal-ai/kling-video/v3/turbo/pro/text-to-video",
      // Wan 2.1 Video
      "wan-2.1": isImageToVideo ? "fal-ai/wan/v2.1/image-to-video" : "fal-ai/wan/v2.1/text-to-video",
      "Wan 2.1 Direct": isImageToVideo ? "fal-ai/wan/v2.1/image-to-video" : "fal-ai/wan/v2.1/text-to-video",
      "Wan 2.1 Video": isImageToVideo ? "fal-ai/wan/v2.1/image-to-video" : "fal-ai/wan/v2.1/text-to-video",
      // Luma Ray 2
      "luma-ray-2": isImageToVideo ? "fal-ai/luma-dream-machine/image-to-video" : "fal-ai/luma-dream-machine",
      "Luma Ray 2": isImageToVideo ? "fal-ai/luma-dream-machine/image-to-video" : "fal-ai/luma-dream-machine",
    };

    const endpoint =
      endpointMap[options.modelName] ||
      endpointMap[options.modelName.toLowerCase()] ||
      (isImageToVideo ? "bytedance/seedance-2.5/image-to-video" : "bytedance/seedance-2.5/text-to-video"); // Safe economical default ($0.10)
    const url = `https://fal.run/${endpoint}`;

    const duration = options.durationSeconds === 10 ? "10" : "5";
    const aspectRatio = options.aspectRatio === "9:16" ? "9:16" : options.aspectRatio === "1:1" ? "1:1" : "16:9";
    const count = options.numOutputs || 1;
    const timeoutMs = 900_000;

    console.log(`[FalProvider.generateVideo] URL: ${url}, Model: ${options.modelName}, ImageToVideo: ${isImageToVideo}, Duration: ${duration}s, AspectRatio: ${aspectRatio}`);

    const videoTasks = Array.from({ length: count }, (_, idx) => {
      const payload: Record<string, any> = {
        prompt: options.prompt,
        duration,
        aspect_ratio: aspectRatio,
        generate_audio: true,
        seed: options.seed ? options.seed + idx * 100 : Math.floor(Math.random() * 1000000),
      };

      if (isImageToVideo && sourceImageUrl) {
        payload.image_url = sourceImageUrl;
      }

      return fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errBody = await res.text().catch(() => "");
            console.error(`[FalProvider HTTP ${res.status} error body]:`, errBody);
            throw new Error(`Provider HTTP ${res.status}: ${errBody}`);
          }
          const data = await res.json();
          console.log("[FalProvider HTTP 200 success]:", data);
          return data;
        })
        .catch((err) => {
          console.error("[FalProvider fetch failure]:", err);
          throw err;
        });
    });

    const results = await Promise.allSettled(videoTasks);
    const successfulUrls: string[] = [];
    let lastErrorMessage = "";

    for (const r of results) {
      if (r.status === "fulfilled") {
        const val = r.value;
        const videoUrl =
          val?.video?.url ||
          (Array.isArray(val?.videos) ? val.videos[0]?.url : undefined) ||
          val?.url;
        if (videoUrl) successfulUrls.push(videoUrl);
      } else {
        lastErrorMessage = r.reason?.message || "Video generation error";
        console.error("[FalProvider task rejection reason]:", r.reason);
      }
    }

    if (successfulUrls.length === 0) {
      throw new Error(sanitizeAIErrorMessage(lastErrorMessage));
    }

    return {
      videoUrl: successfulUrls[0],
      outputUrls: successfulUrls,
      jobId: `fal-video-batch-${Date.now()}`,
      provider: "fal",
      durationSeconds: Number(duration) || 5,
      resolution: "1080p",
    };
  }

  async generateAudio(options: AudioGenerationOptions): Promise<ProviderAudioResult> {
    if (!this.apiKey) {
      throw new Error("Audio synthesis service is temporarily offline.");
    }

    const endpoint = "fal-ai/minimax-music/v1.5";
    const url = `https://fal.run/${endpoint}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: options.prompt,
          voice_setting: { voice_id: options.voiceId || "Rachel" },
        }),
        signal: AbortSignal.timeout(180_000),
      });

      if (!res.ok) {
        throw new Error(`Audio HTTP ${res.status}`);
      }

      const data = await res.json();
      const audioUrl = data?.audio_file?.url || data?.audio?.url || data?.url;

      if (!audioUrl) {
        throw new Error("No audio track returned");
      }

      return {
        audioUrl,
        jobId: `fal-audio-${Date.now()}`,
        provider: "fal",
        durationSeconds: 15,
      };
    } catch (err: any) {
      throw new Error(sanitizeAIErrorMessage(err));
    }
  }

  async generateLipSync(options: LipSyncGenerationOptions): Promise<ProviderLipSyncResult> {
    if (!this.apiKey) {
      throw new Error("Lip-sync service is temporarily offline.");
    }

    const endpoint = "fal-ai/sync-lipsync";
    const url = `https://fal.run/${endpoint}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: options.videoUrl,
          audio_url: options.audioUrl,
        }),
        signal: AbortSignal.timeout(300_000),
      });

      if (!res.ok) {
        throw new Error(`Lip-sync HTTP ${res.status}`);
      }

      const data = await res.json();
      const videoUrl = data?.video?.url || data?.url;

      if (!videoUrl) {
        throw new Error("No lip-sync video returned");
      }

      return {
        videoUrl,
        jobId: `fal-lipsync-${Date.now()}`,
        provider: "fal",
        durationSeconds: options.durationSeconds || 5,
      };
    } catch (err: any) {
      throw new Error(sanitizeAIErrorMessage(err));
    }
  }
}
