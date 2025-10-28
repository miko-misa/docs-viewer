type DocLayoutProps = {
  title: string;
  updatedAt: Date;
  children: React.ReactNode;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function DocLayout({ title, updatedAt, children }: DocLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-zinc-200 bg-white/80 px-6 py-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Docs Viewer
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            最終更新: {DATE_FORMATTER.format(updatedAt)}
          </p>
        </div>
      </header>

      <div className="flex flex-1 gap-8 px-6 py-8">
        <aside className="sticky top-24 hidden h-fit w-72 shrink-0 rounded-lg border border-dashed border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 lg:block">
          TOC をここに表示予定です。
        </aside>
        <main className="flex-1">
          <article className="docs-content mx-auto w-full max-w-3xl">{children}</article>
        </main>
      </div>
    </div>
  );
}
