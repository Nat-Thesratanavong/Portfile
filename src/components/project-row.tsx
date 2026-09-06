import Link from "next/link";
import type { Project } from "@/lib/blog";

export function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      aria-label={project.name}
      className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
    >
      <span className="shrink-0 font-mono text-[13px] text-muted sm:w-20">{project.year}</span>
      <span className="flex-1">
        <span className="block font-serif text-xl leading-snug decoration-accent decoration-2 underline-offset-4 group-hover:underline">
          {project.name}
        </span>
        <span className="mt-1 block text-[15px] leading-6 text-muted">{project.outcome}</span>
      </span>
      <span className="shrink-0 font-mono text-[13px] text-muted">
        {project.stack.join(" · ")}
      </span>
    </Link>
  );
}
