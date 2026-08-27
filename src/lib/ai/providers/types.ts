export interface ImageGenerationOptions {
  prompt: string;
  modelName: string;
  aspectRatio?: string;
  resolution?: string;
  numOutputs?: number;
  imageSize?: "square" | "landscape_16_9" | "portrait_9_16" | string;
  imageUrl?: string;
  referenceImageUrl?: string;
  seed?: number;
}

export interface VideoGenerationOptions {
  prompt: string;
  modelName: string;
  durationSeconds?: number;
  resolution?: string;
  aspectRatio?: string;
  numOutputs?: number;
  cameraMovement?: string;
  imageUrl?: string;
  referenceImageUrl?: string;
  seed?: number;
}

export interface ProviderImageResult {
  imageUrl?: string;
  outputUrls?: string[];
  imageBuffer?: Buffer;
  mimeType?: string;
  jobId: string;
  seed?: number;
  width?: number;
  height?: number;
  provider: "fal" | "segmind" | "wavespeed";
}

export interface ProviderVideoResult {
  videoUrl: string;
  outputUrls?: string[];
  jobId: string;
  durationSeconds: number;
  resolution: string;
  provider: "fal";
}

export interface AIProviderAdapter {
  generateImage(options: ImageGenerationOptions): Promise<ProviderImageResult>;
  generateVideo?(options: VideoGenerationOptions): Promise<ProviderVideoResult>;
}
