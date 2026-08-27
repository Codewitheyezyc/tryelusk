import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AudioStudioClient } from "@/components/audio/audio-studio-client";
import type { Generation } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function AudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialAudios: Generation[] = [];
  let initialVideos: Generation[] = [];

  if (user) {
    const { data: rawAudios } = await (supabase.from("generations") as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "audio")
      .eq("status", "completed")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    initialAudios = (rawAudios || []) as Generation[];

    const { data: rawVideos } = await (supabase.from("generations") as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "video")
      .eq("status", "completed")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    initialVideos = (rawVideos || []) as Generation[];
  }

  return (
    <AudioStudioClient
      initialAudios={initialAudios}
      initialVideos={initialVideos}
    />
  );
}
