import type { GroupConfig } from "@/lib/docs";

type DocLayoutProps = {
  title: string;
  tags?: string[];
  groupConfig?: GroupConfig;
  updatedAt: Date;
  children: React.ReactNode;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function DocLayout({ title, tags, groupConfig, updatedAt, children }: DocLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header
        className="border-b px-6 py-6 backdrop-blur"
        style={{
          borderColor: "var(--color-border-subtle)",
          backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
          {groupConfig ? (
            <>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--muted-foreground)" }}
              >
                {groupConfig.title}
              </p>
              <h1 className="text-3xl font-semibold" style={{ color: "var(--foreground)" }}>
                {title}
              </h1>
            </>
          ) : (
            <h1 className="text-3xl font-semibold" style={{ color: "var(--foreground)" }}>
              {title}
            </h1>
          )}
          <div className="flex items-center gap-4">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              最終更新: {DATE_FORMATTER.format(updatedAt)}
            </p>
            {tags && tags.length > 0 && (
              <div className="flex gap-2">
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
      </header>

      <div className="flex flex-1 gap-8 px-6 py-8">
        <aside
          className="sticky top-24 hidden h-fit w-72 shrink-0 rounded-lg border border-dashed p-4 text-sm lg:block"
          style={{
            borderColor: "var(--color-border-subtle)",
            color: "var(--muted-foreground)",
          }}
        >
          TOC をここに表示予定です。
        </aside>
        <main className="flex-1">
          <article className="docs-content mx-auto w-full max-w-3xl">{children}</article>
        </main>
      </div>
    </div>
  );
}
