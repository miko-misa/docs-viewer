import Link from "next/link";
import type { GroupConfig } from "@/lib/docs";
import type { TocItem } from "@/lib/toc";
import { Toc } from "./Toc";
import { PreviewModeMenu } from "./PreviewModeMenu";
import { DocHeader } from "./DocHeader";
import { BackLink } from "./BackLink";

type DocNavItem = {
  title: string;
  slug: string[];
};

type DocNavigation = {
  previous?: DocNavItem;
  next?: DocNavItem;
};

type DocLayoutProps = {
  title: string;
  tags?: string[];
  groupConfig?: GroupConfig;
  groupSlug?: string[];
  updatedAt: Date;
  toc: TocItem[];
  navigation?: DocNavigation;
  children: React.ReactNode;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

function slugToHref(slug: string[]): string {
  if (slug.length === 0) {
    return "/";
  }
  return `/${slug.join("/")}`;
}

export function DocLayout({
  title,
  tags,
  groupConfig,
  groupSlug,
  updatedAt,
  toc,
  navigation,
  children,
}: DocLayoutProps) {
  const updatedAtText = DATE_FORMATTER.format(updatedAt);
  const leftAccessory =
    groupConfig && groupSlug && groupSlug.length > 0 ? (
      <BackLink href={`/${groupSlug.join("/")}`}>一覧に戻る</BackLink>
    ) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PreviewModeMenu />
      <DocHeader
        title={title}
        groupTitle={groupConfig?.title}
        updatedAtText={updatedAtText}
        tags={tags}
        leftAccessory={leftAccessory}
      />

      <div className="flex flex-1 gap-8 px-6 py-8">
        <aside
          className="sticky top-24 hidden h-fit w-72 shrink-0 rounded-lg border border-dashed p-4 text-sm lg:block"
          style={{
            borderColor: "var(--color-border-subtle)",
            color: "var(--muted-foreground)",
          }}
        >
          <Toc items={toc} />
        </aside>
        <main className="flex-1" style={{ marginRight: "clamp(2rem, 15vw, 300px)" }}>
          <article className="docs-content mx-auto w-full max-w-3xl">
            {children}
            {(navigation?.previous || navigation?.next) && (
              <nav
                className="mt-12 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-stretch md:justify-between"
                style={{ borderColor: "var(--color-border-subtle)" }}
              >
                {navigation?.previous ? (
                  <Link
                    href={slugToHref(navigation.previous.slug)}
                    className="group flex flex-1 flex-col rounded-lg border px-4 py-3 transition hover:border-transparent hover:bg-[color-mix(in_srgb,var(--color-primary-50)_65%,transparent)]"
                    style={{
                      borderColor: "var(--color-border-subtle)",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--color-primary-600)" }}
                    >
                      前へ
                    </span>
                    <span
                      className="mt-1 text-lg font-semibold leading-snug md:text-xl"
                      style={{ color: "var(--foreground)" }}
                    >
                      {navigation.previous.title}
                    </span>
                  </Link>
                ) : (
                  <div className="hidden flex-1 md:block" />
                )}

                {navigation?.next && (
                  <Link
                    href={slugToHref(navigation.next.slug)}
                    className="group flex flex-1 flex-col items-end rounded-lg border px-4 py-3 text-right transition hover:border-transparent hover:bg-[color-mix(in_srgb,var(--color-primary-50)_65%,transparent)]"
                    style={{
                      borderColor: "var(--color-border-subtle)",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: "var(--color-primary-600)" }}
                    >
                      次へ
                    </span>
                    <span
                      className="mt-1 text-lg font-semibold leading-snug md:text-xl"
                      style={{ color: "var(--foreground)" }}
                    >
                      {navigation.next.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}
