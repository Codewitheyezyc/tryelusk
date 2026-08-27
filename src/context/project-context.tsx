"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ProductionFolder {
  id: string;
  projectId: string;
  parentId: string | null; // null for top-level folder under root project
  name: string;
  color?: string; // Hex color code for folder badge (e.g. #7C5CFF, #4ADE80, #38BDF8, #FBBF24, #EC4899)
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalScenes: number;
  totalRuntimeSeconds: number;
  totalTakesCount: number;
  castCount: number;
  creditsSpent: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  aspectRatio: "16:9" | "9:16" | "21:9" | "1:1";
  targetFps: 24 | 25 | 30 | 60;
  coverImageUrl?: string;
  folders: ProductionFolder[];
  activeFolderId: string | null; // null means root of film project
  createdAt: string;
  updatedAt: string;
  stats?: ProjectStats;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
  isProjectRoot?: boolean;
}

const DEFAULT_PROJECT: Project = {
  id: "proj_default",
  title: "Main Film Production",
  description: "Primary production workspace for cinematic takes, sequences, and cast members.",
  genre: "Sci-Fi / Cinema",
  aspectRatio: "16:9",
  targetFps: 24,
  folders: [],
  activeFolderId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stats: {
    totalScenes: 0,
    totalRuntimeSeconds: 0,
    totalTakesCount: 0,
    castCount: 0,
    creditsSpent: 0,
  },
};

interface ProjectContextType {
  projects: Project[];
  activeProject: Project;
  activeFolder: ProductionFolder | null;
  breadcrumbs: BreadcrumbItem[];
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  switchProject: (projectId: string) => void;
  createProject: (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "folders" | "activeFolderId">) => Project;
  updateProject: (id: string, projectData: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  createFolder: (projectId: string, parentId: string | null, name: string, color?: string) => ProductionFolder;
  renameFolder: (projectId: string, folderId: string, newName: string) => void;
  deleteFolder: (projectId: string, folderId: string) => void;
  setActiveFolder: (projectId: string, folderId: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = "tryelusk_projects_v4";
const ACTIVE_KEY = "tryelusk_active_project_id_v4";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([DEFAULT_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState<string>(DEFAULT_PROJECT.id);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(STORAGE_KEY);
      const storedActive = localStorage.getItem(ACTIVE_KEY);

      if (storedProjects) {
        const parsed = JSON.parse(storedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // ensure folders array exists on all parsed projects
          const normalized = parsed.map((p: any) => ({
            ...p,
            folders: Array.isArray(p.folders) ? p.folders : [],
            activeFolderId: p.activeFolderId ?? null,
          }));
          setProjects(normalized);
          if (storedActive && normalized.some((p: Project) => p.id === storedActive)) {
            setActiveProjectId(storedActive);
          } else {
            setActiveProjectId(normalized[0].id);
          }
          return;
        }
      }
    } catch {
      // fallback to DEFAULT_PROJECT
    }
  }, []);

  const saveProjects = (updatedProjects: Project[], newActiveId?: string) => {
    setProjects(updatedProjects);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      if (newActiveId) {
        setActiveProjectId(newActiveId);
        localStorage.setItem(ACTIVE_KEY, newActiveId);
      }
    } catch {
      // ignore
    }
  };

  const switchProject = (projectId: string) => {
    if (projects.some((p) => p.id === projectId)) {
      setActiveProjectId(projectId);
      try {
        localStorage.setItem(ACTIVE_KEY, projectId);
      } catch {
        // ignore
      }
    }
  };

  const createProject = (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "folders" | "activeFolderId">
  ): Project => {
    const newProjId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProj: Project = {
      ...projectData,
      id: newProjId,
      folders: [], // 100% clean slate: user creates their own folders
      activeFolderId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: projectData.stats || {
        totalScenes: 0,
        totalRuntimeSeconds: 0,
        totalTakesCount: 0,
        castCount: 0,
        creditsSpent: 0,
      },
    };

    const updated = [newProj, ...projects];
    saveProjects(updated, newProj.id);
    return newProj;
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    const updated = projects.map((p) =>
      p.id === id
        ? {
            ...p,
            ...projectData,
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    saveProjects(updated);
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const updated = projects.filter((p) => p.id !== id);
    const newActive = activeProjectId === id ? updated[0].id : activeProjectId;
    saveProjects(updated, newActive);
  };

  // Folder Actions
  const createFolder = (
    projectId: string,
    parentId: string | null,
    name: string,
    color: string = "#7C5CFF"
  ): ProductionFolder => {
    const newFolder: ProductionFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      parentId,
      name: name.trim() || "New Subfolder",
      color,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          folders: [...p.folders, newFolder],
          activeFolderId: newFolder.id,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    saveProjects(updated);
    return newFolder;
  };

  const renameFolder = (projectId: string, folderId: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;

    const updated = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          folders: p.folders.map((f) =>
            f.id === folderId ? { ...f, name: cleanName, updatedAt: new Date().toISOString() } : f
          ),
        };
      }
      return p;
    });

    saveProjects(updated);
  };

  const deleteFolder = (projectId: string, folderId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        // Collect all child folder IDs recursively
        const idsToDelete = new Set<string>([folderId]);
        let changed = true;
        while (changed) {
          changed = false;
          p.folders.forEach((f) => {
            if (f.parentId && idsToDelete.has(f.parentId) && !idsToDelete.has(f.id)) {
              idsToDelete.add(f.id);
              changed = true;
            }
          });
        }

        const remainingFolders = p.folders.filter((f) => !idsToDelete.has(f.id));
        const newActiveFolderId = idsToDelete.has(p.activeFolderId || "") ? null : p.activeFolderId;

        return {
          ...p,
          folders: remainingFolders,
          activeFolderId: newActiveFolderId,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    saveProjects(updated);
  };

  const setActiveFolder = (projectId: string, folderId: string | null) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          activeFolderId: folderId,
        };
      }
      return p;
    });

    saveProjects(updated);
  };

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECT;

  const activeFolder =
    activeProject.folders.find((f) => f.id === activeProject.activeFolderId) || null;

  // Build breadcrumbs for active folder
  const breadcrumbs: BreadcrumbItem[] = [
    {
      id: null,
      name: activeProject.title,
      isProjectRoot: true,
    },
  ];

  if (activeFolder) {
    const path: ProductionFolder[] = [];
    let current: ProductionFolder | undefined = activeFolder;
    while (current) {
      path.unshift(current);
      current = activeProject.folders.find((f) => f.id === current?.parentId);
    }
    path.forEach((folder) => {
      breadcrumbs.push({
        id: folder.id,
        name: folder.name,
        isProjectRoot: false,
      });
    });
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeFolder,
        breadcrumbs,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        switchProject,
        createProject,
        updateProject,
        deleteProject,
        createFolder,
        renameFolder,
        deleteFolder,
        setActiveFolder,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
