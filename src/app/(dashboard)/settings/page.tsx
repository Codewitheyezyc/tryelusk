import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getUserBalance } from "@/lib/wallet/wallet";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let creditBalance = 0;
  if (user) {
    creditBalance = await getUserBalance(user.id);
  }

  return (
    <SettingsClient
      userEmail={user?.email}
      initialBalance={creditBalance}
    />
  );
}
