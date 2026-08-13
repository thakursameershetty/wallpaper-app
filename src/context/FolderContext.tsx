"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Folder {
  id: string;
  name: string;
  color: string;
  images: string[];
  sort_order?: number;
}

interface FolderContextType {
  folders: Folder[];
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updatedFolder: Folder) => void;
  removeFolder: (id: string) => void;
  reorderFolders: (newFolders: Folder[]) => void;
  refreshFolders: () => void;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export function FolderProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data && !error) {
      setFolders(data);
    } else if (error) {
      console.error("Error fetching folders:", error);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchFolders(), 0);
    return () => clearTimeout(t);
  }, []);

  const addFolder = (folder: Folder) => {
    setFolders((prev) => [folder, ...prev]);
  };

  const updateFolder = (id: string, updatedFolder: Folder) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? updatedFolder : f)));
  };

  const removeFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const reorderFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
  };

  return (
    <FolderContext.Provider value={{ folders, addFolder, updateFolder, removeFolder, reorderFolders, refreshFolders: fetchFolders }}>
      {children}
    </FolderContext.Provider>
  );
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error("useFolders must be used within a FolderProvider");
  }
  return context;
}
