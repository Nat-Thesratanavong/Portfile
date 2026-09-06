import type { CollectionConfig } from "payload";
import { slugify } from "@/lib/slug";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "tag", "_status", "updatedAt"],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if ((operation === "create" || operation === "update") && data) {
          const title = typeof data.title === "string" ? data.title : "";
          const slug = typeof data.slug === "string" ? data.slug : "";
          if (title && !slug) {
            return { ...data, slug: slugify(title) };
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Auto-filled from the title when left empty.",
      },
    },
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayOnly",
          displayFormat: "d MMM y",
        },
      },
    },
    {
      name: "tag",
      type: "text",
      required: true,
    },
    {
      name: "readingTime",
      type: "text",
      required: true,
      admin: {
        description: 'e.g. "6 min".',
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "body",
      type: "richText",
    },
  ],
};
