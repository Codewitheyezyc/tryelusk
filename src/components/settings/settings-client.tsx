"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Film,
  Key,
  CreditCard,
  Check,
  Sparkles,
  Sliders,
  Shield,
  Zap,
  Save,
  CheckCircle2,
  Ratio,
  Volume2,
} from "lucide-react";
import { CinemaSidebar } from "@/components/studio/cinema-sidebar";
import { ProjectBreadcrumbs } from "@/components/shared/project-breadcrumbs";
import { useCredits } from "@/context/credit-context";
import { cn } from "@/lib/utils";

interface SettingsClientProps {
  userEmail?: string | null;
  initialBalance: number;
}

export function SettingsClient({
  userEmail,
  initialBalance,
}: SettingsClientProps) {
  const { balance } = useCredits();
  const [activeTab, setActiveTab] = useState<"profile" | "cinema" | "api" | "billing">("profile");

  // Profile Form State
  const [displayName, setDisplayName] = useState(userEmail ? userEmail.split("@")[0] : "Cinema Creator");
  const [handle, setHandle] = useState("tryelusk_director");
  const [bio, setBio] = useState("Directing autonomous cinematic AI films and multi-scene sequences with TryElusk.");
  const [avatarColor, setAvatarColor] = useState("#7C5CFF");

  // Cinema Defaults State
  const [defaultRatio, setDefaultRatio] = useState<"16:9" | "9:16" | "21:9" | "1:1">("16:9");
  const [defaultFps, setDefaultFps] = useState<number>(24);
  const [defaultVideoModel, setDefaultVideoModel] = useState("kling-2.5-turbo");
  const [defaultAudioVoice, setDefaultAudioVoice] = useState("Rachel - Cinematic Warm");

  // API Key State
  const [falKey, setFalKey] = useState("");
  const [elevenKey, setElevenKey] = useState("");

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const tabs = [
    { id: "profile" as const, label: "Profile & Identity", icon: User },
    { id: "cinema" as const, label: "Cinema & Directing", icon: Film },
    { id: "api" as const, label: "API Keys & Cloud", icon: Key },
    { id: "billing" as const, label: "Subscription & Billing", icon: CreditCard },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#060608] text-[#F2F2F5] select-none">
      {/* 1. SIDEBAR */}
      <CinemaSidebar />

      {/* 2. MAIN SETTINGS WORKSPACE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto pb-24">
        {/* Interactive Breadcrumbs */}
        <ProjectBreadcrumbs showCurrentAction="Production Settings" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#7C5CFF]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C5CFF] font-mono">
                System Preferences
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Studio &amp; Account Settings
            </h1>
            <p className="text-xs text-[#8B8B96]">
              Manage your filmmaker identity, default camera aspect ratios, AI provider keys, and credit subscriptions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
                <span>Saved Changes!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-white/[0.08] bg-[#0E0E14] overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] text-white shadow-md shadow-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-white/[0.04]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 1. PROFILE & IDENTITY TAB */}
        {/* ========================================================================= */}
        {activeTab === "profile" && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#0E0E14] p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-extrabold text-white shadow-xl"
                style={{ backgroundColor: avatarColor }}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Creator Avatar Color</h3>
                <div className="flex items-center gap-2">
                  {["#7C5CFF", "#38BDF8", "#4ADE80", "#EC4899", "#FBBF24"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-transform",
                        avatarColor === color ? "scale-125 border-white" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8B8B96]">Director Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#12121A] text-xs text-white focus:border-[#7C5CFF] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8B8B96]">Creator Handle</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#12121A] text-xs text-white focus:border-[#7C5CFF] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#8B8B96]">Email Address</label>
                <input
                  type="text"
                  disabled
                  value={userEmail || "user@tryelusk.com"}
                  className="w-full h-10 px-3.5 rounded-xl border border-white/[0.06] bg-black/40 text-xs text-[#8B8B96] cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#8B8B96]">Filmmaker Bio &amp; Logline</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-white/[0.08] bg-[#12121A] text-xs text-white focus:border-[#7C5CFF] focus:outline-none custom-scrollbar"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CINEMA & DIRECTING DEFAULTS */}
        {/* ========================================================================= */}
        {activeTab === "cinema" && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#0E0E14] p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Default Canvas Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["16:9", "9:16", "21:9", "1:1"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setDefaultRatio(ratio)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-bold transition-colors",
                        defaultRatio === ratio
                          ? "bg-[#7C5CFF]/20 text-white border-[#7C5CFF]"
                          : "border-white/[0.08] bg-[#12121A] text-[#8B8B96] hover:text-white"
                      )}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Master Target Frame Rate</label>
                <div className="grid grid-cols-2 gap-2">
                  {[24, 25, 30, 60].map((fps) => (
                    <button
                      key={fps}
                      type="button"
                      onClick={() => setDefaultFps(fps)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-bold transition-colors",
                        defaultFps === fps
                          ? "bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]"
                          : "border-white/[0.08] bg-[#12121A] text-[#8B8B96] hover:text-white"
                      )}
                    >
                      {fps} fps {fps === 24 && "(Cinema Standard)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Default Video Render Engine</label>
                <select
                  value={defaultVideoModel}
                  onChange={(e) => setDefaultVideoModel(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#12121A] text-xs text-white focus:border-[#7C5CFF] focus:outline-none"
                >
                  <option value="kling-2.5-turbo">Kling 2.5 Turbo Video</option>
                  <option value="seedance-2.5">Seedance 2.5 Motion</option>
                  <option value="wan-2.1">Wan 2.1 Direct</option>
                  <option value="luma-ray-2">Luma Ray 2 Fast</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white">Default Narration Voice Actor</label>
                <select
                  value={defaultAudioVoice}
                  onChange={(e) => setDefaultAudioVoice(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#12121A] text-xs text-white focus:border-[#7C5CFF] focus:outline-none"
                >
                  <option value="Rachel - Cinematic Warm">Rachel — Cinematic Warm</option>
                  <option value="Adam - Deep Trailer Narration">Adam — Deep Trailer Narration</option>
                  <option value="Antoni - Expressive Storyteller">Antoni — Expressive Storyteller</option>
                  <option value="Bella - Elegant Soft Tone">Bella — Elegant Soft Tone</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. API KEYS & CLOUD TAB */}
        {/* ========================================================================= */}
        {activeTab === "api" && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#0E0E14] p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Shield className="h-4 w-4 text-[#7C5CFF]" />
                <span>Managed Cloud Cluster Active</span>
              </div>
              <p className="text-xs text-[#8B8B96]">
                By default, TryElusk manages all Fal.ai, Kling, and Segmind inference clusters automatically using your credits. You may optionally provide personal API keys below for zero-credit pass-through.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8B8B96]">Custom Fal.ai API Key (Optional)</label>
                <input
                  type="password"
                  value={falKey}
                  onChange={(e) => setFalKey(e.target.value)}
                  placeholder="fal_key_..."
                  className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#12121A] text-xs text-white placeholder:text-[#8B8B96]/40 focus:border-[#7C5CFF] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8B8B96]">Custom ElevenLabs API Key (Optional)</label>
                <input
                  type="password"
                  value={elevenKey}
                  onChange={(e) => setElevenKey(e.target.value)}
                  placeholder="xi_api_key_..."
                  className="w-full h-10 px-3.5 rounded-xl border border-white/[0.08] bg-[#12121A] text-xs text-white placeholder:text-[#8B8B96]/40 focus:border-[#7C5CFF] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. SUBSCRIPTION & BILLING TAB */}
        {/* ========================================================================= */}
        {activeTab === "billing" && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#0E0E14] p-6 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#7C5CFF]/15 to-[#EC4899]/15 border border-[#7C5CFF]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#7C5CFF] font-bold">
                  Current Tier
                </span>
                <h3 className="text-lg font-extrabold text-white">Creator PRO Studio</h3>
                <p className="text-xs text-[#8B8B96]">
                  Unlimited 1080p rendering, multi-scene storyboard sequencing &amp; Vibe Director co-pilot.
                </p>
              </div>

              <Link href="/dashboard">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-[#7C5CFF] hover:bg-[#6D3EFF] text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5 fill-white" />
                  <span>Refill Credits</span>
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#12121A] space-y-1">
                <span className="text-[10px] font-mono text-[#8B8B96] uppercase">Available Balance</span>
                <p className="text-xl font-extrabold text-[#FBBF24]">{balance} Credits</p>
              </div>

              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#12121A] space-y-1">
                <span className="text-[10px] font-mono text-[#8B8B96] uppercase">Next Monthly Refill</span>
                <p className="text-xl font-extrabold text-white">Active</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
