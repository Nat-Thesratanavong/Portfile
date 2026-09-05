import type { Metadata } from "next";
import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { site } from "@/lib/site";
import { getPostBySlug, getPublishedSlugs } from "@/lib/blog";

type RichTextData = ComponentProps<typeof RichText>["data"];

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: `Not found — ${site.name}` };
  }
  return {
    title: `${post.title} — ${site.name}`,
    description: `${post.title} (${post.tag}, ${post.readingTime} read)`,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
      <article className="max-w-[68ch]">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight">
          {post.title}
        </h1>
        <p className="mt-3 font-mono text-[13px] text-muted">
          {post.date} · {post.readingTime} · {post.tag}
        </p>
        <div className="mt-6 border-t border-rule" />
        {post.cover ? (
          <figure className="mt-8">
            <Image
              src={post.cover.url}
              alt={post.cover.alt}
              width={post.cover.width}
              height={post.cover.height}
              sizes="(max-width: 768px) 100vw, 768px"
              className="rounded-md"
            />
          </figure>
        ) : null}
        {post.body ? (
          <div className="rich-text mt-8">
            <RichText data={post.body as RichTextData} />
          </div>
        ) : null}
        <div className="mt-12 border-t border-rule pt-6 text-[15px] text-muted">
          <p>
            Reply via{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-accent underline underline-offset-4"
            >
              email
            </a>{" "}
            — I read everything.
          </p>
          <p className="mt-2">
            <Link href="/posts" className="text-accent underline underline-offset-4">
              ← All posts
            </Link>
          </p>
        </div>
      </article>
    </main>
  );
}
