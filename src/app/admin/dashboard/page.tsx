"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Deal {
  id: number;
  slug: string;
  title: string;
  firms: string;
  deal_value: string;
  deal_date: string;
  published: number;
}

interface Ad {
  id: number;
  slot: "sidebar" | "leaderboard";
  label: string;
  image_url: string;
  link_url: string;
  active: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdForm, setShowAdForm] = useState(false);
  const [adForm, setAdForm] = useState({ slot: "sidebar" as "sidebar" | "leaderboard", label: "", image_url: "", link_url: "" });
  const [adUploading, setAdUploading] = useState(false);
  const [editingAd, setEditingAd] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ label: "", image_url: "", link_url: "" });
  const [editUploading, setEditUploading] = useState(false);
  const router = useRouter();

  async function loadDeals() {
    try {
      const res = await fetch("/api/deals");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setDeals(data.deals);
    } catch {
      console.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  }

  async function loadAds() {
    try {
      const res = await fetch("/api/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads);
      }
    } catch {
      console.error("Failed to load ads");
    }
  }

  useEffect(() => {
    loadDeals();
    loadAds();
  }, []);

  async function togglePublished(id: number) {
    await fetch("/api/deals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "toggle" }),
    });
    loadDeals();
  }

  async function deleteDeal(id: number) {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    await fetch("/api/deals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadDeals();
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/ads/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Upload failed");
      return null;
    }
    const data = await res.json();
    return data.url;
  }

  async function handleCreateImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdUploading(true);
    const url = await uploadImage(file);
    if (url) setAdForm((f) => ({ ...f, image_url: url }));
    setAdUploading(false);
  }

  async function handleEditImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    const url = await uploadImage(file);
    if (url) setEditForm((f) => ({ ...f, image_url: url }));
    setEditUploading(false);
  }

  async function createAd() {
    if (!adForm.image_url) {
      alert("Please upload an image first.");
      return;
    }
    await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adForm),
    });
    setAdForm({ slot: "sidebar", label: "", image_url: "", link_url: "" });
    setShowAdForm(false);
    loadAds();
  }

  async function toggleAd(id: number) {
    await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "toggle" }),
    });
    loadAds();
  }

  async function saveAdEdit(id: number) {
    await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    setEditingAd(null);
    loadAds();
  }

  async function deleteAd(id: number) {
    if (!confirm("Delete this ad?")) return;
    await fetch("/api/ads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadAds();
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Deal Manager</h1>
          <p className="text-sm text-navy-600 mt-1">
            {deals.length} deal{deals.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/upload"
          className="px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-navy-950 font-medium text-sm transition-colors"
        >
          Import CSV
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="bg-card-bg border border-card-border rounded-xl p-12 text-center">
          <p className="text-slate-400">No deals yet.</p>
          <Link
            href="/admin/upload"
            className="inline-block mt-4 text-primary hover:underline text-sm"
          >
            Import your first CSV &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4">
                  Deal
                </th>
                <th className="text-left text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                  Value
                </th>
                <th className="text-left text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                  Date
                </th>
                <th className="text-center text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="border-b border-card-border last:border-0 hover:bg-navy-900/50"
                >
                  <td className="px-6 py-4">
                    <p className="text-white font-medium text-sm">
                      {deal.title}
                    </p>
                    <p className="text-navy-600 text-xs mt-0.5">{deal.firms}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-accent text-sm font-medium">
                      {deal.deal_value}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">
                    {new Date(deal.deal_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                        deal.published
                          ? "bg-green-500/10 text-green-400"
                          : "bg-slate-500/10 text-slate-400"
                      }`}
                    >
                      {deal.published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublished(deal.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-300 hover:bg-navy-800 transition-colors"
                      >
                        {deal.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => deleteDeal(deal.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ad Management */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Ad Manager</h2>
            <p className="text-sm text-navy-600 mt-1">
              {ads.length} ad{ads.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button
            onClick={() => setShowAdForm(!showAdForm)}
            className="px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-navy-950 font-medium text-sm transition-colors"
          >
            {showAdForm ? "Cancel" : "New Ad"}
          </button>
        </div>

        {/* New Ad Form */}
        {showAdForm && (
          <div className="bg-card-bg border border-card-border rounded-xl p-6 mb-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                  Slot
                </label>
                <select
                  value={adForm.slot}
                  onChange={(e) =>
                    setAdForm({ ...adForm, slot: e.target.value as "sidebar" | "leaderboard" })
                  }
                  className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50"
                >
                  <option value="sidebar">Sidebar (300x250)</option>
                  <option value="leaderboard">Leaderboard (728x90)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                  Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sponsor Name"
                  value={adForm.label}
                  onChange={(e) => setAdForm({ ...adForm, label: e.target.value })}
                  className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                  Ad Image
                </label>
                <label className="flex items-center gap-3 w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors">
                  <span className="px-3 py-1 rounded bg-navy-800 text-xs font-medium text-slate-300 shrink-0">
                    {adUploading ? "Uploading..." : "Choose file"}
                  </span>
                  <span className="truncate text-navy-600">
                    {adForm.image_url ? adForm.image_url.split("/").pop() : "No file selected"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleCreateImageUpload}
                    className="hidden"
                    disabled={adUploading}
                  />
                </label>
                {adForm.image_url && (
                  <div className="mt-2">
                    <img
                      src={adForm.image_url}
                      alt="Preview"
                      className="max-h-24 rounded border border-card-border"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                  Click-through URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={adForm.link_url}
                  onChange={(e) => setAdForm({ ...adForm, link_url: e.target.value })}
                  className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <button
              onClick={createAd}
              disabled={adUploading}
              className="mt-4 px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Create Ad
            </button>
          </div>
        )}

        {ads.length === 0 && !showAdForm ? (
          <div className="bg-card-bg border border-card-border rounded-xl p-12 text-center">
            <p className="text-slate-400">No ads yet.</p>
            <button
              onClick={() => setShowAdForm(true)}
              className="inline-block mt-4 text-primary hover:underline text-sm"
            >
              Create your first ad &rarr;
            </button>
          </div>
        ) : (
          ads.length > 0 && (
            <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="text-left text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4">
                      Ad
                    </th>
                    <th className="text-left text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                      Slot
                    </th>
                    <th className="text-center text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr
                      key={ad.id}
                      className="border-b border-card-border last:border-0 hover:bg-navy-900/50"
                    >
                      <td className="px-6 py-4">
                        {editingAd === ad.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.label}
                              onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                              placeholder="Label"
                              className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/50"
                            />
                            <label className="flex items-center gap-2 w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-1.5 cursor-pointer hover:border-primary/50 transition-colors">
                              <span className="px-2 py-0.5 rounded bg-navy-800 text-xs font-medium text-slate-300 shrink-0">
                                {editUploading ? "Uploading..." : "Replace image"}
                              </span>
                              <span className="truncate text-navy-600 text-xs">
                                {editForm.image_url.split("/").pop() || "No image"}
                              </span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/gif,image/webp"
                                onChange={handleEditImageUpload}
                                className="hidden"
                                disabled={editUploading}
                              />
                            </label>
                            {editForm.image_url && (
                              <img
                                src={editForm.image_url}
                                alt="Preview"
                                className="max-h-16 rounded border border-card-border"
                              />
                            )}
                            <input
                              type="text"
                              value={editForm.link_url}
                              onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })}
                              placeholder="Click-through URL"
                              className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/50"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {ad.image_url && (
                              <img
                                src={ad.image_url}
                                alt={ad.label}
                                className="w-12 h-12 rounded border border-card-border object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm">
                                {ad.label || "Untitled Ad"}
                              </p>
                              {ad.link_url && (
                                <p className="text-navy-600 text-xs mt-0.5 truncate max-w-xs">
                                  {ad.link_url}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-slate-300">
                          {ad.slot === "sidebar" ? "Sidebar (300x250)" : "Leaderboard (728x90)"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                            ad.active
                              ? "bg-green-500/10 text-green-400"
                              : "bg-slate-500/10 text-slate-400"
                          }`}
                        >
                          {ad.active ? "Live" : "Off"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingAd === ad.id ? (
                            <>
                              <button
                                onClick={() => saveAdEdit(ad.id)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-green-500/20 text-green-400 hover:bg-green-500/10 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingAd(null)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-300 hover:bg-navy-800 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingAd(ad.id);
                                  setEditForm({ label: ad.label, image_url: ad.image_url, link_url: ad.link_url });
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-300 hover:bg-navy-800 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleAd(ad.id)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-300 hover:bg-navy-800 transition-colors"
                              >
                                {ad.active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => deleteAd(ad.id)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
