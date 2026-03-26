"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PreviewRow {
  title: string;
  firms: string;
  deal_value: string;
  summary: string;
  body: string;
  deal_date: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setError(null);

    // Preview the CSV
    const text = await selectedFile.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      setError("CSV must have a header row and at least one data row.");
      return;
    }

    // Simple CSV parse for preview
    const headers = parseCSVLine(lines[0]);
    const rows: PreviewRow[] = [];
    for (let i = 1; i < lines.length && i <= 10; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h.trim().toLowerCase()] = values[idx]?.trim() || "";
      });
      rows.push(row as unknown as PreviewRow);
    }
    setPreview(rows);
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.status === 401) {
        router.push("/admin");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setResult(`Successfully imported ${data.count} deal${data.count !== 1 ? "s" : ""}.`);
        setPreview([]);
        setFile(null);
      } else {
        setError(data.error || "Import failed.");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Import Deals</h1>
          <p className="text-sm text-navy-600 mt-1">
            Upload a CSV file to bulk-import deals
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-sm text-slate-300 hover:text-primary transition-colors"
        >
          &larr; Back to dashboard
        </Link>
      </div>

      {/* Format guide */}
      <div className="bg-card-bg border border-card-border rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-3">
          Expected CSV format
        </h2>
        <code className="block text-xs text-accent bg-navy-900 p-4 rounded-lg overflow-x-auto">
          title,firms,deal_value,summary,body,deal_date
          <br />
          &quot;PKF acquires Smith &amp; Co&quot;,&quot;PKF, Smith &amp;
          Co&quot;,&quot;&pound;12M&quot;,&quot;Short summary...&quot;,&quot;Full
          article text...&quot;,&quot;2026-03-15&quot;
        </code>
      </div>

      {/* Upload area */}
      <div className="bg-card-bg border border-card-border rounded-xl p-8 mb-8">
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-navy-700 rounded-xl p-12 text-center hover:border-primary/50 transition-colors">
            <svg
              className="w-10 h-10 text-navy-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-white font-medium mb-1">
              {file ? file.name : "Click to select a CSV file"}
            </p>
            <p className="text-xs text-navy-600">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB`
                : "or drag and drop"}
            </p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-red-400 text-sm">
          {error}
        </div>
      )}
      {result && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-8 text-green-400 text-sm">
          {result}{" "}
          <Link
            href="/admin/dashboard"
            className="text-primary hover:underline"
          >
            View dashboard &rarr;
          </Link>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Preview ({preview.length} row{preview.length !== 1 ? "s" : ""})
          </h2>
          <div className="bg-card-bg border border-card-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left text-xs font-medium text-navy-600 uppercase px-4 py-3">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-navy-600 uppercase px-4 py-3">
                    Firms
                  </th>
                  <th className="text-left text-xs font-medium text-navy-600 uppercase px-4 py-3">
                    Value
                  </th>
                  <th className="text-left text-xs font-medium text-navy-600 uppercase px-4 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-card-border last:border-0"
                  >
                    <td className="px-4 py-3 text-white">{row.title}</td>
                    <td className="px-4 py-3 text-slate-400">{row.firms}</td>
                    <td className="px-4 py-3 text-accent">{row.deal_value}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {row.deal_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-6 px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? "Importing..." : `Import ${preview.length} Deal${preview.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
