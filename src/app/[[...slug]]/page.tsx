import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocLayout } from "@/components/doc-layout";
import { GroupLayout } from "@/components/GroupLayout";
import {
  DocNotFoundError,
  type DocRecord,
  getDocBySlug,
  getDocTitleBySlug,
  getGroupListing,
  normalizeOrderEntry,
} from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { extractToc } from "@/lib/toc";

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

type DocNavigation = {
  previous?: {
    title: string;
    slug: string[];
  };
  next?: {
    title: string;
    slug: string[];
  };
};

const DOCS_ROOT = path.join(process.cwd(), "docs");

async function buildNavigation(doc: DocRecord): Promise<DocNavigation> {
  const order = doc.groupConfig?.order;
  if (!order || order.length === 0) {
    return {};
  }

  const docDirRelative = path.relative(DOCS_ROOT, path.dirname(doc.filePath));
  const baseSlug = docDirRelative ? docDirRelative.split(path.sep).filter(Boolean) : [];
  const relativeSlugParts = doc.slug.slice(baseSlug.length);
  const normalizedOrder = order.map(normalizeOrderEntry).filter((parts) => parts.length > 0);

  if (relativeSlugParts.length === 0) {
    return {};
  }

  const currentKey = relativeSlugParts.join("/");
  const currentIndex = normalizedOrder.findIndex((parts) => parts.join("/") === currentKey);

  if (currentIndex === -1) {
    return {};
  }

  const navigation: DocNavigation = {};

  const resolveNavItem = async (parts: string[]) => {
    const slug = [...baseSlug, ...parts];
    try {
      const title = await getDocTitleBySlug(slug);
      return { slug, title };
    } catch (error) {
      if (error instanceof DocNotFoundError) {
        return undefined;
      }
      throw error;
    }
  };

  if (currentIndex > 0) {
    const previous = await resolveNavItem(normalizedOrder[currentIndex - 1]);
    if (previous) {
      navigation.previous = previous;
    }
  }

  if (currentIndex < normalizedOrder.length - 1) {
    const next = await resolveNavItem(normalizedOrder[currentIndex + 1]);
    if (next) {
      navigation.next = next;
    }
  }

  return navigation;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  try {
    const doc = await getDocBySlug(params.slug);
    return {
      title: `${doc.title} | Docs Viewer`,
      description: `${doc.title} のドキュメント`,
    };
  } catch (error) {
    if (error instanceof DocNotFoundError) {
      try {
        const group = await getGroupListing(params.slug);
        return {
          title: `${group.title} | Docs Viewer`,
          description: group.description ?? `${group.title} のドキュメント一覧`,
        };
      } catch (innerError) {
        if (innerError instanceof DocNotFoundError) {
          return {
            title: "Not Found | Docs Viewer",
          };
        }
        throw innerError;
      }
    }
    throw error;
  }
}

export default async function DocPage(props: PageProps) {
  const params = await props.params;
  let doc: DocRecord | undefined;
  let groupListing: Awaited<ReturnType<typeof getGroupListing>> | undefined;
  try {
    doc = await getDocBySlug(params.slug);
  } catch (error) {
    if (error instanceof DocNotFoundError) {
      try {
        groupListing = await getGroupListing(params.slug);
      } catch (groupError) {
        if (groupError instanceof DocNotFoundError) {
          notFound();
        }
        throw groupError;
      }
    } else {
      throw error;
    }
  }

  if (groupListing) {
    return (
      <GroupLayout
        title={groupListing.title}
        description={groupListing.description}
        tags={groupListing.tags}
        items={groupListing.items}
        lastUpdated={groupListing.lastUpdated}
      />
    );
  }

  if (!doc) {
    notFound();
  }

  const docDirRelative = path.relative(DOCS_ROOT, path.dirname(doc.filePath));
  const groupSlug = doc.groupConfig ? docDirRelative.split(path.sep).filter(Boolean) : undefined;

  const rendered = await renderMarkdown(doc.content);
  const toc = extractToc(doc.content);
  const navigation = await buildNavigation(doc);

  return (
    <DocLayout
      title={doc.title}
      tags={doc.tags}
      groupConfig={doc.groupConfig}
      groupSlug={groupSlug}
      updatedAt={doc.lastModified}
      toc={toc}
      navigation={navigation}
    >
      {rendered}
    </DocLayout>
  );
}
