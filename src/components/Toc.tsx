"use client";

import React, { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

type TocProps = {
  items: TocItem[];
};

export function Toc({ items }: TocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const allHeadings = Array.from(
      document.querySelectorAll("h1[id], h2[id], h3[id]")
    );

    const headingElements = allHeadings.filter((heading) => {
      let parent = heading.parentElement;
      while (parent && parent !== document.body) {
        if (
          parent.tagName === "PRE" ||
          parent.tagName === "CODE" ||
          parent.tagName === "BLOCKQUOTE"
        ) {
          return false;
        }
        parent = parent.parentElement;
      }
      return true;
    });

    if (headingElements.length === 0) return;

    const calculateActiveScore = (element: Element): number => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        return 0;
      }

      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const elementHeight = rect.height;
      const intersectionScore = elementHeight > 0 ? visibleHeight / elementHeight : 0;

      const idealPosition = viewportHeight * 0.2;
      const distance = Math.abs(rect.top - idealPosition);
      const maxDistance = viewportHeight;
      const positionScore = Math.max(0, 1 - distance / maxDistance);

      const sectionScore = calculateSectionVisibility(element, headingElements);

      return intersectionScore * 0.3 + positionScore * 0.4 + sectionScore * 0.3;
    };

    const calculateSectionVisibility = (
      heading: Element,
      allHeadings: Element[]
    ): number => {
      const currentIndex = allHeadings.indexOf(heading);
      const nextHeading = allHeadings[currentIndex + 1];

      const headingRect = heading.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const sectionTop = headingRect.bottom;

      const sectionBottom = nextHeading
        ? nextHeading.getBoundingClientRect().top
        : document.documentElement.scrollHeight - window.scrollY;

      const sectionHeight = sectionBottom - sectionTop;
      if (sectionHeight <= 0) return 0;

      const visibleTop = Math.max(sectionTop, 0);
      const visibleBottom = Math.min(sectionBottom, viewportHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      return visibleHeight / Math.min(sectionHeight, viewportHeight);
    };

    const updateActiveHeading = () => {
      let maxScore = 0;
      let activeElement: Element | null = null;

      if (window.scrollY < 100) {
        setActiveId(headingElements[0]?.id || "");
        return;
      }

      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;
      if (isAtBottom) {
        setActiveId(headingElements[headingElements.length - 1]?.id || "");
        return;
      }

      for (const element of headingElements) {
        const score = calculateActiveScore(element);
        if (score > maxScore) {
          maxScore = score;
          activeElement = element;
        }
      }

      if (activeElement) {
        setActiveId(activeElement.id);
      }
    };

    const observer = new IntersectionObserver(
      () => {
        updateActiveHeading();
      },
      {
        root: null,
        rootMargin: "-80px 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    headingElements.forEach((element) => observer.observe(element));

    updateActiveHeading();

    return () => {
      headingElements.forEach((element) => observer.unobserve(element));
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="toc" aria-label="目次">
      <h2 className="toc-title">目次</h2>
      <TocList items={items} activeId={activeId} />
    </nav>
  );
}

function TocList({ items, activeId }: { items: TocItem[]; activeId: string }) {
  return (
    <ul className="toc-list">
      {items.map((item) => (
        <li key={item.id} className="toc-item" data-level={item.level}>
          <a
            href={`#${item.id}`}
            className="toc-link"
            aria-current={activeId === item.id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              const target = document.getElementById(item.id);
              if (target) {
                const targetPosition = target.getBoundingClientRect().top + window.scrollY;
                const offset = window.innerHeight * 0.2;
                const scrollToPosition = targetPosition - offset;

                window.scrollTo({
                  top: scrollToPosition,
                  behavior: "smooth",
                });
              }
            }}
          >
            {item.text}
          </a>
          {item.children && item.children.length > 0 && (
            <TocList items={item.children} activeId={activeId} />
          )}
        </li>
      ))}
    </ul>
  );
}
