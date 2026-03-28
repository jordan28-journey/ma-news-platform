import { getAllDeals } from "@/lib/deals";
import { getActiveAd } from "@/lib/ads";
import DealsFilter from "@/components/DealsFilter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const deals = await getAllDeals();
  const sidebarAd = await getActiveAd("sidebar");
  const leaderboardAd = await getActiveAd("leaderboard");

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

      {/* Stats Counter */}
      {deals.length > 0 && (() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const monthName = now.toLocaleDateString("en-GB", { month: "long" });

        const dealsThisYear = deals.filter((d) => {
          const date = new Date(d.deal_date);
          return date.getFullYear() === currentYear;
        });

        const dealsThisMonth = dealsThisYear.filter((d) => {
          const date = new Date(d.deal_date);
          return date.getMonth() === currentMonth;
        });

        const firmCounts: Record<string, number> = {};
        for (const d of dealsThisYear) {
          for (const firm of d.firms.split(",").map((f) => f.trim()).filter(Boolean)) {
            firmCounts[firm] = (firmCounts[firm] || 0) + 1;
          }
        }
        const topFirm = Object.entries(firmCounts).sort((a, b) => b[1] - a[1])[0];

        return (
          <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-accent">{dealsThisYear.length}</p>
              <p className="text-sm text-slate-400 mt-1">Deals in {currentYear}</p>
            </div>
            <div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-accent">{dealsThisMonth.length}</p>
              <p className="text-sm text-slate-400 mt-1">Deals in {monthName}</p>
            </div>
            <div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-accent truncate">{topFirm ? topFirm[0] : "—"}</p>
              <p className="text-sm text-slate-400 mt-1">
                Most Acquisitive Firm {currentYear}{topFirm ? ` (${topFirm[1]} deals)` : ""}
              </p>
            </div>
          </section>
        );
      })()}

      {/* Featured Deal + Sidebar Ad */}
      {deals.length > 0 && (
        <section className="mb-12">
          <div className={`flex gap-6 ${sidebarAd ? "flex-col lg:flex-row lg:items-stretch" : ""}`}>
            {/* Featured Deal */}
            <a href={`/deals/${deals[0].slug}`} className="group block flex-1 min-w-0">
              <div className="bg-card-bg border border-card-border rounded-2xl p-8 md:p-10 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 h-full">
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
                <p className="text-slate-400 leading-relaxed">
                  {deals[0].summary}
                </p>
                <span className="inline-block mt-5 text-sm text-primary font-medium group-hover:underline">
                  Read full article &rarr;
                </span>
              </div>
            </a>

            {/* Sidebar Ad — 300×auto, matches featured deal height */}
            {sidebarAd && (
              <div className="flex-shrink-0 w-[300px] hidden lg:block">
                {sidebarAd.image_url ? (
                  <a
                    href={sidebarAd.link_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <img
                      src={sidebarAd.image_url}
                      alt={sidebarAd.label || "Advertisement"}
                      className="rounded-xl border border-card-border w-[300px] h-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="w-[300px] h-full rounded-xl border border-dashed border-card-border bg-card-bg flex items-center justify-center">
                    <span className="text-xs text-navy-600">Ad Space &middot; 300&times;250</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Deal Grid */}
      {deals.length > 1 && <DealsFilter deals={deals.slice(1)} />}

      {/* Leaderboard Ad — 728x90 */}
      {leaderboardAd && (
        <section className="mt-12">
          <div className="flex justify-center">
            {leaderboardAd.image_url ? (
              <a
                href={leaderboardAd.link_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={leaderboardAd.image_url}
                  alt={leaderboardAd.label || "Advertisement"}
                  width={728}
                  height={90}
                  className="rounded-xl border border-card-border max-w-full h-auto"
                />
              </a>
            ) : (
              <div className="w-[728px] max-w-full h-[90px] rounded-xl border border-dashed border-card-border bg-card-bg flex items-center justify-center">
                <span className="text-xs text-navy-600">Ad Space &middot; 728&times;90</span>
              </div>
            )}
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
