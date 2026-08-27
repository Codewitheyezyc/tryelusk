"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface CreditContextType {
  balance: number;
  setBalance: (balance: number) => void;
  optimisticDeduct: (amount: number) => void;
  rollbackDeduct: (amount: number) => void;
  isAnimating: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({
  children,
  initialBalance = 0,
}: {
  children: React.ReactNode;
  initialBalance?: number;
}) {
  const [balance, setBalanceState] = useState(initialBalance);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setBalanceState(initialBalance);
  }, [initialBalance]);

  const setBalance = useCallback((newBalance: number) => {
    setBalanceState(newBalance);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
  }, []);

  const optimisticDeduct = useCallback((amount: number) => {
    setBalanceState((prev) => Math.max(0, prev - amount));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
  }, []);

  const rollbackDeduct = useCallback((amount: number) => {
    setBalanceState((prev) => prev + amount);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
  }, []);

  // Listen to global custom balance update events
  useEffect(() => {
    const handleGlobalUpdate = (event: CustomEvent<{ balance: number }>) => {
      if (typeof event.detail?.balance === "number") {
        setBalance(event.detail.balance);
      }
    };

    window.addEventListener("elusk:balance-update" as any, handleGlobalUpdate as any);
    return () => {
      window.removeEventListener("elusk:balance-update" as any, handleGlobalUpdate as any);
    };
  }, [setBalance]);

  return (
    <CreditContext.Provider
      value={{
        balance,
        setBalance,
        optimisticDeduct,
        rollbackDeduct,
        isAnimating,
      }}
    >
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
}

/**
 * Dispatch a global balance update to any mounted listener
 */
export function dispatchBalanceUpdate(newBalance: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("elusk:balance-update", {
        detail: { balance: newBalance },
      })
    );
  }
}
