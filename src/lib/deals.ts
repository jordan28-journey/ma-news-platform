import db from "./db";

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

function ensureUniqueSlug(baseSlug: string): string {
  let slug = baseSlug;
  let counter = 1;
  while (db.prepare("SELECT id FROM deals WHERE slug = ?").get(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export function getAllDeals(includeUnpublished = false): Deal[] {
  const query = includeUnpublished
    ? "SELECT * FROM deals ORDER BY deal_date DESC, created_at DESC"
    : "SELECT * FROM deals WHERE published = 1 ORDER BY deal_date DESC, created_at DESC";
  return db.prepare(query).all() as Deal[];
}

export function getDealBySlug(slug: string): Deal | undefined {
  return db.prepare("SELECT * FROM deals WHERE slug = ?").get(slug) as
    | Deal
    | undefined;
}

export function createDeal(deal: {
  title: string;
  firms: string;
  deal_value: string;
  summary: string;
  body?: string;
  deal_date: string;
  published?: number;
}): Deal {
  const slug = ensureUniqueSlug(slugify(deal.title));
  const stmt = db.prepare(`
    INSERT INTO deals (slug, title, firms, deal_value, summary, body, deal_date, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    slug,
    deal.title,
    deal.firms,
    deal.deal_value,
    deal.summary,
    deal.body || "",
    deal.deal_date,
    deal.published ?? 1
  );
  return getDealBySlug(slug)!;
}

export function toggleDealPublished(id: number): void {
  db.prepare("UPDATE deals SET published = CASE WHEN published = 1 THEN 0 ELSE 1 END WHERE id = ?").run(id);
}

export function deleteDeal(id: number): void {
  db.prepare("DELETE FROM deals WHERE id = ?").run(id);
}

export function importDealsFromCSV(
  rows: Array<{
    title: string;
    firms: string;
    deal_value: string;
    summary: string;
    body?: string;
    deal_date: string;
  }>
): number {
  const insert = db.prepare(`
    INSERT INTO deals (slug, title, firms, deal_value, summary, body, deal_date, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const transaction = db.transaction((rows: typeof arguments[0]) => {
    let count = 0;
    for (const row of rows) {
      if (!row.title || !row.firms || !row.deal_value || !row.summary || !row.deal_date) {
        continue; // skip incomplete rows
      }
      const slug = ensureUniqueSlug(slugify(row.title));
      insert.run(slug, row.title, row.firms, row.deal_value, row.summary, row.body || "", row.deal_date);
      count++;
    }
    return count;
  });

  return transaction(rows);
}

// Seed is no longer needed — import real deals via CSV through the admin dashboard
