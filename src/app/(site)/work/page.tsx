import { getLatestProjects } from "@/lib/blog";
import { ProjectRow } from "@/components/project-row";

export default async function WorkIndex() {
  const projects = await getLatestProjects(100);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Work</h1>
      {projects.length === 0 ? (
        <p className="py-6 text-[15px] text-muted">
          Nothing published yet — selected work will appear here.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-rule border-t border-rule">
          {projects.map((project) => (
            <li key={project.slug}>
              <ProjectRow project={project} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
