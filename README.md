## Docs Viewer

Next.js (App Router) でローカルの `docs/` ディレクトリにある Markdown を表示するビューワーです。Typst 記法の数式を [`@myriaddreamin/rehype-typst`](https://github.com/Myriad-Dreamin/typst.ts) でレンダリングし、Tailwind CSS ベースのレイアウトで表示します。

> 現在はローカル Markdown を対象にしており、GitHub API との連携は行っていません。

### セットアップ

```bash
pnpm install
pnpm dev
```

ブラウザで <http://localhost:3000> を開き、`docs/**/*.md` を編集すると即座に反映されます。

### 依存関係について

- Typst のレンダリングには `@myriaddreamin/typst-ts-node-compiler` を使用します。最初の起動時に WASM/バイナリのダウンロードが行われます。
- Tailwind CSS v4 の `@theme` 記法を使用しています。エディタの LSP や ESLint で警告が出る場合は、対応したプラグインを導入してください。

### 開発メモ

- Markdown のルーティングは `src/app/[[...slug]]/page.tsx` のキャッチオールルートで処理しています。
- `src/lib/markdown.tsx` にて unified パイプラインを構築し、Typst 数式のスタイルをサニタイズ後に復元しています。
- 拡張 Markdown（定理・証明など）は `DirectiveWrapper`/`RefLink` 等のコンポーネントで段階的に実装中です。

### ライセンス

このリポジトリ内のコードは MIT ライセンスに準じます。
