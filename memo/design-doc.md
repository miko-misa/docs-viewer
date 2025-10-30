# 仕様書（Next.js + Tailwind CSS + TypeScript / “docs” レポジトリ連携）

この文書は、GitHub 上の **docs レポジトリ**に保管された Markdown 群を、Next.js（App Router）で **`/[folder]/[docid]`** という URL で閲覧できるモダンなドキュメントサイトとして提供するための、実装寄りの詳細仕様です。
拡張 Markdown（ラベル・参照、Typst 数式、コラム/定理/証明などの「始まり〜終わり」コンテナ）と、Zenn 風の UI（固定 TOC、スクロールスパイ、参照のプレビューポップアップ）を含みます。

---

## 0. 採用技術と主要ライブラリ

- フレームワーク: **Next.js（App Router）** / TypeScript / React 18 以上。ルーティングは `app/[[...slug]]` の**キャッチオール動的ルート**で実装。 ([nextjs.org][1])
- スタイル: **Tailwind CSS**（プレーン HTML にも馴染むユーティリティ設計、preflight を前提に Markdown スタイルはカスタムで当てる）
- Markdown パイプライン（unified 系）:
  - **remark-parse / remark-gfm**（GitHub Flavored Markdown）
  - **remark-directive**（拡張ディレクティブの構文; `:::` コンテナ、`:text[]` など） ([GitHub][2])
  - **remark → rehype 変換**（**remark-rehype**） ([unified][3])
  - **Typst 数式**: **typst.ts** + **rehype-typst**（Typst 記法 `$ ... $` をブラウザ/サーバで描画） ([GitHub][4])
  - **rehype-sanitize**（XSS 対策; 允许するタグ/属性を厳密にホワイトリスト化） ([GitHub][5])
  - **rehype-react** もしくは **react-markdown**（HAST→React 要素化と、要素毎のコンポーネント差し替え） ([GitHub][6])

- UI コンポーネント:
  - 固定 TOC & スクロールスパイ: **IntersectionObserver API**（見出し交差監視） ([MDNウェブドキュメント][7])
  - 参照プレビュー: **Popover**（Radix UI など）と **floating-ui** によるポジショニング ([GitHub Docs][8])

- デプロイ／同期:
  - **Vercel × GitHub 連携**（main ブランチの push で自動デプロイ） ([Vercel][9])
  - **Deploy Hooks** または Next.js の **`revalidateTag()`** によるオンデマンド再検証（ISR / Data Cache） ([Vercel][10])

- コンテンツ取得（ランタイム or ビルド）:
  - GitHub REST API: **Get repository content / Get a tree**、ETag による**条件付きリクエスト**で効率化。 ([GitHub Docs][11])

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
- **相対参照**: 画像・ファイルは同階層相対パスを許可（GitHub Raw 経由で配信）

### 1.2 サイト URL（出力）

- **`/[folder]/[docid]`** でレンダリング
  - 例: `algebra/group-theory/intro` → `docs/algebra/group-theory/intro.md`

- 補完規則:
  1. スラッグ末尾がディレクトリの場合 `index.md` を探す
  2. それ以外は `<docid>.md` を解決
  3. 解決失敗時は 404

- Next.js 実装は `app/[[...slug]]/page.tsx` の**キャッチオール**で実現。 ([nextjs.org][1])

---

## 2. レンダリング・パイプライン（サーバ優先 / クライアント最小）

### 2.1 フロー概要

1. **取得**: GitHub API で Markdown を取得（Conditional GET / ETag 対応） ([GitHub Docs][11])
2. **パース**: remark-parse + remark-gfm
3. **拡張構文**: remark-directive（コンテナ/ラベル/参照のカスタムノード生成） ([GitHub][2])
4. **Typst 数式**: rehype-typst（typst.ts を使って SVG/HTML へ）※詳細は §3 ([Hanwen][12])
5. **サニタイズ**: rehype-sanitize（許可要素・属性・クラスを限定） ([GitHub][5])
6. **React 化**: rehype-react または react-markdown で**要素分解**して React コンポーネントにマッピング。 ([GitHub][6])

> セキュアな HTML 取り込みのため、`rehype-raw` を使う場合は **必ず** `rehype-sanitize` を併用（XSS 回避）。 ([Yarn][13])

### 2.2 HTML 要素の分解（カスタムマップ）

- `h1..h6` → `<Heading level={n} id=... />`（自動 slug 付与 & 見出し番号オプション）
- `p`, `ul/ol/li`, `table` など→ 素のタグ or ラップコンポーネント
- `code`（ブロック）→ シンタックスハイライト（Shiki 等は将来拡張）
- コンテナ（column）→ `<DirectiveWrapper>` で柔軟なスタイリング対応

---

## 3. 拡張 Markdown 仕様

### 3.1 Typst 数式（TeX ではなく Typst）

- **入力**: `$ ... $`（インライン）、`$$ ... $$`（ディスプレイ）を **Typst** で解釈
- **出力**: typst.ts により **SVG（推奨）** を生成（SSR でも CSR でも可）
- **rehype-typst 連携**: Astro 例に準じ、remark の後段で適用（Next.js でも同様に rehype プラグイン接続） ([Hanwen][12])
- Typst の数式仕様参考: **Typst Math** ドキュメント。 ([Typst][14])

> typst.ts はブラウザ/サーバで Typst を動作させ、SVG/HTML に描画可能。React 連携も用意。 ([Myriad Dreamin'][15])

### 3.2 ラベルと参照（TeX/Typst 風）

#### 3.2.1 基本概念

ドキュメント内の要素（見出し、column、数式など）にラベルを付与し、`@label-name` 記法で参照する。

#### 3.2.2 ラベル付与の方法

**方法1: ディレクティブ属性（推奨）**
```md
:::column{#thm-pythagoras}
@title:定理 1.2 ピタゴラスの定理

直角三角形において、斜辺の長さの2乗は他の2辺の長さの2乗の和に等しい。
:::
```

**方法2: 見出しの属性**
```md
## 群論の基礎 {#sec-group-theory}
```

**ラベル命名規則:**
- 接頭辞推奨: `thm-` (定理), `def-` (定義), `sec-` (セクション), `fig-` (図), `eq-` (数式)
- 例: `#thm-pythagoras`, `#sec-introduction`, `#fig-diagram-1`

#### 3.2.3 参照記法

**基本構文:**
```md
@thm-pythagoras を参照してください。
詳細は @sec-group-theory を参照。
```

**参照の展開:**
- `@thm-pythagoras` → `<a href="#thm-pythagoras">定理 1.2</a>`
- `@sec-introduction` → `<a href="#sec-introduction">§1.1</a>`
- 参照先のタイトルを自動取得して表示

**カスタムテキスト:**
```md
[こちら](@thm-pythagoras) を参照
```
→ `<a href="#thm-pythagoras">こちら</a>`

#### 3.2.4 参照プレビュー（Peek機能）

- 参照リンクをクリック → ページ遷移せずポップオーバーで内容プレビュー
- プレビュー内容: 参照先の見出し/タイトル + 最初の段落または要約
- 実装: Radix UI Popover + floating-ui
- "参照先へジャンプ" ボタンでページ内遷移可能

#### 3.2.5 実装の流れ

1. **ラベル収集フェーズ（remarkプラグイン）**:
   - Markdownをパースして全ラベルを収集
   - ラベル→要素情報のマップを構築
   - 見出し、column、数式などからラベルを抽出

2. **参照解決フェーズ（remarkプラグイン）**:
   - テキスト中の `@label-name` を検出
   - ラベルマップを参照して対応する要素を特定
   - リンクノードに変換（`href`, `data-ref-type`, `data-ref-target` 属性を付与）

3. **レンダリングフェーズ（Reactコンポーネント）**:
   - `RefLink` コンポーネントで参照リンクを描画
   - ホバー/クリック時にプレビュー表示
   - 参照先タイトルの表示

#### 3.2.6 番号付けシステム

**自動番号付け:**
- 見出し: `§1.1`, `§2.3` など（章番号.節番号）
- column（定理など）: ラベル接頭辞に基づいて自動採番
  - `thm-*` → "定理 1", "定理 2", ...
  - `def-*` → "定義 1", "定義 2", ...
  - 接頭辞なし → 番号なし、タイトルのみ

**番号のリセット:**
- デフォルト: 文書全体で通し番号
- オプション: H2（章）ごとにリセット可能

#### 3.2.7 データ構造

**ラベルインデックス（lib/refs.ts）:**
```typescript
type LabelInfo = {
  id: string;           // ラベル名（例: "thm-pythagoras"）
  type: 'heading' | 'column' | 'equation';
  title: string;        // 表示テキスト（例: "定理 1.2 ピタゴラスの定理"）
  number?: string;      // 自動番号（例: "1.2"）
  prefix?: string;      // 接頭辞（例: "thm"）
  position: number;     // ドキュメント内の位置（順序）
};

type LabelIndex = Map<string, LabelInfo>;
```

**参照ノードの属性:**
```typescript
{
  href: `#${labelId}`,
  'data-ref-target': labelId,
  'data-ref-type': type,
  'data-ref-title': title,
}
```

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

### 3.4 コンテナディレクティブ（column による統一）

すべてのコンテナ（定理、証明、コラムなど）は `:::column` ディレクティブで統一する。

- **構文（remark-directive）**:

  ```md
  :::column
  @title:定理 1.2
  @color:#3b82f6
  @background:#eff6ff
  
  直角三角形において、斜辺の長さの2乗は他の2辺の長さの2乗の和に等しい。
  :::
  
  :::column
  @title:証明
  @color:#10b981
  
  証明本文…
  :::
  ```

- **柔軟性**: `@title`, `@color`, `@background`, `@border-*` などのメタデータでスタイルを自由にカスタマイズ
- **ラベルと参照**: `:label:` 属性を付ければ `@label-name` で参照可能（§3.2参照）
- **TOC統合**: `:::column-toc` を使用すればTOCに表示される

#### 3.3.1 コラムディレクティブの拡張仕様

コラムディレクティブは、タイトル・背景色・ボーダーのカスタマイズが可能な柔軟な構文をサポートする。

**基本構文:**
```md
:::{column}
@title:タイトル
@title-color:タイトルテキストの色
@color:タイトル帯の背景色
@background:コンテンツ部分の背景色
@border-color:ボーダーの色
@border-width:ボーダーの太さ
@border-style:ボーダーのスタイル

内容
:::
```

**ディレクティブの種類:**
- **`:::column`**: 通常のコラム（TOCに表示されない）
- **`:::column-toc`**: TOCに表示されるコラム（タイトルが必須、クリックでナビゲーション可能）

> **注意**: `:::column*` のようなアスタリスク記法は remark-directive で無効なため、`:::column-toc` を使用すること。

**パラメータ:**
- **@title**: コラムの見出しテキスト（省略可能、省略時はタイトル帯なし）
  - `column-toc` では必須（TOCのテキストとして使用）
- **@title-color**: タイトルテキストの色（CSSカラー値、デフォルト: `#1f2937`）
- **@color**: タイトル帯の背景色（CSSカラー値、デフォルト: `#cbd5e1` 灰色）
- **@background**: コンテンツ部分の背景色（CSSカラー値、省略時は透過）
- **@border-color**: ボーダーの色（CSSカラー値、明示的に指定した場合のみ表示）
- **@border-width**: ボーダーの太さ（CSS単位、デフォルト: `2px`）
- **@border-style**: ボーダーのスタイル（`solid`, `dashed`, `dotted` など、デフォルト: `solid`）

**使用例:**
```md
:::{column}
@title:重要な補足
@color:#3b82f6
@background:#eff6ff
@border-color:#2563eb

青い帯と淡い青の背景、濃い青のボーダー
:::

:::{column-toc}
@title:TOCに表示される列
@border-color:#10b981
@color:#d1fae5

このコラムはTOCに表示され、クリックで遷移できます。
:::

:::{column}
@title:注意事項
@border-color:#ef4444
@border-width:3px
@border-style:dashed

赤の破線ボーダー（太さ3px）
:::

:::{column}
@title:デフォルトスタイル

タイトルのみ指定（灰色の背景とボーダーがデフォルト適用）
:::

:::{column}
@background:#f3f4f6

タイトルなしのシンプルなコンテナ（ボーダーなし）
:::
```

**レンダリング仕様:**
- コンテンツの先頭にある `@xxx:` 行を検出・抽出
- タイトルが指定されている場合:
  - タイトル帯: `background-color: @color`（デフォルト `#cbd5e1`）、`color: @title-color`（デフォルト `#1f2937`）
  - コンテンツ: `background-color: @background`
  - ボーダー: `@border-color` が指定されている場合、または `@title` がある場合はデフォルトで `#cbd5e1` のボーダーを表示
- タイトルが省略されている場合:
  - タイトル帯なし、コンテンツのみ表示
  - ボーダーは `@border-color` が明示的に指定された場合のみ表示
- ボーダーの優先順位:
  1. `@border-color` が指定 → その色でボーダー表示
  2. `@title` があり `@border-color` なし → デフォルト灰色（`#cbd5e1`）のボーダー表示
  3. それ以外 → ボーダーなし

**TOC連携（column-toc）:**
- `:::column-toc` は `@title` を必須とし、TOCに表示される
- `@title` から slug を生成し、`id` 属性を付与（例: `@title:重要な補足` → `id="重要な補足"`）
- TOCでの表示レベルは H4 相当（H3より深い階層、小さめに表示）
- TOCからクリックで該当コラムにスムーススクロール
- スタイリング: 通常の見出しより小さいフォントサイズ（0.8125rem）、やや薄め（opacity: 0.85）

**実装の考慮事項:**
- **remarkプラグイン**（`src/lib/markdown.tsx`）:
  - `directive.name === "column"` または `directive.name === "column-toc"` を検出
  - コンテンツをパースし、`@xxx:`行を抽出して `hProperties` の `data-*` 属性に変換
  - `@xxx:` 行は最終的な出力から削除
  - `column-toc` の場合、`@title` から `github-slugger` でIDを生成し `hProperties["id"]` に設定
  - クラス名は両方とも `directive-column`（見た目は同じ）
  
- **TOC抽出**（`src/lib/toc.ts`）:
  - Markdown を行単位でパース
  - `:::column-toc` を検出し、次の `@title:` 行を抽出
  - slug を生成して TOC アイテムとして追加（level: 2）
  
- **DirectiveWrapper コンポーネント**（`src/components/DirectiveWrapper.tsx`）:
  - `data-title`, `data-title-color`, `data-color`, `data-background`, `data-border-color`, `data-border-width`, `data-border-style` 属性を受け取り
  - スタイルを動的適用
  - デフォルト値: `defaultBorderColor = "#cbd5e1"`, `defaultTitleBgColor = "#cbd5e1"`
  - `id` プロパティを受け取り、外側の `div` に設定（TOCナビゲーション用）
  
- **サニタイズスキーマ**（`src/lib/markdown.tsx`）:
  - `rehype-sanitize` の `div` 要素で以下の属性を許可:
    - `data-title`, `data-title-color`, `data-color`, `data-background`
    - `data-border-color`, `data-border-width`, `data-border-style`
  
- **アクセシビリティ**:
  - タイトルは `<div>` で実装（装飾的な要素のため見出しレベルを消費しない）
  - 必要に応じて `role="note"` 属性を追加可能

---

## 4. UI/UX 仕様

### 4.1 Zenn 風・現代的なレイアウト

- 右サイドに**固定 TOC**（`position: sticky`）、本文は中央 720–760px を基準
- TOC にはスクロールスパイ（IntersectionObserver で現在位置の見出しをハイライト） ([MDNウェブドキュメント][7])
- コードブロックはコピー・行番号ボタン
- 画像はキャプション付き `<figure>`、クリックでライトボックス（将来拡張）

### 4.2 スクロールスパイの仕様

- 監視対象: `h2,h3,h4`
- スレッショルド: `[0, 0.25, 0.5, 0.75, 1]`
- 最上部に近い交差見出しをアクティブ化（ルールは「中心に最も近い heading」などを採用）

### 4.3 参照プレビューポップオーバー（VS Code の Peek 的）

- 参照リンク（例: `<a data-ref="thm:abc">定理 1.2</a>`）クリック時に**遷移せず**ポップオーバーを開く
- コンテンツ: 参照先見出し or コンテナ本文の**要約 DOM**（見出し + 最初の段落/式）
- 実装: Radix UI `Popover` + floating-ui で**位置合わせ**、Portal でオーバーレイ表示 ([GitHub Docs][8])
- 「参照元へフォーカス維持」「参照先へジャンプ」両ボタンを提供

---

## 5. コンテンツ取得・同期とキャッシュ戦略

### 5.1 方式 A: **push 時ビルド**（SSG + ISR）

- GitHub main ブランチへ push → **Vercel が自動デプロイ**。 ([Vercel][9])
- 既知パスを `generateStaticParams()` / 事前ビルドし、**ISR** で時間ベース再検証（`revalidate = N`）を適用。 ([Vercel][17])
- ドキュメント追加・変更に対し、**Deploy Hook** を使って手動再ビルドも可能。 ([Vercel][10])

### 5.2 方式 B: **リクエスト時コンパイル**（SSR / Data Cache）

- ページアクセス時に **GitHub API** で Markdown を取得 → パイプラインで描画。
- **Vercel Data Cache** と `fetch(..., { next: { revalidate, tags } })` を活用（サーバー関数内）。 ([Vercel][18])
- GitHub API は **ETag / If-None-Match** で304応答を活用し、レート制限とトラフィックを節約。 ([floating-ui.com][19])
- main 更新時に Webhook→自前 API Route で **`revalidateTag()`** を呼び、該当タグを**即時無効化**。 ([nextjs.org][20])

> 備考: 過去には revalidate の挙動に関する不具合報告もあるため、環境で挙動確認し、必要なら Deploy Hook 併用で確実に反映させる。 ([GitHub][21])

### 5.3 どちらの採用が良いか

- **A（push 時ビルド）**: 最速表示・シンプルなオペレーション。ドキュメント数が非常に多い場合はビルド時間に注意。
- **B（リクエスト時）**: 初回昂り得るが、**ETag + Data Cache + タグ再検証**で実運用可能。ドキュメント数の増加に強い。

---

## 6. セキュリティ・サニタイズ方針

- `rehype-sanitize` による**厳格ホワイトリスト**:
  - 許可要素（`p,h1..h6,ul,ol,li,table,code,pre,figure,img,svg` 等）
  - 許可属性（`id,className,href,src,alt,aria-*` ほか限定）
  - **style 属性は禁止**（必要時は限定クラスで代替） ([Yarn][13])

- `rehype-raw` を使う場合でも必ず sanitize を後段に。 ([unified][3])
- 画像/リンクは `rel="noopener noreferrer"`、外部リンクは別タブ

---

## 7. ラベル・参照・番号付けの実装詳細

### 7.1 remarkプラグインの構成

**remarkCollectLabels（ラベル収集）:**
- 見出しから `{#label-id}` を抽出
- columnディレクティブから `{#label-id}` を抽出
- ラベルインデックスを構築（文書スコープ）

**remarkResolveReferences（参照解決）:**
- テキストノード内の `@label-id` を検出
- ラベルインデックスを参照して解決
- リンクノードに変換

**remarkNumbering（番号付け）:**
- ラベルの接頭辞に基づいて番号を付与
- 見出しレベルに応じた階層番号（§1.1, §1.2など）
- columnの種類別カウンタ（定理1, 定理2など）

### 7.2 処理フロー

```
Markdown
  ↓
remarkParse
  ↓
remarkDirective (ディレクティブ解析)
  ↓
remarkCollectLabels (ラベル収集) ← 新規実装
  ↓
remarkResolveReferences (参照解決) ← 新規実装
  ↓
remarkNumbering (番号付け) ← 新規実装
  ↓
remarkRehype
  ↓
rehypeSlug (見出しID付与)
  ↓
（以降は既存の処理）
```

### 7.3 ラベルインデックスの永続化

**Server Component（RSC）での実装:**
- ラベルインデックスをレンダリング時に構築
- React Contextまたはpropsで下位コンポーネントに渡す
- RefLinkコンポーネントでタイトル情報を参照

**データの流れ:**
```
renderMarkdown()
  → remarkプラグインでラベルインデックス構築
  → rehype-reactでReact要素化
  → RefLinkにdata-*属性として埋め込み
  → クライアントでプレビュー表示
```

### 7.4 番号付けルール

**見出し:**
- H1: 章番号（1, 2, 3...）
- H2: 節番号（1.1, 1.2, 2.1...）
- H3: 項番号（1.1.1, 1.1.2...）
- 参照テキスト: `§1.2` 形式

**column（接頭辞ベース）:**
- `thm-*`: 定理 1, 定理 2, ...
- `def-*`: 定義 1, 定義 2, ...
- `lem-*`: 補題 1, 補題 2, ...
- `prop-*`: 命題 1, 命題 2, ...
- `cor-*`: 系 1, 系 2, ...
- `proof-*`: 証明（番号なし）
- `ex-*`: 例 1, 例 2, ...
- `rem-*`: 注意 1, 注意 2, ...

**接頭辞とラベルの対応表:**
```typescript
const PREFIX_TO_LABEL: Record<string, string> = {
  'thm': '定理',
  'def': '定義',
  'lem': '補題',
  'prop': '命題',
  'cor': '系',
  'proof': '証明',
  'ex': '例',
  'rem': '注意',
  'fig': '図',
  'eq': '式',
};
```

---

## 8. TOC とスクロール挙動

- ページ内の見出しから **TOC ツリー**を生成（最大 H3 まで）
- IntersectionObserver で**現在位置**を判定し、対応する TOC 項目に `aria-current="true"` を付与 ([MDNウェブドキュメント][7])
- クリック時はスムーススクロール。必要に応じ `scrollIntoView()` 系を使用（`scrollIntoViewIfNeeded` は非標準のため要注意） ([MDNウェブドキュメント][22])

---

## 9. パフォーマンス最適化

- **SSR で Typst を描画**（可能なら）し、クライアントの WASM 実行を最小化（回線細い環境でも安定）
- Typst 出力は **SVG** を優先（テキスト選択と拡大に強い）
- 画像/数式/コードブロックは**遅延ロード**（`loading="lazy"` 等）
- Data Cache / ISR を適切に設定（秒数は 30–300s を目安にチューニング） ([Vercel][17])

---

## 10. アクセシビリティ

- 見出しはヒエラルキー順序を遵守
- 数式 SVG には `aria-label` 相当の代替テキストを付与（環境次第で `<title>`/`<desc>`）
- コンテナ（theorem/proof）は `role="note"` + `aria-labelledby` でタイトルと紐付け

---

## 11. デプロイ / 運用

- GitHub と Vercel を連携し、**main** への push で自動デプロイ。 ([Vercel][9])
- コンテンツ更新の即時反映が必要な場合:
  - **Deploy Hook** を叩いて再ビルド、または
  - Next.js の API Route から **`revalidateTag()`** を呼び出して Data Cache を無効化（タグは `repo:docs` や `path:/algebra` などを設計） ([Vercel][10])

- 方式 B の場合は GitHub Webhook → 自前 API → `revalidateTag()` の連鎖で**数秒内**に反映

---

## 12. フォルダ構成（アプリ側）

```
app/
  [[...slug]]/
    page.tsx           // ルーティング解決 & データ取得
    loading.tsx        // 初回ローディング
    error.tsx
components/
  markdown/
    MarkdownRenderer.tsx     // unified パイプライン
    Heading.tsx
    Admonition.tsx           // theorem/proof/column
    MathBlock.tsx
    RefLink.tsx              // @ラベルのリンク表示
    RefPopover.tsx           // プレビュー（Radix Popover）
  toc/
    Toc.tsx
lib/
  github.ts   // GitHub API (ETag, raw fetch)
  refs.ts     // ラベル索引（同一文書内 + 将来は全体索引）
  sanitize.ts // rehype-sanitize スキーマ
```

---

## 13. 代表的な設定断片

### 13.1 Markdown→React（サーバ側）

```ts
// MarkdownRenderer.tsx（概要）
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeTypst from "@myriaddreamin/rehype-typst"; // Typst 数式
import rehypeSanitize from "rehype-sanitize";
import rehypeReact from "rehype-react";

export async function renderMarkdown(md: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkRehype)
    .use(rehypeTypst) // typst.ts 連携
    .use(rehypeSanitize, mySchema) // ホワイトリスト
    .use(rehypeReact, {
      /* element => component map */
    })
    .process(md);
  return String(file); // or ReactNodes
}
```

（_rehype-typst / typst.ts / sanitize の要点は各ドキュメント参照_） ([Hanwen][12])

### 13.2 GitHub 取得（ETag）

- `GET /repos/{owner}/{repo}/contents/{path}` / `GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1` を利用。`If-None-Match` で 304 を活用。 ([GitHub Docs][11])

### 13.3 ISR / Data Cache

- `export const revalidate = 60` または `fetch(url, { next: { revalidate: 60, tags: ['repo:docs'] } })`
- Webhook/API で **`revalidateTag('repo:docs')`** を呼ぶ。 ([Vercel][17])

---

## 14. テストと検証

- 単体: ラベル解析・参照解決（`@`）、コンテナ番号付け、sanitize スキーマ
- E2E: 主要ブラウザで TOC スクロールスパイ、参照プレビューの動作確認
- 負荷: 大容量文書・画像多数のページで**初回描画**と**再検証**の時間計測

---

## 15. 今後の拡張

- **全文検索**（静的インデックス or サーバ検索）
- **コードハイライト**（Shiki + ダーク/ライト自動切替）
- **外部引用/参考文献**（BibTeX / CSL 対応）
- **差分プレビュー**（GitHub PR と連携）

---

### 付記（設計上のメモ）

- Tailwind と `react-markdown` の組み合わせでは、デフォルトタグの初期スタイルがリセットされるため、`.prose` 系のスタイルかカスタム CSS で整える（一般的な落とし穴）。 ([Stack Overflow][23])
- `rehype-raw` は便利だが **XSS リスク**があるため、**sanitize の許可リスト**運用が前提。 ([Yarn][13])

---

必要ならこのまま雛形リポジトリ（Next.js 15/16, App Router 前提）と、`rehype-typst` + `typst.ts` の最小動作サンプルも用意します。どの同期方式（A/B）で進めるか、希望があれば教えてください。

[1]: https://nextjs.org/docs/app/getting-started/caching-and-revalidating?utm_source=chatgpt.com "Getting Started: Caching and Revalidating"
[2]: https://github.com/remarkjs/remark-directive "GitHub - remarkjs/remark-directive: remark plugin to support directives"
[3]: https://unifiedjs.com/explore/package/remark-rehype/?utm_source=chatgpt.com "remark-rehype - unified"
[4]: https://github.com/Myriad-Dreamin/typst.ts?utm_source=chatgpt.com "Myriad-Dreamin/typst.ts: Run Typst in JavaScriptWorld."
[5]: https://github.com/rehype-pretty/rehype-pretty-code?utm_source=chatgpt.com "rehype-pretty/rehype-pretty-code: Beautiful code blocks for ..."
[6]: https://github.com/rehypejs/rehype-react?utm_source=chatgpt.com "rehypejs/rehype-react: plugin to transform to preact, ..."
[7]: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API?utm_source=chatgpt.com "Intersection Observer API - MDN Web Docs"
[8]: https://docs.github.com/rest/repos/contents?utm_source=chatgpt.com "REST API endpoints for repository contents"
[9]: https://vercel.com/docs/frameworks/full-stack/nextjs?utm_source=chatgpt.com "Next.js on Vercel"
[10]: https://vercel.com/docs/deploy-hooks?utm_source=chatgpt.com "Creating & Triggering Deploy Hooks"
[11]: https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?utm_source=chatgpt.com "Best practices for using the REST API"
[12]: https://hanwen.io/en/posts/use_typst_for_math_in_blog/?utm_source=chatgpt.com "Use Typst for Math in Blog - ~hanwen >_"
[13]: https://classic.yarnpkg.com/en/package/react-markdown?utm_source=chatgpt.com "react-markdown"
[14]: https://typst.app/docs/reference/math/?utm_source=chatgpt.com "Math – Typst Documentation"
[15]: https://myriad-dreamin.github.io/typst.ts/?utm_source=chatgpt.com "reflexo-typst Documentation"
[16]: https://mystmd.org/guide/cross-references "Cross-references - MyST Markdown"
[17]: https://vercel.com/docs/incremental-static-regeneration?utm_source=chatgpt.com "Incremental Static Regeneration (ISR)"
[18]: https://vercel.com/docs/data-cache?utm_source=chatgpt.com "Data Cache for Next.js"
[19]: https://floating-ui.com/?utm_source=chatgpt.com "Floating UI - Create tooltips, popovers, dropdowns, and more"
[20]: https://nextjs.org/docs/app/api-reference/functions/revalidateTag?utm_source=chatgpt.com "Functions: revalidateTag"
[21]: https://github.com/vercel/next.js/issues/57632?utm_source=chatgpt.com "fetch revalidation not working with Nextjs 14.0.0 #57632"
[22]: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoViewIfNeeded "Element: scrollIntoViewIfNeeded() method - Web APIs | MDN"
[23]: https://stackoverflow.com/questions/74607419/react-markdown-don%C2%B4t-render-markdown?utm_source=chatgpt.com "react-markdown don´t render Markdown"
