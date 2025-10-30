"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePreviewMode } from "@/contexts/PreviewContext";

type RefLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  "data-ref"?: string;
  "data-ref-type"?: string;
  "data-ref-title"?: string;
};

type WindowData = {
  id: string;
  targetId: string;
  depth: number;
  initialPosition?: { top: number; left: number };
};

let windowIdCounter = 0;

const PREVIEW_CACHE = new Map<string, string>();
const LOADING_TEMPLATE = '<div class="ref-preview-loading">読み込み中…</div>';
const COLUMN_COLLAPSED_MAX_VH = 50;
let previewSourceIdCounter = 0;

function resolvePreviewSource(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;
  const column = element.closest<HTMLElement>(".directive-column");
  if (column) {
    return column;
  }
  const docsContent = element.closest<HTMLElement>(".docs-content");
  return docsContent ?? element;
}

function scrubClone(node: HTMLElement): HTMLElement {
  const clone = node.cloneNode(true) as HTMLElement;

  clone.querySelectorAll(".ref-preview-window").forEach((el) => el.remove());

  return clone;
}

function getCacheKey(sourceElement: HTMLElement, targetId: string): string {
  if (!sourceElement.dataset.previewCacheKey) {
    sourceElement.dataset.previewCacheKey = `preview-source-${previewSourceIdCounter++}`;
  }
  return `${sourceElement.dataset.previewCacheKey}::${targetId}`;
}

function buildPreviewHtml(sourceElement: HTMLElement, targetId: string): string {
  const cacheKey = getCacheKey(sourceElement, targetId);
  const cached = PREVIEW_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const container = document.createElement("div");

  const clone = scrubClone(sourceElement);

  const originalId = sourceElement.id;
  let scrollTarget: HTMLElement | null = null;

  if (originalId && originalId === targetId) {
    clone.setAttribute("data-scroll-target", "true");
    scrollTarget = clone;
  }

  if (!scrollTarget) {
    const targetInClone = clone.querySelector<HTMLElement>(`[id="${targetId}"]`);
    if (targetInClone) {
      targetInClone.removeAttribute("id");
      targetInClone.setAttribute("data-scroll-target", "true");
      scrollTarget = targetInClone;
    }
  }

  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));

  // 参照リンクのデータ属性を削除し、React管理の属性を避ける
  clone.querySelectorAll<HTMLAnchorElement>("a.ref-link").forEach((anchor) => {
    anchor.removeAttribute("data-ref");
    anchor.removeAttribute("data-ref-type");
    anchor.removeAttribute("data-ref-title");
  });

  container.appendChild(clone);

  const html = container.innerHTML;
  PREVIEW_CACHE.set(cacheKey, html);
  return html;
}

function renderPreviewContent(
  container: HTMLDivElement,
  targetElement: HTMLElement,
  targetId: string,
  depth: number,
  onOpenChild: (
    childId: string,
    childTargetId: string,
    linkEl: HTMLElement,
    parentDepth: number,
  ) => void,
) {
  const html = buildPreviewHtml(targetElement, targetId);
  container.innerHTML = html;

  container.querySelectorAll<HTMLAnchorElement>("a.ref-link").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const childTargetId = href.slice(1);

    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const childId = `window-${windowIdCounter++}`;
      onOpenChild(childId, childTargetId, anchor, depth);
    });
  });

  attachColumnToggleHandlers(container);
}

function attachColumnToggleHandlers(container: HTMLElement) {
  const toggles = container.querySelectorAll<HTMLButtonElement>(".directive-column-toggle");
  toggles.forEach((button) => {
    const column = button.closest(".directive-column");
    const content = column?.querySelector<HTMLElement>(".directive-column-content");
    const fade = column?.querySelector<HTMLElement>(".directive-column-fade");
    const scrollContainer =
      column?.closest<HTMLElement>(".ref-preview-content-wrapper") ??
      column?.closest<HTMLElement>(".docs-content");
    if (!column || !content) {
      return;
    }

    if (button.dataset.previewBound === "true") {
      return;
    }
    button.dataset.previewBound = "true";

    const collapsedLabel =
      button.dataset.collapsedLabel ?? button.getAttribute("data-collapsed-label") ?? "すべて表示";
    const expandedLabel =
      button.dataset.expandedLabel ?? button.getAttribute("data-expanded-label") ?? "折りたたむ";

    const collapse = () => {
      content.classList.add("is-collapsed");
      content.style.maxHeight = `${COLUMN_COLLAPSED_MAX_VH}vh`;
      content.style.overflowY = "hidden";
      button.setAttribute("aria-expanded", "false");
      if (fade) fade.style.removeProperty("display");
      button.textContent = collapsedLabel;
    };

    const expand = () => {
      content.classList.remove("is-collapsed");
      content.style.maxHeight = "";
      content.style.overflowY = "";
      button.setAttribute("aria-expanded", "true");
      if (fade) fade.style.display = "none";
      button.textContent = expandedLabel;
    };

    if (scrollContainer) {
      button.dataset.previewScrollTop = String(scrollContainer.scrollTop);
    }
    collapse();

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (content.classList.contains("is-collapsed")) {
        if (scrollContainer) {
          button.dataset.previewScrollTop = String(scrollContainer.scrollTop);
        }
        expand();
      } else {
        collapse();
        if (scrollContainer) {
          const stored = Number(button.dataset.previewScrollTop ?? "0");
          const target = Number.isFinite(stored) ? stored : 0;
          const maxScroll = Math.max(
            0,
            scrollContainer.scrollHeight - scrollContainer.clientHeight,
          );
          scrollContainer.scrollTop = Math.max(0, Math.min(target, maxScroll));
        }
      }
    });
  });
}

// 子窓コンポーネント
const ChildRefWindow: React.FC<{
  windowId: string;
  targetId: string;
  depth: number;
  initialPosition?: { top: number; left: number };
  useFloating: boolean;
  onClose: () => void;
  onOpenChild: (
    childId: string,
    childTargetId: string,
    linkEl: HTMLElement,
    parentDepth: number,
  ) => void;
}> = ({ windowId, targetId, depth, initialPosition, useFloating, onClose, onOpenChild }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [windowPosition] = useState(initialPosition || { top: 0, left: 0 });

  const handleJump = () => {
    const element = document.getElementById(targetId);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  // DOM要素をクローンして挿入
  useEffect(() => {
    const container = contentRef.current;
    const wrapper = wrapperRef.current;
    const resolvedElement = resolvePreviewSource(document.getElementById(targetId));

    if (!resolvedElement || !container) {
      return;
    }

    container.innerHTML = LOADING_TEMPLATE;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let raf1: number | null = null;
    let raf2: number | null = null;
    let rafScroll1: number | null = null;
    let rafScroll2: number | null = null;

    const scheduleScroll = () => {
      if (!wrapper || typeof window === "undefined" || !window.requestAnimationFrame) {
        return;
      }
      rafScroll1 = window.requestAnimationFrame(() => {
        rafScroll2 = window.requestAnimationFrame(() => {
          if (cancelled) return;
          const scrollTarget = container.querySelector('[data-scroll-target="true"]');
          if (scrollTarget) {
            const scrollContainer = wrapper;
            const containerTop = scrollContainer.getBoundingClientRect().top;
            const targetTop = scrollTarget.getBoundingClientRect().top;
            const relativeTop = targetTop - containerTop + scrollContainer.scrollTop;
            const scrollPosition = relativeTop - scrollContainer.clientHeight / 3;
            scrollContainer.scrollTop = Math.max(0, scrollPosition);
          }
        });
      });
    };

    const runRender = () => {
      if (cancelled) return;
      renderPreviewContent(container, resolvedElement, targetId, depth, onOpenChild);
      scheduleScroll();
    };

    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      raf1 = window.requestAnimationFrame(() => {
        if (cancelled) return;
        raf2 = window.requestAnimationFrame(() => {
          if (cancelled) return;
          runRender();
        });
      });
    } else {
      if (typeof window !== "undefined") {
        timeoutId = window.setTimeout(runRender, 0);
      } else {
        runRender();
      }
    }

    return () => {
      cancelled = true;
      if (timeoutId !== null && typeof window !== "undefined") {
        window.clearTimeout(timeoutId);
      }
      if (raf1 !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(raf1);
      }
      if (raf2 !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(raf2);
      }
      if (rafScroll1 !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(rafScroll1);
      }
      if (rafScroll2 !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(rafScroll2);
      }
      container.innerHTML = "";
    };
  }, [targetId, depth, onOpenChild]);

  return (
    <div
      ref={windowRef}
      data-window-id={windowId}
      className={`ref-preview-window ref-preview-window-child ${useFloating ? "ref-preview-floating" : ""}`}
      style={
        useFloating
          ? {
              top: `${windowPosition.top}px`,
              left: `${windowPosition.left}px`,
              zIndex: 1000 + depth,
            }
          : undefined
      }
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
        <div ref={contentRef} className="ref-preview-content"></div>
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
      setUseFloating(isWide && previewMode === "floating");
    };

    checkLayout();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
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

    const docsContent = linkRef.current.closest(".docs-content");
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
    const allParentWindows = document.querySelectorAll(
      ".ref-preview-window:not(.ref-preview-window-child)",
    );
    allParentWindows.forEach((win) => {
      const windowElement = win as HTMLElement;
      const windowTop = parseInt(windowElement.style.top || "0");
      const windowRect = win.getBoundingClientRect();
      const windowBottom = windowTop + windowRect.height;

      if (windowBottom > maxBottom) {
        maxBottom = windowBottom;
      }
    });

    // 子窓をチェック
    const allChildWindows = document.querySelectorAll(".ref-preview-window-child");
    allChildWindows.forEach((win) => {
      const windowElement = win as HTMLElement;
      const windowTop = parseInt(windowElement.style.top || "0");
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

  const targetId = props.href?.replace("#", "");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!isExpanded && targetId) {
      const element = resolvePreviewSource(document.getElementById(targetId));
      if (element) {
        setPreviewElement(element);
      }
    }

    setIsExpanded(!isExpanded);
  };

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const openChildWindow = useCallback(
    (childId: string, childTargetId: string, linkEl: HTMLElement, parentDepth: number) => {
      const docsContent =
        linkEl.closest(".docs-content") ?? document.querySelector(".docs-content");
      if (!docsContent) return;

      const docsRect = docsContent.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const windowWidth = 650;
      let leftPosition = docsRect.right + 20;

      if (leftPosition + windowWidth > window.innerWidth - 20) {
        leftPosition = Math.max(20, window.innerWidth - windowWidth - 20);
      }

      // 親窓と既存の子窓の最下部を見つけて配置
      setChildWindows((prev) => {
        let maxBottom = scrollTop + 100;

        const parentWindow = linkEl.closest(".ref-preview-window") as HTMLElement;
        if (parentWindow) {
          const parentTop = parseInt(parentWindow.style.top || "0");
          const parentRect = parentWindow.getBoundingClientRect();
          const parentBottom = parentTop + parentRect.height;
          maxBottom = parentBottom;
        }

        for (const existingWindow of prev) {
          const existingElement = document.querySelector(
            `[data-window-id="${existingWindow.id}"]`,
          ) as HTMLElement;
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

        return [
          ...prev,
          {
            id: childId,
            targetId: childTargetId,
            depth: parentDepth + 1,
            initialPosition: { top: topPosition, left: leftPosition },
          },
        ];
      });
    },
    [],
  );

  const closeChildWindow = useCallback((childId: string) => {
    setChildWindows((prev) => prev.filter((child) => child.id !== childId));
  }, []);

  const handleJump = () => {
    if (targetId) {
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      setIsExpanded(false);
    }
  };

  // 展開時にスムーズにスクロール（インライン表示の場合のみ）
  useEffect(() => {
    if (isExpanded && windowRef.current && !useFloating) {
      windowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isExpanded, useFloating]);

  // 参照先要素をクローンしてコンテンツエリアに挿入
  useEffect(() => {
    if (!isExpanded || !previewElement || !targetId) return;

    const container = contentRef.current;
    const wrapper = wrapperRef.current;
    if (!container) return;

    container.innerHTML = LOADING_TEMPLATE;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let raf1: number | null = null;
    let raf2: number | null = null;
    let rafScroll1: number | null = null;
    let rafScroll2: number | null = null;

    const scheduleScroll = () => {
      if (!wrapper || typeof window === "undefined" || !window.requestAnimationFrame) {
        return;
      }
      rafScroll1 = window.requestAnimationFrame(() => {
        rafScroll2 = window.requestAnimationFrame(() => {
          if (cancelled) return;
          const scrollTarget = container.querySelector('[data-scroll-target="true"]');
          if (scrollTarget) {
            const scrollContainer = wrapper;

            const containerTop = scrollContainer.getBoundingClientRect().top;
            const targetTop = scrollTarget.getBoundingClientRect().top;
            const relativeTop = targetTop - containerTop + scrollContainer.scrollTop;

            const scrollPosition = relativeTop - scrollContainer.clientHeight / 3;
            scrollContainer.scrollTop = Math.max(0, scrollPosition);
          }
        });
      });
    };

    const runRender = () => {
      if (cancelled) return;
      renderPreviewContent(container, previewElement, targetId, 0, openChildWindow);
      scheduleScroll();
    };

    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      raf1 = window.requestAnimationFrame(() => {
        if (cancelled) return;
        raf2 = window.requestAnimationFrame(() => {
          if (cancelled) return;
          runRender();
        });
      });
    } else {
      if (typeof window !== "undefined") {
        timeoutId = window.setTimeout(runRender, 0);
      } else {
        runRender();
      }
    }

    return () => {
      cancelled = true;
      if (timeoutId !== null && typeof window !== "undefined") {
        window.clearTimeout(timeoutId);
      }
      if (raf1 !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(raf1);
      }
      if (raf2 !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(raf2);
      }
      if (rafScroll1 !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(rafScroll1);
      }
      if (rafScroll2 !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(rafScroll2);
      }
      container.innerHTML = "";
    };
  }, [isExpanded, previewElement, targetId, openChildWindow]);

  if (!dataRef || !targetId) {
    return <a {...props}>{children}</a>;
  }

  const className = ["ref-link", isExpanded ? "ref-link-active" : "", props.className]
    .filter(Boolean)
    .join(" ");

  // 窓のコンテンツ
  const windowContent = isExpanded && (
    <div
      ref={windowRef}
      data-window-id={windowIdRef.current}
      className={`ref-preview-window ${useFloating ? "ref-preview-floating" : ""}`}
      style={
        useFloating
          ? {
              top: `${windowPosition.top}px`,
              left: `${windowPosition.left}px`,
              zIndex: 1000,
            }
          : undefined
      }
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
        <div ref={contentRef} className="ref-preview-content"></div>
      </div>

      <div className="ref-preview-actions">
        <button onClick={handleJump} className="ref-preview-jump" type="button">
          参照先へジャンプ →
        </button>
      </div>
    </div>
  );

  // 子窓のコンテンツ
  const childWindowsContent = childWindows.map((child) => (
    <ChildRefWindow
      key={child.id}
      windowId={child.id}
      targetId={child.targetId}
      depth={child.depth}
      initialPosition={child.initialPosition}
      useFloating={useFloating}
      onClose={() => closeChildWindow(child.id)}
      onOpenChild={openChildWindow}
    />
  ));

  return (
    <>
      <a ref={linkRef} {...props} onClick={handleClick} className={className}>
        {children}
      </a>

      {windowContent}
      {childWindowsContent}
    </>
  );
};
