"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  CreditCard,
  FolderKanban,
  Layers,
  Sparkles,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Zap,
  Trash2,
} from "lucide-react";
import { logout } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

interface UserAvatarDropdownProps {
  userEmail?: string | null;
  creditBalance: number;
}

export function UserAvatarDropdown({
  userEmail,
  creditBalance,
}: UserAvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = userEmail ? userEmail.split("@")[0] : "Creator";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-white/[0.08] transition-colors focus:outline-none group"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7C5CFF] via-[#9B77FF] to-[#EC4899] p-[1.5px] shadow-md shadow-[#7C5CFF]/30 group-hover:scale-105 transition-transform">
          <div className="h-full w-full rounded-full bg-[#14141E] flex items-center justify-center text-[11px] font-extrabold text-white">
            {initials}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-[#8B8B96] transition-transform duration-200",
            isOpen && "rotate-180 text-white"
          )}
        />
      </button>

      {/* 100% Solid Opaque Dropdown Menu (No Transparency) */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/[0.18] bg-[#14141E] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.98)] z-[9999] animate-in fade-in slide-in-from-top-2 duration-150 space-y-1.5"
          style={{ backgroundColor: "#14141E" }}
        >
          {/* User Info Header */}
          <div className="p-3 rounded-xl bg-[#1C1C28] border border-white/[0.08] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[140px]">
                {displayName}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#7C5CFF]/30 text-[#A78BFA] border border-[#7C5CFF]/40">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#8B8B96] truncate">{userEmail || "user@tryelusk.com"}</p>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono font-bold text-[#FBBF24]">
              <Zap className="h-3.5 w-3.5 fill-[#FBBF24]" />
              <span>{creditBalance} Credits Available</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/[0.08] transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-[#7C5CFF]" />
              <span>Production Settings</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/[0.08] transition-colors"
            >
              <CreditCard className="h-3.5 w-3.5 text-[#4ADE80]" />
              <span>Credits &amp; Billing</span>
            </Link>

            <Link
              href="/projects"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/[0.08] transition-colors"
            >
              <FolderKanban className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>Film Projects &amp; Folders</span>
            </Link>

            <Link
              href="/media"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/[0.08] transition-colors"
            >
              <Layers className="h-3.5 w-3.5 text-[#EC4899]" />
              <span>Media Vault &amp; Cast</span>
            </Link>

            <Link
              href="/trash"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
              <span>Trash &amp; Archive</span>
            </Link>
          </div>

          {/* Sign Out Section */}
          <div className="pt-1.5 border-t border-white/[0.08]">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#F87171] hover:bg-[#F87171]/15 transition-colors text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
