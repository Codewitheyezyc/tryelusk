import React from "react";
import { redirect } from "next/navigation";
import { getUserPlanStatusAction } from "@/app/actions/vibe-director";
import { VibeDirectorClient } from "@/components/vibe-director/vibe-director-client";

export const dynamic = "force-dynamic";

export default async function VibeDirectorPage() {
  const planStatus = await getUserPlanStatusAction();

  if (!planStatus.isProUnlocked) {
    redirect("/pricing");
  }

  return <VibeDirectorClient initialPlanStatus={planStatus} />;
}
