"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { CreditBadge } from "@/components/shared/credit-badge";
import { RenderStatusPill } from "@/components/layout/render-status-pill";
import { HeaderMegaMenu } from "@/components/layout/header-mega-menu";
import { UserAvatarDropdown } from "@/components/layout/user-avatar-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderClientProps {
  userEmail?: string | null;
  creditBalance: number;
  isLoggedIn: boolean;
}

export function HeaderClient({
  userEmail,
  creditBalance,
  isLoggedIn,
}: HeaderClientProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#060608]/95 backdrop-blur-2xl transition-all select-none">
      <div className="w-full flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Logo variant="full" size="md" />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CASE 1: LANDING / MARKETING PAGE (`/`) */}
        {/* ------------------------------------------------------------- */}
        {isLandingPage ? (
          <>
            {/* Center: Marketing Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#8B8B96]">
              <Link
                href="/pricing"
                className="hover:text-white transition-colors"
              >
                Pricing &amp; Plans
              </Link>
              <Link
                href="/vibe-director"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 text-[#FBBF24]" />
                <span>Vibe Director (PRO)</span>
              </Link>
            </nav>

            {/* Right: Marketing CTA or Fast Studio Jump */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isLoggedIn ? (
                <>
                  <Link href="/generate">
                    <Button
                      size="sm"
                      className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white font-bold text-xs shadow-md shadow-[#7C5CFF]/30 gap-1.5 transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Open Studio</span>
                      <ArrowRight className="h-3 w-3 hidden sm:inline" />
                    </Button>
                  </Link>

                  <UserAvatarDropdown
                    userEmail={userEmail}
                    creditBalance={creditBalance}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-[#8B8B96] hover:text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white font-bold rounded-xl"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ------------------------------------------------------------- */
          /* CASE 2: DASHBOARD / STUDIO / WORKSPACE APPLICATION PAGES */
          /* ------------------------------------------------------------- */
          <>
            {/* Center: Mega Menu (Desktop xl+) */}
            {isLoggedIn ? (
              <div className="hidden xl:flex items-center justify-center flex-1 min-w-0 px-1">
                <HeaderMegaMenu />
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Right: Full Production Header Tools */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {isLoggedIn ? (
                <>
                  <RenderStatusPill />
                  <CreditBadge balance={creditBalance} size="sm" />

                  {/* Upgrade Pill — visible on desktop */}
                  <Link href="/dashboard" className="hidden xl:block shrink-0">
                    <Button
                      size="sm"
                      className="h-8 px-3 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white font-bold text-xs shadow-md shadow-[#7C5CFF]/30 gap-1.5 transition-all"
                    >
                      <Zap className="h-3.5 w-3.5 fill-white text-white" />
                      <span>Upgrade</span>
                      <span className="px-1 py-0.2 rounded text-[9px] bg-white/20 text-white font-mono">
                        PRO
                      </span>
                    </Button>
                  </Link>

                  {/* User Avatar Dropdown */}
                  <UserAvatarDropdown
                    userEmail={userEmail}
                    creditBalance={creditBalance}
                  />

                  {/* Mobile Drawer Trigger (Mobile/Tablet only) */}
                  <div className="xl:hidden">
                    <MobileNav />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-[#8B8B96] hover:text-white"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white font-bold rounded-xl"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
