import { site } from "@/lib/site";

const socials = [
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Email", href: `mailto:${site.email}` },
  { label: "RSS", href: site.rss },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .join("");
}

export default function About() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
      <section aria-label="Profile" className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div
          aria-label="Portrait placeholder — add public/portrait.jpg"
          className="flex h-40 w-40 shrink-0 items-center justify-center rounded-md border border-rule bg-wash font-serif text-4xl text-muted"
        >
          {initials(site.name)}
        </div>
        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">{site.name}</h1>
          <p className="mt-2 text-[15px] text-muted">{site.role}</p>
          <p className="mt-4 text-[17px] leading-7">{site.bio}</p>
        </div>
      </section>

      <section aria-label="Facts" className="mt-14">
        <h2 className="border-b border-rule pb-3 font-serif text-2xl font-semibold tracking-tight">
          Facts
        </h2>
        <dl className="mt-6 space-y-4 text-[15px] leading-7">
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="shrink-0 font-mono text-[13px] text-muted sm:w-28">Based in</dt>
            <dd>[Where you are based]</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="shrink-0 font-mono text-[13px] text-muted sm:w-28">Currently</dt>
            <dd>[What you are working on right now]</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="shrink-0 font-mono text-[13px] text-muted sm:w-28">Previously</dt>
            <dd>[One line of background]</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            <dt className="shrink-0 font-mono text-[13px] text-muted sm:w-28">Interests</dt>
            <dd>[Three things you write about]</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Elsewhere" className="mt-14">
        <h2 className="border-b border-rule pb-3 font-serif text-2xl font-semibold tracking-tight">
          Elsewhere
        </h2>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
          {socials.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="text-accent underline underline-offset-4">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
