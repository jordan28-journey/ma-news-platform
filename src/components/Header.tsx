import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-card-border bg-navy-900/80">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <img src="/logo.svg" alt="Acting Office M&A Tracker" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Deals
          </Link>
          <Link
            href="/insights"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Insights
          </Link>
        </nav>
      </div>
    </header>
  );
}
