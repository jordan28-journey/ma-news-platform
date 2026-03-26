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

// Seed sample data if database is empty
export function seedIfEmpty(): void {
  const count = db.prepare("SELECT COUNT(*) as count FROM deals").get() as { count: number };
  if (count.count > 0) return;

  const sampleDeals = [
    {
      title: "Azets acquires Mitchell Charlesworth",
      firms: "Azets, Mitchell Charlesworth",
      deal_value: "Undisclosed",
      summary: "Azets has completed the acquisition of North West firm Mitchell Charlesworth, adding 14 partners and over 200 staff to its growing UK network.",
      body: "Azets, one of the UK's largest accountancy and business advisory firms, has announced the acquisition of Mitchell Charlesworth, a well-established North West practice.\n\nThe deal sees Mitchell Charlesworth's team of 14 partners and more than 200 staff join Azets, significantly bolstering the firm's presence across Liverpool, Chester, Manchester, and Warrington.\n\nMitchell Charlesworth, founded in 1884, brings a strong client base spanning SMEs, owner-managed businesses, and not-for-profit organisations. The firm has long been recognised for its expertise in audit, tax advisory, and corporate finance.\n\nAzets CEO Chris Sherwood commented: \"This acquisition is a fantastic strategic fit. Mitchell Charlesworth shares our commitment to providing exceptional client service and developing talent. Together, we will offer an even broader range of services to businesses across the North West.\"\n\nThe deal is the latest in a string of acquisitions by Azets, which has been on an aggressive growth trajectory across the UK and Nordics, backed by private equity firm Hg.",
      deal_date: "2026-03-20",
    },
    {
      title: "PKF Littlejohn merges with Haysmacintyre",
      firms: "PKF Littlejohn, Haysmacintyre",
      deal_value: "£150M+ (combined revenue)",
      summary: "Two top-25 London firms announce landmark merger creating a combined practice with over £150 million in revenue.",
      body: "PKF Littlejohn and Haysmacintyre have confirmed a landmark merger that will create one of London's largest independent accountancy firms, with combined revenues exceeding £150 million.\n\nThe merged firm will operate under a new brand and bring together more than 1,200 professionals across multiple London offices. The combination positions the new entity firmly within the UK's top 15 accountancy practices.\n\nThe merger is seen as a strategic response to increasing consolidation in the mid-market, with both firms seeking greater scale to compete with the Big Four and larger international networks.\n\nBoth firms have complementary strengths: PKF Littlejohn is known for its listed company audit practice and international reach through the PKF network, while Haysmacintyre has a strong reputation in not-for-profit, private client, and professional services sectors.\n\nThe deal was advised by Mckinney & Co and is expected to complete in Q2 2026, subject to partner approval at both firms.",
      deal_date: "2026-03-15",
    },
    {
      title: "Saffery Champness acquired by Evelyn Partners",
      firms: "Saffery Champness, Evelyn Partners",
      deal_value: "£80M",
      summary: "Wealth management giant Evelyn Partners makes its move into the top 20 accountancy market with the acquisition of Saffery Champness.",
      body: "Evelyn Partners, the UK's largest integrated wealth management and professional services group, has acquired Saffery Champness in a deal valued at approximately £80 million.\n\nThe acquisition brings Saffery Champness's 90 partners and 900 staff into the Evelyn Partners fold, creating a powerhouse in the private client and landed estates advisory space.\n\nSaffery Champness, a top-20 UK accountancy firm, has been serving private clients, entrepreneurs, and family offices for over 160 years. The firm's expertise in landed estates, charities, and international tax planning complements Evelyn Partners' existing wealth management capabilities.\n\n\"This is a transformational deal for both organisations,\" said Paul Saffery, Senior Partner at Saffery Champness. \"By joining Evelyn Partners, our clients will benefit from an unrivalled combination of accounting expertise and wealth management services.\"\n\nThe deal further consolidates the trend of wealth managers and accountancy firms converging, as high-net-worth clients increasingly demand integrated financial advice.",
      deal_date: "2026-03-10",
    },
    {
      title: "Cogital Group acquires Shorts Chartered Accountants",
      firms: "Cogital Group, Shorts Chartered Accountants",
      deal_value: "£12M",
      summary: "PE-backed Cogital Group continues its buy-and-build strategy with the acquisition of Sheffield-based Shorts Chartered Accountants.",
      body: "Cogital Group, the private equity-backed accountancy consolidator, has acquired Shorts Chartered Accountants in a deal worth approximately £12 million.\n\nShorts, based in Sheffield, is a well-regarded regional practice with particular strengths in owner-managed businesses, R&D tax credits, and corporate advisory. The firm employs over 80 staff and has been serving Yorkshire businesses for more than 40 years.\n\nThe acquisition is the latest in Cogital's buy-and-build strategy, which has seen the group acquire more than 20 accountancy practices across the UK since its formation in 2019.\n\nCogital CEO James Gosling said: \"Shorts is exactly the type of high-quality, client-focused practice we look to partner with. Their team's expertise in R&D tax and corporate advisory adds real depth to our service offering in the North of England.\"\n\nExisting Shorts clients have been assured of continuity of service, with the firm's partners and staff all joining the Cogital network.",
      deal_date: "2026-03-05",
    },
    {
      title: "BDO UK acquires FRP Advisory tax practice",
      firms: "BDO UK, FRP Advisory",
      deal_value: "£25M",
      summary: "BDO strengthens its tax advisory capability with the acquisition of FRP Advisory's specialist tax team and client book.",
      body: "BDO UK, the fifth-largest accountancy firm in the country, has acquired the specialist tax advisory practice of FRP Advisory in a deal worth £25 million.\n\nThe transaction sees a team of 45 tax professionals transfer from FRP to BDO, along with an established client portfolio focused on mid-market corporate tax, international structuring, and M&A tax advisory.\n\nThe move is part of BDO's strategic plan to grow its advisory revenues and reduce reliance on traditional audit and compliance work. BDO's UK managing partner Paul Eagland described the deal as \"a targeted investment in specialist capability.\"\n\n\"FRP has built an excellent tax advisory team that perfectly complements our existing strengths,\" Eagland said. \"This acquisition accelerates our growth in a key area where clients are demanding more sophisticated advice.\"\n\nFRP Advisory, which is listed on AIM, said the disposal allows it to focus on its core restructuring and insolvency advisory business.",
      deal_date: "2026-02-28",
    },
  ];

  for (const deal of sampleDeals) {
    createDeal(deal);
  }
}
