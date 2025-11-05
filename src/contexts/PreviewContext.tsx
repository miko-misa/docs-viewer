"use client";

import React, { createContext, useContext, useState } from "react";

type PreviewMode = "inline" | "floating";

interface PreviewContextType {
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [previewMode, setPreviewModeState] = useState<PreviewMode>(() => {
    if (typeof window === "undefined") {
      return "floating";
    }
    const saved = window.localStorage.getItem("preview-mode");
    return saved === "inline" || saved === "floating" ? saved : "floating";
  });

  // 設定をローカルストレージに保存
  const handleSetPreviewMode = (mode: PreviewMode) => {
    setPreviewModeState(mode);
    window.localStorage.setItem("preview-mode", mode);
  };

  return (
    <PreviewContext.Provider value={{ previewMode, setPreviewMode: handleSetPreviewMode }}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreviewMode() {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error("usePreviewMode must be used within a PreviewProvider");
  }
  return context;
}
