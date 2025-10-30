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
  linkElement: HTMLElement;
  initialPosition?: { top: number; left: number; maxWidth?: number };
};

let windowIdCounter = 0;

const PREVIEW_CACHE = new Map<string, string>();
const LOADING_TEMPLATE = '<div class="ref-preview-loading">読み込み中…</div>';
const COLUMN_COLLAPSED_MAX_VH = 50;
const POPUP_WIDTH = 650;
const FLOATING_MARGIN = 12;
let previewSourceIdCounter = 0;

function resolvePreviewSource(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;
  if (element.classList.contains("annotation-entry") || element.closest(".annotation-entry")) {
    return element.classList.contains("annotation-entry")
      ? element
      : element.closest<HTMLElement>(".annotation-entry");
  }
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

type FloatingPositionOptions = {
  anchor: HTMLElement;
  windowEl: HTMLElement | null;
  exclude?: HTMLElement | null;
};

function calculateFloatingPosition(options: FloatingPositionOptions): {
  top: number;
  left: number;
  maxWidth?: number;
} {
  const { anchor, windowEl, exclude } = options;
  const docsContent = anchor.closest<HTMLElement>(".docs-content");
  const anchorRect = anchor.getBoundingClientRect();
  const windowHeight = windowEl?.getBoundingClientRect().height ?? 360;
  // マージン設定（ドキュメントとの隙間、ビューポート端との隙間）
  const DOC_GAP = 12; // ドキュメントとの隙間（px）
  const VIEWPORT_MARGIN = 16; // ビューポート端との隙間（px）

  if (docsContent) {
    const docRect = docsContent.getBoundingClientRect();
    const docWidth = docsContent.offsetWidth;

    // ドキュメントの右端に小窓の左端を合わせ、その右側に DOC_GAP の余白を入れる
    //（ドキュメントの右外に少しスペースを置いて表示）
    let left = docWidth + DOC_GAP;

    const baseTop = anchorRect.top - docRect.top;
    let candidateTop = Math.max(0, baseTop);

    const existingWindows = Array.from(
      docsContent.querySelectorAll<HTMLElement>(".ref-preview-window.ref-preview-floating"),
    ).filter((el) => el !== exclude);

    const resolveTop = (el: HTMLElement) => {
      const styleTop = Number.parseFloat(el.style.top || "");
      if (!Number.isNaN(styleTop)) return styleTop;
      const rect = el.getBoundingClientRect();
      return rect.top - docRect.top;
    };

    const overlaps = (top: number, height: number, win: HTMLElement) => {
      const otherTop = resolveTop(win);
      const otherHeight = win.getBoundingClientRect().height;
      return (
        top < otherTop + otherHeight + FLOATING_MARGIN && top + height + FLOATING_MARGIN > otherTop
      );
    };

    let iterations = 0;

    // desiredGlobalLeft は popup の左位置（ビューポート原点基準）
    const desiredGlobalLeft = docRect.left + left;

    // ポップアップの実際の幅を参照（DOM が与えられていればそれを優先）
    const popupWidth = windowEl?.getBoundingClientRect().width ?? POPUP_WIDTH;

    // ビューポート内に左右それぞれ VIEWPORT_MARGIN を保つための利用可能幅
    const availableWidth = window.innerWidth - VIEWPORT_MARGIN * 2;

    // ポップアップが利用可能幅より大きければ、幅を availableWidth に縮めて
    // 左端を VIEWPORT_MARGIN にする（右端に余白が出来る）
    if (popupWidth > availableWidth) {
      const maxWidth = Math.max(0, availableWidth);
      const adjustedGlobalLeft = VIEWPORT_MARGIN;
      left = adjustedGlobalLeft - docRect.left;

      // 重なり回避ロジック（幅縮小しても高さの衝突は避ける）
      while (
        existingWindows.some((win) => overlaps(candidateTop, windowHeight, win)) &&
        iterations < 100
      ) {
        const blockingBottom = existingWindows
          .filter((win) => overlaps(candidateTop, windowHeight, win))
          .map((win) => resolveTop(win) + win.getBoundingClientRect().height + FLOATING_MARGIN);
        if (blockingBottom.length === 0) break;
        candidateTop = Math.max(candidateTop, Math.min(...blockingBottom));
        iterations++;
      }

      const maxTop = Math.max(0, docsContent.scrollHeight - windowHeight - 20);
      candidateTop = Math.min(candidateTop, maxTop);

      return { top: candidateTop, left, maxWidth };
    }

    // 画面右端に収めるための最大 global left を計算（ポップアップ幅を使用）
    const computedMaxGlobalLeft = window.innerWidth - VIEWPORT_MARGIN - popupWidth;
    const maxGlobalLeft = Math.max(VIEWPORT_MARGIN, computedMaxGlobalLeft);
    const minGlobalLeft = VIEWPORT_MARGIN;

    // desiredGlobalLeft を [minGlobalLeft, maxGlobalLeft] の範囲にクランプ
    let adjustedGlobalLeft = Math.min(Math.max(desiredGlobalLeft, minGlobalLeft), maxGlobalLeft);

    left = adjustedGlobalLeft - docRect.left;

    while (
      existingWindows.some((win) => overlaps(candidateTop, windowHeight, win)) &&
      iterations < 100
    ) {
      const blockingBottom = existingWindows
        .filter((win) => overlaps(candidateTop, windowHeight, win))
        .map((win) => resolveTop(win) + win.getBoundingClientRect().height + FLOATING_MARGIN);
      if (blockingBottom.length === 0) break;
      candidateTop = Math.max(candidateTop, Math.min(...blockingBottom));
      iterations++;
    }

    const maxTop = Math.max(0, docsContent.scrollHeight - windowHeight - 20);
    candidateTop = Math.min(candidateTop, maxTop);

    return { top: candidateTop, left };
  }

  // Fallback: position relative to viewport
  const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let left = anchorRect.right + 20;
  left = Math.min(left, window.innerWidth - 20 - POPUP_WIDTH);
  left = Math.max(20, left);

  const minTop = scrollY + 40;
  let candidateTop = Math.max(minTop, anchorRect.top + scrollY - 20);

  const existingWindows = Array.from(
    document.querySelectorAll<HTMLElement>(".ref-preview-window.ref-preview-floating"),
  ).filter((el) => el !== exclude);

  const resolveTop = (el: HTMLElement) => {
    const styleTop = Number.parseFloat(el.style.top || "");
    if (!Number.isNaN(styleTop)) return styleTop;
    const rect = el.getBoundingClientRect();
    return rect.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
  };

  const overlaps = (top: number, height: number, win: HTMLElement) => {
    const otherTop = resolveTop(win);
    const otherHeight = win.getBoundingClientRect().height;
    return (
      top < otherTop + otherHeight + FLOATING_MARGIN && top + height + FLOATING_MARGIN > otherTop
    );
  };

  let iterations = 0;
  while (
    existingWindows.some((win) => overlaps(candidateTop, windowHeight, win)) &&
    iterations < 100
  ) {
    const blockingBottom = existingWindows
      .filter((win) => overlaps(candidateTop, windowHeight, win))
      .map((win) => resolveTop(win) + win.getBoundingClientRect().height + FLOATING_MARGIN);
    if (blockingBottom.length === 0) break;
    candidateTop = Math.max(candidateTop, Math.min(...blockingBottom));
    iterations++;
  }

  const maxTop = scrollY + window.innerHeight - windowHeight - 20;
  if (candidateTop > maxTop) {
    candidateTop = Math.max(minTop, maxTop);
  }

  return { top: candidateTop, left };
}

// 子窓コンポーネント
const ChildRefWindow: React.FC<{
  windowId: string;
  targetId: string;
  depth: number;
  linkElement: HTMLElement;
  initialPosition?: { top: number; left: number };
  useFloating: boolean;
  onClose: () => void;
  onOpenChild: (
    childId: string,
    childTargetId: string,
    linkEl: HTMLElement,
    parentDepth: number,
  ) => void;
}> = ({
  windowId,
  targetId,
  depth,
  linkElement,
  initialPosition,
  useFloating,
  onClose,
  onOpenChild,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [windowPosition, setWindowPosition] = useState<{
    top: number;
    left: number;
    maxWidth?: number;
  }>(initialPosition || { top: 0, left: 0 });
  const updateFloatingPosition = useCallback(() => {
    if (!useFloating) return;
    const position = calculateFloatingPosition({
      anchor: linkElement,
      windowEl: windowRef.current,
      exclude: windowRef.current,
    });
    setWindowPosition({ top: position.top, left: position.left, maxWidth: position.maxWidth });
    if (windowRef.current) {
      if (position.maxWidth !== undefined) {
        windowRef.current.style.maxWidth = `${position.maxWidth}px`;
      } else {
        windowRef.current.style.removeProperty("max-width");
      }
    }
  }, [useFloating, linkElement]);

  const handleJump = () => {
    const element = document.getElementById(targetId);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!useFloating) return;
    updateFloatingPosition();
    window.addEventListener("resize", updateFloatingPosition);
    return () => {
      window.removeEventListener("resize", updateFloatingPosition);
    };
  }, [useFloating, updateFloatingPosition]);

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
    let timeoutId: number | null = null;
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
      updateFloatingPosition();
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
  }, [targetId, depth, onOpenChild, updateFloatingPosition]);

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
              maxWidth: windowPosition.maxWidth ? `${windowPosition.maxWidth}px` : undefined,
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
  const [windowPosition, setWindowPosition] = useState<{
    top: number;
    left: number;
    maxWidth?: number;
  }>({ top: 0, left: 0 });
  const [useFloating, setUseFloating] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const windowIdRef = useRef<string>(`window-${windowIdCounter++}`);
  const updateFloatingPosition = useCallback(() => {
    if (!useFloating || !isExpanded || !linkRef.current) return;
    const position = calculateFloatingPosition({
      anchor: linkRef.current,
      windowEl: windowRef.current,
      exclude: windowRef.current,
    });
    setWindowPosition({ top: position.top, left: position.left, maxWidth: position.maxWidth });
    if (windowRef.current) {
      if (position.maxWidth !== undefined) {
        windowRef.current.style.maxWidth = `${position.maxWidth}px`;
      } else {
        windowRef.current.style.removeProperty("max-width");
      }
    }
  }, [useFloating, isExpanded]);

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

  useEffect(() => {
    if (!useFloating || !isExpanded) return;

    updateFloatingPosition();

    window.addEventListener("resize", updateFloatingPosition);
    return () => {
      window.removeEventListener("resize", updateFloatingPosition);
    };
  }, [useFloating, isExpanded, updateFloatingPosition]);

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
      const initialPosition = useFloating
        ? calculateFloatingPosition({ anchor: linkEl, windowEl: null, exclude: null })
        : { top: 0, left: 0 };

      setChildWindows((prev) => [
        ...prev,
        {
          id: childId,
          targetId: childTargetId,
          depth: parentDepth + 1,
          linkElement: linkEl,
          initialPosition,
        },
      ]);

      if (useFloating) {
        requestAnimationFrame(() => updateFloatingPosition());
      }
    },
    [useFloating, updateFloatingPosition],
  );

  const closeChildWindow = useCallback(
    (childId: string) => {
      setChildWindows((prev) => prev.filter((child) => child.id !== childId));
      if (useFloating) {
        requestAnimationFrame(() => updateFloatingPosition());
      }
    },
    [useFloating, updateFloatingPosition],
  );

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
    let timeoutId: number | null = null;
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
      updateFloatingPosition();
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
  }, [isExpanded, previewElement, targetId, openChildWindow, updateFloatingPosition]);

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
              maxWidth: windowPosition.maxWidth ? `${windowPosition.maxWidth}px` : undefined,
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
      linkElement={child.linkElement}
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
