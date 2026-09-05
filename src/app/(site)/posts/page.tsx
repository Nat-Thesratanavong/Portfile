import { getLatestPosts } from "@/lib/blog";
import { PostRow } from "@/components/post-row";

export default async function PostsIndex() {
  const posts = await getLatestPosts(100);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Posts</h1>
      {posts.length === 0 ? (
        <p className="py-6 text-[15px] text-muted">Nothing published yet — the first post is on its way.</p>
      ) : (
        <ul className="mt-6 divide-y divide-rule border-t border-rule">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostRow post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
