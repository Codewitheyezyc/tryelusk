import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrashClient } from "@/components/trash/trash-client";
import type { Generation } from "@/types/database.types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trash & Bin | TryElusk",
  description: "Restore or permanently delete your archived takes and images.",
};

export default async function TrashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch trashed items for current user
  const { data: rawTrash } = await (supabase.from("generations") as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("is_deleted", true)
    .order("deleted_at", { ascending: false });

  const trashItems: Generation[] = (rawTrash || []) as Generation[];

  return <TrashClient initialTrash={trashItems} />;
}
