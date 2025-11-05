import type { ReactNode } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeReact from "rehype-react";
import {
  HeadingH1,
  HeadingH2,
  HeadingH3,
  HeadingH4,
  HeadingH5,
  HeadingH6,
} from "../components/Heading";
import { RefLink } from "../components/RefLink";
import DirectiveWrapper from "../components/DirectiveWrapper";
import { TypstSvg } from "../components/typst-svg";
import { CheckIcon } from "../components/CheckIcon";
import { TaskCheckbox } from "../components/TaskCheckbox";
import { DiffIcon } from "../components/DiffIcon";
import type { Plugin } from "unified";
import type { Parent } from "unist";
import type { Element, Properties } from "hast";
import type { Text, Code } from "mdast";
import { visit } from "unist-util-visit";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import type { Schema } from "hast-util-sanitize";
import { slug } from "github-slugger";
import { LabelIndex } from "./refs";
import { remarkCollectLabels } from "./remark-labels";
import { remarkResolveReferences } from "./remark-references";
import { remarkAnnotations } from "./remark-annotations";
import { rehypeTypstWithProlog } from "./rehype-typst-curryst";
import { CURRYST_TYPST_PROLOG } from "./typst-curryst-prolog";

type DirectiveNode = Parent & {
  name?: string;
  attributes?: Record<string, unknown>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    [key: string]: unknown;
  };
  type: "textDirective" | "leafDirective" | "containerDirective";
};

function getDirectiveContentText(node: Parent): string {
  const children = (
    node as unknown as {
      children?: Array<{ type?: string; value?: unknown; name?: unknown }>;
    }
  ).children;
  if (!Array.isArray(children)) {
    return "";
  }

  let text = "";
  for (const child of children) {
    if (!child) continue;
    if (child.type === "text" && typeof child.value === "string") {
      text += child.value;
    } else if (child.type === "textDirective") {
      text += `:${String(child.name ?? "")}`;
    } else if (child.type === "break") {
      text += "\n";
    }
  }
  return text;
}

function isParentNode(node: unknown): node is Parent {
  return Boolean(node) && typeof node === "object" && Array.isArray((node as Parent).children);
}

function isDirectiveNode(node: unknown): node is DirectiveNode {
  if (!node || typeof node !== "object") return false;
  const candidate = node as Partial<DirectiveNode>;
  if (
    candidate.type !== "textDirective" &&
    candidate.type !== "leafDirective" &&
    candidate.type !== "containerDirective"
  ) {
    return false;
  }
  if (candidate.name !== undefined && typeof candidate.name !== "string") {
    return false;
  }
  return true;
}

function getProofTreeTypstBody(directive: DirectiveNode): string {
  if (!Array.isArray(directive.children)) {
    return "";
  }

  const children = directive.children as Parent["children"];
  const parts: string[] = [];

  for (const child of children) {
    if (!isParentNode(child) || child.type !== "paragraph" || !Array.isArray(child.children)) {
      continue;
    }

    const paragraphChildren = child.children as Parent["children"];

    for (const paragraphChild of paragraphChildren) {
      if (!paragraphChild) continue;

      const typed = paragraphChild as { type?: string; value?: unknown };

      if (typed.type === "text" && typeof typed.value === "string") {
        parts.push(typed.value);
      } else if (typed.type === "break") {
        parts.push("\n");
      } else if (typed.type === "inlineMath" && typeof typed.value === "string") {
        parts.push(`$${typed.value}$`);
      }
    }

    parts.push("\n");
  }

  return parts.join("").trim();
}

function isStandaloneDirectiveCloser(node: unknown): node is Parent {
  if (!node || typeof node !== "object") return false;
  const paragraph = node as Parent & { type?: string };
  if (paragraph.type !== "paragraph") return false;
  const text = getDirectiveContentText(paragraph).trim();
  if (text.length === 0) return false;
  // Treat paragraphs consisting solely of directive closers (e.g., :::) as closers.
  return /^:::$/.test(text);
}

const remarkNormalizeDiffCode: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, "code", (node: Code) => {
    const lang = node.lang;
    if (!lang) return;

    const diffMatch = /^diff[-:+](.+)$/i.exec(lang);
    if (!diffMatch) return;

    const normalizedLang = diffMatch[1]?.trim();
    if (!normalizedLang) return;

    node.lang = normalizedLang;

    if (typeof node.meta === "string") {
      if (!/\bdiff\b/i.test(node.meta)) {
        node.meta = `${node.meta} diff`.trim();
      }
    } else {
      node.meta = "diff";
    }
  });
};

const remarkTransformDirectives: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, (node, index, parent) => {
    if (
      node.type !== "textDirective" &&
      node.type !== "leafDirective" &&
      node.type !== "containerDirective"
    ) {
      return;
    }

    const directive = node as DirectiveNode;

    const data = directive.data || (directive.data = {});

    const tagName =
      directive.type === "textDirective"
        ? "span"
        : directive.type === "leafDirective"
          ? "div"
          : "div";

    data.hName = data.hName ?? tagName;

    const isColumnToc = directive.name === "column-toc";
    const baseName = isColumnToc ? "column" : directive.name || "";

    const classes =
      directive.name === "prooftree"
        ? []
        : [`directive`, baseName ? `directive-${baseName}` : null].filter(Boolean);

    const hProperties: Record<string, unknown> = {
      ...(directive.attributes ?? {}),
      ...(data.hProperties ?? {}),
      className: classes,
    };

    if ((directive.name === "column" || isColumnToc) && directive.children) {
      const children = directive.children as Parent[];
      let title = "";

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type === "paragraph" && child.children) {
          const paragraphText = getDirectiveContentText(child);
          const lines = paragraphText.split("\n");
          const contentLines: string[] = [];
          let hasMetadata = false;

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("@title:")) {
              title = trimmed.substring(7).trim();
              hProperties["data-title"] = title;
              hasMetadata = true;
            } else if (trimmed.startsWith("@title-color:")) {
              hProperties["data-title-color"] = trimmed.substring(13).trim();
              hasMetadata = true;
            } else if (trimmed.startsWith("@color:")) {
              hProperties["data-color"] = trimmed.substring(7).trim();
              hasMetadata = true;
            } else if (trimmed.startsWith("@background:")) {
              hProperties["data-background"] = trimmed.substring(12).trim();
              hasMetadata = true;
            } else if (trimmed.startsWith("@border-color:")) {
              hProperties["data-border-color"] = trimmed.substring(14).trim();
              hasMetadata = true;
            } else if (trimmed.startsWith("@border-width:")) {
              hProperties["data-border-width"] = trimmed.substring(14).trim();
              hasMetadata = true;
            } else if (trimmed.startsWith("@border-style:")) {
              hProperties["data-border-style"] = trimmed.substring(14).trim();
              hasMetadata = true;
            } else if (trimmed !== "") {
              contentLines.push(line);
            }
          }

          if (hasMetadata) {
            const newContent = contentLines.join("\n").trim();

            if (newContent) {
              const textNode = { type: "text", value: newContent } as unknown as Text;
              child.children = [textNode];
            } else {
              children.splice(i, 1);
              i--;
            }
          }
        }
      }

      // タイトルをdataに保存（remarkCollectLabelsが使用）
      if (title) {
        directive.data = directive.data || {};
        directive.data.directiveTitle = title;
      }

      if (isColumnToc && title) {
        // すでにremarkCollectLabelsでIDが設定されていない場合のみ、タイトルからslugを生成
        if (!hProperties["id"]) {
          hProperties["id"] = slug(title);
        }
      }
    }

    if (directive.name === "prooftree" && parent && typeof index === "number") {
      const typstBody = getProofTreeTypstBody(directive);
      if (!typstBody) {
        parent.children.splice(index, 1);
        return;
      }

      const classNames = Array.from(new Set([...classes, "typst-prooftree"]));
      const expression = typstBody.startsWith("prooftree(") ? typstBody : `prooftree(${typstBody})`;
      directive.data = directive.data || {};
      directive.data.hName = "div";
      directive.data.hProperties = {
        className: classNames,
        "data-typst-expression": expression,
      };
      directive.children = [];
      return;
    }

    if (
      (directive.name === "column" || directive.name === "column-toc") &&
      directive.children &&
      parent &&
      typeof index === "number" &&
      Array.isArray((parent as Parent).children)
    ) {
      const parentChildren = Array.isArray((parent as Parent).children)
        ? ((parent as Parent).children as Parent["children"])
        : [];
      const start = index + 1;
      let closingIndex = -1;

      for (let i = start; i < parentChildren.length; i++) {
        const sibling = parentChildren[i];

        if (sibling && isStandaloneDirectiveCloser(sibling)) {
          closingIndex = i;
          break;
        }

        if (sibling && isDirectiveNode(sibling)) {
          const siblingDirective = sibling;
          const siblingName = siblingDirective.name ?? "";
          if (siblingName !== "annotation") {
            break;
          }
        }
      }

      if (closingIndex !== -1) {
        const movedNodes = parentChildren.slice(start, closingIndex);
        if (movedNodes.length > 0) {
          const directiveChildren = Array.isArray(directive.children)
            ? (directive.children as Parent["children"])
            : ((directive.children = []) as Parent["children"]);
          directiveChildren.push(...movedNodes);
        }
        parentChildren.splice(start, closingIndex - start);
        if (parentChildren[start] && isStandaloneDirectiveCloser(parentChildren[start])) {
          parentChildren.splice(start, 1);
        }
      }
    }

    data.hProperties = hProperties;
  });
};

const sanitizeSchema: Schema = {
  tagNames: [
    "a",
    "p",
    "div",
    "span",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "strong",
    "em",
    "code",
    "pre",
    "del",
    "blockquote",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "img",
    "figure",
    "figcaption",
    "check-icon",
    "task-checkbox",
    "svg",
    "g",
    "path",
    "defs",
    "use",
    "style",
    "clipPath",
    "input",
    "diff-icon",
  ],
  attributes: {
    "*": ["className", "id"],
    a: ["href", "ref", "target", "rel", "data-ref", "data-ref-type", "data-ref-title"],
    div: [
      "data-name",
      "data-value",
      "data-title",
      "data-title-color",
      "data-color",
      "data-background",
      "data-border-color",
      "data-border-width",
      "data-border-style",
      "data-typst-expression",
    ],
    img: ["src", "alt", "title", "width", "height"],
    figure: ["data-rehype-pretty-code-figure"],
    pre: ["data-language", "data-theme"],
    code: ["data-language", "data-theme", "style"],
    span: [
      "data-line",
      "data-line-start",
      "data-line-end",
      "data-highlighted",
      "data-diff",
      "data-diff-symbol",
      "data-line-number",
      "style",
    ],
    "diff-icon": ["type"],
    "task-checkbox": ["checked"],
    svg: [
      "className",
      "aria-hidden",
      "data-width",
      "data-height",
      "data-typst-style",
      "viewBox",
      "width",
      "height",
      "xmlns",
      "fill",
      "stroke",
      "xmlns:xlink",
      "xmlns:h5",
    ],
    path: [
      "d",
      "fill",
      "class",
      "id",
      "stroke",
      "stroke-width",
      "strokeWidth",
      "stroke-linecap",
      "strokeLinecap",
      "stroke-linejoin",
      "strokeLinejoin",
      "stroke-miterlimit",
      "strokeMiterlimit",
    ],
    g: ["data-tid", "transform", "fill", "class"],
    use: ["href", "fill", "transform", "x", "y", "xlink:href"],
    style: ["type"],
    clipPath: ["id"],
  },
  protocols: {
    href: ["http", "https", "mailto", "data"],
    src: ["http", "https", "data"],
  },
  strip: ["script"],
  allowComments: false,
  allowDoctypes: false,
  clobber: [],
  clobberPrefix: "",
};

function findDiffIndicator(
  node: Element | { value?: string; children?: unknown[] } | undefined,
): string | null {
  if (!node) return null;
  if ("value" in node && typeof node.value === "string" && node.value.length > 0) {
    const first = node.value[0];
    if (first === "+" || first === "-") {
      return first;
    }
  }
  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      const indicator = findDiffIndicator(child as Element);
      if (indicator) return indicator;
    }
  }
  return null;
}

function stripDiffIndicator(
  node: Element | { value?: string; children?: unknown[] },
  indicator: string,
): boolean {
  if (!node) return false;
  if ("value" in node && typeof node.value === "string" && node.value.length > 0) {
    const value = node.value;
    if (value.startsWith(indicator)) {
      let trimmed = value.slice(1);
      if (trimmed.startsWith(" ")) {
        trimmed = trimmed.slice(1);
      }
      node.value = trimmed;
      return true;
    }
    if (value === indicator) {
      node.value = "";
      return true;
    }
  }
  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (stripDiffIndicator(child as Element, indicator)) {
        return true;
      }
    }
  }
  return false;
}

const rehypePrettyCodeOptions: PrettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
  defaultLang: "plaintext",
  onVisitLine(element) {
    element.properties = element.properties ?? {};
    const props = element.properties as Properties & { className?: unknown };
    const classList = new Set<string>();
    const existing = props.className;
    if (Array.isArray(existing)) {
      for (const value of existing) {
        if (typeof value === "string") classList.add(value);
      }
    } else if (typeof existing === "string") {
      for (const token of existing.split(/\s+/)) {
        if (token) classList.add(token);
      }
    }
    classList.add("line");
    props.className = Array.from(classList);
  },
  onVisitHighlightedLine(element) {
    element.properties = element.properties ?? {};
    (element.properties as Properties)["data-highlighted"] = "true";
  },
};

const rehypeEnhanceCodeBlocks: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, "element", (node) => {
    const pre = node as Element & Parent;
    if (pre.tagName !== "pre") return;

    const code = pre.children.find(
      (child): child is Element & Parent =>
        child.type === "element" && (child as Element).tagName === "code",
    );

    if (!code) return;

    const languageRaw = pre.properties?.["data-language"];
    const language = typeof languageRaw === "string" ? languageRaw.toLowerCase() : "";

    const codeProperties = (code.properties ?? {}) as Properties & { metastring?: unknown };
    const codeData = (code.data ?? {}) as { meta?: unknown };
    const codeMetaRaw =
      typeof codeData.meta === "string"
        ? codeData.meta
        : typeof codeProperties.metastring === "string"
          ? String(codeProperties.metastring)
          : undefined;
    const hasDiffMeta = typeof codeMetaRaw === "string" ? /\bdiff\b/i.test(codeMetaRaw) : false;

    const isDiff = language === "diff" || hasDiffMeta;

    let hasDiff = false;
    for (const child of code.children) {
      if (child.type !== "element") continue;
      const line = child as Element & Parent;
      if (line.tagName !== "span") continue;

      line.properties = line.properties ?? {};
      const props = line.properties as Properties & { className?: unknown };

      if (isDiff) {
        const indicator = findDiffIndicator(line);
        if (indicator && stripDiffIndicator(line, indicator)) {
          hasDiff = true;
          props["data-diff"] = indicator === "+" ? "add" : "remove";
          props["data-diff-symbol"] = indicator;
          const iconElement: Element = {
            type: "element",
            tagName: "diff-icon",
            properties: { type: indicator === "+" ? "add" : "remove" },
            children: [],
          };
          line.children.unshift(iconElement as unknown as Parent["children"][number]);
        }
      }
    }

    if (isDiff && !hasDiff) {
      visit(code, "element", (line) => {
        const element = line as Element;
        if (element.tagName !== "span") return;
        const props = element.properties as Properties | undefined;
        if (props) {
          delete props["data-diff"];
          delete props["data-diff-symbol"];
        }
      });
    }

    code.children = code.children.filter((child) => {
      if (child.type !== "text") return true;
      const value = (child as { value?: string }).value ?? "";
      return value.trim().length > 0;
    });
  });
};
export async function renderMarkdown(markdown: string): Promise<ReactNode> {
  const isDev = process.env.NODE_ENV !== "production";

  // ラベルインデックスを作成
  const labelIndex = new LabelIndex();

  const file = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkDirective)
    .use(remarkNormalizeDiffCode)
    .use(remarkTransformDirectives)
    .use(remarkCollectLabels, { labelIndex })
    .use(remarkResolveReferences, { labelIndex })
    .use(remarkAnnotations, { labelIndex })
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeTypstWithProlog, {
      prolog: CURRYST_TYPST_PROLOG,
    })
    .use(rehypePrettyCode, rehypePrettyCodeOptions)
    .use(rehypeEnhanceCodeBlocks)
    .use(rehypeSlug)
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
        "diff-icon": DiffIcon,
      },
    })
    .process(markdown);

  return file.result as ReactNode;
}

const enforceInlineMathRendering: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, "element", (node, index, parent) => {
    const element = node as Element & { classNames?: unknown };
    if (element.tagName !== "svg") return;

    const props = (element.properties ?? {}) as Properties & Record<string, unknown>;
    const existing = props.className;
    let classes: string[] = [];
    if (Array.isArray(existing)) classes = existing.map(String);
    else if (typeof existing === "string") classes = existing.split(/\s+/).filter(Boolean);

    const extra = element.classNames;
    if (Array.isArray(extra)) {
      classes.push(...extra.map(String));
    }

    delete element.classNames;

    if (!classes.includes("typst-doc")) classes.unshift("typst-doc");

    // 親要素を確認して、インライン/ブロックを判定
    if (parent && "tagName" in parent && "children" in parent) {
      const parentElement = parent as Element & Parent;

      if (parentElement.tagName === "p") {
        const siblings = parentElement.children;

        // pの子要素を解析
        let hasNonWhitespaceText = false;
        let svgCount = 0;

        for (const child of siblings) {
          if (child.type === "text") {
            const textValue = (child as { value?: string }).value || "";
            if (textValue.trim().length > 0) {
              hasNonWhitespaceText = true;
            }
          } else if (child.type === "element" && (child as Element).tagName === "svg") {
            svgCount++;
          } else if (child.type === "element") {
            // 他の要素がある場合もインライン扱い
            hasNonWhitespaceText = true;
          }
        }

        // テキストがあるか、複数のSVGがある場合はインライン
        if (hasNonWhitespaceText || svgCount > 1) {
          if (!classes.includes("typst-inline")) classes.push("typst-inline");
        } else if (svgCount === 1) {
          // SVG1つのみの場合はブロック
          if (!classes.includes("typst-block")) classes.push("typst-block");
        }
      }
    }

    props.className = Array.from(new Set(classes)).join(" ");
    element.properties = props;
  });
};

const preserveTypstStyles: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, "element", (node) => {
    const element = node as Element;
    if (element.tagName !== "svg") return;

    const props = (element.properties ?? {}) as Properties & Record<string, unknown>;
    if (!props) return;

    const style = props.style as string | undefined;
    if (typeof style === "string" && style.length > 0) {
      props["data-typst-style"] = style;
      delete props.style;
    }
    element.properties = props;
  });
};

const replaceCheckmarks: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, "text", (node, index, parent) => {
    if (typeof index !== "number" || !parent) return;
    if (!("children" in parent)) return;

    const textNode = node as { value: string };
    const text = textNode.value;

    if (!text.includes("✅")) return;

    const parts = text.split("✅");
    const newNodes: Array<Element | { type: "text"; value: string }> = [];

    parts.forEach((part, i) => {
      if (i > 0) {
        newNodes.push({
          type: "element",
          tagName: "check-icon",
          properties: {},
          children: [],
        } as Element);
      }
      if (part) {
        newNodes.push({ type: "text", value: part });
      }
    });

    (parent as Parent).children.splice(index, 1, ...newNodes);
  });
};

const replaceTaskCheckboxes: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, "element", (node, index, parent) => {
    if (typeof index !== "number" || !parent) return;
    if (!("children" in parent)) return;

    const element = node as Element;
    if (element.tagName !== "input") return;

    const props = element.properties as Properties;
    if (props?.type !== "checkbox") return;

    const checked = props.checked === true || props.checked === "true";
    const taskCheckbox: Element = {
      type: "element",
      tagName: "task-checkbox",
      properties: { checked: checked ? "true" : "false" },
      children: [],
    };

    (parent as Parent).children.splice(index, 1, taskCheckbox);
  });
};
