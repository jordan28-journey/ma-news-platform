import { getDealBySlug, getAllDeals, seedIfEmpty } from "@/lib/deals";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DealPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  seedIfEmpty();
  const { slug } = await params;
  const deal = getDealBySlug(slug);

  if (!deal || !deal.published) {
    notFound();
  }

  const paragraphs = deal.body
    ? deal.body.split("\n").filter((p) => p.trim())
    : [deal.summary];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-navy-600 hover:text-primary transition-colors mb-8"
      >
        &larr; Back to all deals
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
              {deal.deal_value}
            </span>
            <time className="text-sm text-navy-600" dateTime={deal.deal_date}>
              {new Date(deal.deal_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
            {deal.title}
          </h1>
          <p className="text-navy-600 text-sm">
            Firms involved:{" "}
            <span className="text-slate-300">{deal.firms}</span>
          </p>
        </header>

        <div className="border-t border-card-border pt-8">
          <p className="text-lg text-slate-300 leading-relaxed mb-6 font-medium">
            {deal.summary}
          </p>
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="text-slate-400 leading-relaxed mb-4"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}
