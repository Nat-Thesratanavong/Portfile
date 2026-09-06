import { describe, expect, it, vi } from "vitest";
import { syncProjectTag, unlinkProjectTag } from "@/collections/Projects";

type Calls = { find: unknown[]; create: unknown[]; update: unknown[] };

function makePayload(findResults: unknown[] = []) {
  const calls: Calls = { find: [], create: [], update: [] };
  let findCount = 0;
  const payload = {
    find: vi.fn(async (query: unknown) => {
      calls.find.push(query);
      const next = findCount < findResults.length ? findResults[findCount] : { docs: [] };
      findCount += 1;
      return next;
    }),
    create: vi.fn(async (query: unknown) => {
      calls.create.push(query);
      return { id: 9 };
    }),
    update: vi.fn(async (query: unknown) => {
      calls.update.push(query);
      return {};
    }),
  };
  return { payload, calls };
}

const project = { id: 1, name: "Athemis", slug: "athemis" };

describe("syncProjectTag", () => {
  it("creates a project-mastered tag on project create", async () => {
    const { payload, calls } = makePayload();
    await syncProjectTag({ doc: project, operation: "create", req: { payload } });
    expect(calls.create).toEqual([
      {
        collection: "tags",
        data: { label: "Athemis", slug: "athemis", project: 1 },
      },
    ]);
  });

  it("does not duplicate an existing project tag", async () => {
    const { payload, calls } = makePayload([{ docs: [{ id: 9, project: 1 }] }]);
    await syncProjectTag({ doc: project, operation: "create", req: { payload } });
    expect(calls.create).toEqual([]);
  });

  it("suffixes the slug when another tag already owns it", async () => {
    const { payload, calls } = makePayload([{ docs: [] }, { docs: [{ id: 5 }] }]);
    await syncProjectTag({ doc: project, operation: "create", req: { payload } });
    expect(calls.create).toEqual([
      {
        collection: "tags",
        data: { label: "Athemis", slug: "athemis-1", project: 1 },
      },
    ]);
  });

  it("syncs label and slug when the project is renamed", async () => {
    const { payload, calls } = makePayload([
      { docs: [{ id: 9, slug: "athemis", project: 1 }] },
    ]);
    await syncProjectTag({
      doc: { ...project, name: "Athemis Two" },
      operation: "update",
      originalDoc: project,
      req: { payload },
    });
    expect(calls.update).toEqual([
      { collection: "tags", id: 9, data: { label: "Athemis Two", slug: "athemis-two" } },
    ]);
  });

  it("keeps a customized tag slug on rename", async () => {
    const { payload, calls } = makePayload([
      { docs: [{ id: 9, slug: "custom", project: 1 }] },
    ]);
    await syncProjectTag({
      doc: { ...project, name: "Athemis Two" },
      operation: "update",
      originalDoc: project,
      req: { payload },
    });
    expect(calls.update).toEqual([
      { collection: "tags", id: 9, data: { label: "Athemis Two" } },
    ]);
  });

  it("does nothing when the name is unchanged", async () => {
    const { payload, calls } = makePayload([
      { docs: [{ id: 9, slug: "athemis", project: 1 }] },
    ]);
    await syncProjectTag({
      doc: project,
      operation: "update",
      originalDoc: project,
      req: { payload },
    });
    expect(calls.update).toEqual([]);
  });

  it("ignores docs without usable project fields", async () => {
    const { payload, calls } = makePayload();
    await syncProjectTag({ doc: { name: "Nope" }, operation: "create", req: { payload } });
    expect(calls.find).toEqual([]);
    expect(calls.create).toEqual([]);
  });
});

describe("unlinkProjectTag", () => {
  it("turns the project tag into a free-form tag instead of deleting it", async () => {
    const { payload, calls } = makePayload([{ docs: [{ id: 9, project: 1 }] }]);
    await unlinkProjectTag({ doc: project, req: { payload } });
    expect(calls.update).toEqual([
      { collection: "tags", id: 9, data: { project: null } },
    ]);
  });

  it("does nothing when the project has no tag", async () => {
    const { payload, calls } = makePayload();
    await unlinkProjectTag({ doc: project, req: { payload } });
    expect(calls.update).toEqual([]);
  });
});
