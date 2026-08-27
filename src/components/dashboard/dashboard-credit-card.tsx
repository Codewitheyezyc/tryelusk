"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { useCredits } from "@/context/credit-context";

interface DashboardCreditCardProps {
  initialBalance: number;
}

export function DashboardCreditCard({ initialBalance }: DashboardCreditCardProps) {
  let balance = initialBalance;
  let isAnimating = false;

  try {
    const credits = useCredits();
    balance = credits.balance;
    isAnimating = credits.isAnimating;
  } catch {
    // fallback to initialBalance
  }

  const isZero = balance === 0;

  return (
    <Card className="border-[#26262E] bg-[#16161C]/90 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#8B8B96]">Credit Balance</CardTitle>
        <Coins
          className={`h-4 w-4 text-[#FBBF24] transition-transform ${
            isAnimating ? "rotate-12 scale-125" : ""
          }`}
        />
      </CardHeader>
      <CardContent>
        <div
          className={`text-lg font-bold text-[#F2F2F5] transition-all ${
            isAnimating ? "text-[#7C5CFF] scale-105" : ""
          }`}
        >
          {balance} Credits
        </div>
        <p className="text-xs text-[#8B8B96] mt-1">
          {isZero ? "Zero balance (ready for top-up)" : "Active available credits"}
        </p>
      </CardContent>
    </Card>
  );
}
