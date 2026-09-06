import { describe, expect, it } from "vitest";
import { Posts } from "@/collections/Posts";

type Data = Record<string, unknown>;

async function runBeforeValidate(data: Data, operation: "create" | "update"): Promise<Data> {
  const hooks = Posts.hooks?.beforeValidate ?? [];
  let current: Data | undefined = { ...data };
  for (const hook of hooks) {
    const next = await hook({ data: current, operation } as Parameters<typeof hook>[0]);
    if (next) {
      current = next as Data;
    }
  }
  return current ?? {};
}

describe("Posts slug hook", () => {
  it("fills an empty slug from the title on create", async () => {
    const result = await runBeforeValidate({ title: "Hello World", slug: "" }, "create");
    expect(result.slug).toBe("hello-world");
  });

  it("fills an empty slug from the title on update", async () => {
    const result = await runBeforeValidate({ title: "Hello World", slug: "" }, "update");
    expect(result.slug).toBe("hello-world");
  });

  it("keeps an explicitly set slug", async () => {
    const result = await runBeforeValidate({ title: "Hello World", slug: "custom" }, "create");
    expect(result.slug).toBe("custom");
  });

  it("leaves data without a title untouched", async () => {
    const result = await runBeforeValidate({ title: "", slug: "" }, "create");
    expect(result.slug).toBe("");
  });
});
