import { getAllDeals, seedIfEmpty } from "@/lib/deals";
import DealCard from "@/components/DealCard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  seedIfEmpty();
  const deals = getAllDeals();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          UK Accounting{" "}
          <span className="text-emphasis">M&A</span>{" "}
          Tracker
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Spotlighting the latest mergers, acquisitions, and consolidation deals
          shaping the UK accounting market.
        </p>
      </section>

      {/* Featured Deal */}
      {deals.length > 0 && (
        <section className="mb-12">
          <a href={`/deals/${deals[0].slug}`} className="group block">
            <div className="bg-card-bg border border-card-border rounded-2xl p-8 md:p-10 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-navy-950 bg-accent px-3 py-1 rounded-full">
                  Featured Deal
                </span>
                <span className="text-sm font-medium text-accent">
                  {deals[0].deal_value}
                </span>
                <time
                  className="text-sm text-navy-600 ml-auto"
                  dateTime={deals[0].deal_date}
                >
                  {new Date(deals[0].deal_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                {deals[0].title}
              </h2>
              <p className="text-sm text-navy-600 mb-2">{deals[0].firms}</p>
              <p className="text-slate-400 leading-relaxed max-w-3xl">
                {deals[0].summary}
              </p>
              <span className="inline-block mt-5 text-sm text-primary font-medium group-hover:underline">
                Read full article &rarr;
              </span>
            </div>
          </a>
        </section>
      )}

      {/* Deal Grid */}
      {deals.length > 1 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">
            Latest Deals
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deals.slice(1).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </section>
      )}

      {deals.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg">No deals published yet.</p>
          <p className="text-sm mt-2">
            Head to the{" "}
            <a href="/admin" className="text-primary hover:underline">
              admin panel
            </a>{" "}
            to import your first CSV.
          </p>
        </div>
      )}
    </div>
  );
}
