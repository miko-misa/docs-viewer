'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePreviewMode } from '@/contexts/PreviewContext';

type RefLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  "data-ref"?: string;
  "data-ref-type"?: string;
  "data-ref-title"?: string;
};

type WindowData = {
  id: string;
  targetId: string;
  targetElement: HTMLElement;
  linkElement: HTMLElement;
  depth: number;
  initialPosition?: { top: number; left: number };
};

let windowIdCounter = 0;

// 子窓コンポーネント
const ChildRefWindow: React.FC<{
  windowId: string;
  targetId: string;
  targetElement: HTMLElement;
  linkElement: HTMLElement;
  depth: number;
  initialPosition?: { top: number; left: number };
  useFloating: boolean;
  onClose: () => void;
  onOpenChild: (childId: string, childTargetId: string, element: HTMLElement, linkEl: HTMLElement, parentDepth: number) => void;
}> = ({ windowId, targetId, targetElement, linkElement, depth, initialPosition, useFloating, onClose, onOpenChild }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [windowPosition, setWindowPosition] = useState(initialPosition || { top: 0, left: 0 });

  const handleJump = () => {
    const element = document.getElementById(targetId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  // DOM要素をクローンして挿入
  useEffect(() => {
    if (!targetElement || !contentRef.current) return;

    const clone = targetElement.cloneNode(true) as HTMLElement;
    
    // クローンのID重複を避ける
    const originalId = clone.id;
    clone.removeAttribute('id');
    
    // 参照先要素に一時的なIDを付与（スクロール用）
    let scrollTargetElement: Element | null = null;
    if (originalId === targetId) {
      clone.setAttribute('data-scroll-target', 'true');
      scrollTargetElement = clone;
    } else {
      scrollTargetElement = clone.querySelector(`[id="${targetId}"]`);
      if (scrollTargetElement) {
        scrollTargetElement.removeAttribute('id');
        scrollTargetElement.setAttribute('data-scroll-target', 'true');
      }
    }
    
    // 全てのIDを削除
    clone.querySelectorAll('[id]').forEach(el => {
      el.removeAttribute('id');
    });
    
    // クローン内の窓要素を削除（既に開いている窓が複製されるのを防ぐ）
    clone.querySelectorAll('.ref-preview-window').forEach(window => {
      window.remove();
    });
    
    // クローン内の参照リンクから data-ref を削除（Reactコンポーネントとして動作しないように）
    clone.querySelectorAll('a.ref-link').forEach(link => {
      link.removeAttribute('data-ref');
      link.removeAttribute('data-ref-type');
      link.removeAttribute('data-ref-title');
    });
    
    // クローン内の参照リンクのクリックを処理
    clone.querySelectorAll('a.ref-link').forEach(link => {
      const anchor = link as HTMLAnchorElement;
      const childTargetId = anchor.getAttribute('href')?.replace('#', '');
      
      if (!childTargetId) return;
      
      // クリックハンドラを設定
      anchor.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const childElement = document.getElementById(childTargetId);
        if (childElement) {
          const parent = childElement.parentElement;
          const elementToShow = parent?.classList.contains('docs-content') ? parent : childElement;
          
          const childId = `window-${windowIdCounter++}`;
          onOpenChild(childId, childTargetId, elementToShow, anchor, depth);
        }
      };
    });
    
    contentRef.current.innerHTML = '';
    contentRef.current.appendChild(clone);

    // スクロール処理
    if (scrollTargetElement && wrapperRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const scrollTarget = contentRef.current?.querySelector('[data-scroll-target="true"]');
          if (scrollTarget && wrapperRef.current) {
            const scrollContainer = wrapperRef.current;
            const containerTop = scrollContainer.getBoundingClientRect().top;
            const targetTop = scrollTarget.getBoundingClientRect().top;
            const relativeTop = targetTop - containerTop + scrollContainer.scrollTop;
            const scrollPosition = relativeTop - scrollContainer.clientHeight / 3;
            scrollContainer.scrollTop = Math.max(0, scrollPosition);
          }
        });
      });
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.innerHTML = '';
      }
    };
  }, [targetElement, targetId, onOpenChild]);

  return (
    <div 
      ref={windowRef}
      data-window-id={windowId}
      className={`ref-preview-window ref-preview-window-child ${useFloating ? 'ref-preview-floating' : ''}`}
      style={useFloating ? {
        top: `${windowPosition.top}px`,
        left: `${windowPosition.left}px`,
        zIndex: 1000 + depth,
      } : undefined}
    >
      <button
        onClick={handleClose}
        className="ref-preview-close-floating"
        aria-label="閉じる"
        type="button"
      >
        ×
      </button>
      
      <div ref={wrapperRef} className="ref-preview-content-wrapper">
        <div ref={contentRef} className="ref-preview-content" />
      </div>
      
      <div className="ref-preview-actions">
        <button onClick={handleJump} className="ref-preview-jump" type="button">
          参照先へジャンプ →
        </button>
      </div>
    </div>
  );
};

export const RefLink: React.FC<RefLinkProps> = ({ children, ...props }) => {
  const dataRef = props["data-ref"] as string | undefined;
  const { previewMode } = usePreviewMode();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewElement, setPreviewElement] = useState<HTMLElement | null>(null);
  const [childWindows, setChildWindows] = useState<WindowData[]>([]);
  const [windowPosition, setWindowPosition] = useState({ top: 0, left: 0 });
  const [useFloating, setUseFloating] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const windowIdRef = useRef<string>(`window-${windowIdCounter++}`);
  const fixedPositionRef = useRef<{ top: number; left: number } | null>(null);
  
  // 画面幅とプレビューモードを監視してフローティング表示の有無を決定
  useEffect(() => {
    const checkLayout = () => {
      const isWide = window.innerWidth >= 1280; // xl breakpoint
      setUseFloating(isWide && previewMode === 'floating');
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, [previewMode]);
  
  // フローティング表示時の位置を計算（初回のみ）
  useEffect(() => {
    if (!useFloating || !isExpanded || !linkRef.current) {
      fixedPositionRef.current = null;
      return;
    }
    
    // 既に位置が計算済みの場合は再利用
    if (fixedPositionRef.current) {
      setWindowPosition(fixedPositionRef.current);
      return;
    }
    
    const docsContent = linkRef.current.closest('.docs-content');
    if (!docsContent) return;
    
    const docsRect = docsContent.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const windowWidth = 650;
    let leftPosition = docsRect.right + 20;
    
    if (leftPosition + windowWidth > window.innerWidth - 20) {
      leftPosition = Math.max(20, window.innerWidth - windowWidth - 20);
    }
    
    // 既存の全ての窓の最下部を見つける
    let topPosition = scrollTop + 100;
    let maxBottom = topPosition;
    
    // 親窓をチェック
    const allParentWindows = document.querySelectorAll('.ref-preview-window:not(.ref-preview-window-child)');
    allParentWindows.forEach((win) => {
      const windowElement = win as HTMLElement;
      const windowTop = parseInt(windowElement.style.top || '0');
      const windowRect = win.getBoundingClientRect();
      const windowBottom = windowTop + windowRect.height;
      
      if (windowBottom > maxBottom) {
        maxBottom = windowBottom;
      }
    });
    
    // 子窓をチェック
    const allChildWindows = document.querySelectorAll('.ref-preview-window-child');
    allChildWindows.forEach((win) => {
      const windowElement = win as HTMLElement;
      const windowTop = parseInt(windowElement.style.top || '0');
      const windowRect = win.getBoundingClientRect();
      const windowBottom = windowTop + windowRect.height;
      
      if (windowBottom > maxBottom) {
        maxBottom = windowBottom;
      }
    });
    
    if (maxBottom > topPosition) {
      topPosition = maxBottom + 20;
    }
    
    const finalPosition = {
      top: topPosition,
      left: leftPosition,
    };
    
    fixedPositionRef.current = finalPosition;
    setWindowPosition(finalPosition);
  }, [useFloating, isExpanded]);
  
  if (!dataRef) {
    return <a {...props}>{children}</a>;
  }
  
  const targetId = props.href?.replace('#', '');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (!isExpanded && targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        const parent = element.parentElement;
        
        if (parent?.classList.contains('docs-content')) {
          setPreviewElement(parent);
        } else {
          setPreviewElement(element);
        }
      }
    }
    
    setIsExpanded(!isExpanded);
  };

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const openChildWindow = useCallback((childId: string, childTargetId: string, element: HTMLElement, linkEl: HTMLElement, parentDepth: number) => {
    const docsContent = linkEl.closest('.docs-content');
    if (!docsContent) return;
    
    const docsRect = docsContent.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const windowWidth = 650;
    let leftPosition = docsRect.right + 20;
    
    if (leftPosition + windowWidth > window.innerWidth - 20) {
      leftPosition = Math.max(20, window.innerWidth - windowWidth - 20);
    }
    
    // 親窓と既存の子窓の最下部を見つけて配置
    setChildWindows(prev => {
      let maxBottom = scrollTop + 100;
      
      const parentWindow = linkEl.closest('.ref-preview-window') as HTMLElement;
      if (parentWindow) {
        const parentTop = parseInt(parentWindow.style.top || '0');
        const parentRect = parentWindow.getBoundingClientRect();
        const parentBottom = parentTop + parentRect.height;
        maxBottom = parentBottom;
      }
      
      for (const existingWindow of prev) {
        const existingElement = document.querySelector(`[data-window-id="${existingWindow.id}"]`) as HTMLElement;
        if (existingElement) {
          const existingRect = existingElement.getBoundingClientRect();
          const existingTop = existingWindow.initialPosition?.top || 0;
          const existingBottom = existingTop + existingRect.height;
          
          if (existingBottom > maxBottom) {
            maxBottom = existingBottom;
          }
        } else if (existingWindow.initialPosition) {
          const estimatedBottom = existingWindow.initialPosition.top + 500;
          if (estimatedBottom > maxBottom) {
            maxBottom = estimatedBottom;
          }
        }
      }
      
      const topPosition = maxBottom + 20;
      
      return [...prev, { 
        id: childId, 
        targetId: childTargetId, 
        targetElement: element, 
        linkElement: linkEl,
        depth: parentDepth + 1,
        initialPosition: { top: topPosition, left: leftPosition }
      }];
    });
  }, []);

  const closeChildWindow = useCallback((childId: string) => {
    setChildWindows(prev => prev.filter(child => child.id !== childId));
  }, []);

  const handleJump = () => {
    if (targetId) {
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsExpanded(false);
    }
  };

  // 展開時にスムーズにスクロール（インライン表示の場合のみ）
  useEffect(() => {
    if (isExpanded && windowRef.current && !useFloating) {
      windowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isExpanded, useFloating]);

  // 参照先要素をクローンしてコンテンツエリアに挿入
  useEffect(() => {
    if (!isExpanded || !previewElement || !contentRef.current) return;

    const clone = previewElement.cloneNode(true) as HTMLElement;
    
    const originalId = clone.id;
    clone.removeAttribute('id');
    
    let targetElement: Element | null = null;
    if (targetId) {
      if (originalId === targetId) {
        clone.setAttribute('data-scroll-target', 'true');
        targetElement = clone;
      } else {
        targetElement = clone.querySelector(`[id="${targetId}"]`);
        if (targetElement) {
          targetElement.removeAttribute('id');
          targetElement.setAttribute('data-scroll-target', 'true');
        }
      }
    }
    
    clone.querySelectorAll('[id]').forEach(el => {
      el.removeAttribute('id');
    });
    
    clone.querySelectorAll('.ref-preview-window').forEach(window => {
      window.remove();
    });
    
    clone.querySelectorAll('a.ref-link').forEach(link => {
      link.removeAttribute('data-ref');
      link.removeAttribute('data-ref-type');
      link.removeAttribute('data-ref-title');
    });
    
    clone.querySelectorAll('a.ref-link').forEach(link => {
      const anchor = link as HTMLAnchorElement;
      const childTargetId = anchor.getAttribute('href')?.replace('#', '');
      
      if (!childTargetId) return;
      
      anchor.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const childElement = document.getElementById(childTargetId);
        if (childElement) {
          const parent = childElement.parentElement;
          const elementToShow = parent?.classList.contains('docs-content') ? parent : childElement;
          
          const childId = `window-${windowIdCounter++}`;
          openChildWindow(childId, childTargetId, elementToShow, anchor, 0);
        }
      };
    });
    
    contentRef.current.innerHTML = '';
    contentRef.current.appendChild(clone);

    if (targetElement && contentRef.current && wrapperRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const scrollTarget = contentRef.current?.querySelector('[data-scroll-target="true"]');
          if (scrollTarget && wrapperRef.current) {
            const scrollContainer = wrapperRef.current;
            
            const containerTop = scrollContainer.getBoundingClientRect().top;
            const targetTop = scrollTarget.getBoundingClientRect().top;
            const relativeTop = targetTop - containerTop + scrollContainer.scrollTop;
            
            const scrollPosition = relativeTop - scrollContainer.clientHeight / 3;
            scrollContainer.scrollTop = Math.max(0, scrollPosition);
          }
        });
      });
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.innerHTML = '';
      }
    };
  }, [isExpanded, previewElement, targetId, openChildWindow]);

  const className = ["ref-link", isExpanded ? "ref-link-active" : "", props.className]
    .filter(Boolean)
    .join(" ");

  // 窓のコンテンツ
  const windowContent = isExpanded && (
    <div
      ref={windowRef}
      data-window-id={windowIdRef.current}
      className={`ref-preview-window ${useFloating ? 'ref-preview-floating' : ''}`}
      style={useFloating ? {
        top: `${windowPosition.top}px`,
        left: `${windowPosition.left}px`,
        zIndex: 1000,
      } : undefined}
    >
      <button
        onClick={handleClose}
        className="ref-preview-close-floating"
        aria-label="閉じる"
        type="button"
      >
        ×
      </button>
      
      <div
        ref={wrapperRef}
        className="ref-preview-content-wrapper"
      >
        <div
          ref={contentRef}
          className="ref-preview-content"
        />
      </div>
      
      <div className="ref-preview-actions">
        <button
          onClick={handleJump}
          className="ref-preview-jump"
          type="button"
        >
          参照先へジャンプ →
        </button>
      </div>
    </div>
  );

  // 子窓のコンテンツ
  const childWindowsContent = childWindows.map(child => (
    <ChildRefWindow
      key={child.id}
      windowId={child.id}
      targetId={child.targetId}
      targetElement={child.targetElement}
      linkElement={child.linkElement}
      depth={child.depth}
      initialPosition={child.initialPosition}
      useFloating={useFloating}
      onClose={() => closeChildWindow(child.id)}
      onOpenChild={openChildWindow}
    />
  ));

  return (
    <>
      <a
        ref={linkRef}
        {...props}
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
      
      {windowContent}
      {childWindowsContent}
    </>
  );
};
