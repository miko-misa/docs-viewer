'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type PreviewMode = 'inline' | 'floating';

interface PreviewContextType {
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('floating');

  // ローカルストレージから設定を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('preview-mode');
    if (saved === 'inline' || saved === 'floating') {
      setPreviewMode(saved);
    }
  }, []);

  // 設定をローカルストレージに保存
  const handleSetPreviewMode = (mode: PreviewMode) => {
    setPreviewMode(mode);
    localStorage.setItem('preview-mode', mode);
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
    throw new Error('usePreviewMode must be used within a PreviewProvider');
  }
  return context;
}
