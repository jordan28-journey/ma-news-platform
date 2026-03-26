import db, { _initPromise } from "./db";

export interface Ad {
  id: number;
  slot: "sidebar" | "leaderboard";
  label: string;
  image_url: string;
  link_url: string;
  active: number;
  created_at: string;
}

export async function getAllAds(): Promise<Ad[]> {
  await _initPromise;
  const result = await db.execute("SELECT * FROM ads ORDER BY created_at DESC");
  return result.rows as unknown as Ad[];
}

export async function getActiveAd(slot: "sidebar" | "leaderboard"): Promise<Ad | undefined> {
  await _initPromise;
  const result = await db.execute({
    sql: "SELECT * FROM ads WHERE slot = ? AND active = 1 ORDER BY created_at DESC LIMIT 1",
    args: [slot],
  });
  return (result.rows[0] as unknown as Ad) || undefined;
}

export async function createAd(ad: {
  slot: "sidebar" | "leaderboard";
  label: string;
  image_url: string;
  link_url: string;
}): Promise<Ad> {
  await _initPromise;
  const result = await db.execute({
    sql: "INSERT INTO ads (slot, label, image_url, link_url) VALUES (?, ?, ?, ?)",
    args: [ad.slot, ad.label, ad.image_url, ad.link_url],
  });
  const inserted = await db.execute({
    sql: "SELECT * FROM ads WHERE id = ?",
    args: [result.lastInsertRowid!],
  });
  return inserted.rows[0] as unknown as Ad;
}

export async function updateAd(
  id: number,
  fields: { label?: string; image_url?: string; link_url?: string }
): Promise<void> {
  await _initPromise;
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
  await db.execute({
    sql: `UPDATE ads SET ${sets.join(", ")} WHERE id = ?`,
    args: values,
  });
}

export async function toggleAdActive(id: number): Promise<void> {
  await _initPromise;
  await db.execute({
    sql: "UPDATE ads SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?",
    args: [id],
  });
}

export async function deleteAd(id: number): Promise<void> {
  await _initPromise;
  await db.execute({
    sql: "DELETE FROM ads WHERE id = ?",
    args: [id],
  });
}
