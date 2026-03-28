import db, { _initPromise } from "./db";

export interface Insight {
  id: number;
  slug: string;
  title: string;
  quarter: string;
  year: number;
  summary: string;
  body: string;
  kennys_contribution: string;
  published: number;
  created_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await db.execute({
      sql: "SELECT id FROM insights WHERE slug = ?",
      args: [slug],
    });
    if (existing.rows.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function getAllInsights(includeUnpublished = false): Promise<Insight[]> {
  await _initPromise;
  const query = includeUnpublished
    ? "SELECT * FROM insights ORDER BY year DESC, quarter DESC, created_at DESC"
    : "SELECT * FROM insights WHERE published = 1 ORDER BY year DESC, quarter DESC, created_at DESC";
  const result = await db.execute(query);
  return result.rows as unknown as Insight[];
}

export async function getInsightBySlug(slug: string): Promise<Insight | undefined> {
  await _initPromise;
  const result = await db.execute({
    sql: "SELECT * FROM insights WHERE slug = ?",
    args: [slug],
  });
  return (result.rows[0] as unknown as Insight) || undefined;
}

export async function createInsight(insight: {
  title: string;
  quarter: string;
  year: number;
  summary?: string;
  body?: string;
  kennys_contribution?: string;
  published?: number;
}): Promise<Insight> {
  await _initPromise;
  const slug = await ensureUniqueSlug(slugify(insight.title));
  await db.execute({
    sql: `INSERT INTO insights (slug, title, quarter, year, summary, body, kennys_contribution, published)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      slug,
      insight.title,
      insight.quarter,
      insight.year,
      insight.summary || "",
      insight.body || "",
      insight.kennys_contribution || "",
      insight.published ?? 0,
    ],
  });
  return (await getInsightBySlug(slug))!;
}

export async function updateInsight(
  id: number,
  fields: Partial<{
    title: string;
    quarter: string;
    year: number;
    summary: string;
    body: string;
    kennys_contribution: string;
    published: number;
  }>
): Promise<void> {
  await _initPromise;
  const sets: string[] = [];
  const args: (string | number)[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      sets.push(`${key} = ?`);
      args.push(value);
    }
  }
  if (sets.length === 0) return;

  args.push(id);
  await db.execute({
    sql: `UPDATE insights SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function toggleInsightPublished(id: number): Promise<void> {
  await _initPromise;
  await db.execute({
    sql: "UPDATE insights SET published = CASE WHEN published = 1 THEN 0 ELSE 1 END WHERE id = ?",
    args: [id],
  });
}

export async function deleteInsight(id: number): Promise<void> {
  await _initPromise;
  await db.execute({
    sql: "DELETE FROM insights WHERE id = ?",
    args: [id],
  });
}

export function quarterLabel(quarter: string, year: number): string {
  return `${quarter} ${year}`;
}
