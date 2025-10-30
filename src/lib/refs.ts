/**
 * ラベル・参照システム
 * 
 * ラベルの収集と参照の解決を行います。
 */

/**
 * ラベル情報
 */
export interface LabelInfo {
  /** ラベルID（例: sec-intro, thm-pythagorean） */
  id: string;
  /** 種類（heading, column, annotation など） */
  type: "heading" | "column" | "annotation";
  /** タイトル */
  title: string;
  /** 要素のDOM ID */
  elementId: string;
  /** 簡易サマリ（注釈などで利用） */
  summary?: string;
}

/**
 * ラベルインデックス
 */
export class LabelIndex {
  private labels = new Map<string, LabelInfo>();

  /**
   * ラベルを追加
   */
  add(labelInfo: LabelInfo): void {
    this.labels.set(labelInfo.id, labelInfo);
  }

  /**
   * ラベルを取得
   */
  get(labelId: string): LabelInfo | undefined {
    return this.labels.get(labelId);
  }

  /**
   * すべてのラベルを取得
   */
  getAll(): Map<string, LabelInfo> {
    return this.labels;
  }

  /**
   * ラベルIDを正規化（要素IDに変換）
   * 例: "sec:intro" → "sec-intro"
   */
  static normalizeId(labelId: string): string {
    return labelId.replace(/:/g, "-");
  }
}
