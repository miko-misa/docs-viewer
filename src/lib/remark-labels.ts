/**
 * remark plugin: ラベルの収集と番号付け
 * 
 * - 見出しから {#label-id} を抽出
 * - columnディレクティブから {#label-id} を抽出
 * - ラベルインデックスを構築
 */

import type { Root, Heading, Text } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { LabelIndex } from './refs';

interface DirectiveNode {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  attributes?: Record<string, string>;
  children?: any[];
  data?: {
    hName?: string;
    hProperties?: Record<string, any>;
    directiveTitle?: string; // remarkTransformDirectivesで設定されるタイトル
  };
}

interface PluginOptions {
  labelIndex: LabelIndex;
}

/**
 * remarkCollectLabels - ラベル収集プラグイン
 */
export const remarkCollectLabels: Plugin<[PluginOptions], Root> = (options) => {
  const { labelIndex } = options;

  return (tree: Root) => {
    // 見出しからラベルを収集
    visit(tree, 'heading', (node: Heading) => {
      const labelId = extractLabelFromHeading(node);
      if (labelId) {
        const normalizedId = LabelIndex.normalizeId(labelId);
        // ラベル除去後のテキストを取得
        const title = extractHeadingText(node);
        
        labelIndex.add({
          id: normalizedId,
          type: 'heading',
          elementId: normalizedId,
          title,
        });

        // ノードにIDを付与
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties.id = normalizedId;
      }
    });

    // columnディレクティブからラベルを収集
    visit(tree, (node: any) => {
      if (
        (node.type === 'containerDirective' || node.type === 'leafDirective') &&
        (node.name === 'column' || node.name === 'column-toc')
      ) {
        const directive = node as DirectiveNode;
        const { label: labelId, title: extractedTitle } = extractLabelFromDirective(directive);
        
        // remarkTransformDirectivesで保存されたタイトルを優先的に使用
        const title = (directive.data?.directiveTitle as string) || extractedTitle;
        
        if (labelId) {
          const normalizedId = LabelIndex.normalizeId(labelId);

          labelIndex.add({
            id: normalizedId,
            type: 'column',
            elementId: normalizedId,
            title,
          });

          // ノードにIDを付与
          directive.data = directive.data || {};
          directive.data.hProperties = directive.data.hProperties || {};
          directive.data.hProperties.id = normalizedId;
        }
      }
    });
  };
};

/**
 * 見出しから (label)= 形式のラベルを抽出
 */
function extractLabelFromHeading(node: Heading): string | null {
  if (!node.children || node.children.length === 0) return null;
  
  const firstChild = node.children[0];
  
  // 見出しの最初に (label)= があるかチェック
  if (firstChild && firstChild.type === 'text') {
    const text = (firstChild as Text).value;
    const match = text.match(/^\(([a-z][a-z0-9-:]*)\)=\s*/);
    
    if (match) {
      // ラベル部分を削除（新しいオブジェクトを作成）
      const newValue = text.replace(/^\([a-z][a-z0-9-:]*\)=\s*/, '');
      
      // 元のオブジェクトを変更するのではなく、新しい配列を作成
      const newChildren = [...node.children];
      if (newValue) {
        newChildren[0] = {
          ...firstChild,
          value: newValue,
        } as Text;
      } else {
        // ラベルのみの場合は削除
        newChildren.shift();
      }
      node.children = newChildren as any;
      
      return match[1];
    }
  }
  
  return null;
}

/**
 * 見出しからテキストを抽出
 */
function extractHeadingText(node: Heading): string {
  return node.children
    .map((child: any) => {
      if (child.type === 'text') return child.value;
      if (child.type === 'inlineCode') return child.value;
      return '';
    })
    .join('')
    .trim();
}

/**
 * columnディレクティブから (label)= を抽出し、タイトルも取得
 */
function extractLabelFromDirective(node: DirectiveNode): { label: string | null; title: string } {
  let label: string | null = null;
  let title = '';

  // attributes から直接取得を試みる
  if (node.attributes?.label) {
    label = node.attributes.label as string;
  }

  // 子要素のテキストから (label)= と @title: を探す
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      if (child.type === 'paragraph' && child.children) {
        // テキストを再構成
        let text = '';
        for (const textNode of child.children) {
          if (textNode.type === 'text') {
            text += textNode.value;
          }
        }
        
        const lines = text.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          
          // ラベルをチェック
          if (!label) {
            const labelMatch = trimmed.match(/^\(([a-z][a-z0-9-:]*)\)=\s*$/);
            if (labelMatch) {
              label = labelMatch[1];
            }
          }
          
          // タイトルをチェック
          if (trimmed.startsWith('@title:')) {
            title = trimmed.substring(7).trim();
          }
        }
      }
    }
    
    // ラベルが見つかった場合、コンテンツから削除
    if (label) {
      const firstChild = node.children[0];
      if (firstChild && firstChild.type === 'paragraph' && firstChild.children) {
        const firstText = firstChild.children[0];
        
        if (firstText && firstText.type === 'text') {
          const match = firstText.value.match(/^\(([a-z][a-z0-9-:]*)\)=\s*/);
          if (match) {
            // ラベル部分を削除（新しいオブジェクトを作成）
            const newValue = firstText.value.replace(/^\([a-z][a-z0-9-:]*\)=\s*/, '');
            
            // 新しい children 配列を作成
            const newParagraphChildren = [...firstChild.children];
            if (newValue) {
              newParagraphChildren[0] = {
                ...firstText,
                value: newValue,
              };
            } else {
              // ラベルのみの場合は削除
              newParagraphChildren.shift();
            }
            
            // paragraph の children を更新
            const newParagraph = {
              ...firstChild,
              children: newParagraphChildren,
            };
            
            // directive の children を更新
            const newDirectiveChildren = [...node.children];
            if (newParagraphChildren.length === 0) {
              // 段落が空になった場合は削除
              newDirectiveChildren.shift();
            } else {
              newDirectiveChildren[0] = newParagraph;
            }
            node.children = newDirectiveChildren as any;
          }
        }
      }
    }
  }

  return { label, title };
}
