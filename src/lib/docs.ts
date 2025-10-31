import { promises as fs } from "node:fs";
import type { Stats } from "node:fs";
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
  description?: string;
  tags?: string[];
  order?: string[];
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

export function normalizeOrderEntry(entry: string): string[] {
  const cleaned = entry.trim().replace(/\.md$/i, "").replace(/^\.\//, "");
  if (cleaned.length === 0) return [];
  return cleaned
    .split(/[\\/]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

async function readGroupConfig(dirPath: string): Promise<GroupConfig | undefined> {
  const configPath = path.join(dirPath, "config.yaml");

  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    const raw = yaml.load(configContent);
    if (!raw || typeof raw !== "object") {
      return undefined;
    }

    const source = raw as Record<string, unknown>;
    const config: GroupConfig = {};

    if (typeof source.title === "string") {
      config.title = source.title.trim();
    }

    if (typeof source.description === "string") {
      const desc = source.description.trim();
      if (desc.length > 0) {
        config.description = desc;
      }
    }

    if (Array.isArray(source.tags)) {
      config.tags = source.tags
        .map((tag) => (typeof tag === "string" ? tag : String(tag)))
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    if (Array.isArray(source.order)) {
      const normalizedOrder = source.order
        .map((entry) => (typeof entry === "string" ? entry : String(entry)))
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
      if (normalizedOrder.length > 0) {
        config.order = normalizedOrder;
      }
    }

    return Object.keys(config).length > 0 ? config : undefined;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function loadGroupConfigForFile(filePath: string): Promise<GroupConfig | undefined> {
  return readGroupConfig(path.dirname(filePath));
}

async function loadGroupConfigForDirectory(dirPath: string): Promise<GroupConfig | undefined> {
  return readGroupConfig(dirPath);
}

async function readDocFile(slug: string[]): Promise<{
  filePath: string;
  rawContent: string;
  stat: Stats;
}> {
  const candidates = slugToCandidates(slug).map(assertInsideDocsRoot);

  for (const filePath of candidates) {
    try {
      const rawContent = await fs.readFile(filePath, "utf-8");
      const stat = await fs.stat(filePath);
      return { filePath, rawContent, stat };
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

export async function getDocBySlug(rawSlug: string[] | string | undefined): Promise<DocRecord> {
  const slug = normalizeSlug(rawSlug);
  const { filePath, rawContent, stat } = await readDocFile(slug);

  // フロントマターを解析
  const { data: metadata, content } = matter(rawContent);

  // グループ設定を読み込む（ファイルパスを使用）
  const groupConfig = await loadGroupConfigForFile(filePath);

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
    const metadataTags = metadata.tags;
    if (Array.isArray(metadataTags)) {
      tags = metadataTags
        .map((tag) => (typeof tag === "string" ? tag : String(tag)))
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    } else if (typeof metadataTags === "string") {
      tags = [metadataTags.trim()].filter((tag) => tag.length > 0);
    }
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
}

export async function getDocTitleBySlug(rawSlug: string[] | string | undefined): Promise<string> {
  const slug = normalizeSlug(rawSlug);
  const { rawContent } = await readDocFile(slug);
  const { data: metadata, content } = matter(rawContent);

  return (metadata.title as string) ?? extractTitle(content) ?? titleFromSlug(slug);
}

export type DocPreview = {
  slug: string[];
  title: string;
  lastModified: Date;
  metadata: DocMetadata;
};

export async function getDocPreview(rawSlug: string[] | string | undefined): Promise<DocPreview> {
  const slug = normalizeSlug(rawSlug);
  const { rawContent, stat } = await readDocFile(slug);
  const { data: metadata, content } = matter(rawContent);
  const title = (metadata.title as string) ?? extractTitle(content) ?? titleFromSlug(slug);

  return {
    slug,
    title,
    lastModified: stat.mtime,
    metadata: metadata as DocMetadata,
  };
}

export type GroupListingItem = {
  slug: string[];
  title: string;
  lastModified: Date;
};

export type GroupListing = {
  slug: string[];
  title: string;
  description?: string;
  tags?: string[];
  items: GroupListingItem[];
  lastUpdated?: Date;
};

export async function getGroupListing(
  rawSlug: string[] | string | undefined,
): Promise<GroupListing> {
  const slug = normalizeSlug(rawSlug);
  const dirPath = path.join(DOCS_ROOT, ...slug);

  let dirStat;
  try {
    dirStat = await fs.stat(dirPath);
  } catch {
    throw new DocNotFoundError(slug);
  }

  if (!dirStat.isDirectory()) {
    throw new DocNotFoundError(slug);
  }

  const groupConfig = (await loadGroupConfigForDirectory(dirPath)) ?? {};
  const title = groupConfig.title ?? titleFromSlug(slug);

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const markdownEntries = entries.filter(
    (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"),
  );

  const relativeToAbsolute = new Map<string, string[]>();
  for (const entry of markdownEntries) {
    const baseName = entry.name.replace(/\.md$/i, "");
    const docSlug = [...slug, baseName];
    const relativeKey = docSlug.slice(slug.length).join("/");
    relativeToAbsolute.set(relativeKey, docSlug);
  }

  const orderedSlugs: string[][] = [];
  const seen = new Set<string>();

  if (groupConfig.order) {
    for (const rawEntry of groupConfig.order) {
      const parts = normalizeOrderEntry(rawEntry);
      if (parts.length === 0) continue;
      const key = parts.join("/");
      const absoluteSlug = relativeToAbsolute.get(key);
      if (!absoluteSlug) continue;
      orderedSlugs.push(absoluteSlug);
      seen.add(key);
    }
  }

  const remainingEntries = Array.from(relativeToAbsolute.entries())
    .filter(([key]) => !seen.has(key))
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey, "ja"));

  for (const [, absoluteSlug] of remainingEntries) {
    orderedSlugs.push(absoluteSlug);
  }

  const items: GroupListingItem[] = [];
  let lastUpdated: Date | undefined;

  for (const docSlug of orderedSlugs) {
    try {
      const preview = await getDocPreview(docSlug);
      items.push({
        slug: preview.slug,
        title: preview.title,
        lastModified: preview.lastModified,
      });
      if (!lastUpdated || preview.lastModified > lastUpdated) {
        lastUpdated = preview.lastModified;
      }
    } catch (error) {
      if (error instanceof DocNotFoundError) {
        continue;
      }
      throw error;
    }
  }

  return {
    slug,
    title,
    description: groupConfig.description,
    tags: groupConfig.tags,
    items,
    lastUpdated,
  };
}
