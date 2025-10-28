import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocLayout } from "@/components/doc-layout";
import { DocNotFoundError, type DocRecord, getDocBySlug } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

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
      return {
        title: "Not Found | Docs Viewer",
      };
    }
    throw error;
  }
}

export default async function DocPage(props: PageProps) {
  const params = await props.params;
  let doc: DocRecord;
  try {
    doc = await getDocBySlug(params.slug);
  } catch (error) {
    if (error instanceof DocNotFoundError) {
      notFound();
    }
    throw error;
  }

  const rendered = await renderMarkdown(doc.content);

  return (
    <DocLayout title={doc.title} updatedAt={doc.lastModified}>
      {rendered}
    </DocLayout>
  );
}
