// app/results/[id]/[token]/loading.tsx

export default function LoadingPublicResults() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="h-8 bg-muted rounded w-3/5 mb-6 animate-pulse"></div> {/* Tytuł */}
      <div className="h-4 bg-muted rounded w-1/3 mb-4 animate-pulse"></div> {/* Info */}
      <div className="bg-card p-6 rounded border animate-pulse">
        <div className="h-5 bg-muted rounded w-1/4 mb-4"></div> {/* Nagłówek tabeli? */}
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}
