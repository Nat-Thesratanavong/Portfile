import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{site.bio}</p>
        <p className="flex gap-4">
          <a href={site.rss} className="transition-colors hover:text-accent">
            RSS
          </a>
          <a href={site.github} className="transition-colors hover:text-accent">
            GitHub
          </a>
          <a href={`mailto:${site.email}`} className="transition-colors hover:text-accent">
            Email
          </a>
          <a href={site.linkedin} className="transition-colors hover:text-accent">
            LinkedIn
          </a>
        </p>
      </div>
    </footer>
  );
}
