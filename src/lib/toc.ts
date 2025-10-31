import { slug } from "github-slugger";

export type TocItem = {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children?: TocItem[];
};

export function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const headings: TocItem[] = [];
  let inCodeBlock = false;
  let inBlockquote = false;
  let inColumnDirective = false;
  let columnDirectiveDepth = 0;
  let columnTitle = "";
  let columnLabel = ""; // ラベルを格納
  let columnIncludeInToc = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      continue;
    }

    inBlockquote = trimmed.startsWith(">");

    if (inBlockquote) {
      continue;
    }

    const columnStartMatch = line.match(/^:::column(-toc)?$/);
    if (columnStartMatch) {
      inColumnDirective = true;
      columnIncludeInToc = columnStartMatch[1] === "-toc";
      columnTitle = "";
      columnLabel = ""; // リセット
      columnDirectiveDepth = 1;
      continue;
    }

    if (inColumnDirective) {
      if (trimmed !== ":::" && trimmed.startsWith(":::")) {
        // ネストしたディレクティブの開始
        columnDirectiveDepth += 1;
        continue;
      }

      if (trimmed === ":::") {
        // ネストしたディレクティブの終了
        columnDirectiveDepth = Math.max(0, columnDirectiveDepth - 1);

        if (columnDirectiveDepth === 0) {
          if (columnIncludeInToc && columnTitle) {
            const id = columnLabel ? columnLabel.replace(/:/g, "-") : slug(columnTitle);
            headings.push({ id, text: columnTitle, level: 4 });
          }
          inColumnDirective = false;
          columnTitle = "";
          columnLabel = "";
          columnIncludeInToc = false;
        }
        continue;
      }

      // ラベル行をチェック（独立した行として）
      const labelOnlyMatch = trimmed.match(/^\(([a-z][a-z0-9-:]*)\)=\s*$/);
      if (labelOnlyMatch) {
        columnLabel = labelOnlyMatch[1];
        continue;
      }

      // @title: をチェック
      if (trimmed.startsWith("@title:")) {
        columnTitle = trimmed.substring(7).trim();
        continue;
      }

      continue;
    }

    if (trimmed === ":::") {
      continue;
    }

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 1 | 2 | 3 | 4 | 5 | 6;
    let text = match[2].trim();

    // ラベル構文 (label)= があるかチェック
    const labelMatch = text.match(/^\(([a-z][a-z0-9-:]*)\)=\s*/);
    let id: string;

    if (labelMatch) {
      // ラベルがある場合: ラベルをIDとして使用し、テキストからラベルを削除
      const labelId = labelMatch[1];
      id = labelId.replace(/:/g, "-"); // normalize
      text = text.replace(/^\([a-z][a-z0-9-:]*\)=\s*/, "");
    } else {
      // ラベルがない場合: テキストからslugを生成
      id = slug(text);
    }

    if (level > 3) continue;

    headings.push({ id, text, level });
  }

  return buildTocTree(headings);
}

function buildTocTree(headings: TocItem[]): TocItem[] {
  const root: TocItem[] = [];
  const stack: TocItem[] = [];

  for (const heading of headings) {
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(heading);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(heading);
    }

    stack.push(heading);
  }

  return root;
}
