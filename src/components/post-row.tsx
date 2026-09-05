import Link from "next/link";
import type { Post } from "@/lib/blog";

export function PostRow({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      aria-label={post.title}
      className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
    >
      <span className="shrink-0 font-mono text-[13px] text-muted sm:w-20">
        {post.date}
      </span>
      <span className="flex-1 font-serif text-xl leading-snug decoration-accent decoration-2 underline-offset-4 group-hover:underline">
        {post.title}
      </span>
      <span className="shrink-0 font-mono text-[13px] text-muted">
        {post.tag} · {post.readingTime}
      </span>
    </Link>
  );
}
