/**
 * remark plugin: 参照の解決
 *
 * [文章](@label-id) および @label-id 形式の参照を検出し、リンクに変換します。
 */

import type { Root, Link, Paragraph, PhrasingContent, Text } from "mdast";
import type { Plugin } from "unified";
import { visit, SKIP } from "unist-util-visit";
import { LabelIndex } from "./refs";

interface PluginOptions {
  labelIndex: LabelIndex;
  resolveExternal?: (
    fileSegments: string[],
    rawLabel: string,
    normalizedLabel: string,
  ) =>
    | {
        docPath: string;
        elementId: string;
        title: string;
        type: string;
      }
    | undefined;
}

/**
 * remarkResolveReferences - 参照解決プラグイン
 */
export const remarkResolveReferences: Plugin<[PluginOptions], Root> = (options) => {
  const { labelIndex, resolveExternal } = options;

  const resolveToken = (
    token: string,
  ):
    | {
        href: string;
        title: string;
        hProperties: Record<string, string>;
      }
    | undefined => {
    const normalizedToken = token.trim();
    if (!normalizedToken) return undefined;
    const slashIndex = normalizedToken.lastIndexOf("/");
    let labelPart = normalizedToken;
    let fileSegments: string[] | undefined;
    if (slashIndex > 0) {
      const filePart = normalizedToken.slice(0, slashIndex);
      labelPart = normalizedToken.slice(slashIndex + 1);
      const segments = filePart
        .split("/")
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0 && segment !== "." && segment !== "..");
      if (segments.length > 0) {
        fileSegments = segments;
      }
    }

    if (!labelPart) return undefined;
    const normalizedLabel = LabelIndex.normalizeId(labelPart);

    if (!fileSegments) {
      const labelInfo = labelIndex.get(normalizedLabel);
      if (!labelInfo) return undefined;
      return {
        href: `#${labelInfo.elementId}`,
        title: labelInfo.title,
        hProperties: {
          "data-ref": normalizedLabel,
          "data-ref-type": labelInfo.type,
          "data-ref-title": labelInfo.title,
        },
      };
    }

    if (!resolveExternal) return undefined;
    const external = resolveExternal(fileSegments, labelPart, normalizedLabel);
    if (!external) return undefined;
    const href = `${external.docPath}#${external.elementId}`;
    return {
      href,
      title: external.title,
      hProperties: {
        "data-ref": href,
        "data-ref-type": external.type,
        "data-ref-title": external.title,
        "data-ref-doc": external.docPath,
        "data-ref-target": external.elementId,
      },
    };
  };

  return (tree: Root) => {
    // [文章](@label-id) 形式の link ノードを処理
    visit(tree, "link", (node: Link) => {
      const url = node.url;

      // @label-id 形式のURLをチェック
      if (url.startsWith("@")) {
        const token = url.substring(1);
        const resolved = resolveToken(token);

        if (resolved) {
          node.url = resolved.href;
          node.data = {
            hProperties: resolved.hProperties,
          };
        } else {
          // ラベルが見つからない場合はそのまま残す
        }
      }
    });

    // @label-id 単独形式を paragraph 内で検出
    visit(tree, "paragraph", (paragraph: Paragraph) => {
      const newChildren: PhrasingContent[] = [];
      let modified = false;

      for (const child of paragraph.children) {
        if (child.type !== "text") {
          newChildren.push(child);
          continue;
        }

        const text = (child as Text).value;
        const references: Array<{
          match: string;
          labelId: string;
          start: number;
          end: number;
        }> = [];

        // @label-id パターンを検出（単語境界を考慮）
        const regex = /@([a-z][a-z0-9-:\/]*)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
          references.push({
            match: match[0],
            labelId: match[1],
            start: match.index,
            end: match.index + match[0].length,
          });
        }

        if (references.length === 0) {
          newChildren.push(child);
          continue;
        }

        // 参照が見つかった場合、テキストを分割してリンクに置き換え
        modified = true;
        let lastEnd = 0;

        for (const ref of references) {
          const resolved = resolveToken(ref.labelId);

          // 参照前のテキスト
          if (ref.start > lastEnd) {
            newChildren.push({
              type: "text",
              value: text.slice(lastEnd, ref.start),
            });
          }

          if (resolved) {
            newChildren.push({
              type: "link",
              url: resolved.href,
              children: [{ type: "text", value: resolved.title }],
              data: {
                hProperties: resolved.hProperties,
              },
            } as Link);
          } else {
            // ラベルが見つからない場合、元のテキストのまま（警告は出さない）
            newChildren.push({
              type: "text",
              value: ref.match,
            });
          }

          lastEnd = ref.end;
        }

        // 残りのテキスト
        if (lastEnd < text.length) {
          newChildren.push({
            type: "text",
            value: text.slice(lastEnd),
          });
        }
      }

      if (modified) {
        paragraph.children = newChildren;
      }

      return SKIP;
    });

    return tree;
  };
};
