import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("trims input and strips edge hyphens", () => {
    expect(slugify("  --Hello, World!--  ")).toBe("hello-world");
  });

  it("collapses runs of separators into one hyphen", () => {
    expect(slugify("a  b__c")).toBe("a-b-c");
  });

  it("returns an empty string for blank input", () => {
    expect(slugify("   ")).toBe("");
  });
});
