import type { Root, Parent, Content, Heading, List, ListItem, Text, Paragraph } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { LabelIndex } from "./refs";

interface PluginOptions {
  labelIndex: LabelIndex;
}

type AnnotationInfo = {
  elementId: string;
  number: number;
  title: string;
  summary: string;
  content: Content[];
};

type DirectiveNode = Parent & {
  type: "containerDirective";
  name?: string;
  attributes?: Record<string, unknown>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    [key: string]: unknown;
  };
};

const ANNOTATION_PREFIX = "annotation";

export const remarkAnnotations: Plugin<[PluginOptions], Root> = ({ labelIndex }) => {
  return (tree: Root) => {
    const annotations: AnnotationInfo[] = [];

    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== "number") return;
      if (node.type !== "containerDirective") return;

      const directive = node as DirectiveNode;
      if ((directive.name ?? "") !== "annotation") return;

      const annotation = createAnnotation(directive, annotations.length + 1, labelIndex);
      annotations.push(annotation);

      const marker = createAnnotationMarker(annotation);
      insertMarkerIntoParent(parent, index, marker, directive);
    });

    if (annotations.length > 0) {
      appendAnnotationSection(tree, annotations);
    }
  };
};

function createAnnotation(
  directive: DirectiveNode,
  number: number,
  labelIndex: LabelIndex,
): AnnotationInfo {
  const elementId = `${ANNOTATION_PREFIX}-${number}`;
  const title = `注釈 ${number}`;
  const content = cloneNodes((directive.children as Content[]) ?? []);
  const summary = extractSummary(content);

  labelIndex.add({
    id: elementId,
    type: "annotation",
    elementId,
    title,
    summary,
  });

  return {
    elementId,
    number,
    title,
    summary,
    content,
  };
}

function createAnnotationMarker(annotation: AnnotationInfo): Content {
  const markerText: Text = {
    type: "text",
    value: String(annotation.number),
  };

  return {
    type: "link",
    url: `#${annotation.elementId}`,
    children: [markerText],
    data: {
      hName: "a",
      hProperties: {
        className: ["ref-link", "annotation-marker"],
        "data-ref": annotation.elementId,
        "data-ref-type": "annotation",
        "data-ref-title": annotation.title,
      },
    },
  } as Content;
}

function insertMarkerIntoParent(
  parent: Parent,
  index: number,
  marker: Content,
  directive: DirectiveNode,
) {
  if (parent.type === "paragraph") {
    parent.children.splice(index, 1, marker);
    return;
  }

  const previous = parent.children[index - 1];
  const next = parent.children[index + 1];
  const hasBlankBefore = hasBlankLineBetween(previous, directive);
  const hasBlankAfter = hasBlankLineBetween(directive, next);

  if (hasBlankBefore && next?.type === "paragraph") {
    prependMarkerToParagraph(next as Paragraph, marker);
    parent.children.splice(index, 1);
    return;
  }

  if (!hasBlankBefore && previous?.type === "paragraph") {
    const paragraph = previous as Paragraph;
    appendMarkerToParagraph(paragraph, marker);
    parent.children.splice(index, 1);
    if (!hasBlankAfter) {
      mergeFollowingParagraph(parent, index, paragraph);
    }
    return;
  }

  if (next?.type === "paragraph") {
    prependMarkerToParagraph(next as Paragraph, marker);
    parent.children.splice(index, 1);
    return;
  }

  if (previous?.type === "paragraph") {
    appendMarkerToParagraph(previous as Paragraph, marker);
    parent.children.splice(index, 1);
    return;
  }

  parent.children.splice(index, 1, {
    type: "paragraph",
    children: [marker],
  } as Paragraph);
}

function hasBlankLineBetween(
  a: { position?: { end?: { line?: number } } } | undefined,
  b: { position?: { start?: { line?: number } } } | undefined,
): boolean {
  if (!a?.position?.end || !b?.position?.start) return false;
  const endLine = a.position.end.line ?? 0;
  const startLine = b.position.start.line ?? 0;
  return startLine - endLine > 1;
}

function appendMarkerToParagraph(paragraph: Paragraph, marker: Content) {
  paragraph.children.push(marker);
}

function prependMarkerToParagraph(paragraph: Paragraph, marker: Content) {
  paragraph.children.unshift(marker);
  trimLeadingWhitespace(paragraph);
}

function trimLeadingWhitespace(paragraph: Paragraph) {
  if (paragraph.children.length < 2) return;
  const first = paragraph.children[1];
  if (first && first.type === "text") {
    first.value = first.value?.replace(/^\s+/, "") ?? "";
    if (first.value.length === 0) {
      paragraph.children.splice(1, 1);
    }
  }
}

function mergeFollowingParagraph(parent: Parent, index: number, target: Paragraph) {
  const nextNode = parent.children[index];
  if (!nextNode || nextNode.type !== "paragraph") return;

  const nextParagraph = nextNode as Paragraph;
  const nextChildren = cloneNodes(nextParagraph.children);

  if (nextChildren.length > 0) {
    const first = nextChildren[0];
    if (first?.type === "text") {
      first.value = first.value?.replace(/^\s+/, "") ?? "";
      if (first.value.length === 0) {
        nextChildren.shift();
      }
    }
  }

  if (nextChildren.length > 0) {
    target.children.push(...nextChildren);
  }

  parent.children.splice(index, 1);
}

function appendAnnotationSection(tree: Root, annotations: AnnotationInfo[]) {
  const heading: Heading = {
    type: "heading",
    depth: 2,
    children: [
      {
        type: "text",
        value: "注釈",
      },
    ],
  };

  const listItems: ListItem[] = annotations.map((annotation) => ({
    type: "listItem",
    data: {
      hProperties: {
        id: annotation.elementId,
        className: ["annotation-entry"],
      },
    },
    children: cloneNodes(annotation.content),
  }));

  const list: List = {
    type: "list",
    ordered: true,
    spread: false,
    children: listItems,
    data: {
      hProperties: {
        className: ["annotation-list"],
      },
    },
  };

  tree.children.push({ type: "thematicBreak" });
  tree.children.push(heading);
  tree.children.push(list);
}

function extractSummary(nodes: Content[]): string {
  for (const node of nodes) {
    if (node.type === "paragraph") {
      const text = toPlainText(node);
      if (text.trim()) {
        return text.trim();
      }
    }
  }
  return "";
}

function toPlainText(node: Content): string {
  if ("children" in node && Array.isArray((node as Parent).children)) {
    return (node as Parent).children.map((child) => toPlainText(child as Content)).join("");
  }

  if (node.type === "text") {
    return node.value ?? "";
  }

  return "";
}

function cloneNodes<T extends Content>(nodes: T[]): T[] {
  return nodes.map((node) => {
    if (typeof structuredClone === "function") {
      return structuredClone(node);
    }
    return JSON.parse(JSON.stringify(node)) as T;
  });
}
