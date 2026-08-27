"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  FolderPlus,
  Folder,
  FolderOpen,
  Clapperboard,
  Film,
  Sparkles,
  CheckCircle2,
  Trash2,
  Sliders,
  Play,
  ArrowRight,
  Ratio,
  Clock,
  Layers,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Edit3,
  Copy,
  MoreVertical,
  Check,
  X,
  Palette,
} from "lucide-react";
import { useProjects, type Project, type ProductionFolder } from "@/context/project-context";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { CinemaSidebar } from "@/components/studio/cinema-sidebar";
import { ProjectBreadcrumbs } from "@/components/shared/project-breadcrumbs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FOLDER_COLORS = ["#7C5CFF", "#38BDF8", "#4ADE80", "#FBBF24", "#EC4899", "#A855F7"];

export function ProjectsHubClient() {
  const {
    projects,
    activeProject,
    switchProject,
    createProject,
    deleteProject,
    createFolder,
    renameFolder,
    deleteFolder,
    setActiveFolder,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Collapsed state per project (true = collapsed, false = expanded)
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});

  // Quick Add Folder State
  const [quickAddProjectId, setQuickAddProjectId] = useState<string | null>(null);
  const [quickAddFolderName, setQuickAddFolderName] = useState("");
  const [quickAddParentId, setQuickAddParentId] = useState<string | null>(null);
  const [quickAddColor, setQuickAddColor] = useState(FOLDER_COLORS[0]);

  // Rename Folder State
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renamingFolderName, setRenamingFolderName] = useState("");

  const router = useRouter();

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCollapse = (projectId: string) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleOpenStudio = (project: Project, folderId?: string | null) => {
    switchProject(project.id);
    setActiveFolder(project.id, folderId || null);
    router.push("/generate");
  };

  const handleOpenStoryboard = (project: Project, folderId?: string | null) => {
    switchProject(project.id);
    setActiveFolder(project.id, folderId || null);
    router.push("/storyboard");
  };

  const handleConfirmQuickAdd = (projectId: string) => {
    if (!quickAddFolderName.trim()) return;
    createFolder(projectId, quickAddParentId, quickAddFolderName.trim(), quickAddColor);
    setQuickAddProjectId(null);
    setQuickAddFolderName("");
    setQuickAddParentId(null);
  };

  const handleStartRenameFolder = (folder: ProductionFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingFolderId(folder.id);
    setRenamingFolderName(folder.name);
  };

  const handleSaveRenameFolder = (projectId: string, folderId: string) => {
    if (renamingFolderName.trim()) {
      renameFolder(projectId, folderId, renamingFolderName.trim());
    }
    setRenamingFolderId(null);
    setRenamingFolderName("");
  };

  const handleDeleteFolderConfirm = (projectId: string, folder: ProductionFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete folder "${folder.name}"? Takes inside will be unassigned.`)) {
      deleteFolder(projectId, folder.id);
    }
  };

  const handleDuplicateProject = (project: Project) => {
    createProject({
      title: `${project.title} (Copy)`,
      description: project.description,
      genre: project.genre,
      aspectRatio: project.aspectRatio,
      targetFps: project.targetFps,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#060608] text-[#F2F2F5] select-none">
      {/* 1. SIDEBAR with interactive folder tree */}
      <CinemaSidebar activeView="projects" />

      {/* 2. MAIN PROJECTS HUB WORKSPACE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto pb-24">
        {/* Interactive Breadcrumb Bar */}
        <ProjectBreadcrumbs showCurrentAction="Film Projects &amp; Workspaces Hub" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[#7C5CFF]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C5CFF] font-mono">
                Workspaces &amp; Production Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Film Projects &amp; Workspaces
            </h1>
            <p className="text-xs text-[#8B8B96]">
              Organize your takes, storyboard sequences, cast members, and scenes by dedicated film project.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold shadow-lg shadow-[#7C5CFF]/30 flex items-center gap-2 transition-all"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Film Project</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0E0E14] space-y-1">
            <span className="text-[10px] font-mono text-[#8B8B96] uppercase">Total Film Projects</span>
            <p className="text-xl font-extrabold text-white">{projects.length}</p>
          </div>

          <div className="p-4 rounded-2xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/5 space-y-1">
            <span className="text-[10px] font-mono text-[#7C5CFF] uppercase">Active Film Workspace</span>
            <p className="text-sm font-extrabold text-white truncate">{activeProject.title}</p>
          </div>

          <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0E0E14] space-y-1">
            <span className="text-[10px] font-mono text-[#8B8B96] uppercase">Master Canvas</span>
            <p className="text-xl font-extrabold text-white">{activeProject.aspectRatio}</p>
          </div>

          <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#0E0E14] space-y-1">
            <span className="text-[10px] font-mono text-[#8B8B96] uppercase">Master Frame Rate</span>
            <p className="text-xl font-extrabold text-[#4ADE80]">{activeProject.targetFps} fps</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B8B96]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, genre, or synopsis..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl border border-white/[0.1] bg-[#0E0E14] text-xs sm:text-sm text-white placeholder:text-[#8B8B96]/50 focus:outline-none focus:border-[#7C5CFF] transition-all"
          />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project) => {
            const isActive = activeProject.id === project.id;
            const isCollapsed = Boolean(collapsedProjects[project.id]);
            const topFolders = project.folders.filter((f) => f.parentId === null);

            return (
              <div
                key={project.id}
                className={cn(
                  "group relative rounded-3xl border bg-[#0E0E14] p-5 sm:p-6 space-y-4 flex flex-col justify-between transition-all duration-300",
                  isActive
                    ? "border-[#7C5CFF] ring-1 ring-[#7C5CFF]/50 shadow-xl shadow-[#7C5CFF]/15"
                    : "border-white/[0.08] hover:border-white/20 hover:bg-[#12121A]"
                )}
              >
                <div className="space-y-3.5">
                  {/* Top Badges & Project Operations */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.08] text-[#8B8B96]">
                        {project.genre}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/60 text-[#8B8B96] border border-white/10">
                        {project.aspectRatio} • {project.targetFps}fps
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20">
                        {project.folders.length} Folders
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40 flex items-center gap-1 shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                          ACTIVE
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => switchProject(project.id)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#8B8B96] hover:text-white hover:bg-white/10 transition-colors"
                        >
                          Set Active
                        </button>
                      )}

                      {/* Edit Project Button */}
                      <button
                        type="button"
                        onClick={() => setEditingProject(project)}
                        className="p-1.5 rounded-lg border border-white/[0.08] text-[#8B8B96] hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Project Settings"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {/* Duplicate Project Button */}
                      <button
                        type="button"
                        onClick={() => handleDuplicateProject(project)}
                        className="p-1.5 rounded-lg border border-white/[0.08] text-[#8B8B96] hover:text-white hover:bg-white/10 transition-colors"
                        title="Duplicate Project"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-white group-hover:text-[#7C5CFF] transition-colors truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#8B8B96] line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Collapsible Folders Section */}
                  <div className="rounded-2xl border border-white/[0.06] bg-black/40 overflow-hidden">
                    {/* Folders Header / Toggle Bar */}
                    <div className="p-3 flex items-center justify-between text-[11px] font-bold text-white bg-white/[0.02] border-b border-white/[0.04]">
                      <button
                        type="button"
                        onClick={() => toggleCollapse(project.id)}
                        className="flex items-center gap-1.5 hover:text-[#7C5CFF] transition-colors"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 text-[#8B8B96]" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-[#7C5CFF]" />
                        )}
                        <span>Production Folders ({project.folders.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddProjectId(project.id);
                          setQuickAddFolderName("");
                          setQuickAddParentId(null);
                        }}
                        className="text-[10px] font-mono text-[#7C5CFF] hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Folder</span>
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="p-3.5 space-y-2">
                        {/* Quick Add Folder Input Form */}
                        {quickAddProjectId === project.id && (
                          <div className="p-2.5 rounded-xl border border-[#7C5CFF]/40 bg-[#14141E] space-y-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={quickAddFolderName}
                                onChange={(e) => setQuickAddFolderName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleConfirmQuickAdd(project.id);
                                  if (e.key === "Escape") setQuickAddProjectId(null);
                                }}
                                placeholder="Folder / Scene name (e.g. Act 2 — Chase)..."
                                className="flex-1 h-8 px-2.5 rounded-lg border border-white/[0.1] bg-[#0E0E14] text-xs text-white placeholder:text-[#8B8B96] focus:outline-none focus:border-[#7C5CFF]"
                              />
                              <button
                                type="button"
                                onClick={() => handleConfirmQuickAdd(project.id)}
                                className="h-8 px-3 rounded-lg bg-[#7C5CFF] text-white text-xs font-bold shadow"
                              >
                                Create
                              </button>
                              <button
                                type="button"
                                onClick={() => setQuickAddProjectId(null)}
                                className="h-8 px-2 rounded-lg bg-white/10 text-xs text-[#8B8B96] hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>

                            {/* Color Selector */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[10px] text-[#8B8B96] font-mono">Color:</span>
                              <div className="flex items-center gap-1.5">
                                {FOLDER_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setQuickAddColor(color)}
                                    className={cn(
                                      "h-4 w-4 rounded-full transition-transform",
                                      quickAddColor === color ? "scale-125 ring-2 ring-white" : "opacity-60 hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Folders List with Inline Rename & Delete */}
                        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                          {topFolders.length === 0 ? (
                            <p className="text-[11px] text-[#8B8B96] italic py-1">
                              No folders created yet. Click "Add Folder" above.
                            </p>
                          ) : (
                            topFolders.map((folder) => {
                              const subChildren = project.folders.filter(
                                (f) => f.parentId === folder.id
                              );
                              const isRenaming = renamingFolderId === folder.id;

                              return (
                                <div key={folder.id} className="space-y-1">
                                  {isRenaming ? (
                                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#14141E]">
                                      <input
                                        type="text"
                                        autoFocus
                                        value={renamingFolderName}
                                        onChange={(e) => setRenamingFolderName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleSaveRenameFolder(project.id, folder.id);
                                          if (e.key === "Escape") setRenamingFolderId(null);
                                        }}
                                        className="flex-1 h-7 px-2 rounded-lg border border-[#7C5CFF] bg-[#0E0E14] text-xs text-white focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSaveRenameFolder(project.id, folder.id)}
                                        className="p-1.5 rounded-lg bg-[#4ADE80] text-black"
                                      >
                                        <Check className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRenamingFolderId(null)}
                                        className="p-1.5 rounded-lg bg-white/10 text-[#8B8B96]"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => handleOpenStudio(project, folder.id)}
                                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-colors group/f"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Folder
                                          className="h-3.5 w-3.5 shrink-0"
                                          style={{ color: folder.color || "#7C5CFF" }}
                                        />
                                        <span className="text-xs text-white group-hover/f:text-[#7C5CFF] truncate font-medium">
                                          {folder.name}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {/* Inline Folder Actions */}
                                        <button
                                          type="button"
                                          onClick={(e) => handleStartRenameFolder(folder, e)}
                                          className="opacity-0 group-hover/f:opacity-100 p-1 text-[#8B8B96] hover:text-white transition-opacity"
                                          title="Rename Folder"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteFolderConfirm(project.id, folder, e)}
                                          className="opacity-0 group-hover/f:opacity-100 p-1 text-[#8B8B96] hover:text-[#F87171] transition-opacity"
                                          title="Delete Folder"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>

                                        <span className="text-[10px] font-mono text-[#8B8B96] group-hover/f:text-white flex items-center gap-0.5">
                                          <span>Open</span>
                                          <ChevronRight className="h-3 w-3" />
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Subfolders */}
                                  {subChildren.map((sub) => (
                                    <div
                                      key={sub.id}
                                      onClick={() => handleOpenStudio(project, sub.id)}
                                      className="flex items-center justify-between p-1 pl-6 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors text-[11px] text-[#8B8B96] hover:text-white group/sub"
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <Folder className="h-3 w-3 text-[#38BDF8] shrink-0" />
                                        <span className="truncate">{sub.name}</span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteFolderConfirm(project.id, sub, e)}
                                          className="opacity-0 group-hover/sub:opacity-100 p-1 text-[#8B8B96] hover:text-[#F87171] transition-opacity"
                                        >
                                          <Trash2 className="h-2.5 w-2.5" />
                                        </button>
                                        <span className="text-[9px] font-mono">Subfolder</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action CTAs */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenStudio(project)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6D3EFF] hover:from-[#6D3EFF] hover:to-[#5B2DEE] text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Direct Scene</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStoryboard(project)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10 flex items-center gap-1.5"
                    >
                      <Film className="h-3 w-3" />
                      <span>Storyboard</span>
                    </button>
                  </div>

                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${project.title}" and all its folders?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-2 rounded-xl text-[#8B8B96] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
                      title="Delete Film Project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* 4. Edit Project Modal */}
      <EditProjectModal
        project={editingProject}
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
      />
    </div>
  );
}
