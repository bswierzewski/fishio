// app/(main)/competitions/[id]/loading.tsx

export default function LoadingCompetitionDetail() {
  return (
    <div>
      {/* Szkielet nagłówka */}
      <div className="h-8 bg-muted rounded w-3/5 mb-2 animate-pulse"></div> {/* Nazwa */}
      <div className="h-4 bg-muted rounded w-4/5 mb-6 animate-pulse"></div> {/* Info pod nazwą */}
      {/* Szkielet przycisku akcji */}
      <div className="h-10 bg-muted rounded w-48 mb-8 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Szkielet sekcji informacji */}
          <div>
            <div className="h-6 bg-muted rounded w-1/4 mb-3 animate-pulse"></div> {/* Tytuł sekcji */}
            <div className="bg-card p-4 rounded border animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-3"></div> {/* Podtytuł */}
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {/* Szkielet sekcji uczestników */}
          <div>
            <div className="h-6 bg-muted rounded w-1/2 mb-3 animate-pulse"></div> {/* Tytuł sekcji */}
            <div className="bg-card p-4 rounded border animate-pulse">
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          </div>
          {/* Szkielet sekcji rankingu */}
          <div>
            <div className="h-6 bg-muted rounded w-1/2 mb-3 animate-pulse"></div> {/* Tytuł sekcji */}
            <div className="bg-card p-4 rounded border animate-pulse">
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
