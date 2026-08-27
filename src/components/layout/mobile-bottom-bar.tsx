"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Film,
  Sparkles,
  FolderKanban,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Studio",
    href: "/generate",
    icon: Home,
    badge: null,
  },
  {
    label: "Storyboard",
    href: "/storyboard",
    icon: Film,
    badge: null,
  },
  {
    label: "Vibe Director",
    href: "/vibe-director",
    icon: Sparkles,
    badge: "PRO",
    isAccent: true,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    badge: null,
  },
  {
    label: "Vault",
    href: "/media",
    icon: Layers,
    badge: null,
  },
];

export function MobileBottomBar() {
  const pathname = usePathname();

  // Hide on landing page, auth pages, or marketing pages
  if (
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-3 inset-x-3 z-40 md:hidden select-none pointer-events-none">
      <nav className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-white/[0.12] bg-[#0E0E14]/90 backdrop-blur-2xl px-2 py-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-white"
                  : "text-[#8B8B96] hover:text-[#D1D1DB] active:scale-95"
              )}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <span className="absolute -top-1 h-1 w-6 rounded-full bg-[#7C5CFF] shadow-[0_0_10px_#7C5CFF]" />
              )}

              <div
                className={cn(
                  "relative flex h-7 w-7 items-center justify-center rounded-xl transition-all",
                  isActive
                    ? item.isAccent
                      ? "bg-gradient-to-tr from-[#7C5CFF] to-[#EC4899] text-white shadow-md shadow-[#7C5CFF]/30"
                      : "bg-[#7C5CFF]/20 text-[#7C5CFF]"
                    : item.isAccent
                    ? "text-[#FBBF24]"
                    : "text-[#8B8B96]"
                )}
              >
                <Icon className="h-4 w-4" />

                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded text-[7px] font-mono font-extrabold bg-[#7C5CFF] text-white shadow">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-[9px] font-medium tracking-tight mt-0.5 truncate max-w-[54px]",
                  isActive ? "text-white font-bold" : "text-[#8B8B96]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
