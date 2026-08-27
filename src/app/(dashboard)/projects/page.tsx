import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectsHubClient } from "@/components/projects/projects-hub-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects & Production Hub | TryElusk",
  description: "Manage film workspaces, organize takes, storyboard sequences, and cast members by project.",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ProjectsHubClient />;
}
