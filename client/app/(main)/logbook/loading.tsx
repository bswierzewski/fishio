// app/(main)/logbook/loading.tsx

export default function LoadingLogbook() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mój Dziennik Połowów</h1>
        {/* Placeholder dla przycisku dodawania */}
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>
      <p className="text-muted-foreground mb-4">Ładowanie wpisów...</p>
      {/* Szkielet siatki */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded bg-card overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-muted"></div> {/* Placeholder zdjęcia */}
            <div className="p-3">
              <div className="h-5 bg-muted rounded w-3/4 mb-2"></div> {/* Gatunek */}
              <div className="h-3 bg-muted rounded w-1/2"></div> {/* Data */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
