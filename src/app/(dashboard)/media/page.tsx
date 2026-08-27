import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectMediaTabs } from "@/components/media/project-media-tabs";
import { reconcileStaleGenerations } from "@/lib/wallet/wallet";
import type { Generation, Character } from "@/types/database.types";
import { Film, Sparkles, FolderPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Elements & Production Hub | TryElusk",
  description: "Manage persistent cast characters, location sets, hero props, video takes, and cinematic scenes.",
};

export default async function MediaVaultPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Auto-reconcile and refund any stale processing generations (>5m images, >15m videos)
  await reconcileStaleGenerations(user.id);

  // Fetch all active user generations ordered by recency
  const { data: rawGenerations } = await (supabase.from("generations") as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  // Fetch all user characters ordered by recency
  const { data: rawCharacters } = await (supabase.from("characters") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const generations = (rawGenerations || []) as unknown as Generation[];
  const characters = (rawCharacters || []) as unknown as Character[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Media Vault Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-[#7C5CFF]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C5CFF] font-mono">
              Production Elements &amp; Media Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Elements &amp; Production Hub
          </h1>
          <p className="text-xs text-[#8B8B96]">
            Dedicated spaces for Cast Members, Location Sets, Hero Props, Video Takes, and Audio Tracks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/generate">
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-md shadow-[#7C5CFF]/25 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
              <span>Direct New Take</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 5-Space Interactive Media Organization Tabs */}
      <ProjectMediaTabs generations={generations} characters={characters} />
    </div>
  );
}
