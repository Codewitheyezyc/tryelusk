"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Folder, FolderOpen, Film, FolderKanban } from "lucide-react";
import { useProjects } from "@/context/project-context";
import { cn } from "@/lib/utils";

interface ProjectBreadcrumbsProps {
  className?: string;
  showCurrentAction?: string;
}

export function ProjectBreadcrumbs({
  className,
  showCurrentAction,
}: ProjectBreadcrumbsProps) {
  const { activeProject, breadcrumbs, setActiveFolder, setMobileSidebarOpen } = useProjects();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0E0E14] border border-white/[0.08] text-xs font-semibold select-none flex-wrap backdrop-blur-md shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        <div className="flex items-center gap-1 text-[#7C5CFF] shrink-0 font-mono text-[10px] uppercase font-bold pr-1">
          <Film className="h-3.5 w-3.5" />
          <span>Project Path:</span>
        </div>

        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1 && !showCurrentAction;

          return (
            <React.Fragment key={crumb.id || "root"}>
              {idx > 0 && <ChevronRight className="h-3 w-3 text-[#8B8B96]/50 shrink-0" />}

              <button
                type="button"
                onClick={() => setActiveFolder(activeProject.id, crumb.id)}
                className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-colors truncate max-w-[160px]",
                  isLast
                    ? "bg-[#7C5CFF]/15 text-white font-bold border border-[#7C5CFF]/30"
                    : "text-[#8B8B96] hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {crumb.isProjectRoot ? (
                  <Film className="h-3 w-3 text-[#7C5CFF] shrink-0" />
                ) : isLast ? (
                  <FolderOpen className="h-3 w-3 text-[#38BDF8] shrink-0" />
                ) : (
                  <Folder className="h-3 w-3 text-[#8B8B96] shrink-0" />
                )}
                <span className="truncate">{crumb.name}</span>
              </button>
            </React.Fragment>
          );
        })}

        {showCurrentAction && (
          <>
            <ChevronRight className="h-3 w-3 text-[#8B8B96]/50 shrink-0" />
            <span className="px-1.5 py-0.5 rounded-lg bg-white/[0.06] text-white font-bold text-[11px] truncate">
              {showCurrentAction}
            </span>
          </>
        )}
      </div>

      {/* Mobile/iPad Quick Drawer Trigger */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#7C5CFF]/15 hover:bg-[#7C5CFF]/25 text-[#7C5CFF] border border-[#7C5CFF]/30 font-bold text-[11px] shrink-0 transition-colors ml-auto"
        title="Open Cinema Folders & Workspaces"
      >
        <FolderKanban className="h-3.5 w-3.5" />
        <span>Folders</span>
      </button>
    </div>
  );
}
