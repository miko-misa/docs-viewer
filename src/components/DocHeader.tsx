"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DocHeaderProps = {
  title: string;
  groupTitle?: string;
  updatedAtText: string;
  tags?: string[];
  leftAccessory?: ReactNode;
};

const EXPANDED_HEIGHT = 168; // px
const COLLAPSED_HEIGHT = 64; // px
const COLLAPSE_RANGE = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
const BASE_PADDING_Y = 12; // px when collapsed
const EXTRA_PADDING_Y = 20; // additional px when expanded
const META_MAX_HEIGHT = 64; // px
const META_TRANSLATE = 10; // px
const GROUP_MAX_HEIGHT = 18; // px
const TITLE_BASE_SIZE = 1.75; // rem
const TITLE_EXTRA_SIZE = 0.55; // rem
const TITLE_BASE_LINE_HEIGHT = 1.15;
const TITLE_EXTRA_LINE_HEIGHT = 0.12;
const SCROLL_ACCELERATION = 1.2;
const PROGRESS_VAR = "--doc-header-progress";

export function DocHeader({
  title,
  groupTitle,
  updatedAtText,
  tags,
  leftAccessory,
}: DocHeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(1);
  const targetRef = useRef(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const applyProgress = (value: number) => {
      progressRef.current = value;
      headerEl.style.setProperty(PROGRESS_VAR, value.toString());
    };

    const step = () => {
      const current = progressRef.current;
      const target = targetRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.002) {
        applyProgress(target);
        rafRef.current = null;
        return;
      }

      const next = current + diff * 0.48;
      applyProgress(next);
      rafRef.current = window.requestAnimationFrame(step);
    };

    const schedule = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(step);
      }
    };

    const updateTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const effectiveScroll = scrollY * SCROLL_ACCELERATION;
      const rawProgress = 1 - effectiveScroll / COLLAPSE_RANGE;
      const clamped = Math.min(1, Math.max(0, rawProgress));
      if (Math.abs(targetRef.current - clamped) < 0.001) return;
      targetRef.current = clamped;
      schedule();
    };

    applyProgress(1);
    targetRef.current = 1;
    updateTarget();
    window.addEventListener("scroll", handleScroll, { passive: true });
    function handleScroll() {
      updateTarget();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const progressExpr = `var(${PROGRESS_VAR}, 1)`;

  return (
    <header
      ref={headerRef}
      className="px-6 backdrop-blur"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        boxShadow: "inset 0 -1px var(--color-border-subtle)",
        backgroundColor: "color-mix(in srgb, var(--background) 92%, transparent)",
        backdropFilter: "blur(12px)",
        height: `calc(${COLLAPSED_HEIGHT}px + ${COLLAPSE_RANGE}px * ${progressExpr})`,
        paddingTop: `calc(${BASE_PADDING_Y}px + ${EXTRA_PADDING_Y}px * ${progressExpr})`,
        paddingBottom: `calc(${BASE_PADDING_Y}px + ${EXTRA_PADDING_Y}px * ${progressExpr})`,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="flex w-full items-center">
        {leftAccessory && (
          <div className="flex shrink-0 items-center pr-4" style={{ height: "100%" }}>
            {leftAccessory}
          </div>
        )}
        <div className="flex flex-1">
          <div
            className="mx-auto flex w-full max-w-6xl flex-col items-start"
            style={{
              gap: `calc(6px * ${progressExpr})`,
            }}
          >
            {groupTitle && (
              <div
                style={{
                  maxHeight: `calc(${GROUP_MAX_HEIGHT}px * ${progressExpr})`,
                  overflow: "hidden",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--muted-foreground)",
                    opacity: progressExpr,
                    transform: `translateY(calc(${META_TRANSLATE}px * (${progressExpr} - 1)))`,
                  }}
                >
                  {groupTitle}
                </p>
              </div>
            )}
            <h1
              className="font-semibold"
              style={{
                color: "var(--foreground)",
                fontSize: `calc(${TITLE_BASE_SIZE}rem + ${TITLE_EXTRA_SIZE}rem * ${progressExpr})`,
                lineHeight: `calc(${TITLE_BASE_LINE_HEIGHT} + ${TITLE_EXTRA_LINE_HEIGHT} * ${progressExpr})`,
              }}
            >
              {title}
            </h1>
            <div
              className="overflow-hidden"
              style={{
                maxHeight: `calc(${META_MAX_HEIGHT}px * ${progressExpr})`,
              }}
            >
              <div
                className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-4"
                style={{
                  color: "var(--muted-foreground)",
                  opacity: progressExpr,
                  transform: `translateY(calc(${META_TRANSLATE}px * (${progressExpr} - 1)))`,
                  marginTop: `calc(12px * ${progressExpr})`,
                }}
              >
                <p className="font-medium">最終更新: {updatedAtText}</p>
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: "var(--muted-background)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
