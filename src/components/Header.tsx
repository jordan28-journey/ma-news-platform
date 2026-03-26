import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-card-border bg-navy-900/80">
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
      </div>
    </header>
  );
}
