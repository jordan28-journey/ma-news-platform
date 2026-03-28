import { getAllInsights, quarterLabel } from "@/lib/insights";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const insights = await getAllInsights();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Quarterly{" "}
          <span className="text-emphasis">Insights</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          In-depth analysis and commentary on UK accounting M&A activity,
          published each quarter.
        </p>
      </section>

      {insights.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {insights.map((insight) => (
            <Link
              key={insight.id}
              href={`/insights/${insight.slug}`}
              className="group block"
            >
              <article className="bg-card-bg border border-card-border rounded-xl p-6 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    {quarterLabel(insight.quarter, insight.year)}
                  </span>
                  <time className="text-xs text-navy-600" dateTime={insight.created_at}>
                    {new Date(insight.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <h2 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors leading-snug">
                  {insight.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {insight.summary}
                </p>
                <span className="inline-block mt-4 text-xs text-primary font-medium group-hover:underline">
                  Read report &rarr;
                </span>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg">No insight reports published yet.</p>
          <p className="text-sm mt-2">Check back soon for quarterly analysis.</p>
        </div>
      )}
    </div>
  );
}
