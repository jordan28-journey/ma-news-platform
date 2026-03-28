import db, { _initPromise } from "./db";

export interface Deal {
  id: number;
  slug: string;
  title: string;
  firms: string;
  deal_value: string;
  summary: string;
  body: string;
  deal_date: string;
  created_at: string;
  published: number;
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
      sql: "SELECT id FROM deals WHERE slug = ?",
      args: [slug],
    });
    if (existing.rows.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function getAllDeals(includeUnpublished = false): Promise<Deal[]> {
  await _initPromise;
  const query = includeUnpublished
    ? "SELECT * FROM deals ORDER BY deal_date DESC, created_at DESC"
    : "SELECT * FROM deals WHERE published = 1 ORDER BY deal_date DESC, created_at DESC";
  const result = await db.execute(query);
  return result.rows as unknown as Deal[];
}

export async function getDealBySlug(slug: string): Promise<Deal | undefined> {
  await _initPromise;
  const result = await db.execute({
    sql: "SELECT * FROM deals WHERE slug = ?",
    args: [slug],
  });
  return (result.rows[0] as unknown as Deal) || undefined;
}

export async function createDeal(deal: {
  title: string;
  firms: string;
  deal_value: string;
  summary: string;
  body?: string;
  deal_date: string;
  published?: number;
}): Promise<Deal> {
  await _initPromise;
  const slug = await ensureUniqueSlug(slugify(deal.title));
  await db.execute({
    sql: `INSERT INTO deals (slug, title, firms, deal_value, summary, body, deal_date, published)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      slug,
      deal.title,
      deal.firms,
      deal.deal_value,
      deal.summary,
      deal.body || "",
      deal.deal_date,
      deal.published ?? 1,
    ],
  });
  return (await getDealBySlug(slug))!;
}

export async function toggleDealPublished(id: number): Promise<void> {
  await _initPromise;
  await db.execute({
    sql: "UPDATE deals SET published = CASE WHEN published = 1 THEN 0 ELSE 1 END WHERE id = ?",
    args: [id],
  });
}

export async function deleteDeal(id: number): Promise<void> {
  await _initPromise;
  await db.execute({
    sql: "DELETE FROM deals WHERE id = ?",
    args: [id],
  });
}

export async function getDealsByDateRange(startDate: string, endDate: string): Promise<Deal[]> {
  await _initPromise;
  const result = await db.execute({
    sql: "SELECT * FROM deals WHERE published = 1 AND deal_date >= ? AND deal_date < ? ORDER BY deal_date ASC",
    args: [startDate, endDate],
  });
  return result.rows as unknown as Deal[];
}

export async function importDealsFromCSV(
  rows: Array<{
    title: string;
    firms: string;
    deal_value: string;
    summary: string;
    body?: string;
    deal_date: string;
  }>
): Promise<number> {
  await _initPromise;
  let count = 0;
  for (const row of rows) {
    if (!row.title || !row.firms || !row.deal_value || !row.summary || !row.deal_date) {
      continue;
    }
    const slug = await ensureUniqueSlug(slugify(row.title));
    await db.execute({
      sql: `INSERT INTO deals (slug, title, firms, deal_value, summary, body, deal_date, published)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [slug, row.title, row.firms, row.deal_value, row.summary, row.body || "", row.deal_date],
    });
    count++;
  }
  return count;
}
