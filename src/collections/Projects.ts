import type { CollectionConfig } from "payload";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "year", "_status", "updatedAt"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if ((operation === "create" || operation === "update") && data) {
          const name = typeof data.name === "string" ? data.name : "";
          const slug = typeof data.slug === "string" ? data.slug : "";
          if (name && !slug) {
            return { ...data, slug: slugify(name) };
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Auto-filled from the name when left empty.",
      },
    },
    {
      name: "outcome",
      type: "textarea",
      required: true,
    },
    {
      name: "stack",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        {
          name: "item",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "year",
      type: "text",
      required: true,
    },
    {
      name: "links",
      type: "group",
      fields: [
        { name: "github", type: "text" },
        { name: "live", type: "text" },
      ],
    },
    {
      name: "screenshots",
      type: "upload",
      relationTo: "media",
      hasMany: true,
    },
    {
      name: "body",
      type: "richText",
    },
  ],
};
