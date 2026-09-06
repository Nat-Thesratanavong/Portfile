import type { Metadata } from "next";
import { PongGame } from "@/components/pong-game";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Play — ${site.name}`,
  description: "A friendly Atari-inspired Pong match.",
};

export default function PlayPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:py-16">
      <PongGame />
    </main>
  );
}
