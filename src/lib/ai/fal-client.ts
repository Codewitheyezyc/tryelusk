export interface FalImageGenerationOptions {
  prompt: string;
  imageSize?: "square" | "landscape_16_9" | "portrait_9_16";
  model?: string;
  seed?: number;
}

export interface FalImageResult {
  imageUrl: string;
  jobId: string;
  seed?: number;
  width?: number;
  height?: number;
}

/**
 * Generate an image using fal.ai API (Nano Banana / Flux endpoint)
 */
export async function generateFalImage(
  options: FalImageGenerationOptions
): Promise<FalImageResult> {
  const apiKey = (process.env.FAL_API_KEY || "").trim();

  if (!apiKey) {
    throw new Error("FAL_API_KEY is not configured on the server.");
  }

  // Model endpoint for Nano Banana / Flux
  const endpoint = options.model || "fal-ai/nano-banana";
  const url = `https://fal.run/${endpoint}`;

  const imageSizeMap = {
    square: "square_hd",
    landscape_16_9: "landscape_16_9",
    portrait_9_16: "portrait_9_16",
  };

  const payload = {
    prompt: options.prompt,
    image_size: imageSizeMap[options.imageSize || "square"] || "square_hd",
    num_inference_steps: 4,
    enable_safety_checker: true,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorDetail =
      typeof data.detail === "string"
        ? data.detail
        : data.message || `Provider returned status code ${response.status}`;
    throw new Error(`fal.ai generation failed: ${errorDetail}`);
  }

  if (data.detail && !data.images) {
    throw new Error(`fal.ai provider error: ${data.detail}`);
  }

  if (!data.images || data.images.length === 0 || !data.images[0].url) {
    throw new Error("No image output returned from fal.ai provider.");
  }

  const generated = data.images[0];

  return {
    imageUrl: generated.url,
    jobId: data.request_id || `fal-${Date.now()}`,
    seed: data.seed,
    width: generated.width,
    height: generated.height,
  };
}
