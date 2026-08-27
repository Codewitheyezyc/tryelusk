"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  FolderKanban,
  Sparkles,
  Layers,
  Heart,
  Plus,
  Home,
  ChevronRight,
  Check,
  ChevronDown,
  Trash2,
  X,
  FolderOpen,
} from "lucide-react";
import { useProjects } from "@/context/project-context";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { SidebarFolderTree } from "@/components/studio/sidebar-folder-tree";
import { cn } from "@/lib/utils";

interface CinemaSidebarProps {
  activeView?: "create" | "storyboard" | "generations" | "elements" | "favorites" | "projects";
  onChangeView?: (view: "create" | "storyboard" | "generations" | "elements" | "favorites" | "projects") => void;
  onNewProject?: () => void;
}

export function CinemaSidebar({
  activeView,
  onChangeView,
  onNewProject,
}: CinemaSidebarProps) {
  const pathname = usePathname();
  const {
    projects,
    activeProject,
    switchProject,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useProjects();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCurrent = (viewKey: string, route: string) => {
    if (activeView) return activeView === viewKey;
    return pathname === route;
  };

  const handleCreateClick = () => {
    setMobileSidebarOpen(false);
    if (onNewProject) {
      onNewProject();
    } else {
      setIsCreateOpen(true);
    }
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* 1. Header Branding & Active Project Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Link
              href="/generate"
              onClick={() => isMobile && setMobileSidebarOpen(false)}
              className="flex items-center gap-2.5 px-2 py-1 group"
            >
              <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#B066FF] flex items-center justify-center text-white font-extrabold shadow-md shadow-[#7C5CFF]/30 group-hover:scale-105 transition-transform">
                <Film className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-[#F2F2F5] tracking-tight">
                  Elusk Studio
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#7C5CFF]/20 text-[#7C5CFF] border border-[#7C5CFF]/30">
                  PRO
                </span>
              </div>
            </Link>

            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-white/[0.05] text-[#8B8B96] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Active Project Dropdown Switcher */}
          <div className="relative px-1">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-left transition-all"
            >
              <div className="min-w-0 pr-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#7C5CFF] block font-bold">
                  Active Film
                </span>
                <span className="text-xs font-bold text-white block truncate">
                  {activeProject.title}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#8B8B96] shrink-0" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-1 right-1 top-full mt-1.5 rounded-2xl border border-white/[0.1] bg-[#0E0E14] p-1.5 shadow-2xl z-50 animate-in fade-in duration-150 max-h-56 overflow-y-auto custom-scrollbar">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#8B8B96]">
                  Switch Film Project
                </div>

                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      switchProject(p.id);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-left transition-colors",
                      p.id === activeProject.id
                        ? "bg-[#7C5CFF]/15 text-[#7C5CFF]"
                        : "text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <span className="truncate">{p.title}</span>
                    {p.id === activeProject.id && <Check className="h-3 w-3 shrink-0" />}
                  </button>
                ))}

                <div className="pt-1 mt-1 border-t border-white/[0.06]">
                  <Link
                    href="/projects"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (isMobile) setMobileSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-[#7C5CFF] hover:bg-[#7C5CFF]/10 text-left"
                  >
                    <FolderKanban className="h-3.5 w-3.5" />
                    <span>Projects &amp; Folder Hub</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Primary Navigation */}
        <div className="space-y-1">
          <Link
            href="/generate"
            onClick={() => {
              onChangeView && onChangeView("create");
              if (isMobile) setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left",
              isCurrent("create", "/generate")
                ? "bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 text-white shadow-sm"
                : "text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-white/[0.04]"
            )}
          >
            <Home className="h-4 w-4 text-[#8B8B96]" />
            <span>Studio Workspace</span>
          </Link>

          <Link
            href="/storyboard"
            onClick={() => {
              onChangeView && onChangeView("storyboard");
              if (isMobile) setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left",
              isCurrent("storyboard", "/storyboard")
                ? "bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 text-white shadow-sm"
                : "text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-white/[0.04]"
            )}
          >
            <Film className="h-4 w-4 text-[#7C5CFF]" />
            <span>Storyboard Sequencer</span>
          </Link>

          <Link
            href="/projects"
            onClick={() => {
              onChangeView && onChangeView("projects");
              if (isMobile) setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left",
              isCurrent("projects", "/projects")
                ? "bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 text-white shadow-sm"
                : "text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-white/[0.04]"
            )}
          >
            <FolderKanban className="h-4 w-4 text-[#7C5CFF]" />
            <span>Film Projects Hub</span>
          </Link>

          <Link
            href="/generations"
            onClick={() => {
              onChangeView && onChangeView("generations");
              if (isMobile) setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left",
              activeView === "generations" && pathname === "/generations"
                ? "bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 text-white shadow-sm"
                : "text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-white/[0.04]"
            )}
          >
            <Sparkles className="h-4 w-4 text-[#FBBF24]" />
            <span>My Generations</span>
          </Link>

          <Link
            href="/media"
            onClick={() => {
              onChangeView && onChangeView("elements");
              if (isMobile) setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left",
              isCurrent("elements", "/media")
                ? "bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 text-white shadow-sm"
                : "text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-white/[0.04]"
            )}
          >
            <Layers className="h-4 w-4 text-[#7C5CFF]" />
            <span>Elements &amp; Production Hub</span>
          </Link>

          <Link
            href="/generations?filter=favorites"
            onClick={() => {
              onChangeView && onChangeView("favorites");
              if (isMobile) setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left",
              activeView === "favorites"
                ? "bg-[#7C5CFF]/15 border border-[#7C5CFF]/40 text-white shadow-sm"
                : "text-[#8B8B96] hover:text-[#F2F2F5] hover:bg-white/[0.04]"
            )}
          >
            <Heart className="h-4 w-4 text-[#EC4899]" />
            <span>Starred Favorites</span>
          </Link>

          <Link
            href="/trash"
            onClick={() => isMobile && setMobileSidebarOpen(false)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left",
              pathname === "/trash"
                ? "bg-red-500/15 border border-red-500/40 text-red-400 shadow-sm"
                : "text-[#8B8B96] hover:text-red-400 hover:bg-red-500/10"
            )}
          >
            <Trash2 className="h-4 w-4 text-red-400/80" />
            <span>Trash &amp; Bin</span>
          </Link>
        </div>

        {/* 3. Nested Production Folders Tree */}
        <SidebarFolderTree />

        {/* 4. Project Creation */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B96] font-mono px-2 block">
            Workspace Actions
          </span>

          <button
            type="button"
            onClick={handleCreateClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-dashed border-[#7C5CFF]/40 bg-[#7C5CFF]/5 hover:bg-[#7C5CFF]/15 text-xs font-semibold text-[#F2F2F5] transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-[#7C5CFF]" />
            <span>New Film Project</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col justify-between border-r border-white/[0.08] bg-[#0A0A0E]/95 backdrop-blur-xl h-[calc(100vh-4rem)] sticky top-16 select-none p-3 space-y-4 overflow-y-auto custom-scrollbar">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile & Tablet Slide-Over Drawer */}
      {mounted &&
        isMobileSidebarOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-xl md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="w-72 max-w-[85vw] h-full bg-[#0A0A0E] border-r border-white/[0.1] p-3 space-y-4 overflow-y-auto custom-scrollbar shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {renderSidebarContent(true)}
            </div>
          </div>,
          document.body
        )}

      {/* Modal is available anywhere */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
