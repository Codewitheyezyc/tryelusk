import React from "react";
import { getPricingCatalog } from "@/lib/wallet/wallet";
import { mapPricingRowsToStudioModels } from "@/lib/ai/models";
import { getCharactersAction } from "@/app/actions/character";
import { StudioClient } from "@/components/studio/studio-client";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function GeneratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch real active pricing catalog directly from database
  const catalog = await getPricingCatalog();
  const initialModels = mapPricingRowsToStudioModels(catalog);
  const characters = await getCharactersAction();

  let initialGenerations: Generation[] = [];
  if (user) {
    const { data: rawGen } = await (supabase.from("generations") as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });
    initialGenerations = (rawGen || []) as Generation[];
  }

  return (
    <StudioClient
      initialModels={initialModels}
      initialCharacters={characters}
      initialGenerations={initialGenerations}
    />
  );
}
