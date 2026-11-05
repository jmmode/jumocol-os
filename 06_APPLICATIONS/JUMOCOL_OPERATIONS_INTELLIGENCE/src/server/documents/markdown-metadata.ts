// Pure Markdown helpers shared by the canonical repository and the LIFE-OS discovery.
export type DocumentHeading = {
  id: string;
  level: 2 | 3;
  label: string;
};

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Reads `**Label:** value`, `- **Label:** value` or YAML front-matter `label: value`. */
export function extractMetadata(markdown: string, ...labels: string[]): string {
  for (const label of labels) {
    const bold = markdown.match(new RegExp(`^\\s*(?:[-*]\\s+)?\\*\\*${escape(label)}:?\\*\\*:?\\s*(.+?)\\s*$`, "im"));
    if (bold?.[1]) return bold[1].trim().replace(/\\$/, "").trim();
  }
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (frontMatter) {
    for (const label of labels) {
      const line = frontMatter[1].match(new RegExp(`^${escape(slugify(label).replace(/-/g, "_"))}\\s*:\\s*(.+)$`, "im"))
        ?? frontMatter[1].match(new RegExp(`^${escape(label)}\\s*:\\s*(.+)$`, "im"));
      if (line?.[1]) return line[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return "NO DOCUMENTADO";
}

export function extractTitle(markdown: string, fallback: string): string {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

export function extractHeadings(markdown: string): readonly DocumentHeading[] {
  const occurrences = new Map<string, number>();

  return markdown.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) return [];

    const level = match[1].length as 2 | 3;
    const label = match[2].trim();
    const baseId = slugify(label);
    const occurrence = occurrences.get(baseId) ?? 0;
    occurrences.set(baseId, occurrence + 1);

    return [{ id: occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}`, level, label }];
  });
}
