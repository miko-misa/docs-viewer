'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePreviewMode } from '@/contexts/PreviewContext';

export function PreviewModeMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { previewMode, setPreviewMode } = usePreviewMode();
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 画面幅を監視
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrowScreen(window.innerWidth < 1280);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const effectiveMode = isNarrowScreen ? 'inline' : previewMode;

  return (
    <div ref={menuRef} className="preview-mode-menu">
      <button
        className="preview-mode-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="メニュー"
        type="button"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {isOpen && (
        <div className="preview-mode-dropdown">
          <div className="preview-mode-header">参照プレビュー設定</div>
          {isNarrowScreen && (
            <div className="preview-mode-notice">
              画面幅が狭いため、インライン表示のみ利用可能です
            </div>
          )}
          <button
            className={`preview-mode-option ${effectiveMode === 'floating' ? 'active' : ''}`}
            onClick={() => {
              setPreviewMode('floating');
              setIsOpen(false);
            }}
            disabled={isNarrowScreen}
            type="button"
          >
            <div className="preview-mode-option-title">フローティング表示</div>
            <div className="preview-mode-option-desc">ドキュメント横に表示</div>
          </button>
          <button
            className={`preview-mode-option ${effectiveMode === 'inline' ? 'active' : ''}`}
            onClick={() => {
              setPreviewMode('inline');
              setIsOpen(false);
            }}
            type="button"
          >
            <div className="preview-mode-option-title">インライン表示</div>
            <div className="preview-mode-option-desc">テキスト内に展開</div>
          </button>
        </div>
      )}
    </div>
  );
}
