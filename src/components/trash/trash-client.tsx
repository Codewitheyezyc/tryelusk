"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  RotateCcw,
  Sparkles,
  Film,
  Image as ImageIcon,
  CheckSquare,
  Square,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import {
  restoreFromTrashAction,
  permanentlyDeleteAction,
  emptyTrashAction,
} from "@/app/actions/generations-manage";
import { CinemaSidebar } from "@/components/studio/cinema-sidebar";
import { cn } from "@/lib/utils";
import type { Generation } from "@/types/database.types";

interface TrashClientProps {
  initialTrash: Generation[];
}

export function TrashClient({ initialTrash }: TrashClientProps) {
  const [trashItems, setTrashItems] = useState<Generation[]>(initialTrash);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const router = useRouter();

  const isAllSelected =
    trashItems.length > 0 && selectedIds.length === trashItems.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(trashItems.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRestore = (idsToRestore: string[]) => {
    startTransition(async () => {
      const res = await restoreFromTrashAction(idsToRestore);
      if (res.success) {
        setTrashItems((prev) => prev.filter((item) => !idsToRestore.includes(item.id)));
        setSelectedIds((prev) => prev.filter((id) => !idsToRestore.includes(id)));
        setActionFeedback(`Restored ${idsToRestore.length} item(s) to Generations.`);
        setTimeout(() => setActionFeedback(null), 3000);
        router.refresh();
      }
    });
  };

  const handlePermanentDelete = (idsToDelete: string[]) => {
    startTransition(async () => {
      const res = await permanentlyDeleteAction(idsToDelete);
      if (res.success) {
        setTrashItems((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
        setSelectedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
        setActionFeedback(`Permanently deleted ${idsToDelete.length} item(s).`);
        setTimeout(() => setActionFeedback(null), 3000);
        router.refresh();
      }
    });
  };

  const handleEmptyTrash = () => {
    startTransition(async () => {
      const res = await emptyTrashAction();
      if (res.success) {
        setTrashItems([]);
        setSelectedIds([]);
        setConfirmEmptyOpen(false);
        setActionFeedback("Trash has been permanently emptied.");
        setTimeout(() => setActionFeedback(null), 3000);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#060608] text-white">
      {/* Studio Cinema Sidebar */}
      <CinemaSidebar />

      {/* Main Trash Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/generations"
                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#8B8B96] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Trash2 className="h-4 w-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Trash &amp; Bin
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-white/[0.06] text-[#8B8B96] border border-white/[0.08]">
                {trashItems.length} {trashItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="text-xs text-[#8B8B96]">
              Items in trash can be restored back to your Studio/Vault or deleted permanently.
            </p>
          </div>

          {/* Action Bar */}
          {trashItems.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-all"
              >
                {isAllSelected ? (
                  <CheckSquare className="h-3.5 w-3.5 text-[#7C5CFF]" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-[#8B8B96]" />
                )}
                <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
              </button>

              {selectedIds.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRestore(selectedIds)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4ADE80]/15 hover:bg-[#4ADE80]/25 border border-[#4ADE80]/30 text-xs font-bold text-[#4ADE80] transition-all"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    <span>Restore Selected ({selectedIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(selectedIds)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-bold text-red-400 transition-all"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>Delete Permanently ({selectedIds.length})</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setConfirmEmptyOpen(true)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 transition-all ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Empty Trash</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="p-3 rounded-2xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-xs font-bold text-[#A78BFA] flex items-center gap-2 animate-in fade-in">
            <Sparkles className="h-4 w-4 text-[#7C5CFF]" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Empty State */}
        {trashItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 rounded-3xl border border-white/[0.06] bg-[#0E0E14]/60 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#8B8B96]">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-white">Trash is Empty</h3>
              <p className="text-xs text-[#8B8B96]">
                Deleted scene takes and images will appear here. You can safely restore them anytime.
              </p>
            </div>
            <Link
              href="/generations"
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white border border-white/[0.1] transition-all"
            >
              Back to Generations
            </Link>
          </div>
        ) : (
          /* Trashed Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trashItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isVideo = item.type === "video";
              const mediaUrl = item.output_url;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative rounded-2xl border bg-[#0E0E14] overflow-hidden transition-all space-y-2 p-2.5",
                    isSelected
                      ? "border-[#7C5CFF] shadow-lg shadow-[#7C5CFF]/20"
                      : "border-white/[0.08] hover:border-white/[0.18]"
                  )}
                >
                  {/* Media Preview Frame */}
                  <div className="relative aspect-video rounded-xl bg-black/60 overflow-hidden border border-white/[0.04]">
                    {mediaUrl ? (
                      isVideo ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={item.prompt || "Take"}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#8B8B96] p-2 text-center">
                        <AlertTriangle className="h-6 w-6 text-amber-400 mb-1" />
                        <span className="text-[10px] font-mono">Failed / Incomplete</span>
                      </div>
                    )}

                    {/* Selection Checkbox Overlay */}
                    <button
                      type="button"
                      onClick={() => toggleSelectItem(item.id)}
                      className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-md transition-all z-10"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-[#7C5CFF]" />
                      ) : (
                        <Square className="h-4 w-4 text-white/70" />
                      )}
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-mono font-bold text-[#8B8B96] backdrop-blur-md flex items-center gap-1 border border-white/10">
                      {isVideo ? <Film className="h-2.5 w-2.5" /> : <ImageIcon className="h-2.5 w-2.5" />}
                      <span>{isVideo ? "VIDEO" : "IMAGE"}</span>
                    </div>
                  </div>

                  {/* Card Info & Actions */}
                  <div className="space-y-1.5 px-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-white">
                      <span className="truncate max-w-[140px] text-[#A78BFA] font-mono">
                        {item.model_used || "AI Engine"}
                      </span>
                      <span className="text-[10px] font-mono text-[#8B8B96]">
                        {item.credits_charged} cr
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8B8B96] line-clamp-2 leading-relaxed">
                      {item.prompt || "No prompt details"}
                    </p>

                    {/* Deleted Timestamp */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-red-400/80 pt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Deleted: {new Date(item.deleted_at || item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Individual Restore / Delete Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => handleRestore([item.id])}
                        disabled={isPending}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 border border-[#4ADE80]/20 text-[11px] font-bold text-[#4ADE80] transition-all"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermanentDelete([item.id])}
                        disabled={isPending}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[11px] font-bold text-red-400 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal for Empty Trash */}
        {confirmEmptyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0E0E14] p-6 shadow-2xl space-y-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white">Permanently Empty Trash?</h3>
                <p className="text-xs text-[#8B8B96]">
                  This will permanently delete all {trashItems.length} items in your trash. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmEmptyOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEmptyTrash}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Yes, Empty Trash</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
