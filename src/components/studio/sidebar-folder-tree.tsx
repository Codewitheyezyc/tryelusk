"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  Clapperboard,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { useProjects, type ProductionFolder } from "@/context/project-context";
import { cn } from "@/lib/utils";

interface FolderItemProps {
  folder: ProductionFolder;
  level: number;
  allFolders: ProductionFolder[];
  projectId: string;
  activeFolderId: string | null;
  onSelect: (folderId: string) => void;
  onCreateSubfolder: (parentId: string) => void;
  onRename: (folder: ProductionFolder) => void;
  onDelete: (folderId: string) => void;
  onDirectScene: (folder: ProductionFolder) => void;
}

function FolderItem({
  folder,
  level,
  allFolders,
  projectId,
  activeFolderId,
  onSelect,
  onCreateSubfolder,
  onRename,
  onDelete,
  onDirectScene,
}: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const childFolders = allFolders.filter((f) => f.parentId === folder.id);
  const hasChildren = childFolders.length > 0;
  const isActive = activeFolderId === folder.id;

  return (
    <div className="space-y-0.5 select-none">
      <div
        className={cn(
          "group relative flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
          isActive
            ? "bg-[#7C5CFF]/20 text-white font-bold border border-[#7C5CFF]/40 shadow-sm"
            : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
        )}
        style={{ paddingLeft: `${Math.max(8, level * 14 + 8)}px` }}
        onClick={() => onSelect(folder.id)}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Expand / Collapse Icon */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 hover:text-white text-[#8B8B96] transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="w-3" />
          )}

          {/* Folder Icon with Color Badge */}
          <div className="relative shrink-0">
            {isExpanded && hasChildren ? (
              <FolderOpen
                className="h-3.5 w-3.5"
                style={{ color: folder.color || "#7C5CFF" }}
              />
            ) : (
              <Folder
                className="h-3.5 w-3.5"
                style={{ color: folder.color || "#7C5CFF" }}
              />
            )}
          </div>

          {/* Folder Name */}
          <span className="truncate text-[11px]">{folder.name}</span>
        </div>

        {/* Action Menu & Item Count */}
        <div className="flex items-center gap-1 shrink-0">
          {typeof folder.itemCount === "number" && folder.itemCount > 0 && (
            <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-[#8B8B96] group-hover:text-white">
              {folder.itemCount}
            </span>
          )}

          {/* 3-Dot Quick Action Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity text-[#8B8B96] hover:text-white"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-white/[0.1] bg-[#0E0E14] p-1 shadow-2xl z-50 animate-in fade-in duration-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    onCreateSubfolder(folder.id);
                    setIsMenuOpen(false);
                    setIsExpanded(true);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-white hover:bg-white/[0.06] text-left"
                >
                  <Plus className="h-3 w-3 text-[#7C5CFF]" />
                  <span>New Subfolder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDirectScene(folder);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-[#38BDF8] hover:bg-[#38BDF8]/10 text-left"
                >
                  <Clapperboard className="h-3 w-3 text-[#38BDF8]" />
                  <span>Direct Take Here</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRename(folder);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-white hover:bg-white/[0.06] text-left"
                >
                  <Edit2 className="h-3 w-3 text-[#8B8B96]" />
                  <span>Rename</span>
                </button>

                <div className="pt-1 mt-1 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete folder "${folder.name}" and its subfolders?`)) {
                        onDelete(folder.id);
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-[#F87171] hover:bg-[#F87171]/10 text-left"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render Child Subfolders Recursively */}
      {isExpanded && hasChildren && (
        <div className="space-y-0.5">
          {childFolders.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              allFolders={allFolders}
              projectId={projectId}
              activeFolderId={activeFolderId}
              onSelect={onSelect}
              onCreateSubfolder={onCreateSubfolder}
              onRename={onRename}
              onDelete={onDelete}
              onDirectScene={onDirectScene}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarFolderTree() {
  const {
    activeProject,
    createFolder,
    renameFolder,
    deleteFolder,
    setActiveFolder,
  } = useProjects();
  const router = useRouter();

  const [creatingParentId, setCreatingParentId] = useState<string | null | "root">(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<ProductionFolder | null>(null);
  const [editingName, setEditingName] = useState("");

  const rootFolders = activeProject.folders.filter((f) => f.parentId === null);

  const handleSelectFolder = (folderId: string) => {
    setActiveFolder(activeProject.id, folderId);
  };

  const handleStartCreate = (parentId: string | null | "root") => {
    setCreatingParentId(parentId);
    setNewFolderName("");
  };

  const handleConfirmCreate = () => {
    if (!newFolderName.trim() || creatingParentId === null) return;
    const parentId = creatingParentId === "root" ? null : creatingParentId;
    createFolder(activeProject.id, parentId, newFolderName.trim());
    setCreatingParentId(null);
    setNewFolderName("");
  };

  const handleStartRename = (folder: ProductionFolder) => {
    setEditingFolder(folder);
    setEditingName(folder.name);
  };

  const handleConfirmRename = () => {
    if (editingFolder && editingName.trim()) {
      renameFolder(activeProject.id, editingFolder.id, editingName.trim());
    }
    setEditingFolder(null);
  };

  const handleDirectScene = (folder: ProductionFolder) => {
    setActiveFolder(activeProject.id, folder.id);
    router.push(`/generate?folderId=${folder.id}`);
  };

  return (
    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2 text-[10px] font-mono uppercase text-[#8B8B96] font-bold">
        <span>Production Folders</span>
        <button
          type="button"
          onClick={() => handleStartCreate(activeProject.activeFolderId || "root")}
          className="p-1 rounded-md hover:bg-white/10 hover:text-white text-[#7C5CFF] transition-colors"
          title={activeProject.activeFolderId ? "Add Subfolder to Selected Folder" : "Create New Folder"}
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Root Project Level Item */}
      <button
        type="button"
        onClick={() => setActiveFolder(activeProject.id, null)}
        className={cn(
          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors text-left",
          activeProject.activeFolderId === null
            ? "bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30"
            : "text-[#8B8B96] hover:text-white hover:bg-white/[0.04]"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Folder className="h-3.5 w-3.5 text-[#7C5CFF] shrink-0" />
          <span className="truncate text-[11px]">All Project Assets</span>
        </div>
        <span className="text-[9px] font-mono text-[#8B8B96]">Root</span>
      </button>

      {/* Inline Create Root Folder Input */}
      {creatingParentId === "root" && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#12121A] border border-[#7C5CFF]">
          <input
            type="text"
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmCreate();
              if (e.key === "Escape") setCreatingParentId(null);
            }}
            placeholder="Folder name..."
            className="w-full bg-transparent text-xs text-white placeholder:text-[#8B8B96] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleConfirmCreate}
            className="p-1 hover:text-[#4ADE80] text-white"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setCreatingParentId(null)}
            className="p-1 hover:text-[#F87171] text-[#8B8B96]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Nested Folder Tree */}
      <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
        {rootFolders.length === 0 && !creatingParentId && (
          <p className="px-2 py-1.5 text-[10px] text-[#8B8B96]/70 italic">
            No folders yet. Click + to add scenes.
          </p>
        )}

        {rootFolders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            level={0}
            allFolders={activeProject.folders}
            projectId={activeProject.id}
            activeFolderId={activeProject.activeFolderId}
            onSelect={handleSelectFolder}
            onCreateSubfolder={(parentId) => handleStartCreate(parentId)}
            onRename={handleStartRename}
            onDelete={(id) => deleteFolder(activeProject.id, id)}
            onDirectScene={handleDirectScene}
          />
        ))}
      </div>

      {/* Inline Create Subfolder Input */}
      {creatingParentId && creatingParentId !== "root" && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#12121A] border border-[#7C5CFF] ml-4">
          <input
            type="text"
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmCreate();
              if (e.key === "Escape") setCreatingParentId(null);
            }}
            placeholder="Subfolder name..."
            className="w-full bg-transparent text-xs text-white placeholder:text-[#8B8B96] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleConfirmCreate}
            className="p-1 hover:text-[#4ADE80] text-white"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setCreatingParentId(null)}
            className="p-1 hover:text-[#F87171] text-[#8B8B96]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Inline Rename Dialog */}
      {editingFolder && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#12121A] border border-[#38BDF8]">
          <input
            type="text"
            autoFocus
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmRename();
              if (e.key === "Escape") setEditingFolder(null);
            }}
            className="w-full bg-transparent text-xs text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={handleConfirmRename}
            className="p-1 hover:text-[#4ADE80] text-white"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setEditingFolder(null)}
            className="p-1 hover:text-[#F87171] text-[#8B8B96]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
