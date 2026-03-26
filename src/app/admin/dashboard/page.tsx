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

export default function AdminDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadDeals();
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
    </div>
  );
}
