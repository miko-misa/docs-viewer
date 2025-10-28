import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";

export class DocNotFoundError extends Error {
  constructor(public readonly slug: string[]) {
    super(`Document not found for slug: ${slug.join("/") || "(root)"}`);
    this.name = "DocNotFoundError";
  }
}

export type DocMetadata = {
  title?: string;
  tags?: string[];
};

export type GroupConfig = {
  title?: string;
  tags?: string[];
};

export type DocRecord = {
  slug: string[];
  content: string;
  filePath: string;
  title: string;
  tags?: string[];
  metadata: DocMetadata;
  groupConfig?: GroupConfig;
  lastModified: Date;
};

const DOCS_ROOT = path.join(process.cwd(), "docs");

const ROOT_FALLBACK_CANDIDATES = ["index.md", "README.md"];

function normalizeSlug(raw: string[] | string | undefined): string[] {
  if (!raw) {
    return [];
  }

  const parts = Array.isArray(raw) ? raw : [raw];

  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
}

function assertInsideDocsRoot(candidatePath: string) {
  const resolved = path.resolve(candidatePath);
  const root = path.resolve(DOCS_ROOT);

  if (resolved === root) {
    return resolved;
  }

  if (!resolved.startsWith(root + path.sep)) {
    throw new Error(`Invalid path traversal attempt for ${candidatePath}`);
  }

  return resolved;
}

function slugToCandidates(slug: string[]): string[] {
  if (slug.length === 0) {
    return ROOT_FALLBACK_CANDIDATES.map((candidate) => path.join(DOCS_ROOT, candidate));
  }

  const basePath = path.join(DOCS_ROOT, ...slug);
  return [path.join(basePath, "index.md"), `${basePath}.md`];
}

function extractTitle(markdown: string): string | null {
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    // match first heading H1..H6
    const headingMatch = /^#{1,6}\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      return headingMatch[1].trim();
    }
  }
  return null;
}

function titleFromSlug(slug: string[]): string {
  if (slug.length === 0) {
    return "Home";
  }

  const last = slug[slug.length - 1];
  return last.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function loadGroupConfig(filePath: string): Promise<GroupConfig | undefined> {
  // ファイルの親ディレクトリ（同じ階層）のみを確認
  const fileDir = path.dirname(filePath);
  const configPath = path.join(fileDir, "config.yaml");

  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    const config = yaml.load(configContent) as GroupConfig;
    return config;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

export async function getDocBySlug(rawSlug: string[] | string | undefined): Promise<DocRecord> {
  const slug = normalizeSlug(rawSlug);
  const candidates = slugToCandidates(slug).map(assertInsideDocsRoot);

  for (const filePath of candidates) {
    try {
      const rawContent = await fs.readFile(filePath, "utf-8");
      const stat = await fs.stat(filePath);

      // フロントマターを解析
      const { data: metadata, content } = matter(rawContent);

      // グループ設定を読み込む（ファイルパスを使用）
      const groupConfig = await loadGroupConfig(filePath);

      // タイトルとタグの決定
      let title: string;
      let tags: string[] | undefined;

      if (groupConfig) {
        // グループ内の場合: mdのtitleはサブタイトルとして使用
        title = (metadata.title as string) ?? extractTitle(content) ?? titleFromSlug(slug);
        tags = groupConfig.tags; // グループのタグを使用
      } else {
        // 単体mdの場合: mdのtitleとtagsを使用
        title = (metadata.title as string) ?? extractTitle(content) ?? titleFromSlug(slug);
        tags = metadata.tags as string[] | undefined;
      }

      return {
        slug,
        content,
        filePath,
        title,
        tags,
        metadata,
        groupConfig,
        lastModified: stat.mtime,
      };
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err?.code === "ENOENT") {
        continue;
      }
      throw error;
    }
  }

  throw new DocNotFoundError(slug);
}
