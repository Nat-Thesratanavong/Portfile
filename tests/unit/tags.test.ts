import { describe, expect, it, vi } from "vitest";
import { displayTags, resolveTagLabels } from "@/lib/tags";

describe("resolveTagLabels", () => {
  it("reads labels from populated tag docs without fetching", async () => {
    const fetch = vi.fn();
    await expect(
      resolveTagLabels(
        [
          { label: "Next.js", slug: "next-js" },
          { label: "React", slug: "react" },
        ],
        fetch,
      ),
    ).resolves.toEqual(["Next.js", "React"]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("falls back to slug and trims whitespace", async () => {
    const fetch = vi.fn();
    await expect(
      resolveTagLabels([{ slug: "next-js" }, { label: "  React  " }], fetch),
    ).resolves.toEqual(["next-js", "React"]);
  });

  it("resolves bare ids through fetchTagById", async () => {
    const fetch = vi.fn().mockResolvedValue({ label: "React" });
    await expect(resolveTagLabels([{ label: "Next.js" }, 7], fetch)).resolves.toEqual([
      "Next.js",
      "React",
    ]);
    expect(fetch).toHaveBeenCalledWith(7);
  });

  it("skips deleted tags and keeps the remaining ones", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("not found"));
    await expect(resolveTagLabels([{ label: "Next.js" }, 7], fetch)).resolves.toEqual([
      "Next.js",
    ]);
  });

  it("ignores entries it cannot resolve", async () => {
    const fetch = vi.fn();
    await expect(resolveTagLabels([null, "   ", { nothing: "here" }], fetch)).resolves.toEqual(
      [],
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns empty for non-array input", async () => {
    const fetch = vi.fn();
    await expect(resolveTagLabels(undefined, fetch)).resolves.toEqual([]);
  });
});

describe("displayTags", () => {
  it("joins tags with the default separator", () => {
    expect(displayTags(["Next.js", "React"])).toBe("Next.js · React");
  });

  it("supports a custom separator", () => {
    expect(displayTags(["Next.js", "React"], ", ")).toBe("Next.js, React");
  });

  it("labels empty tag lists as Untagged", () => {
    expect(displayTags([])).toBe("Untagged");
  });
});
