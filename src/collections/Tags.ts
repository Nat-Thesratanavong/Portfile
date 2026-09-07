import type { CollectionConfig } from "payload";
import { slugify } from "@/lib/slug";

export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "slug", "project", "updatedAt"],
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if ((operation === "create" || operation === "update") && data) {
          const label = typeof data.label === "string" ? data.label : "";
          const slug = typeof data.slug === "string" ? data.slug : "";
          const normalized = slugify(slug) || slugify(label);
          if (normalized && normalized !== slug) {
            return { ...data, slug: normalized };
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Auto-filled from the label when left empty.",
      },
    },
    {
      name: "project",
      type: "relationship",
      relationTo: "projects",
      admin: {
        description: "Set for project-mastered tags; leave empty for free-form tags.",
      },
    },
  ],
};
