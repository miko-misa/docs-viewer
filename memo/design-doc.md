# 仕様書（Next.js + Tailwind CSS + TypeScript / “docs” レポジトリ連携）

この文書は、GitHub 上の **docs レポジトリ**に保管された Markdown 群を、Next.js（App Router）で **`/[folder]/[docid]`** という URL で閲覧できるモダンなドキュメントサイトとして提供するための、実装寄りの詳細仕様です。
拡張 Markdown（ラベル・参照、Typst 数式、コラム/定理/証明などの「始まり〜終わり」コンテナ）と、Zenn 風の UI（固定 TOC、スクロールスパイ、参照のプレビューポップアップ）を含みます。

---

## 0. 採用技術と主要ライブラリ

- フレームワーク: **Next.js 16（App Router）** / TypeScript / **React 19**。`app/[[...slug]]` のキャッチオール動的ルートで Markdown を配信し、**React Compiler** を有効化。 ([nextjs.org][1])
- スタイル: **Tailwind CSS v4** をベースに、`src/app/globals.css` でテーマ変数・Markdown 用レイアウトを細かく定義（ライト/ダークの `data-theme` スイッチを前提）。
- Markdown パイプライン（unified 系）:
  - **remark-parse / remark-gfm / remark-math / remark-breaks**
  - **remark-directive** + カスタムの `remarkTransformDirectives`（`:::` コンテナのメタデータ抽出と閉じタグ補正） ([GitHub][2])
  - ラベル・参照・注釈: `remarkCollectLabels` → `remarkResolveReferences` → `remarkAnnotations`（`LabelIndex` を共有）
  - **remark-rehype**（`allowDangerousHtml: false`）→ `rehype-slug` → **rehype-typst**（SVG 出力）→ カスタム変換（Typst スタイル復元、チェックボックス差し替え）→ **rehype-sanitize**（専用スキーマ）→ **rehype-react**
  - React マッピング: `a`→`RefLink`, `div.directive-*`→`DirectiveWrapper`, `svg.typst-doc`→`TypstSvg`, `task-checkbox`→`TaskCheckbox`
- UI コンポーネント:
  - **DocHeader**: スクロール量を補間する sticky ヘッダー（グループタイトル・タグ・更新日時を表示／自動縮小）
  - **Toc**: IntersectionObserver + スコアリングでアクティブ項目を計算し、必要に応じて自己スクロール ([MDNウェブドキュメント][7])
  - **RefLink**: 参照クリック時に DOM クローンを用いたプレビューウィンドウを生成。`PreviewModeMenu` から **フローティング／インライン切り替え** とネストプレビューに対応
  - **PreviewModeMenu / ThemeProvider**: ローカルストレージに保存するプレビュー表示モードとライト/ダークテーマの切り替え UI

- デプロイ／同期:
  - **Vercel × GitHub 連携**（main ブランチの push で自動デプロイ） ([Vercel][9])
  - **Deploy Hooks** または Next.js の **`revalidateTag()`** によるオンデマンド再検証（ISR / Data Cache） ([Vercel][10])

- コンテンツ取得:
  - サーバー側で `node:fs` と `gray-matter` を使い、`process.cwd()/docs` 配下の Markdown を直接読み込み
  - ディレクトリ毎の **`config.yaml`** を `js-yaml` で解析し、タイトル・説明・タグ・並び順を供給
  - `DocRecord` はファイル更新日時 (`stat.mtime`) を保持し、UI の「最終更新」に利用

---

## 1. リポジトリ構成と URL 設計

### 1.1 docs レポジトリ（入力）

```
docs/
  algebra/
    group-theory/
      intro.md
      theorem-a.md
  calculus/
    limits.md
  README.md
```

- **拡張子**: `.md` 固定（MDX は使わない）
- **相対参照**: 画像・ファイルは同階層相対パスを許可（Next.js の静的アセットとして提供）

### 1.2 サイト URL（出力）

- **`/[folder]/[docid]`** でレンダリング
  - 例: `algebra/group-theory/intro` → `docs/algebra/group-theory/intro.md`

- 補完規則:
  1. スラッグ末尾がディレクトリの場合 `index.md` を探す
  2. それ以外は `<docid>.md` を解決
  3. 解決失敗時は 404

- Next.js 実装は `app/[[...slug]]/page.tsx` の**キャッチオール**で実現。 ([nextjs.org][1])

### 1.3 メタデータと補助ファイル

- **Markdown フロントマター**（`gray-matter`）:
  - 各 `.md` の先頭に YAML フロントマターを記述可能（`title`, `tags` をサポート）
  - グループ外の単独ページではフロントマターの `tags` を UI 表示にそのまま利用
  - グループ配下のページは、フロントマターよりもディレクトリ側 `config.yaml` のタグを優先
- **ディレクトリ構成メタ (`config.yaml`)**:
  - 置き場所: 該当ディレクトリ直下（例: `docs/info-logic/config.yaml`）
  - フィールド: `title`, `description`, `tags`, `order`（いずれも任意）
    - `order`: ディレクトリ基準の相対スラッグ（`.md` 拡張子不要）を列挙。未指定のファイルは残りをスラッグ昇順で補完
    - `tags`: グループ詳細ページおよび配下ドキュメントのタグ表示に使用
  - `GroupLayout` は `config.yaml` のメタと `getDocPreview` で集計した `lastModified` を用いて一覧を構築
- **ナビゲーション**:
  - `order` を基に、本文末尾で「前へ / 次へ」ナビゲーションを生成（存在しないファイルは自動的にスキップ）
  - グループ直下スラッグにアクセスした場合は `GroupLayout`（一覧ページ）を表示し、`BackLink` から上位へ戻れる

---

## 2. レンダリング・パイプライン（サーバ優先 / クライアント最小）

### 2.1 フロー概要

1. **ローカル読み込み (`getDocBySlug`)**:
   - `normalizeSlug` でスラッグ調整 → `index.md` と `<slug>.md` を優先順に探索
   - `fs.promises.readFile` / `fs.promises.stat` で本文と最終更新時刻を取得、Path 走査は `assertInsideDocsRoot` でディレクトリトラバーサルを防止
2. **メタ情報の解決**:
   - `gray-matter` でフロントマターを解析し、本文は `content` として保持
   - `readGroupConfig` が同階層の `config.yaml` を `js-yaml` 経由で読み込み、ディレクトリ単位の `title / description / tags / order` を付与
   - グループ配下ドキュメントでは `tags` をグループ設定から継承し、単独ドキュメントはフロントマターの `tags` をそのまま利用
3. **Markdown 変換 (`renderMarkdown`)**:
   - `remark-parse` → `remark-math` → `remark-gfm` → `remark-breaks` → `remark-directive`
   - カスタム `remarkTransformDirectives` が `column`/`column-toc` のメタ行整理・`:::` クローズ行の再配置を実施
   - `LabelIndex` を共有しながら `remarkCollectLabels`（見出し＋column ラベル収集）→ `remarkResolveReferences`（`@label` → `RefLink` 化）→ `remarkAnnotations`（`:::annotation` を抽出し本文末尾へ集約）
   - `remark-rehype`（HTML は危険許可なし）→ `rehype-slug` → `rehype-typst`（Typst 数式を SVG 化）→ カスタム rehype プラグイン（Typst スタイル保持、チェックマーク/タスクリストの独自要素化）→ `rehype-sanitize`（スキーマは §6）
4. **React 化**:
   - `rehype-react` で React ノードへ変換し、`RefLink` / `DirectiveWrapper` / `TypstSvg` / `HeadingH*` などのコンポーネントに差し替え
   - 生成物は RSC 側で `DocLayout` / `GroupLayout` に渡し、UI レイヤーで TOC やプレビュー制御を行う

> `rehype-raw` は使用していないため、外部 HTML の持ち込みは常時遮断される。 ([Yarn][13])

### 2.2 HTML 要素の分解（カスタムマップ）

- `h1..h6` → `HeadingHx`（ハッシュ装飾付き）。`rehype-slug` が付与した ID を保持し TOC のアンカーに利用
- `a[data-ref=*]` → `RefLink`（参照プレビュー制御。一般リンクは通常の `<a>` として渡される）
- `div.directive-*` → `DirectiveWrapper`（column / column-toc / annotation など）
- `svg.typst-doc` → `TypstSvg`（`data-typst-style` を inline `style` に復元、ライト/ダークテーマと同期）
- `task-checkbox`（タスクリスト）→ `TaskCheckbox`（`lucide-react` アイコン表示）

---

## 3. 拡張 Markdown 仕様

### 3.1 Typst 数式（TeX ではなく Typst）

- **入力**: `$ ... $`（インライン）、`$$ ... $$`（ディスプレイ）を **Typst** で解釈
- **出力**: typst.ts により **SVG（推奨）** を生成（SSR でも CSR でも可）
- **rehype-typst 連携**: Astro 例に準じ、remark の後段で適用（Next.js でも同様に rehype プラグイン接続） ([Hanwen][12])
- Typst の数式仕様参考: **Typst Math** ドキュメント。 ([Typst][14])

> typst.ts はブラウザ/サーバで Typst を動作させ、SVG/HTML に描画可能。React 連携も用意。 ([Myriad Dreamin'][15])

### 3.2 ラベルと参照

#### 3.2.1 ラベル記法

- **見出し**: `(label-id)=` を先頭に置く。
  ```md
  ## (sec-valuation)= 付値
  ```
  `remarkCollectLabels` が `(sec-valuation)=` を除去し、ID を `rehype-slug` の結果に上書きしてアンカーとする。
- **column / column-toc**:
  ```md
  :::column
  (col-basic)=
  @title: シンプルなコラム
  本文...
  :::
  ```
  - `@title`, `@color`, `@background`, `@border-*` は `DirectiveWrapper` の `data-*` に変換される。
  - ラベルは `(label)=` 行もしくは `label` 属性で指定可能。`remarkTransformDirectives` が本文から除去する。
- **注釈 (`:::annotation`)**: 自動で `annotation-1`, `annotation-2` … の ID が振られる。

#### 3.2.2 参照記法

- `@label-id` で参照リンクを挿入。`[任意テキスト](@label-id)` でリンクテキストを上書き可能。
- デフォルトのリンクテキスト:
  - 見出し → ラベル記法を除いた見出し本文
  - column / column-toc → `@title:` の値（未指定時は最初の本文テキスト）
  - 注釈 → `注釈 n`

#### 3.2.3 プレビュー挙動

- `RefLink` がクリックを横取りし、参照先の DOM をクローンしてプレビュー表示。
- **フローティングモード**: 本文右側に小窓を出し、既存ウィンドウとの衝突を避けて再配置。複数階層のプレビューに対応。
- **インラインモード**: 参照リンク直下に差し込み。1280px 未満では自動的にこちらを強制。
- プレビュー内の参照リンクも `RefLink` として再帰的に動作し、子ウィンドウを開ける。`Jump` ボタンで本体へスクロール。

#### 3.2.4 実装フロー

1. `remarkCollectLabels` がラベルを解析し、`LabelIndex` に `LabelInfo` を登録。
2. `remarkResolveReferences` が `@label` 記法を `<a>` ノードへ変換し、`href="\#elementId"` と `data-ref-*` をセット。
3. `remarkAnnotations` が `:::annotation` を処理して本文側にマーカー、末尾に注釈リストを追加。
4. クライアント側 `RefLink` がクリックでプレビューを開閉し、開いているリンクに `.ref-link-active` クラスを付与。

#### 3.2.5 ラベルインデックス

```ts
// src/lib/refs.ts
export interface LabelInfo {
  id: string;
  type: "heading" | "column" | "annotation";
  title: string;
  elementId: string;
  summary?: string; // 注釈一覧用
}
```
`LabelIndex` は `Map<string, LabelInfo>` として構築され、`renderMarkdown` 内のプラグイン間で共有される。
### 3.3 注釈（Annotations）

- **目的**: 本文中に長文の注釈を紐付ける。本文中には軽量なマーカーを表示し、ページ下部に注釈本文をまとめて表示する。
- **マーカー表示**:
  - マーカーは上付き数字（1, 2, 3, …）またはカスタムラベル。
  - マーカーをクリックすると参照プレビューと同じポップアップを表示（`RefLink` と同等の挙動）。
  - マーカーは連番を自動採番。Markdown 内の出現順で決定。
- **本文表示**:
  - ページ末尾に「注釈」セクションを自動生成し、各注釈の本文を表示。
  - 注釈本文は複数段落・ブロック要素を含められる。
  - 各注釈は `<article>` 相当のラッパを用意し、マーカーと同じ番号・ラベルを表示。
- **Markdown 記法**:
  - 注釈で囲みたい範囲を `:::annotation ... :::` で包む。
  - 範囲内に記述したテキストが注釈本文になり、元位置にはマーカーが残る。
  - 例:
    ```md
    直観的な説明は以下の注釈にまとめる。:::annotation
    補足として、より詳細な背景や証明の概略をここに記述できる。
    箇条書きやコードブロックなども利用可能。
    :::
    続きの本文。
    ```
- **実装方針**:
  1. remark プラグイン（`remark-annotations`）で `annotation` ディレクティブを検出。
     - 出現順に連番を付与 (`annotationIndex` + `displayNumber`)。
     - ラベルインデックスに `type: "annotation"` を追加保存（タイトル/本文の冒頭をサマリとして保持）。
  2. マーカーは `RefLink` と同じデータ属性（`data-ref="annotation-<n>"` など）を付与したアンカーで出力し、CSS で上付き表示にする。
  3. 注釈本文は HAST ツリー末尾に `AnnotationList` ノードを追加し、レンダリング段階で一覧化する。
  4. `RefLink` で `annotation` タイプに対応し、ポップアップ内で注釈本文全文を表示。
  5. スクロールフォーカス: 注釈ポップアップから「本文へジャンプ」操作で該当注釈本文へスクロール。
- **スタイル**:
  - マーカー: `.annotation-marker`（フォントサイズ 0.8em、カラーは muted、上付き表示）。
  - 下部注釈リスト: `section.annotations` 内で番号付きリスト表示、各項目にマーカーと同じ番号。
  - ポップアップ: 既存 `RefLink` レイアウトを使用し、注釈が長い場合はスクロール可。

### 3.4 コンテナディレクティブ（column 系）

拡張コンテナ（定理・証明・コラム・補足など）は `:::column` 系ディレクティブで統一する。`column-toc` を使うと目次にも掲載できる。

- **構文（remark-directive）**:

  ```md
  :::column
  (col-basic)=
  @title: 補足
  @background: #eff6ff
  @border-color: #2563eb

  本文...
  :::

  :::column-toc
  @title: TOC に出す補足
  (col-in-toc)=
  @background: #fef3c7

  本文...
  :::
  ```

#### 3.4.1 メタデータとパラメータ

- `@title`（任意 / `column-toc` では必須）
- `@title-color`, `@color`, `@background`
- `@border-color`, `@border-width`, `@border-style`
- ラベルは `(label-id)=` 行または `label:` 属性で指定可能（§3.2）

#### 3.4.2 表示仕様

- タイトル帯は `DirectiveWrapper` が自動描画（デフォルト配色: タイトル帯 = `#cbd5e1`, ボーダー = `#cbd5e1`, テキスト = `#1f2937`）。
- `@border-color` が省略された場合でも、タイトルがあると 2px の淡色ボーダーを描画。`@title` も `@border-color` も無い場合はボーダー無し。
- コンテンツ高さが `50vh` を超えると自動的に折りたたみ、フェードと「すべて表示 / 折りたたむ」ボタンを表示。
  - 折りたたみ状態はプレビュー内の `DirectiveWrapper` でも共有。
- `column-toc` は `@title` から `github-slugger` で ID を生成し、TOC に **レベル 4** の項目として追加。

#### 3.4.3 実装メモ

- **remarkTransformDirectives**（`src/lib/markdown.tsx`）
  - `column` / `column-toc` を検出し、メタ情報を `data-*` 属性へ移し替え。
  - `(label)=` 行や `@xxx:` 行を本文から除去しつつ `directive.data.directiveTitle` に保存。
  - 独立した `:::` 行（クローザ）を適切な位置に再配置。

- **TOC 抽出**（`src/lib/toc.ts`）
  - `:::column-toc` 開始行と `@title:` 行を解析し、`slug()` で ID を生成。
  - `level: 4` の TOC 項目として追加し、リンクテキストには `@title` を使用。

- **DirectiveWrapper**（`src/components/DirectiveWrapper.tsx`）
  - `data-title` などの属性を参照しタイトル帯・背景色・ボーダーを描画。
  - `ResizeObserver` と `window` リサイズを監視して折りたたみ判定を更新。
  - プレビューウィンドウ内でも同じ挙動になるよう、ボタンラベルやスクロール位置の復元を管理。

- **サニタイズスキーマ**
  - `div.directive*` に対して `data-title`, `data-title-color`, `data-color`, `data-background`,
    `data-border-color`, `data-border-width`, `data-border-style`, `data-name`, `data-value` を許可。

- **TOC / RefLink 連携**
  - `DirectiveWrapper` は外側 `div` に `id` を付与し、TOC やプレビューがアンカーへジャンプできるようにする。

---

## 4. UI/UX 仕様

### 4.1 レイアウト構成

- `DocLayout` がページ全体を担当。上部には `PreviewModeMenu`（右上固定）と、スクロールに応じて高さが変化する `DocHeader` を配置。
- 本文領域は中央 3 カラム構成: 左に sticky TOC（`lg` 以上で表示）、中央に記事、右側はフローティングプレビュー用の余白を確保。
- グループ配下ページでは `BackLink`（左アクセサリ）とグループタイトルをヘッダーに表示。
- ページ下部に「前へ / 次へ」ナビゲーションカードを表示（`config.yaml` の `order` に基づく）。

### 4.2 目次とスクロールスパイ

- `extractToc` が H1〜H3 と `column-toc` を抽出し階層化。`column-toc` はレベル 4 として H3 の子に配置。
- `Toc` コンポーネントは IntersectionObserver（閾値 `[0, 0.25, 0.5, 0.75, 1]`）で可視領域を計算し、
  - 表示割合 / 位置 / セクション可視長のスコアリングでアクティブ見出しを決定
  - ビューポート上端付近（スクロール量 < 100px）では最初の見出し、末尾では最後の見出しを自動選択
- アクティブ項目はスムーズスクロールで自己位置を調整し、`aria-current="true"` を付与。
- TOC のリンクはクリック時に本文を 20% オフセットでスクロールして視認性を確保。

### 4.3 参照プレビューと表示モード

- `RefLink` が参照クリック時にプレビューを生成。DOM クローンを使用し、SVG や column のトグルを含むリッチコンテンツをそのまま表示。
- 表示モードは `PreviewContext` で管理し、`localStorage('preview-mode')` に保存。
  - **floating**（デフォルト）: 本文右に小窓を重ねて表示。重なりを避けるため垂直位置を調整し、最大幅はビューポートに収まるよう制限。
  - **inline**: 参照リンク直下に展開。横幅が 1280px 未満の環境では強制適用。
- ウィンドウ内リンクは再帰的に `RefLink` として動作し、子ウィンドウをスタック表示。閉じるボタン / Jump ボタン付き。
- `PreviewModeMenu` ではプレビュー表示モードに加え、`ThemeProvider` と連携したライト/ダーク切り替えを提供（設定は `docs-viewer-theme` に保存）。

### 4.4 グループ一覧ページ

- フォルダ直下（`/info-logic` など）にアクセスすると `GroupLayout` を表示。`config.yaml` のメタデータと `getDocPreview` の結果からカード一覧を生成。
- 最終更新日時 (`lastUpdated`) は配下ドキュメントの更新日時の最大値を表示。
## 5. コンテンツ取得とキャッシュ戦略

- すべての Markdown はリポジトリ同梱の `docs/` ディレクトリからサーバー側で直接読み込む。
  - `getDocBySlug` が `index.md` / `<slug>.md` を探索し、`fs.promises` で内容と `stat.mtime` を取得。
  - `getGroupListing` はディレクトリ内の `.md` を列挙し、`config.yaml` の `order` → 未指定分はスラッグ昇順で並べる。
- 現状はリクエスト毎にファイルを読み出す実装（In-memory キャッシュや ISR は未適用）。Next.js のファイルシステムキャッシュに依存していないため、必要に応じて今後 `cache()` や `revalidateTag()` を組み合わせる。
- 将来的に GitHub API 連携へ切り替える場合でも `getDocBySlug` / `getGroupListing` の境界を差し替えればよい設計になっている。
## 6. セキュリティ・サニタイズ方針

- `rehype-sanitize` で明示的なホワイトリストを設定。
  - 許可タグ: 見出し・段落・リスト・テーブル・`img`・`figure`・`svg`・Typst 生成要素（`g`, `path`, `defs`, `clipPath`, `use`, `style` など）・カスタム要素（`check-icon`, `task-checkbox`）。
  - 許可属性: `id`, `className`, `href`, `rel`, `target`, `alt`, `width`, `height`, `data-ref*`, `data-title*`, `data-color`, `data-background`, `data-border-*`, `data-typst-style`, `aria-*` など必要最小限。
  - `style` 属性は Typst SVG が持ち込む場合のみ一時的に許可し、`TypstSvg` で `data-typst-style` に移し替えてから削除。
- ユーザーデータ由来の HTML は `rehype-raw` を経由させず、Markdown のみを処理対象にしている。
- 外部リンクは `RefLink` ではなく通常の `<a>` として出力され、CSS で `text-decoration` を制御。必要に応じて `target="_blank"`/`rel="noopener noreferrer"` をフロントマター側で指定できる。
---

## 7. ラベル・参照・注釈処理の実装詳細

### 7.1 remark / rehype パイプライン

1. `remarkParse`
2. `remarkMath` / `remarkGfm` / `remarkBreaks`
3. `remarkDirective`
4. **`remarkTransformDirectives`** — column メタ行の抽出・`:::` クローザ補正
5. **`remarkCollectLabels`** — 見出し・column のラベル収集（`LabelIndex` に登録）
6. **`remarkResolveReferences`** — `@label` 記法を `<a>` ノードへ変換し `data-ref-*` を付与
7. **`remarkAnnotations`** — `:::annotation` をマーカー＋末尾リストへ展開
8. `remarkRehype`（`allowDangerousHtml: false`）
9. `rehypeSlug`
10. `rehypeTypst` → Typst 数式を SVG へ
11. カスタム rehype（Typst スタイル復元 / チェックボックス差し替え）
12. `rehypeSanitize`（専用スキーマ）
13. `rehypeReact`

### 7.2 データの流れ

```
renderMarkdown(markdown)
  ├─ LabelIndex を初期化
  ├─ remark 系プラグインでラベル・参照・注釈を解析
  ├─ rehypeSanitize でホワイトリスト化
  └─ rehypeReact で React ノードを生成（RefLink, DirectiveWrapper など）
```

生成された React ツリーはサーバーコンポーネント (`DocPage`) からクライアントコンポーネントへ渡され、参照プレビューや折りたたみ制御をクライアント側で行う。

### 7.3 LabelIndex と RefLink

- `LabelIndex` は単純な `Map<string, LabelInfo>`。レンダリング中にのみ保持し、SSR 完了後はクライアントへデータを渡さない。
- `remarkResolveReferences` は `LabelInfo` から `elementId`/`title` を取得して `<a>` に埋め込むため、クライアント側では追加のデータフェッチが不要。
- `RefLink` は `data-ref` キーを `{sourceId}::{targetId}` の形でキャッシュキーに用い、同じプレビューを複数回開く際に DOM クローンを再利用する。

### 7.4 注釈ディレクティブ (`:::annotation`)

- マーカー挿入位置の文脈（段落内 / ブロック間）に応じてマーカー配置を調整。余計な空白や改行は `remarkAnnotations` がクリーンアップ。
- 注釈本体は本文末尾の有序リストにまとめ、各項目に `id="annotation-n"` を付与。`summary`（最初の段落）を `LabelInfo` に格納し、プレビュー表示に利用。
- プレビュー内でも `DirectiveWrapper` や数式が正しく描画されるよう、注釈本文をそのまま DOM クローンする。
---

## 8. TOC とスクロール挙動

- `extractToc` は Markdown を行単位で解析し、H1〜H3 と `column-toc` のタイトルを抽出して木構造化。
- `Toc` コンポーネントは複数指標（可視割合・理想位置との距離・次見出しまでの可視領域）を合成してアクティブ要素を決定。
- 初期状態（スクロール 0 付近）は最初の見出しを強制選択、ページ最下部付近では最後の見出しを選択し、スクロール終端での揺れを防止。
- アクティブリンクは `aria-current="true"` を付与し、TOC 内スクロールもスムーズスクロールで追従。
- `column-toc` 項目は H3 の子レベルとしてドット表示し、プレビューウィンドウからのアンカー遷移にも利用される。
## 9. パフォーマンスメモ

- Typst のレンダリングは `rehype-typst` がサーバー側で行うため、ビルド／リクエスト時に WASM の初期化コストが発生する。大量ページでの再利用を想定し、今後 `cache()` などで結果を共有する余地あり。
- 現状は画像・数式の遅延ロード等は未実装。必要に応じて Markdown 拡張や `<Image>` 置換を検討する。
- プレビュー（RefLink）は DOM クローンをキャッシュすることで同一参照の再描画を避けている。
## 10. アクセシビリティ

- 見出しは Markdown 構造をそのまま使用し、`Heading` コンポーネント内で装飾ハッシュを `aria-hidden` にしている。
- `RefLink` は `<a>` 要素のままなのでスクリーンリーダーで参照先タイトルを読み上げ可能。プレビューは補助的機能として実装しており、従来のアンカー挙動（ジャンプ）も利用できる。
- 折りたたみボタンやプレビューモードメニューは `aria-expanded` / `aria-controls` を付与済み。今後はキーボードフォーカスインジケータの整備や注釈マーカーへの詳細説明追加が課題。
## 11. デプロイ / 運用

- 現状はローカル `docs/` ディレクトリを参照するシンプルな構成。Vercel などのホスティングに載せる場合も追加のシークレットは不要。
- Next.js App Router のランタイム（Node.js / Edge）いずれでも動作するが、`fs` を使用しているため Node.js ランタイムを選択する。
- 将来的に外部リポジトリと同期したい場合は、`getDocBySlug` / `getGroupListing` を API 取得に差し替え、`revalidateTag()` などを併用してキャッシュ制御する想定。
## 12. フォルダ構成（主要ファイル）

```
src/
  app/
    [[...slug]]/
      page.tsx          // slug 解決・Doc/Group 判定
    layout.tsx          // ThemeProvider / PreviewProvider / グローバルレイアウト
    globals.css         // テーマ変数 + Markdown 用スタイル
  components/
    DocHeader.tsx
    doc-layout.tsx
    GroupLayout.tsx
    Toc.tsx
    RefLink.tsx
    DirectiveWrapper.tsx
    typst-svg.tsx
    PreviewModeMenu.tsx
    TaskCheckbox.tsx / CheckIcon.tsx
  contexts/
    PreviewContext.tsx  // プレビュー表示モード（inline/floating）
    ThemeContext.tsx    // data-theme と localStorage 管理
  lib/
    docs.ts             // Markdown / config.yaml 読み込み & メタ生成
    markdown.tsx        // unified パイプライン
    toc.ts              // TOC 抽出
    refs.ts             // LabelIndex
    remark-*.ts         // ラベル・参照・注釈向けカスタムプラグイン
```
## 13. サンプルコード断片

### 13.1 `renderMarkdown`（抜粋）

```ts
export async function renderMarkdown(markdown: string): Promise<ReactNode> {
  const isDev = process.env.NODE_ENV !== "production";
  const labelIndex = new LabelIndex();

  const file = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkDirective)
    .use(remarkTransformDirectives)
    .use(remarkCollectLabels, { labelIndex })
    .use(remarkResolveReferences, { labelIndex })
    .use(remarkAnnotations, { labelIndex })
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeTypst, { renderOptions: { format: "svg" } })
    .use(enforceInlineMathRendering)
    .use(preserveTypstStyles)
    .use(replaceCheckmarks)
    .use(replaceTaskCheckboxes)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
      development: isDev,
      jsxDEV: isDev ? jsxDEV : undefined,
      components: {
        a: RefLink,
        h1: HeadingH1,
        h2: HeadingH2,
        h3: HeadingH3,
        h4: HeadingH4,
        h5: HeadingH5,
        h6: HeadingH6,
        div: DirectiveWrapper,
        svg: TypstSvg,
        "check-icon": CheckIcon,
        "task-checkbox": (props: { checked?: string }) => (
          <TaskCheckbox checked={props.checked === "true"} />
        ),
      },
    })
    .process(markdown);

  return file.result as ReactNode;
}
```

### 13.2 `docs.ts` のナビゲーションロジック（要点）

- `normalizeOrderEntry` が `config.yaml` の `order` 行を正規化（パス区切り対応）。
- `buildNavigation` が現在スラッグを `order` 上で検索し、前後のドキュメントタイトルを非同期で取得。
- グループ未設定・`order` に存在しない場合はナビゲーションを表示しない。
## 14. テストと検証

- 単体: ラベル解析 / 参照解決（`@` 記法）、注釈抽出、TOC 抽出ロジック、`DirectiveWrapper` の折りたたみ判定。
- コンポーネント: `RefLink` の表示モード切り替え、プレビュー内での再帰的リンク、`PreviewModeMenu` のローカルストレージ連携。
- E2E: 主要ブラウザで TOC スクロールスパイ、プレビューのフローティング配置、テーマ切り替えが期待通りに動作することを確認。
- パフォーマンス: 大規模 Markdown で Typst レンダリング時間とプレビュー動作を計測。必要に応じてキャッシュ戦略を検討。
## 15. 今後の拡張

- **全文検索**（静的インデックス or サーバ検索）
- **コードハイライト**（Shiki + ダーク/ライト自動切替）
- **外部引用/参考文献**（BibTeX / CSL 対応）
- **差分プレビュー**（GitHub PR と連携）

---

### 付記（設計上のメモ）

- `DocHeader` のスクロール補間は requestAnimationFrame で行っており、スクロール量に応じて CSS カスタムプロパティを更新する。
- プレビューの DOM クローンは `data-preview-cache-key` を用いてキャッシュ。DOM サイズが大きい場合はメモリ使用量に注意。
- `DirectiveWrapper` の折りたたみ判定は `ResizeObserver` 非対応ブラウザ向けフォールバックが未実装（必要に応じてポリフィル検討）。

必要ならこのまま雛形リポジトリ（Next.js 16, App Router 前提）と、`rehype-typst` + `typst.ts` の最小動作サンプルも用意します。どの同期方式で進めるか希望があれば教えてください。

[1]: https://nextjs.org/docs/app/getting-started/caching-and-revalidating?utm_source=chatgpt.com "Getting Started: Caching and Revalidating"
[2]: https://github.com/remarkjs/remark-directive "GitHub - remarkjs/remark-directive: remark plugin to support directives"
[3]: https://unifiedjs.com/explore/package/remark-rehype/?utm_source=chatgpt.com "remark-rehype - unified"
[4]: https://github.com/Myriad-Dreamin/typst.ts?utm_source=chatgpt.com "Myriad-Dreamin/typst.ts: Run Typst in JavaScriptWorld."
[5]: https://github.com/rehype-pretty/rehype-pretty-code?utm_source=chatgpt.com "rehype-pretty/rehype-pretty-code: Beautiful code blocks for ..."
[6]: https://github.com/rehypejs/rehype-react?utm_source=chatgpt.com "rehypejs/rehype-react: plugin to transform to preact, ..."
[7]: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API?utm_source=chatgpt.com "Intersection Observer API - MDN Web Docs"
[9]: https://vercel.com/docs/frameworks/full-stack/nextjs?utm_source=chatgpt.com "Next.js on Vercel"
[10]: https://vercel.com/docs/deploy-hooks?utm_source=chatgpt.com "Creating & Triggering Deploy Hooks"
[12]: https://hanwen.io/en/posts/use_typst_for_math_in_blog/?utm_source=chatgpt.com "Use Typst for Math in Blog - ~hanwen >_"
[13]: https://classic.yarnpkg.com/en/package/react-markdown?utm_source=chatgpt.com "react-markdown"
[14]: https://typst.app/docs/reference/math/?utm_source=chatgpt.com "Math – Typst Documentation"
[15]: https://myriad-dreamin.github.io/typst.ts/?utm_source=chatgpt.com "reflexo-typst Documentation"
[16]: https://mystmd.org/guide/cross-references "Cross-references - MyST Markdown"
