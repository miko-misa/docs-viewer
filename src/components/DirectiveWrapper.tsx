"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  "data-title"?: string;
  "data-title-color"?: string;
  "data-color"?: string;
  "data-background"?: string;
  "data-border-color"?: string;
  "data-border-width"?: string;
  "data-border-style"?: string;
};

const COLUMN_COLLAPSED_MAX_VH = 50;

export default function DirectiveWrapper(props: Props) {
  const isColumn = props.className?.includes("directive-column") ?? false;
  const dataTitle = props["data-title"];
  const dataTitleColor = props["data-title-color"];
  const dataColor = props["data-color"];
  const dataBackground = props["data-background"];
  const dataBorderColor = props["data-border-color"];
  const dataBorderWidth = props["data-border-width"];
  const dataBorderStyle = props["data-border-style"];

  const defaultBorderColor = "#cbd5e1";
  const defaultTitleBgColor = "#cbd5e1";
  const hasBorder = dataBorderColor !== undefined && dataBorderColor !== "";
  const hasTitle = dataTitle !== undefined && dataTitle !== "";
  const contentRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const collapsedLabel = "すべて表示";
  const expandedLabel = "折りたたむ";
  const scrollOriginRef = useRef<number | null>(null);

  const handleToggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;

      if (typeof window !== "undefined") {
        if (next) {
          const origin =
            scrollOriginRef.current ??
            (contentRef.current
              ? contentRef.current.getBoundingClientRect().top + window.scrollY
              : window.scrollY);
          scrollOriginRef.current = null;
          window.requestAnimationFrame(() => {
            window.scrollTo({ top: origin });
          });
        } else {
          scrollOriginRef.current = window.scrollY;
        }
      }

      return next;
    });
  }, []);

  useEffect(() => {
    if (!isColumn) return;

    const element = contentRef.current;
    if (!element) return;

    const calculateLimit = () => {
      if (typeof window === "undefined") return 0;
      return (window.innerHeight || 0) * (COLUMN_COLLAPSED_MAX_VH / 100);
    };

    const updateOverflowState = () => {
      const limit = calculateLimit();
      if (limit === 0) return;

      const hasOverflowContent = element.scrollHeight > limit + 1;
      setIsOverflowing(hasOverflowContent);
      if (!hasOverflowContent) {
        setIsCollapsed(false);
        scrollOriginRef.current = null;
      }
    };

    updateOverflowState();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateOverflowState())
        : null;

    resizeObserver?.observe(element);

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateOverflowState);
    }

    return () => {
      resizeObserver?.disconnect();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateOverflowState);
      }
    };
  }, [isColumn, props.children]);

  if (!isColumn) {
    return <div className={`directive-wrapper ${props.className || ""}`} {...props} />;
  }

  return (
    <div className="directive-wrapper" id={props.id}>
      <div
        className={props.className}
        style={{
          border: hasBorder
            ? `${dataBorderWidth || "2px"} ${dataBorderStyle || "solid"} ${dataBorderColor}`
            : hasTitle
              ? `${dataBorderWidth || "2px"} solid ${defaultBorderColor}`
              : "none",
          ...props.style,
        }}
      >
        {dataTitle && (
          <div
            className="directive-column-title"
            style={{
              backgroundColor: dataColor || defaultTitleBgColor,
              color: dataTitleColor || "#1f2937",
              padding: "0.5rem 1rem",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {dataTitle}
          </div>
        )}
        <div
          className="directive-column-inner"
          style={{
            position: "relative",
          }}
        >
          <div
            ref={contentRef}
            className={`directive-column-content${isCollapsed && isOverflowing ? " is-collapsed" : ""}`}
            id={contentId}
            style={{
              backgroundColor: dataBackground,
              padding: "1rem",
              ...(isCollapsed && isOverflowing
                ? {
                    maxHeight: `${COLUMN_COLLAPSED_MAX_VH}vh`,
                    overflowY: "hidden",
                  }
                : {}),
            }}
          >
            {props.children}
          </div>
          {isCollapsed && isOverflowing && (
            <div className="directive-column-fade" aria-hidden="true" />
          )}
          {isOverflowing && (
            <button
              type="button"
              className="directive-column-toggle"
              onClick={handleToggle}
              aria-expanded={!isCollapsed}
              aria-controls={contentId}
              data-collapsed-label={collapsedLabel}
              data-expanded-label={expandedLabel}
            >
              {isCollapsed ? collapsedLabel : expandedLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
