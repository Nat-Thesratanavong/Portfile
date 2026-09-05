// Sample content for the design preview. Local data until the
// Payload CMS migration; then this is replaced by CMS queries.
export type Post = {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  tag: string;
};

export type Project = {
  slug: string;
  name: string;
  outcome: string;
  stack: string[];
  year: string;
};

export const posts: Post[] = [
  {
    slug: "nextjs-on-a-single-vps",
    title: "Running Next.js on a single VPS",
    date: "Sep 2026",
    readingTime: "6 min",
    tag: "self-hosting",
  },
  {
    slug: "strict-typescript-defaults",
    title: "Strict TypeScript defaults I actually keep",
    date: "Aug 2026",
    readingTime: "4 min",
    tag: "typescript",
  },
  {
    slug: "blog-seo-without-plugins",
    title: "Blog SEO without plugins",
    date: "Aug 2026",
    readingTime: "8 min",
    tag: "web",
  },
];

export const projects: Project[] = [
  {
    slug: "blog-post",
    name: "blog-post",
    outcome: "Personal blog and portfolio, self-hosted on one VPS.",
    stack: ["Next.js", "Tailwind", "Postgres"],
    year: "2026",
  },
  {
    slug: "uptime-monitor",
    name: "uptime-monitor",
    outcome: "Ping monitor that pages me before users notice.",
    stack: ["Go", "SQLite"],
    year: "2025",
  },
  {
    slug: "dotfiles",
    name: "dotfiles",
    outcome: "One-command dev environment for fresh machines.",
    stack: ["Bash", "Neovim"],
    year: "2024",
  },
];
