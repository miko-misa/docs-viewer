---
title: "テストページ"
tags:
  - "テスト"
  - "Markdown"
  - "Typst"
---

# テストページ

## 改行と段落のテスト

これは最初の文です。
これは2行目の文です。改行が1つだけあるので、同じ段落として表示されます。
3行目も同様に続きます。

ここで段落が変わります。改行が2つ（空行）あるため、新しい段落として表示されます。

このように空行で区切ることで、段落を分けることができます。

## Typst数式のテスト

インライン数式: $x + y = z$ と $a^2 + b^2 = c^2$

分数のテスト: $1/2$ と $(a+b)/(c+d)$ と $a/b + c/d$

ブロック数式:

$$
integral_0^infinity e^(-x^2) dif x = sqrt(pi)/2
$$

分数のブロック数式:

$$
x = (-b plus.minus sqrt(b^2 - 4 a c)) / (2 a)
$$

## ディレクティブのテスト

:::theorem
ピタゴラスの定理: 直角三角形において、斜辺の長さの2乗は他の2辺の長さの2乗の和に等しい。

すなわち、$a^2 + b^2 = c^2$ が成り立つ。
:::

:::proof
証明は省略します。
:::

:::column
@title:重要な補足
@color:#3b82f6
@title-color:#ffffff
@background:#eff6ff
@border-color:#3b82f6
@border-width:4px

これは青い帯と淡い青の背景を持つコラムの例です。重要な補足情報を記載します。
:::

:::column
@title:注意事項
@color:#ef4444
@title-color:#ffffff
@background:#fee2e2
@border-color:#ef4444

タイトルは赤、背景は淡い赤のコラムです。注意が必要な内容を強調できます。
:::

:::column
@title:メモ
@color:#10b981
@title-color:#ffffff
@background:#d1fae5
@border-color:#10b981

緑色のコラムでメモを記載できます。
:::

:::column-toc
@title:シンプルなコラム

タイトルのみで色指定なし(デフォルトスタイル)
:::

:::column
@background:#f3f4f6

タイトルなし、背景色のみのシンプルなコンテナです。左ボーダーはありません。
:::

:::column
@background:#fef3c7
@border-color:#f59e0b
@border-width:3px

タイトルなし、背景色あり、左ボーダーも表示する例です。
:::

:::column
@title:カスタムボーダー
@color:#8b5cf6
@title-color:#ffffff
@background:#f5f3ff
@border-color:#8b5cf6
@border-width:6px
@border-style:dashed

太い破線ボーダーとパープルのテーマです。
:::

## リストのテスト



テスト

1. 最初の項目
2. 2番目の項目 $x = 1$ を含む
3. 3番目の項目

- 箇条書き1
- 箇条書き2 $y = 2$ あり
- 箇条書き3

## テキスト装飾のテスト

**太字のテキスト**と*斜体のテキスト*、そして**_太字かつ斜体_**。

~~取り消し線~~も使えます。

インラインコード: `const x = 42;` や `npm install` など。

## コードブロックのテスト

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

```python
# Pythonのコード例
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print([fibonacci(i) for i in range(10)])
```

## 引用のテスト

> これは引用ブロックです。
> 複数行にわたる引用も可能です。
>
> 引用の中に段落を含めることもできます。

> **注意:** 重要な情報は引用ブロックで強調できます。

## リンクのテスト

[Googleへのリンク](https://www.google.com)

[Next.jsドキュメント](https://nextjs.org/docs)

内部リンク: [テストページトップ](#テストページ)

## 画像のテスト

![サンプル画像の代替テキスト](https://via.placeholder.com/400x200?text=Sample+Image)

## テーブルのテスト

| 項目 | 説明        | 値  |
| ---- | ----------- | --- |
| A    | 最初の項目  | 100 |
| B    | 2番目の項目 | 200 |
| C    | 3番目の項目 | 300 |

数式を含むテーブル:

| 変数 | 式        | 結果 |
| ---- | --------- | ---- |
| $x$  | $x^2 + 1$ | $2$  |
| $y$  | $2y - 3$  | $5$  |
| $z$  | $sqrt(z)$ | $3$  |

## 水平線のテスト

上のコンテンツ

---

下のコンテンツ

## 複雑なリストのテスト

1. 第一項目
   - サブ項目1
   - サブ項目2
     - さらにネストしたサブ項目
2. 第二項目
   1. 番号付きサブ項目1
   2. 番号付きサブ項目2
3. 第三項目

## タスクリストのテスト

- [x] 完了したタスク
- [ ] 未完了のタスク
- [x] もう一つ完了したタスク
- [ ] まだやることがある
