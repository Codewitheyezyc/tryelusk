import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoryboardClient } from "@/components/storyboard/storyboard-client";
import type { Generation } from "@/types/database.types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Storyboard & Scene Sequencer | TryElusk",
  description: "Assemble multiple video and image takes into continuous cinematic scenes with continuity inheritance.",
};

export default async function StoryboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user completed generations (excluding soft-deleted)
  const { data: rawGenerations } = await (supabase.from("generations") as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const generations: Generation[] = (rawGenerations || []) as Generation[];

  return <StoryboardClient initialGenerations={generations} />;
}
