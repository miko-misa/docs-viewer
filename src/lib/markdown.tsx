import type { ReactNode } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeTypst from "@myriaddreamin/rehype-typst";
import rehypeSanitize from "rehype-sanitize";
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
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { Parent } from "unist";
import type { Element, Properties } from "hast";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
import type { Schema } from "hast-util-sanitize";
import { slug } from "github-slugger";

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

const remarkTransformDirectives: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, (node) => {
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

    const classes = [`directive`, baseName ? `directive-${baseName}` : null].filter(
      Boolean,
    );

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
          const nodes = child.children as any[];
          let reconstructedText = "";
          
          for (const node of nodes) {
            if (node.type === "text") {
              reconstructedText += node.value || "";
            } else if (node.type === "textDirective") {
              reconstructedText += ":" + (node.name || "");
            } else if (node.type === "break") {
              reconstructedText += "\n";
            }
          }
          
          const lines = reconstructedText.split("\n");
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
              child.children = [{ type: "text", value: newContent }] as any;
            } else {
              children.splice(i, 1);
              i--;
            }
          }
        }
      }

      if (isColumnToc && title) {
        hProperties["id"] = slug(title);
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
  ],
  attributes: {
    "*": ["className", "id"],
    a: ["href", "ref", "target", "rel"],
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
    ],
    img: ["src", "alt", "title", "width", "height"],
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
      "style",
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
      "stroke-linecap",
      "stroke-linejoin",
    ],
    g: ["data-tid", "transform", "fill", "class"],
    use: ["href", "fill"],
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

export async function renderMarkdown(markdown: string): Promise<ReactNode> {
  const isDev = process.env.NODE_ENV !== "production";

  const file = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkDirective)
    .use(remarkTransformDirectives)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSlug)
    .use(rehypeTypst)
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

const enforceInlineMathRendering: Plugin<[], Parent> = () => (tree: Parent) => {
  visit(tree, "element", (node) => {
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
