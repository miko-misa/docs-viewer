---
title: "統合機能テストページ"
tags:
  - "テスト"
  - "Markdown"
  - "すべての機能"
---

# 統合機能テストページ

このページでは、ドキュメントビューアのすべての機能をテストします。

## (sec-basic)= 基本的なMarkdown記法

### 改行と段落

これは最初の文です。
これは2行目の文です。改行が1つだけあるので、同じ段落として表示されます。
3行目も同様に続きます。

ここで段落が変わります。改行が2つ（空行）あるため、新しい段落として表示されます。

### テキスト装飾

**太字のテキスト**と*斜体のテキスト*、そして**_太字かつ斜体_**。

~~取り消し線~~も使えます。

インラインコード: `const x = 42;` や `npm install` など。

### リンク

[Googleへのリンク](https://www.google.com)

[Next.jsドキュメント](https://nextjs.org/docs)

## (sec-math)= 数式（Typst）

### インライン数式

インライン数式: $x + y = z$ と $a^2 + b^2 = c^2$

分数のテスト: $1/2$ と $(a+b)/(c+d)$ と $a/b + c/d$

### ブロック数式

$$
integral_0^infinity e^(-x^2) dif x = sqrt(pi)/2
$$

分数のブロック数式:

$$
x = (-b plus.minus sqrt(b^2 - 4 a c)) / (2 a)
$$

## (sec-directives)= ディレクティブ

### Columnディレクティブの基本

:::column
(col-basic)=
@title: シンプルなコラム

タイトルのみで色指定なし（デフォルトスタイル）
:::

[シンプルなコラム](@col-basic) を参照してください。

### カラフルなColumn

:::column
(col-blue)=
@title: 青いコラム
@color: #3b82f6
@title-color: #ffffff
@background: #eff6ff
@border-color: #3b82f6
@border-width: 4px

これは青い帯と淡い青の背景を持つコラムの例です。重要な補足情報を記載します。
:::

:::column
(col-red)=
@title: 注意事項
@color: #ef4444
@title-color: #ffffff
@background: #fee2e2
@border-color: #ef4444

タイトルは赤、背景は淡い赤のコラムです。注意が必要な内容を強調できます。
:::

:::column
(col-green)=
@title: メモ
@color: #10b981
@title-color: #ffffff
@background: #d1fae5
@border-color: #10b981

緑色のコラムでメモを記載できます。
:::

[青いコラム](@col-blue)、[注意事項](@col-red)、[メモ](@col-green) を参照してください。

### タイトルなしColumn

:::column
@background: #f3f4f6

タイトルなし、背景色のみのシンプルなコンテナです。左ボーダーはありません。
:::

:::column
@background: #fef3c7
@border-color: #f59e0b
@border-width: 3px

タイトルなし、背景色あり、左ボーダーも表示する例です。
:::

### カスタムボーダー

:::column
(col-custom-border)=
@title: カスタムボーダー
@color: #8b5cf6
@title-color: #ffffff
@background: #f5f3ff
@border-color: #8b5cf6
@border-width: 6px
@border-style: dashed

太い破線ボーダーとパープルのテーマです。
:::

### Column-TOCディレクティブ

以下のディレクティブはTOCに表示されます:

:::column-toc
(col-toc-1)=
@title: TOCに表示される列1
@border-color: #3b82f6
@background: #dbeafe

これはTOCに表示される列です。
:::

:::column-toc
(col-toc-2)=
@title: TOCに表示される列2
@border-color: #10b981
@background: #d1fae5

2つ目のTOC表示列
:::

## 注釈

本文の中で補足したい内容がある場合は、`annotation` ディレクティブで囲みます。以下の文では注釈マーカーが自動で挿入されます。注釈は長文でも問題ありません。
ここで注釈を挟みます。
:::annotation
この注釈は段落を複数含めるテストです。

1. 箇条書きも利用できます。
2. 数式も書けます。たとえば $a^2 + b^2 = c^2$。

```
コードブロック
も注釈内で利用可能です。
```

:::
続きの文章もそのまま繋がります。

もう一つ短い注釈を挿入してみます。
:::annotation
簡潔な注釈の例です。
:::


段落が続きます。

:::column-toc
(col-toc-3)=
@title: TOCに表示される列3
@border-color: #f59e0b
@background: #fef3c7

3つ目のTOC表示列
:::

[TOC列1](@col-toc-1)、[TOC列2](@col-toc-2)、[TOC列3](@col-toc-3) を参照してください。

## (sec-lists)= リスト

### 順序付きリスト

1. 最初の項目
2. 2番目の項目 $x = 1$ を含む
3. 3番目の項目

### 箇条書きリスト

- 箇条書き1
- 箇条書き2 $y = 2$ あり
- 箇条書き3

### ネストされたリスト

1. 第一項目
   - サブ項目1
   - サブ項目2
     - さらにネストしたサブ項目
2. 第二項目
   1. 番号付きサブ項目1
   2. 番号付きサブ項目2
3. 第三項目

### タスクリスト

- [x] 完了したタスク
- [ ] 未完了のタスク
- [x] もう一つ完了したタスク
- [ ] まだやることがある

## (sec-code)= コードブロック

### TypeScript

```typescript
// TypeScriptのコード例
interface User {
  id: number;
  name: string;
  email: string;
}

function greet(user: User): string {
  return `Hello, ${user.name}!`;
}
```

### Python

```python
# Pythonのコード例
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print([fibonacci(i) for i in range(10)])
```

## (sec-quote)= 引用

> これは引用ブロックです。
> 複数行にわたる引用も可能です。
>
> 引用の中に段落を含めることもできます。

> **注意:** 重要な情報は引用ブロックで強調できます。

## (sec-table)= テーブル

### 基本的なテーブル

| 項目 | 説明        | 値  |
| ---- | ----------- | --- |
| A    | 最初の項目  | 100 |
| B    | 2番目の項目 | 200 |
| C    | 3番目の項目 | 300 |

### 数式を含むテーブル

| 変数 | 式        | 結果 |
| ---- | --------- | ---- |
| $x$  | $x^2 + 1$ | $2$  |
| $y$  | $2y - 3$  | $5$  |
| $z$  | $sqrt(z)$ | $3$  |

## (sec-labels)= ラベルと参照

このドキュメントでは、以下のセクションにラベルを付与しています：

### 完全な参照形式（[テキスト](@ラベル)）

- [基本的なMarkdown記法](@sec-basic)
- [数式（Typst）](@sec-math)
- [ディレクティブ](@sec-directives)
- [リスト](@sec-lists)
- [コードブロック](@sec-code)
- [引用](@sec-quote)
- [テーブル](@sec-table)
- [このセクション](@sec-labels)

また、Columnディレクティブへの参照も可能です：

- [カスタムボーダー](@col-custom-border)
- [TOCに表示される列1](@col-toc-1)

### 簡潔な参照形式（@ラベル）

見出しへの参照：@sec-basic や @sec-math、@sec-directives など。

Columnディレクティブへの参照：@col-blue、@col-red、@col-green、@col-custom-border、@col-toc-1、@col-toc-2、@col-toc-3 などが利用可能です。

文章の中で @sec-code を参照したり、@col-basic を参照したりできます。

## まとめ

すべての機能が1つのページでテストできます。
