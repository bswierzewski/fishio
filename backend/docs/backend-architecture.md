# Architektura Backendu Fishio

## Spis Treści

1. [Przegląd Architektury](#przegląd-architektury)
2. [Struktura Projektu](#struktura-projektu)
3. [Bounded Contexts](#bounded-contexts)
4. [Shared Kernel](#shared-kernel)
5. [Wzorce Architektoniczne](#wzorce-architektoniczne)
6. [Zarządzanie Zależnościami](#zarządzanie-zależnościami)
7. [Konfiguracja i Wdrożenie](#konfiguracja-i-wdrożenie)
8. [Integration Events](#integration-events)
9. [Podsumowanie](#podsumowanie)

## Przegląd Architektury

Fishio backend jest zaimplementowany zgodnie z zasadami **Clean Architecture** i **Domain-Driven Design (DDD)**. System wykorzystuje podejście modularne oparte na **Bounded Contexts**, gdzie każdy kontekst reprezentuje oddzielną domenę biznesową z własną logiką i modelami.

### Kluczowe Decyzje Architektoniczne

- **.NET 9.0** - najnowsza wersja platformy .NET
- **Clean Architecture** - separacja warstw i zależności
- **Domain-Driven Design** - modelowanie zgodne z domeną biznesową
- **CQRS + MediatR** - rozdzielenie komend i zapytań
- **Event-Driven Architecture** - komunikacja przez domain events
- **Modular Monolith** - podział na bounded contexts w jednym deploymencie

## Struktura Projektu

```
backend/
├── docs/                                    # Dokumentacja projektu
│   └── read-models-projections.md
├── src/
│   ├── Fishio.ApiHost/                     # Entry point aplikacji
│   ├── Fishio.SharedKernel/               # Wspólne abstrakcje DDD
│   ├── Fishio.IntegrationEvents/          # Wydarzenia integracyjne
│   └── Contexts/                           # Bounded Contexts
│       ├── IdentityAccess/                # Zarządzanie użytkownikami
│       ├── Competitions/                  # Zawody i ligi
│       ├── Scoring/                       # Systemy punktacji
│       ├── LiveEvent/                     # Wydarzenia na żywo
│       ├── Venues/                        # Łowiska i miejsca
│       └── Payments/                      # Płatności
├── Fishio.sln                            # Solution file
└── Directory.Packages.props               # Centralne zarządzanie pakietami
```

### Struktura Bounded Context

Każdy bounded context implementuje Clean Architecture z następującymi warstwami:

```
Context/
├── Fishio.{Context}.Domain/              # Warstwa domeny
│   ├── Aggregates/                       # Aggregate roots i entities
│   ├── Enums/                           # Enumeracje domenowe
│   ├── Events/                          # Domain events
│   ├── Exceptions/                      # Wyjątki domenowe
│   ├── Repositories/                    # Interfejsy repozytoriów
│   ├── Services/                        # Serwisy domenowe
│   └── Specifications/                  # Specyfikacje domenowe
├── Fishio.{Context}.Application/         # Warstwa aplikacji
│   ├── AssemblyReference.cs            # Referencja dla MediatR
│   └── DependencyInjection.cs         # Konfiguracja DI
├── Fishio.{Context}.Infrastructure/      # Warstwa infrastruktury
│   └── DependencyInjection.cs         # Konfiguracja DI
└── Fishio.{Context}.Api/                # Warstwa API
    └── DependencyInjection.cs          # Konfiguracja DI
```

## Bounded Contexts

### 1. IdentityAccess

**Odpowiedzialność**: Zarządzanie tożsamością użytkowników, autentykacja, autoryzacja

**Kluczowe Agregaty**:

- `User` - użytkownik systemu z profilem

**Domain Events**:

- `UserRegistered` - nowy użytkownik zarejestrowany
- `UserProfileUpdated` - profil użytkownika zaktualizowany

**Integracja**: Clerk.dev (planowane)

### 2. Competitions

**Odpowiedzialność**: Zarządzanie zawodami, ligami, uczestnikami

**Kluczowe Agregaty** (planowane):

- `Competition` - pojedyncze zawody
- `League` - cykl zawodów z klasyfikacją generalną

### 3. Scoring

**Odpowiedzialność**: Systemy punktacji, szablony klasyfikacji, obliczanie wyników

**Kluczowe Agregaty** (planowane):

- `ScoringSystem` - system punktacji za gatunki
- `ClassificationTemplate` - szablon klasyfikacji

### 4. LiveEvent

**Odpowiedzialność**: Wydarzenia na żywo, rejestracja połowów, real-time updates

**Kluczowe Agregaty** (planowane):

- `LiveCompetition` - zawody w trakcie

### 5. Venues

**Odpowiedzialność**: Łowiska, miejsca zawodów, lokalizacje

**Kluczowe Agregaty** (planowane):

- `Venue` - łowisko z profilem

### 6. Payments

**Odpowiedzialność**: Płatności, bramki płatnicze, faktury

**Kluczowe Agregaty** (planowane):

- `Payment` - płatność za zawody

## Shared Kernel

Fishio.SharedKernel zawiera wspólne abstrakcje DDD używane przez wszystkie konteksty:

### Klasy Bazowe

#### `Entity<TId>`

```csharp
public abstract class Entity<TId>
{
    public TId Id { get; protected set; }
    public DateTimeOffset Created { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public int? LastModifiedBy { get; set; }
}
```

**Charakterystyka**:

- Bazowa klasa dla wszystkich encji
- Wbudowane pola audytowe
- Tożsamość oparta na Id

#### `AggregateRoot<TId>`

```csharp
public abstract class AggregateRoot<TId> : Entity<TId>
{
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents { get; }

    public void AddDomainEvent(IDomainEvent domainEvent);
    public void RemoveDomainEvent(IDomainEvent domainEvent);
    public void ClearDomainEvents();
}
```

**Charakterystyka**:

- Punkt wejścia do agregatu
- Zarządza domain events
- Zapewnia spójność w granicach agregatu

#### `ValueObject`

```csharp
public abstract class ValueObject
{
    protected abstract IEnumerable<object> GetEqualityComponents();
    public override bool Equals(object? obj);
    public override int GetHashCode();
}
```

**Charakterystyka**:

- Niezmienność
- Równość oparta na wartościach
- Brak tożsamości

#### `DomainEvent`

```csharp
public abstract class DomainEvent : IDomainEvent
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow();
}
```

**Charakterystyka**:

- Implementuje INotification (MediatR)
- Niezmienność
- Automatyczne znaczniki czasowe

### Interfejsy

- `IDomainEvent` - kontrakt dla domain events
- `ISpecification<T>` - wzorzec specyfikacji

## Wzorce Architektoniczne

### 1. CQRS + MediatR

System wykorzystuje **Command Query Responsibility Segregation** z **MediatR**:

```csharp
// Program.cs - rejestracja MediatR dla wszystkich kontekstów
var applicationAssemblies = new[]
{
    typeof(Fishio.Competitions.Application.AssemblyReference).Assembly,
    typeof(Fishio.Payments.Application.AssemblyReference).Assembly,
    typeof(Fishio.Scoring.Application.AssemblyReference).Assembly,
    typeof(Fishio.LiveEvent.Application.AssemblyReference).Assembly,
    typeof(Fishio.Venues.Application.AssemblyReference).Assembly,
    typeof(Fishio.IdentityAccess.Application.AssemblyReference).Assembly
};

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblies(applicationAssemblies));
```

### 2. Domain Events

Agregaty publikują domain events, które są obsługiwane przez handlery:

```csharp
// Przykład z User aggregate
public User(string clerkId, string email, ...)
{
    // ... walidacja i inicjalizacja

    AddDomainEvent(new UserRegistered(Id, ClerkId, Email, GetFullName()));
}
```

### 3. Dependency Injection

Każda warstwa ma własny `DependencyInjection.cs`:

```csharp
public static class DependencyInjection
{
    public static IServiceCollection AddIdentityAccessInfrastructure(
        this IServiceCollection services)
    {
        // TODO: Add Entity Framework DbContext
        // TODO: Add repositories
        // TODO: Add external services
        return services;
    }
}
```

## Zarządzanie Zależnościami

### Directory.Packages.props

Centralne zarządzanie wersjami pakietów NuGet:

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="MediatR" Version="12.5.0" />
    <PackageVersion Include="Swashbuckle.AspNetCore" Version="9.0.3" />
    <PackageVersion Include="Moq" Version="4.20.72" />
  </ItemGroup>
</Project>
```

### Zależności między Projektami

- **ApiHost** → wszystkie Api + Infrastructure
- **Api** → Application + Domain
- **Application** → Domain + SharedKernel + IntegrationEvents
- **Infrastructure** → Application + Domain + SharedKernel
- **Domain** → SharedKernel

## Konfiguracja i Wdrożenie

### ApiHost

Entry point aplikacji (`Fishio.ApiHost`):

```csharp
// Program.cs - główny punkt wejścia
var builder = WebApplication.CreateBuilder(args);

// Rejestracja wszystkich modułów (obecnie zakomentowane)
// builder.Services
//     .AddIdentityAccessInfrastructure()
//     .AddIdentityAccessApi()
//     .AddCompetitionsInfrastructure()
//     // ... inne konteksty

var app = builder.Build();

// Mapowanie endpointów (obecnie zakomentowane)
// app.MapIdentityAccessEndpoints()
//    .MapCompetitionsEndpoints()
//    // ... inne konteksty

app.Run();
```

### Baza Danych

**PostgreSQL** jako główna baza danych:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=fishio;Username=postgres;Password=postgres"
  }
}
```

### Swagger/OpenAPI

Zintegrowane z `Swashbuckle.AspNetCore` dla dokumentacji API.

## Integration Events

`Fishio.IntegrationEvents` zapewnia komunikację między bounded contexts:

### Charakterystyka
- **Komunikacja Cross-Context**: Wydarzenia między różnymi kontekstami domenowymi
- **MediatR Integration**: Wszystkie integration events implementują `INotification`
- **Centralna Rejestracja**: MediatR w ApiHost obsługuje events z wszystkich kontekstów
- **In-Process Communication**: Brak zewnętrznej infrastruktury - komunikacja wewnętrzna

### Przykład Implementation
```csharp
// Integration Event
public record DummyIdentityAccessEvent(
    Guid UserId,
    string Email,
    DateTime OccurredOn) : INotification;

// MediatR w ApiHost obsługuje wszystkie konteksty
builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssemblies(applicationAssemblies));
```

### Wzorzec Komunikacji
1. **Domain Event** → publikowany w aggregate
2. **Domain Event Handler** → przekształca w Integration Event
3. **Integration Event** → publikowany przez MediatR
4. **Integration Event Handler** → obsługa w docelowym kontekście

**Ważne**: Aktualnie brak zewnętrznej obsługi komunikacji (message brokers, service bus). Wszystko realizowane in-process przez MediatR.

## Podsumowanie

Architektura Fishio backend została zaprojektowana z myślą o:

1. **Modularności** - każdy bounded context jako niezależny moduł
2. **Skalowalności** - możliwość łatwego dodawania nowych kontekstów
3. **Maintainability** - czysty kod i separacja warstw
4. **Testability** - dependency injection i mockable interfaces
5. **Domain Focus** - model domenowy jako rdzeń aplikacji
