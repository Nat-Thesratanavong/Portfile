import { describe, expect, it } from "vitest";
import { Tags } from "@/collections/Tags";

type Data = Record<string, unknown>;

async function runBeforeValidate(data: Data, operation: "create" | "update"): Promise<Data> {
  const hooks = Tags.hooks?.beforeValidate ?? [];
  let current: Data | undefined = { ...data };
  for (const hook of hooks) {
    const next = await hook({ data: current, operation } as Parameters<typeof hook>[0]);
    if (next) {
      current = next as Data;
    }
  }
  return current ?? {};
}

describe("Tags slug hook", () => {
  it("fills an empty slug from the label on create", async () => {
    const result = await runBeforeValidate({ label: "Next.js", slug: "" }, "create");
    expect(result.slug).toBe("next-js");
  });

  it("fills an empty slug from the label on update", async () => {
    const result = await runBeforeValidate({ label: "Next.js", slug: "" }, "update");
    expect(result.slug).toBe("next-js");
  });

  it("keeps an explicitly set slug", async () => {
    const result = await runBeforeValidate({ label: "Next.js", slug: "custom" }, "create");
    expect(result.slug).toBe("custom");
  });

  it("normalizes an explicitly set slug", async () => {
    const result = await runBeforeValidate({ label: "Next.js", slug: "My Slug" }, "create");
    expect(result.slug).toBe("my-slug");
  });

  it("leaves data without a label untouched", async () => {
    const result = await runBeforeValidate({ label: "", slug: "" }, "create");
    expect(result.slug).toBe("");
  });
});
