---
title: "フロントマターとグループ設定のサンプル"
tags:
  - "ドキュメント"
  - "YAML"
  - "設定"
---

# フロントマターとグループ設定について

このページは、YAMLフロントマター記法とフォルダー単位のグループ設定に対応したマークダウンファイルの例です。

## フロントマター

ファイルの先頭に `---` で囲まれた YAML 形式のメタデータを記述できます。

### 単体のマークダウンファイルの場合

```yaml
---
title: "記事のタイトル"
tags:
  - "タグ1"
  - "タグ2"
---
```

- **title**: ページのタイトル
- **tags**: ページに関連するタグ（配列）

### グループ内のマークダウンファイルの場合

フォルダー内に `config.yaml` がある場合は、そのフォルダー内のすべてのマークダウンファイルは1つのグループとして扱われます。

```yaml
---
title: "サブタイトル"
---
```

- **title**: グループ内のページのサブタイトル（グループタイトルの下に表示）
- **tags**: グループのconfig.yamlで定義されたタグが使用されるため、個別ファイルには不要

## グループ設定（config.yaml）

フォルダー内に `config.yaml` を配置することで、そのフォルダー内のドキュメントグループの情報を設定できます。

### 設定例

```yaml
title: "グループ名"
tags:
  - "タグ1"
  - "タグ2"
  - "タグ3"
```

### title（グループタイトル）

- フォルダー内のドキュメントに共通のグループ名を表示します
- ページヘッダーの上部に表示されます
- 例: "チュートリアル", "API リファレンス", "数学ノート" など

### tags（タグ）

- グループに関連するタグを配列で指定します
- ページヘッダーに小さなバッジとして表示されます
- 例: `["nextjs", "react", "typescript"]`

## フォルダー構造の例

```
docs/
├── algebra/
│   ├── config.yaml          # グループ設定
│   ├── group-theory/
│   │   └── intro.md
│   └── linear-algebra.md
├── tutorials/
│   ├── config.yaml          # 別のグループ設定
│   ├── getting-started.md
│   └── advanced.md
└── index.md
```

### algebra/config.yaml の例

```yaml
title: "代数学ノート"
tags:
  - "数学"
  - "代数"
  - "群論"
```

### tutorials/config.yaml の例

```yaml
title: "チュートリアル"
tags:
  - "初心者向け"
  - "入門"
```

## 型定義

### DocMetadata（単体mdファイルのフロントマター）

```typescript
export type DocMetadata = {
  title?: string;
  tags?: string[];
};
```

### GroupConfig（フォルダーのconfig.yaml）

```typescript
export type GroupConfig = {
  title?: string;
  tags?: string[];
};
```

### DocRecord（ドキュメントレコード）

```typescript
export type DocRecord = {
  slug: string[];
  content: string;
  filePath: string;
  title: string;
  tags?: string[];        // 単体mdの場合はmd.tags、グループの場合はconfig.tags
  metadata: DocMetadata;
  groupConfig?: GroupConfig;
  lastModified: Date;
};
```

## まとめ

### 単体のマークダウンファイル
✅ フロントマターに`title`と`tags`を指定  
✅ シンプルな独立したページとして表示  
✅ タグはページに直接表示

### グループ内のマークダウンファイル
✅ `config.yaml`でグループ全体の`title`と`tags`を指定  
✅ 各mdファイルには`title`（サブタイトル）のみ指定  
✅ グループタイトルが上部に表示され、その下にサブタイトルが表示  
✅ タグはグループ全体のものが使用される

✅ 既存のマークダウンファイルとの後方互換性あり
