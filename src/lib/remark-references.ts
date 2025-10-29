/**
 * remark plugin: 参照の解決
 * 
 * [文章](@label-id) および @label-id 形式の参照を検出し、リンクに変換します。
 */

import type { Root, Link, Paragraph, PhrasingContent, Text } from 'mdast';
import type { Plugin } from 'unified';
import { visit, SKIP } from 'unist-util-visit';
import { LabelIndex } from './refs';

interface PluginOptions {
  labelIndex: LabelIndex;
}

/**
 * remarkResolveReferences - 参照解決プラグイン
 */
export const remarkResolveReferences: Plugin<[PluginOptions], Root> = (options) => {
  const { labelIndex } = options;

  return (tree: Root) => {
    // [文章](@label-id) 形式の link ノードを処理
    visit(tree, 'link', (node: Link) => {
      const url = node.url;
      
      // @label-id 形式のURLをチェック
      if (url.startsWith('@')) {
        const labelId = url.substring(1);
        const normalizedId = LabelIndex.normalizeId(labelId);
        const labelInfo = labelIndex.get(normalizedId);

        if (labelInfo) {
          // ラベルが見つかった場合、URLとdata属性を更新
          node.url = `#${labelInfo.elementId}`;
          node.data = {
            hProperties: {
              'data-ref': normalizedId,
              'data-ref-type': labelInfo.type,
              'data-ref-title': labelInfo.title,
            },
          };
        } else {
          // ラベルが見つからない場合、警告を出力
          console.warn(`Reference not found: ${labelId}`);
        }
      }
    });

    // @label-id 単独形式を paragraph 内で検出
    visit(tree, 'paragraph', (paragraph: Paragraph) => {
      const newChildren: PhrasingContent[] = [];
      let modified = false;

      for (const child of paragraph.children) {
        if (child.type !== 'text') {
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
        const regex = /@([a-z][a-z0-9-:]*)/g;
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
          const normalizedId = LabelIndex.normalizeId(ref.labelId);
          const labelInfo = labelIndex.get(normalizedId);

          // 参照前のテキスト
          if (ref.start > lastEnd) {
            newChildren.push({
              type: 'text',
              value: text.slice(lastEnd, ref.start),
            });
          }

          if (labelInfo) {
            // ラベルが見つかった場合、リンクに変換（タイトルをリンクテキストに使用）
            newChildren.push({
              type: 'link',
              url: `#${labelInfo.elementId}`,
              children: [{ type: 'text', value: labelInfo.title }],
              data: {
                hProperties: {
                  'data-ref': normalizedId,
                  'data-ref-type': labelInfo.type,
                  'data-ref-title': labelInfo.title,
                },
              },
            } as Link);
          } else {
            // ラベルが見つからない場合、元のテキストのまま
            newChildren.push({
              type: 'text',
              value: ref.match,
            });
            console.warn(`Reference not found: ${ref.labelId}`);
          }

          lastEnd = ref.end;
        }

        // 残りのテキスト
        if (lastEnd < text.length) {
          newChildren.push({
            type: 'text',
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
