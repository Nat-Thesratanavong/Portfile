import { asString, isRecord } from "./guards";

function labelOf(entry: unknown): string | null {
  if (!isRecord(entry)) {
    return null;
  }
  return asString(entry.label) ?? asString(entry.slug);
}

export async function resolveTagLabels(
  entries: unknown,
  fetchTagById: (id: number | string) => Promise<unknown>,
): Promise<string[]> {
  if (!Array.isArray(entries)) {
    return [];
  }
  const labels: string[] = [];
  for (const entry of entries) {
    const direct = labelOf(entry);
    if (direct) {
      labels.push(direct);
      continue;
    }
    if (typeof entry !== "number" && asString(entry) === null) {
      continue;
    }
    const id = entry as number | string;
    try {
      const doc = await fetchTagById(id);
      const label = labelOf(doc);
      if (label) {
        labels.push(label);
      }
    } catch {
      // Tag doc is gone (deleted) or otherwise unreadable: skip this tag
      // and keep the post visible with its remaining tags.
    }
  }
  return labels;
}

export function displayTags(tags: string[], separator = " · "): string {
  return tags.length > 0 ? tags.join(separator) : "Untagged";
}
