import type { Root, FootnoteDefinition, FootnoteReference, Parent, Heading, List, ListItem, Text, Content } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { LabelIndex } from "./refs";

type AnnotationInfo = {
  identifier: string;
  elementId: string;
  number: number;
  title: string;
  summary: string;
  content: Content[];
};

interface PluginOptions {
  labelIndex: LabelIndex;
}

const ANNOTATION_PREFIX = "annotation";

export const remarkAnnotations: Plugin<[PluginOptions], Root> = (options) => {
  const { labelIndex } = options;

  return (tree: Root) => {
    const definitions = new Map<string, FootnoteDefinition>();
    const annotations: AnnotationInfo[] = [];
    const referenceMap = new Map<string, AnnotationInfo>();

    collectDefinitions(tree, definitions);
    processReferences(tree, definitions, annotations, referenceMap, labelIndex);

    if (annotations.length > 0) {
      appendAnnotationSection(tree, annotations);
    }
  };
};

function collectDefinitions(tree: Root, definitions: Map<string, FootnoteDefinition>) {
  visit(tree, "footnoteDefinition", (node) => {
    const definition = node as FootnoteDefinition;
    definitions.set(definition.identifier, definition);
  });

  tree.children = tree.children.filter((child) => child.type !== "footnoteDefinition");
}

function processReferences(
  tree: Root,
  definitions: Map<string, FootnoteDefinition>,
  annotations: AnnotationInfo[],
  referenceMap: Map<string, AnnotationInfo>,
  labelIndex: LabelIndex,
) {
  visit(tree, "footnoteReference", (node, index, parent) => {
    if (!parent || typeof index !== "number") {
      return;
    }

    const reference = node as FootnoteReference;
    const definition = definitions.get(reference.identifier);
    const annotation = ensureAnnotation(reference, definition, annotations, referenceMap, labelIndex);
    const markerText = String(annotation.number);

    const linkNode = createAnnotationLink(annotation, markerText);
    parent.children.splice(index, 1, linkNode);
  });
}

function ensureAnnotation(
  reference: FootnoteReference,
  definition: FootnoteDefinition | undefined,
  annotations: AnnotationInfo[],
  referenceMap: Map<string, AnnotationInfo>,
  labelIndex: LabelIndex,
): AnnotationInfo {
  const existing = referenceMap.get(reference.identifier);
  if (existing) {
    return existing;
  }

  const number = annotations.length + 1;
  const elementId = `${ANNOTATION_PREFIX}-${reference.identifier || number}`;
  const content = cloneNodes(definition?.children ?? createFallbackContent(reference.identifier));
  const summary = extractSummary(content);
  const title = `注釈 ${number}`;

  const info: AnnotationInfo = {
    identifier: reference.identifier,
    elementId,
    number,
    title,
    summary,
    content,
  };

  referenceMap.set(reference.identifier, info);
  annotations.push(info);

  labelIndex.add({
    id: elementId,
    type: "annotation",
    elementId,
    title,
    summary,
  });

  return info;
}

function createAnnotationLink(annotation: AnnotationInfo, markerText: string): FootnoteReference {
  return {
    type: "link",
    url: `#${annotation.elementId}`,
    children: [
      {
        type: "text",
        value: markerText,
      } as Text,
    ],
    data: {
      hName: "a",
      hProperties: {
        className: ["ref-link", "annotation-marker"],
        "data-ref": annotation.elementId,
        "data-ref-type": "annotation",
        "data-ref-title": annotation.title,
      },
    },
  } as unknown as FootnoteReference;
}

function appendAnnotationSection(tree: Root, annotations: AnnotationInfo[]) {
  const heading: Heading = {
    type: "heading",
    depth: 2,
    children: [
      {
        type: "text",
        value: "注釈",
      } as Text,
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

function createFallbackContent(identifier: string): Content[] {
  return [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: `注釈 "${identifier}" の本文が見つかりません。`,
        },
      ],
    },
  ];
}
