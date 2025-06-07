// app/(main)/fisheries/loading.tsx

export default function LoadingFisheriesList() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Łowiska</h1>
        {/* Placeholder dla przycisku dodawania */}
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>
      <p className="text-muted-foreground mb-4">Ładowanie listy łowisk...</p>
      {/* Szkielet listy */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border rounded bg-card animate-pulse">
            <div className="h-5 bg-muted rounded w-1/3 mb-2"></div> {/* Nazwa */}
            <div className="h-4 bg-muted rounded w-2/3"></div> {/* Lokalizacja */}
          </div>
        ))}
      </div>
    </div>
  );
}
