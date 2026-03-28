"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Insight {
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

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const CURRENT_YEAR = new Date().getFullYear();

export default function AdminInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    quarter: "Q1",
    year: CURRENT_YEAR,
    summary: "",
    body: "",
    kennys_contribution: "",
  });
  const router = useRouter();

  async function loadInsights() {
    try {
      const res = await fetch("/api/insights");
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      setInsights(data.insights);
    } catch {
      console.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsights();
  }, []);

  function resetForm() {
    setForm({
      title: "",
      quarter: "Q1",
      year: CURRENT_YEAR,
      summary: "",
      body: "",
      kennys_contribution: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      alert("Title is required.");
      return;
    }

    if (editingId) {
      await fetch("/api/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
    } else {
      await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    resetForm();
    loadInsights();
  }

  async function togglePublished(id: number) {
    await fetch("/api/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "toggle" }),
    });
    loadInsights();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this insight report?")) return;
    await fetch("/api/insights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadInsights();
  }

  function startEdit(insight: Insight) {
    setForm({
      title: insight.title,
      quarter: insight.quarter,
      year: insight.year,
      summary: insight.summary,
      body: insight.body,
      kennys_contribution: insight.kennys_contribution,
    });
    setEditingId(insight.id);
    setShowForm(true);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quarter: form.quarter, year: form.year }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Generation failed");
        return;
      }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        title: data.title,
        summary: data.summary,
        body: data.body,
      }));
    } catch {
      alert("Failed to generate report. Check your API key configuration.");
    } finally {
      setGenerating(false);
    }
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
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/dashboard"
              className="text-sm text-navy-600 hover:text-primary transition-colors"
            >
              &larr; Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">Insight Reports</h1>
          <p className="text-sm text-navy-600 mt-1">
            {insights.length} report{insights.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-navy-950 font-medium text-sm transition-colors"
        >
          {showForm ? "Cancel" : "New Report"}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-card-bg border border-card-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? "Edit Report" : "New Quarterly Report"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. UK Accounting M&A: Q1 2026 Review"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                Quarter
              </label>
              <select
                value={form.quarter}
                onChange={(e) => setForm({ ...form, quarter: e.target.value })}
                className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50"
              >
                {QUARTERS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || CURRENT_YEAR })}
                className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50"
              />
            </div>
            {/* Generate with AI */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating report from {form.quarter} {form.year} deals...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
              <p className="text-xs text-navy-600 mt-1.5 text-center">
                Uses Claude to generate a report based on all deals from {form.quarter} {form.year}. You can edit the output before publishing.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                Summary
              </label>
              <textarea
                rows={2}
                placeholder="Brief overview shown on the insights listing page..."
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 resize-y"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                Report Body
              </label>
              <textarea
                rows={10}
                placeholder="Full quarterly insights report content..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 resize-y"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-navy-600 uppercase tracking-wider mb-1.5">
                Kenny&apos;s Contribution
              </label>
              <textarea
                rows={6}
                placeholder="Additional commentary from Kenny..."
                value={form.kennys_contribution}
                onChange={(e) => setForm({ ...form, kennys_contribution: e.target.value })}
                className="w-full bg-navy-900 border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 resize-y"
              />
              <p className="text-xs text-navy-600 mt-1">
                This section appears as a distinct commentary block on the public report page.
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors"
            >
              {editingId ? "Save Changes" : "Create Report"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2 rounded-lg border border-card-border text-slate-300 hover:bg-navy-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Insights Table */}
      {insights.length === 0 && !showForm ? (
        <div className="bg-card-bg border border-card-border rounded-xl p-12 text-center">
          <p className="text-slate-400">No insight reports yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-block mt-4 text-primary hover:underline text-sm"
          >
            Create your first report &rarr;
          </button>
        </div>
      ) : (
        insights.length > 0 && (
          <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4">
                    Report
                  </th>
                  <th className="text-left text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Quarter
                  </th>
                  <th className="text-center text-xs font-medium text-navy-600 uppercase tracking-wider px-6 py-4 hidden md:table-cell">
                    Kenny&apos;s Input
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
                {insights.map((insight) => (
                  <tr
                    key={insight.id}
                    className="border-b border-card-border last:border-0 hover:bg-navy-900/50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white font-medium text-sm">
                        {insight.title}
                      </p>
                      <p className="text-navy-600 text-xs mt-0.5 line-clamp-1">
                        {insight.summary || "No summary"}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-accent text-sm font-medium">
                        {insight.quarter} {insight.year}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                          insight.kennys_contribution
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {insight.kennys_contribution ? "Added" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                          insight.published
                            ? "bg-green-500/10 text-green-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {insight.published ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(insight)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-300 hover:bg-navy-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => togglePublished(insight.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-300 hover:bg-navy-800 transition-colors"
                        >
                          {insight.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete(insight.id)}
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
        )
      )}
    </div>
  );
}
