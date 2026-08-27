"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface RenderJob {
  id: string;
  type: "image" | "video" | "audio" | "lipsync" | "sequence";
  prompt: string;
  model: string;
  status: "rendering" | "completed" | "failed";
  outputUrl?: string;
  outputUrls?: string[];
  startedAt: number;
  completedAt?: number;
  error?: string;
}

interface RenderJobContextType {
  jobs: RenderJob[];
  activeJobs: RenderJob[];
  completedJobs: RenderJob[];
  latestCompletedJob: RenderJob | null;
  addJob: (job: { id?: string; type: RenderJob["type"]; prompt: string; model: string }) => string;
  updateJob: (id: string, updates: Partial<RenderJob>) => void;
  dismissJob: (id: string) => void;
  dismissLatestCompleted: () => void;
  clearCompleted: () => void;
}

const RenderJobContext = createContext<RenderJobContextType | undefined>(undefined);

export function RenderJobProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [latestCompletedJob, setLatestCompletedJob] = useState<RenderJob | null>(null);

  const activeJobs = jobs.filter((j) => j.status === "rendering");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  const addJob = ({
    id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    prompt,
    model,
  }: {
    id?: string;
    type: RenderJob["type"];
    prompt: string;
    model: string;
  }): string => {
    const newJob: RenderJob = {
      id,
      type,
      prompt,
      model,
      status: "rendering",
      startedAt: Date.now(),
    };
    setJobs((prev) => [newJob, ...prev]);
    return id;
  };

  const updateJob = (id: string, updates: Partial<RenderJob>) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const updated = { ...j, ...updates };
          if (updates.status === "completed" && j.status !== "completed") {
            updated.completedAt = Date.now();
            setLatestCompletedJob(updated);
          }
          return updated;
        }
        return j;
      })
    );
  };

  const dismissJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (latestCompletedJob?.id === id) {
      setLatestCompletedJob(null);
    }
  };

  const dismissLatestCompleted = () => {
    setLatestCompletedJob(null);
  };

  const clearCompleted = () => {
    setJobs((prev) => prev.filter((j) => j.status === "rendering"));
    setLatestCompletedJob(null);
  };

  return (
    <RenderJobContext.Provider
      value={{
        jobs,
        activeJobs,
        completedJobs,
        latestCompletedJob,
        addJob,
        updateJob,
        dismissJob,
        dismissLatestCompleted,
        clearCompleted,
      }}
    >
      {children}
    </RenderJobContext.Provider>
  );
}

export function useRenderJobs() {
  const context = useContext(RenderJobContext);
  if (!context) {
    throw new Error("useRenderJobs must be used within a RenderJobProvider");
  }
  return context;
}
