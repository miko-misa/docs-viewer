# Column TOC Test

このページは `:::column-toc` ディレクティブのTOC機能をテストするためのものです。

## column-toc ディレクティブ

以下のディレクティブはTOCに表示されます:

:::column-toc
@title: TOCに表示される列
@border-color: #3b82f6
@color: #dbeafe

これはTOCに表示される列です。
:::

## 通常の column ディレクティブ

以下のディレクティブはTOCに表示されません:

:::column
@title: TOCに表示されない列
@border-color: #ef4444
@color: #fee2e2

これはTOCに表示されない列です。
:::

## 複数の column-toc ディレクティブ

:::column-toc
@title: 最初のTOC列
@border-color: #10b981
@color: #d1fae5

1つ目のTOC表示列
:::

:::column-toc
@title: 2番目のTOC列
@border-color: #f59e0b
@color: #fef3c7

2つ目のTOC表示列
:::

## 通常の見出し

これは通常のH2見出しです。TOCに表示されます。

### H3見出し

これも表示されます。
