import Link from "next/link";
import { DocHeader } from "./DocHeader";
import { PreviewModeMenu } from "./PreviewModeMenu";
import type { GroupListingItem } from "@/lib/docs";

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

type GroupLayoutProps = {
  title: string;
  description?: string;
  tags?: string[];
  items: GroupListingItem[];
  lastUpdated?: Date;
};

export function GroupLayout({ title, description, tags, items, lastUpdated }: GroupLayoutProps) {
  const updatedAtText = lastUpdated ? DATE_FORMATTER.format(lastUpdated) : "更新情報なし";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PreviewModeMenu />
      <DocHeader title={title} updatedAtText={updatedAtText} tags={tags} />
      <main className="flex-1 px-6 py-8">
        <article className="docs-content mx-auto w-full max-w-3xl">
          {description && (
            <p className="text-base" style={{ color: "var(--muted-foreground)" }}>
              {description}
            </p>
          )}

          <section className="mt-8 flex flex-col gap-4">
            {items.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                現在、このグループに公開されたドキュメントはありません。
              </p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.slug.join("/")}
                  href={`/${item.slug.join("/")}`}
                  className="group rounded-lg border px-4 py-4 transition hover:border-transparent hover:bg-[color-mix(in_srgb,var(--color-primary-50)_65%,transparent)]"
                  style={{ borderColor: "var(--color-border-subtle)", textDecoration: "none" }}
                >
                  <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    最終更新: {DATE_FORMATTER.format(item.lastModified)}
                  </p>
                </Link>
              ))
            )}
          </section>
        </article>
      </main>
    </div>
  );
}
