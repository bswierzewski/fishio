export default function LoadingCompetitionsList() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Otwarte Zawody</h1>
      <p className="text-muted-foreground mb-4">Wyszukiwanie dostępnych zawodów...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="rounded-lg border border-border bg-card shadow">
              <div className="h-10 bg-slate-200 rounded-t-lg"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
