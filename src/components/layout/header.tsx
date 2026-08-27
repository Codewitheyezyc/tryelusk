import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getUserBalance } from "@/lib/wallet/wallet";
import { HeaderClient } from "@/components/layout/header-client";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let creditBalance = 0;
  if (user) {
    creditBalance = await getUserBalance(user.id);
  }

  return (
    <HeaderClient
      userEmail={user?.email || null}
      creditBalance={creditBalance}
      isLoggedIn={Boolean(user)}
    />
  );
}
