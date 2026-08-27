import { createClient } from "@/lib/supabase/server";

export async function uploadImageToStorage(
  userId: string,
  source: { imageUrl?: string; imageBuffer?: Buffer; mimeType?: string },
  filenamePrefix = "gen"
): Promise<string> {
  const supabase = await createClient();

  let buffer: Buffer;
  let contentType = source.mimeType || "image/png";

  if (source.imageBuffer) {
    buffer = source.imageBuffer;
  } else if (source.imageUrl) {
    const response = await fetch(source.imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image asset: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    contentType = response.headers.get("content-type") || contentType;
  } else {
    throw new Error("No image source provided for storage upload.");
  }

  const extension = contentType.includes("webp")
    ? "webp"
    : contentType.includes("jpeg") || contentType.includes("jpg")
    ? "jpg"
    : "png";

  const filePath = `${userId}/${filenamePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

  const { data, error } = await supabase.storage
    .from("images")
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(data.path);

  return publicUrl;
}

export async function uploadVideoToStorage(
  userId: string,
  videoUrl: string,
  filenamePrefix = "vid"
): Promise<string> {
  const supabase = await createClient();

  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`Failed to download generated video: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get("content-type") || "video/mp4";
  const extension = contentType.includes("webm") ? "webm" : "mp4";

  const filePath = `${userId}/${filenamePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

  const { data, error } = await supabase.storage
    .from("videos")
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    // If upload to videos fails, return original remote videoUrl as fallback
    console.warn("Video bucket storage fallback:", error.message);
    return videoUrl;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("videos").getPublicUrl(data.path);

  return publicUrl;
}
