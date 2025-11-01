---
title: "Docs Viewer チュートリアル"
tags:
  - guide
  - features
---

# (sec-intro)= Docs Viewer の全体像

Docs Viewer は、拡張 Markdown・Typst 数式・参照プレビューを備えたドキュメント閲覧サイトです。このページは「ユーザー向け仕様書」として、執筆時に必要となる記法と UI の使い方を **書き方（ソース）** と **表示例** の対で整理しています。執筆中はヘッダー右上のプレビュー機能やテーマ切り替えも活用してください（詳しくは [プレビューとテーマ](@sec-preview-theme)）。

:::column-toc
(col-map)=
@title: このチュートリアルの読み方
@background: #eef2ff
@border-color: #6366f1

1. [クイックスタート](@sec-quickstart) でプロジェクト構成を確認
2. [Markdown 記法ガイド](@sec-writing) で基本と拡張をまとめて把握
3. 仕上げに [Typst 数式](@sec-typst) と [プレビューとテーマ](@sec-preview-theme) を確認
:::

## (sec-quickstart)= クイックスタート

### (sec-structure)= ディレクトリとファイル配置

```text
docs/
  tutorial.md
  annotation.md
  info-logic/
    config.yaml
    set-relation.md
    semantic-func.md
```

- Markdown は `docs/` 配下に配置します。サブフォルダごとに閲覧ページの URL が決まります。
- `config.yaml` を置くとそのディレクトリが「グループ」となり、共通メタ情報や前後ナビゲーションをまとめて設定できます（[グループと config.yaml](@sec-groups)）。
- 画像や添付ファイルは Markdown からの相対パス、もしくは `public/` 配下を利用できます（[リンクとメディア](@sec-links-media)）。

### (sec-frontmatter)= フロントマター

各 Markdown の先頭に YAML 形式でメタ情報を記述すると、DocHeader やタグに反映されます。

```md
---
title: "Docs Viewer チュートリアル"
tags:
  - guide
  - features
description: Docs Viewer の使い方をまとめたユーザー向け仕様書です。
updated: 2024-05-01
---
```

- `title` … DocHeader に表示されるページタイトル。
- `tags` … 単独ページではタグバッジに表示。グループ配下では `config.yaml` の `tags` が優先されます。
- `description` / `updated` … グループ一覧などの補助情報で活用されます。

## (sec-writing)= Markdown 記法ガイド

Docs Viewer は GitHub Flavored Markdown をベースに、ディレクティブや参照、差分ハイライトなどの拡張を加えています。ここでは関連する記法をまとめて紹介します。

### (sec-text-blocks)= テキスト・リスト・引用

```md
これは 1 つ目の段落です。

これは 2 つ目の段落です。行末に半角スペース 2 つを置くと  
同じ段落内で改行できます。

**太字**、*斜体*、~~取り消し線~~、`インラインコード`

- 箇条書き
  - ネストした項目
    1. 番号付きリストも混在可能

> 引用は `>` で始めます。
> Typst 数式 $x^2 + y^2 = z^2$ も入れられます（[Typst 数式](@sec-typst)）。
```

表示例：

これは 1 つ目の段落です。

これは 2 つ目の段落です。行末に半角スペース 2 つを置くと  
同じ段落内で改行できます。

**太字**、*斜体*、~~取り消し線~~、`インラインコード`

- 箇条書き
  - ネストした項目
    1. 番号付きリストも混在可能

> 引用は `>` で始めます。  
> Typst 数式 $x^2 + y^2 = z^2$ も入れられます（[Typst 数式](@sec-typst)）。

表も通常の Markdown 形式で記述できます。

```md
| 言語 | 用途 |
| --- | --- |
| `remark` | Markdown → HTML 変換 |
| `rehype` | HTML の加工 |
```

### (sec-links-media)= リンクとメディア

```md
[外部リンク](https://example.com) や [セクション参照](@sec-links-media) を書けます。

![Next.js ロゴ](/next.svg)
[補助資料](./appendix.pdf)
```

- 画像は Markdown ファイルからの相対パス、または `public/` 配下を利用できます。
- PDF などの添付ファイルは相対リンクでダウンロード可能です（例: `appendix.pdf` を同じフォルダに配置）。

### (sec-code)= コードブロックと差分ハイライト

Docs Viewer のコードブロックは `rehype-pretty-code` とカスタム処理で彩色・行ハイライト・差分表示を実現しています。

```md
```ts
export function greet(name: string) {
  console.log(`Hello, ${name}!`);
}
```
```

#### (sec-code-language)= 言語の指定

````md
```python
def add(a: int, b: int) -> int:
    return a + b
```
````

```python
def add(a: int, b: int) -> int:
    return a + b
```

#### (sec-code-highlight)= 行ハイライト

````md
```js {1,3-4}
import { useMemo } from "react";

export function total(items) {
  return useMemo(() => items.reduce((sum, item) => sum + item, 0), [items]);
}
```
````

```js {1,3-4}
import { useMemo } from "react";

export function total(items) {
  return useMemo(() => items.reduce((sum, item) => sum + item, 0), [items]);
}
```

#### (sec-code-diff)= 差分表示とシンタックスハイライトの両立

````md
```ts diff
const apiUrl = "/api/v1";
-const timeout = 5000;
+const timeout = 8000;
```
````

```ts diff
const apiUrl = "/api/v1";
-const timeout = 5000;
+const timeout = 8000;
```

- `diff-ts` や `diff:ts` のようなラベルでも機能します。内部で `@sec-code-language` の言語設定と `diff` フラグを正規化します。
- 行頭の `+` / `-` は lucide アイコンに差し替えられ、コピー時には記号を除いたコードだけが取得されます。
- 行ハイライトと差分表示は組み合わせ可能です。例：```` ```ts diff {2} ````。

### (sec-labels)= ラベルと参照

Docs Viewer では `(id)=` 形式でラベルを付与し、`@id` で参照できます。参照リンクは [プレビューとテーマ](@sec-preview-theme) と連動し、小窓で内容を確認できます。

#### (sec-label-headings)= 見出しへのラベル

```md
## (sample-heading)= ラベル付き見出し
```

参照例：このセクションは [ラベル付き見出し](@sample-heading) です。

#### (sec-label-other)= コラムや図へのラベル

```md
:::column
(col-best-practice)=
@title: ベストプラクティス
@background: #eff6ff
@border-color: #2563eb

ラベル付きコラムは [参照リンク](@col-best-practice) で呼び出せます。
:::
```

:::column
(col-best-practice)=
@title: ベストプラクティス
@background: #eff6ff
@border-color: #2563eb

ラベル付きコラムは [参照リンク](@col-best-practice) で呼び出せます。
:::

#### (sec-references)= 参照リンクの書き方

```md
@sample-heading       ← ラベルのタイトルを自動表示
[任意のテキスト](@col-best-practice)  ← 表示名を上書き
```

### (sec-containers)= コラムと TOC 連携

```md
:::column
@title: コラム基本形
@background: #f8fafc
@border-color: #0ea5e9

文章やリスト、数式などを強調したいときに利用します。
:::
```

:::column
@title: コラム基本形
@background: #f8fafc
@border-color: #0ea5e9

文章やリスト、数式などを強調したいときに利用します。
:::

`:::column-toc` を使うと目次にも表示されます。

```md
:::column-toc
(col-flow)=
@title: 執筆フローの例
@background: #fef3c7
@border-color: #d97706

1. アウトライン作成
2. 脚注や補足は [注釈](@sec-annotations) に切り出す
3. コード例は [コード記法](@sec-code) に沿って記述
:::
```

:::column-toc
(col-flow)=
@title: 執筆フローの例
@background: #fef3c7
@border-color: #d97706

1. アウトライン作成
2. 脚注や補足は [注釈](@sec-annotations) に切り出す
3. コード例は [コード記法](@sec-code) に沿って記述
:::

### (sec-annotations)= 注釈（`:::annotation`）

````md
注釈を付けたい文章の直後に書き始めます。:::annotation
注釈内では複数段落やリスト、Typst 数式も利用できます。

- 目的: 本文は簡潔に
- リンク: [コラムの使い分け](@col-flow)
:::
````

注釈を付けたい文章の直後に書き始めます。:::annotation
注釈内では複数段落やリスト、Typst 数式も利用できます。

- 目的: 本文は簡潔に
- リンク: [コラムの使い分け](@col-flow)
:::

本文には上付き数字が表示され、ページ末尾に注釈一覧が生成されます。

### (sec-tasks)= タスクリストとチェックアイコン

```md
- [ ] 未完了のタスク
- [x] 完了したタスク

✅ のような文字も自動的にアイコン化されます。
```

- [ ] 未完了のタスク
- [x] 完了したタスク

✅ のような文字も自動的にアイコン化されます。

## (sec-typst)= Typst 数式

Typst 記法で数式を記述できます。TeX とは構文が異なるため、`integral`, `sqrt` など Typst 独自のキーワードに注意してください。

```md
インライン数式は $a^2 + b^2 = c^2$。

(eq-gauss)=
$$
integral_0^infinity e^(-x^2) dif x = sqrt(pi)/2
$$

数式 `(eq-gauss)=` にラベルを付けておくと、
@eq-gauss のように参照できます。
```

インライン数式の例：$a^2 + b^2 = c^2$

ブロック数式：

(eq-gauss)=
$$
integral_0^infinity e^(-x^2) dif x = sqrt(pi)/2
$$

## (sec-groups)= グループと `config.yaml`

サブディレクトリに `config.yaml` を設置するとグループ表示になります。例：`docs/info-logic/config.yaml`

```yaml
title: 情報論理学入門
description: >-
  研究メモをまとめた章構成です。
tags:
  - info-logic
order:
  - set-relation
  - prop-define
  - semantic-func
```

- グループ直下（`/info-logic` など）にアクセスすると、タイトル・説明・配下ドキュメント一覧が表示されます。
- `order` を設定するとナビゲーションの「前へ / 次へ」が指定順に生成されます。未指定のページはスラッグ順で補完されます。
- `tags` は配下ページのフロントマターより優先されます。

## (sec-preview-theme)= プレビューとテーマ切り替え

- 参照リンクをクリックすると、プレビュー小窓が開きます。モードはヘッダー右上の `Preview` メニューで **Floating**（右側に重ねて表示） / **Inline**（本文内に展開）を切り替え可能です。
- テーマは同じメニューの `Theme` からライト / ダークを選択します。設定は `localStorage` に保存され、再訪時に復元されます。
- 画面幅が 1280px 未満の場合、自動でインラインプレビューになります。

## (sec-summary)= まとめと次のステップ

- 基本記法（[Markdown 記法ガイド](@sec-writing)）を押さえたうえで、ラベル・参照・Typst 数式・コラムなどの拡張を組み合わせると高度なドキュメントが作成できます。
- 各セクションのラベル `@sec-...` を活用し、他ドキュメントからもリンクを張れる構成にするとナレッジ共有がスムーズです。
- 章立てを増やしていく場合は `config.yaml` の整備と、コラム・注釈による情報整理を並行して行うと読み手の負担を減らせます。
- 本チュートリアルをテンプレートとして複製し、プロジェクト固有のルールやサンプルを追加してください。
