import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPricingCatalog } from "@/lib/wallet/wallet";
import { mapPricingRowsToStudioModels } from "@/lib/ai/models";
import { GenerationsClient } from "@/components/generations/generations-client";
import type { Generation } from "@/types/database.types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Generations | TryElusk",
  description: "View, manage, recreate, and reference every cinematic scene and visual take.",
};

export default async function GenerationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch user's active generations (newest first, excluding trash)
  const { data: rawGenerations } = await (supabase.from("generations") as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const generations: Generation[] = (rawGenerations || []) as Generation[];

  // 2. Fetch active characters for @ mention tagging
  const { data: rawCharacters } = await (supabase.from("characters") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const characters = (rawCharacters || []) as any[];

  // 3. Fetch AI Studio Models for dual-mode generation dock
  const catalog = await getPricingCatalog();
  const models = mapPricingRowsToStudioModels(catalog);

  return (
    <GenerationsClient
      initialGenerations={generations}
      initialCharacters={characters}
      models={models}
      userEmail={user.email || "Creator"}
    />
  );
}
