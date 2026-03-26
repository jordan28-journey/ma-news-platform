"use client";

import { useState, useMemo } from "react";
import type { Deal } from "@/lib/deals";
import DealCard from "./DealCard";

export default function DealsFilter({ deals }: { deals: Deal[] }) {
  const [firmFilter, setFirmFilter] = useState("");
  const [valueFilter, setValueFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Extract unique firms (split comma-separated values)
  const allFirms = useMemo(() => {
    const firms = new Set<string>();
    deals.forEach((d) =>
      d.firms
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((f) => firms.add(f))
    );
    return Array.from(firms).sort((a, b) => a.localeCompare(b));
  }, [deals]);

  // Extract unique deal values
  const allValues = useMemo(() => {
    const values = new Set<string>();
    deals.forEach((d) => {
      if (d.deal_value) values.add(d.deal_value);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [deals]);

  // Extract unique months (e.g. "March 2026")
  const allDates = useMemo(() => {
    const months = new Map<string, string>();
    deals.forEach((d) => {
      const date = new Date(d.deal_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
      months.set(key, label);
    });
    return Array.from(months.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, label]) => ({ key, label }));
  }, [deals]);

  const filtered = useMemo(() => {
    return deals.filter((deal) => {
      if (firmFilter) {
        const firms = deal.firms.split(",").map((f) => f.trim());
        if (!firms.includes(firmFilter)) return false;
      }
      if (valueFilter && deal.deal_value !== valueFilter) return false;
      if (dateFilter) {
        const date = new Date(deal.deal_date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (key !== dateFilter) return false;
      }
      return true;
    });
  }, [deals, firmFilter, valueFilter, dateFilter]);

  const [page, setPage] = useState(1);
  const perPage = 12;

  const hasActiveFilter = firmFilter || valueFilter || dateFilter;

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Latest Deals</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Firm filter */}
          <select
            value={firmFilter}
            onChange={(e) => handleFilterChange(setFirmFilter, e.target.value)}
            className="bg-card-bg border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer max-w-48"
          >
            <option value="">All Firms</option>
            {allFirms.map((firm) => (
              <option key={firm} value={firm}>
                {firm}
              </option>
            ))}
          </select>

          {/* Value filter */}
          <select
            value={valueFilter}
            onChange={(e) => handleFilterChange(setValueFilter, e.target.value)}
            className="bg-card-bg border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer max-w-48"
          >
            <option value="">All Values</option>
            {allValues.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>

          {/* Date filter */}
          <select
            value={dateFilter}
            onChange={(e) => handleFilterChange(setDateFilter, e.target.value)}
            className="bg-card-bg border border-card-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="">All Dates</option>
            {allDates.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              onClick={() => {
                setFirmFilter("");
                setValueFilter("");
                setDateFilter("");
                setPage(1);
              }}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {paginated.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginated.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <p className="text-center py-10 text-slate-500">
          No deals match the selected filters.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm rounded-lg border border-card-border bg-card-bg text-slate-300 hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            &larr; Prev
          </button>

          {(() => {
            const pages: (number | "...")[] = [];
            for (let p = 1; p <= totalPages; p++) {
              if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                pages.push(p);
              } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
              }
            }
            return pages.map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-1 text-slate-500 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 text-sm rounded-lg border cursor-pointer ${
                    p === page
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-card-border bg-card-bg text-slate-300 hover:border-primary/50"
                  }`}
                >
                  {p}
                </button>
              )
            );
          })()}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm rounded-lg border border-card-border bg-card-bg text-slate-300 hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </section>
  );
}
