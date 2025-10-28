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
  let columnTitle = "";
  let columnIncludeInToc = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```") || line.trim().startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      continue;
    }

    inBlockquote = line.trim().startsWith(">");

    if (inBlockquote) {
      continue;
    }

    const columnStartMatch = line.match(/^:::column(-toc)?$/);
    if (columnStartMatch) {
      inColumnDirective = true;
      columnIncludeInToc = columnStartMatch[1] === "-toc";
      columnTitle = "";
      continue;
    }

    if (line.trim() === ":::") {
      if (inColumnDirective && columnIncludeInToc && columnTitle) {
        const id = slug(columnTitle);
        headings.push({ id, text: columnTitle, level: 4 });
      }
      inColumnDirective = false;
      columnTitle = "";
      columnIncludeInToc = false;
      continue;
    }

    if (inColumnDirective && line.trim().startsWith("@title:")) {
      columnTitle = line.trim().substring(7).trim();
      continue;
    }

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 1 | 2 | 3 | 4 | 5 | 6;
    const text = match[2].trim();

    if (level > 3) continue;

    const id = slug(text);

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
