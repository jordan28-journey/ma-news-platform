import Link from "next/link";
import type { Deal } from "@/lib/deals";

export default function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link href={`/deals/${deal.slug}`} className="group block">
      <article className="bg-card-bg border border-card-border rounded-xl p-6 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            {deal.deal_value}
          </span>
          <time className="text-xs text-navy-600" dateTime={deal.deal_date}>
            {new Date(deal.deal_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary transition-colors leading-snug">
          {deal.title}
        </h3>
        <p className="text-sm text-navy-600 mb-3">{deal.firms}</p>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
          {deal.summary}
        </p>
        <span className="inline-block mt-4 text-xs text-primary font-medium group-hover:underline">
          Read more &rarr;
        </span>
      </article>
    </Link>
  );
}
