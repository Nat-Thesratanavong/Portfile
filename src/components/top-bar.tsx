import Link from "next/link";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/posts", label: "Posts" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/play", label: "Play" },
];

export function TopBar() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
          {site.name}
        </Link>
        <nav aria-label="Primary" className="flex w-full items-center justify-between gap-4 sm:w-auto sm:gap-5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] text-muted transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
