import { getAllInsights, getInsightBySlug, quarterLabel } from "@/lib/insights";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);

  if (!insight || !insight.published) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/insights"
        className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-primary transition-colors mb-8"
      >
        &larr; All Insights
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-navy-950 bg-accent px-3 py-1 rounded-full">
            {quarterLabel(insight.quarter, insight.year)}
          </span>
          <time
            className="text-sm text-navy-600"
            dateTime={insight.created_at}
          >
            {new Date(insight.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
          {insight.title}
        </h1>
        {insight.summary && (
          <p className="text-lg text-slate-400 leading-relaxed">
            {insight.summary}
          </p>
        )}
      </header>

      {/* Report Body */}
      {insight.body && (
        <section className="mb-12">
          <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
            {insight.body}
          </div>
        </section>
      )}

      {/* Kenny's Contribution */}
      {insight.kennys_contribution && (
        <section className="mt-12 border-t border-card-border pt-10">
          <div className="bg-card-bg border border-card-border rounded-xl p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                K
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Kenny&apos;s Commentary
                </h2>
                <p className="text-xs text-navy-600">Additional insights & analysis</p>
              </div>
            </div>
            <div className="text-slate-300 leading-relaxed whitespace-pre-line">
              {insight.kennys_contribution}
            </div>
          </div>
        </section>
      )}

      {/* Back to insights */}
      <div className="mt-12 pt-8 border-t border-card-border">
        <Link
          href="/insights"
          className="text-sm text-primary hover:underline"
        >
          &larr; Back to all insights
        </Link>
      </div>
    </div>
  );
}
