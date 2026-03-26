import db from "./db";

export interface Ad {
  id: number;
  slot: "sidebar" | "leaderboard";
  label: string;
  image_url: string;
  link_url: string;
  active: number;
  created_at: string;
}

export function getAllAds(): Ad[] {
  return db.prepare("SELECT * FROM ads ORDER BY created_at DESC").all() as Ad[];
}

export function getActiveAd(slot: "sidebar" | "leaderboard"): Ad | undefined {
  return db
    .prepare("SELECT * FROM ads WHERE slot = ? AND active = 1 ORDER BY created_at DESC LIMIT 1")
    .get(slot) as Ad | undefined;
}

export function createAd(ad: {
  slot: "sidebar" | "leaderboard";
  label: string;
  image_url: string;
  link_url: string;
}): Ad {
  const stmt = db.prepare(
    "INSERT INTO ads (slot, label, image_url, link_url) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(ad.slot, ad.label, ad.image_url, ad.link_url);
  return db.prepare("SELECT * FROM ads WHERE id = ?").get(result.lastInsertRowid) as Ad;
}

export function updateAd(
  id: number,
  fields: { label?: string; image_url?: string; link_url?: string }
): void {
  const sets: string[] = [];
  const values: (string | number)[] = [];
  if (fields.label !== undefined) {
    sets.push("label = ?");
    values.push(fields.label);
  }
  if (fields.image_url !== undefined) {
    sets.push("image_url = ?");
    values.push(fields.image_url);
  }
  if (fields.link_url !== undefined) {
    sets.push("link_url = ?");
    values.push(fields.link_url);
  }
  if (sets.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE ads SET ${sets.join(", ")} WHERE id = ?`).run(...values);
}

export function toggleAdActive(id: number): void {
  db.prepare(
    "UPDATE ads SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?"
  ).run(id);
}

export function deleteAd(id: number): void {
  db.prepare("DELETE FROM ads WHERE id = ?").run(id);
}
