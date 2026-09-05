import Link from "next/link";
import { site } from "@/lib/site";
import { posts, projects } from "@/lib/content";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
      {/* Masthead */}
      <section aria-label="Introduction" className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-[40px]">
            {site.name}
          </h1>
          <p className="mt-4 text-[17px] leading-7">{site.stance}</p>
          <p className="mt-4 text-[15px] leading-7 text-muted">
            {site.role} — currently building this site in the open. Read the{" "}
            <Link href="/posts" className="text-accent underline underline-offset-4">
              latest writing
            </Link>{" "}
            or browse{" "}
            <Link href="/work" className="text-accent underline underline-offset-4">
              selected work
            </Link>
            .
          </p>
        </div>
        {/* TODO: replace with <Image src="/portrait.jpg" alt="Portrait" width={160} height={160} /> */}
        <div
          aria-label="Portrait placeholder — add public/portrait.jpg"
          className="flex h-40 w-40 shrink-0 items-center justify-center rounded-md border border-rule bg-wash font-serif text-4xl text-muted"
        >
          JD
        </div>
      </section>

      {/* Latest writing */}
      <section aria-label="Latest writing" className="mt-14">
        <div className="flex items-baseline justify-between border-b border-rule pb-3">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Latest writing</h2>
          <Link href="/posts" className="text-sm text-muted transition-colors hover:text-accent">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-rule">
          {posts.map((post) => (
            <li key={post.slug}>
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
            </li>
          ))}
        </ul>
      </section>

      {/* Selected work */}
      <section aria-label="Selected work" className="mt-14">
        <div className="flex items-baseline justify-between border-b border-rule pb-3">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Selected work</h2>
          <Link href="/work" className="text-sm text-muted transition-colors hover:text-accent">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-rule">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                aria-label={project.name}
                className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="shrink-0 font-mono text-[13px] text-muted sm:w-20">
                  {project.year}
                </span>
                <span className="flex-1">
                  <span className="block font-serif text-xl leading-snug decoration-accent decoration-2 underline-offset-4 group-hover:underline">
                    {project.name}
                  </span>
                  <span className="mt-1 block text-[15px] leading-6 text-muted">
                    {project.outcome}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[13px] text-muted">
                  {project.stack.join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
