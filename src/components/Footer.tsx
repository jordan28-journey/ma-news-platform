export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-navy-900/50 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">
              AO
            </div>
            <span className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} Acting Office. All rights reserved.
            </span>
          </div>
          <p className="text-xs text-navy-600">
            Tracking mergers & acquisitions in the UK accounting market.
          </p>
        </div>
      </div>
    </footer>
  );
}
