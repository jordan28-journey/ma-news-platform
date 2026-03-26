import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-card-border bg-navy-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Acting Office logo mark */}
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
            AO
          </div>
          <div>
            <span className="text-white font-semibold text-lg tracking-tight">
              M&A Tracker
            </span>
            <span className="block text-xs text-navy-600 -mt-0.5">
              by Acting Office
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Deals
          </Link>
          <Link
            href="/admin"
            className="text-sm px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
