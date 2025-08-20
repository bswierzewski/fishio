# Read Models / Projections w Modularnej Architekturze

## 📖 Koncepcja

**Read Model** (Model Odczytu) to dedykowana struktura danych zoptymalizowana pod konkretne zapytania (queries), oddzielona od modeli domenowych używanych do zapisu (commands). To kluczowy element wzorca **CQRS (Command Query Responsibility Segregation)**.

**Projection** (Projekcja) to proces tworzenia i aktualizowania Read Modeli na podstawie zdarzeń domenowych lub zmian w agregatach.

## 🎯 Kiedy stosować Read Models?

### ✅ **Idealne zastosowania:**
1. **Cross-context queries** - gdy potrzebujemy danych z wielu bounded contexts
2. **Złożone raporty** - agregacje, sumy, statystyki
3. **Denormalizowane widoki** - gdy normalizacja utrudnia odczyt
4. **Wysokowydajne queries** - gdy performance jest krytyczny
5. **UI-specific data** - gdy interfejs potrzebuje specyficznego kształtu danych

### ❌ **Kiedy NIE stosować:**
1. **Proste CRUD** - gdy dane są prostą reprezentacją agregatu
2. **Real-time consistency** - gdy wymagamy natychmiastowej spójności
3. **Rzadko używane queries** - koszt maintenance vs benefit
4. **Małe systemy** - overhead może być większy niż korzyść

## 🏗️ Podejścia implementacyjne

### **1. Event-Driven Projections**
```csharp
// Domain Event
public class UserProfileUpdated : DomainEvent
{
    public int UserId { get; }
    public string NewFullName { get; }
}

// Projection Handler
public class UserCompetitionProjectionHandler : INotificationHandler<UserProfileUpdated>
{
    public async Task Handle(UserProfileUpdated notification, CancellationToken cancellationToken)
    {
        // Aktualizuj wszystkie projekcje zawierające tego użytkownika
        await _projectionRepository.UpdateUserNameAsync(notification.UserId, notification.NewFullName);
    }
}
```

### **2. Database Views**
```sql
CREATE VIEW UserCompetitionView AS
SELECT 
    u.Id AS UserId,
    u.FirstName + ' ' + u.LastName AS UserName,
    c.Id AS CompetitionId,
    c.Name AS CompetitionName,
    p.Role
FROM Users u
JOIN Participants p ON u.Id = p.UserId
JOIN Competitions c ON p.CompetitionId = c.Id
```

### **3. Dedicated Tables**
```csharp
public class UserCompetitionProjection
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; }
    public Guid CompetitionId { get; set; }
    public string CompetitionName { get; set; }
    public string Role { get; set; }
    public DateTime LastUpdated { get; set; }
}
```

## 🔄 Strategie aktualizacji

### **1. Immediate (Synchroniczna)**
- Projekcja aktualizowana w tej samej transakcji
- **Pros:** Natychmiastowa spójność
- **Cons:** Wydajność, coupling

### **2. Eventually Consistent (Asynchroniczna)**
- Projekcja aktualizowana przez domain events
- **Pros:** Wydajność, loose coupling
- **Cons:** Eventual consistency

### **3. Scheduled (Batch)**
- Okresowa przebudowa projekcji
- **Pros:** Prostota, odporność na błędy
- **Cons:** Opóźnienia w danych

## 💡 Przykład: Lista zawodów użytkownika

### **Problem biznesowy:**
> "W jakich wszystkich zawodach Jan Kowalski jest sędzią?"

### **Wyzwanie architektoniczne:**
- **User** (IdentityAccess Context) - imię, nazwisko
- **Participant** (Competitions Context) - role w zawodach
- **Competition** (Competitions Context) - nazwy zawodów

### **❌ Błędne podejście:**
```csharp
// ŹLE - narusza bounded context boundaries
public class User : AggregateRoot<int>
{
    private readonly List<UserRole> _roles = new();
    public IReadOnlyCollection<UserRole> Roles => _roles.AsReadOnly();
}
```

### **✅ Rozwiązanie z Read Model:**

#### **1. Definicja Read Model:**
```csharp
public class UserCompetitionReadModel
{
    public int UserId { get; set; }
    public string UserName { get; set; }
    public List<UserCompetitionItem> Competitions { get; set; } = new();
}

public class UserCompetitionItem
{
    public Guid CompetitionId { get; set; }
    public string CompetitionName { get; set; }
    public string Role { get; set; }
    public DateTime StartDate { get; set; }
    public string Status { get; set; }
}
```

#### **2. Projekcja w bazie:**
```sql
CREATE TABLE UserCompetitionProjections (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId INT NOT NULL,
    UserName NVARCHAR(200) NOT NULL,
    CompetitionId UNIQUEIDENTIFIER NOT NULL,
    CompetitionName NVARCHAR(500) NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    CompetitionStartDate DATETIME2 NOT NULL,
    CompetitionStatus NVARCHAR(50) NOT NULL,
    LastUpdated DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    INDEX IX_UserId (UserId),
    INDEX IX_CompetitionId (CompetitionId),
    INDEX IX_Role (Role)
);
```

#### **3. Event Handlers dla aktualizacji:**
```csharp
// Gdy zmieni się profil użytkownika
public class UserProfileUpdatedHandler : INotificationHandler<UserProfileUpdated>
{
    private readonly IUserCompetitionProjectionRepository _repository;

    public async Task Handle(UserProfileUpdated @event, CancellationToken cancellationToken)
    {
        await _repository.UpdateUserNameAsync(@event.UserId, @event.NewFullName);
    }
}

// Gdy użytkownik dołącza do zawodów
public class ParticipantRegisteredHandler : INotificationHandler<ParticipantRegistered>
{
    private readonly IUserCompetitionProjectionRepository _repository;

    public async Task Handle(ParticipantRegistered @event, CancellationToken cancellationToken)
    {
        await _repository.AddUserCompetitionAsync(new UserCompetitionProjection
        {
            UserId = @event.UserId,
            UserName = @event.UserName,
            CompetitionId = @event.CompetitionId,
            CompetitionName = @event.CompetitionName,
            Role = @event.Role.ToString()
        });
    }
}
```

#### **4. Query Service:**
```csharp
public interface IUserCompetitionQueryService
{
    Task<UserCompetitionReadModel> GetUserCompetitionsAsync(int userId);
    Task<List<UserCompetitionItem>> GetUserJudgeCompetitionsAsync(int userId);
    Task<List<UserCompetitionItem>> GetActiveCompetitionsForUserAsync(int userId);
}

public class UserCompetitionQueryService : IUserCompetitionQueryService
{
    private readonly IUserCompetitionProjectionRepository _repository;

    public async Task<List<UserCompetitionItem>> GetUserJudgeCompetitionsAsync(int userId)
    {
        return await _repository.GetByUserIdAndRoleAsync(userId, "Judge");
    }
}
```

#### **5. Użycie w Application Service:**
```csharp
public class GetUserCompetitionsQuery : IRequest<UserCompetitionReadModel>
{
    public int UserId { get; set; }
}

public class GetUserCompetitionsHandler : IRequestHandler<GetUserCompetitionsQuery, UserCompetitionReadModel>
{
    private readonly IUserCompetitionQueryService _queryService;

    public async Task<UserCompetitionReadModel> Handle(GetUserCompetitionsQuery request, CancellationToken cancellationToken)
    {
        return await _queryService.GetUserCompetitionsAsync(request.UserId);
    }
}
```

## 🎯 Korzyści tego podejścia

### **1. Bounded Context Integrity**
- Każdy kontekst zarządza swoimi agregatami
- Brak cross-context dependencies w domain model

### **2. Performance**
- Denormalizowane dane = szybkie queries
- Indeksy zoptymalizowane pod konkretne zapytania

### **3. Flexibility**
- Różne read modele dla różnych use cases
- UI może dostawać dokładnie te dane, których potrzebuje

### **4. Scalability**
- Read i write modele mogą być skalowane niezależnie
- Możliwość użycia różnych storage engines

## ⚠️ Wyzwania i rozwiązania

### **1. Eventual Consistency**
```csharp
// Problem: User widzi przestarzałe dane
// Rozwiązanie: Wersjonowanie projekcji
public class UserCompetitionProjection
{
    public long Version { get; set; }
    public DateTime LastUpdated { get; set; }
}
```

### **2. Data Synchronization**
```csharp
// Problem: Zgubione eventy, błędy w projekcji
// Rozwiązanie: Rebuilding mechanizm
public interface IProjectionRebuilder
{
    Task RebuildUserCompetitionProjectionsAsync();
    Task RebuildForUserAsync(int userId);
}
```

### **3. Storage Overhead**
```csharp
// Problem: Duplikacja danych
// Rozwiązanie: Archiwizacja starych projekcji
await _repository.ArchiveOldProjectionsAsync(DateTime.UtcNow.AddMonths(-12));
```

## 📋 Checklist implementacji

### **Przed implementacją:**
- [ ] Czy query naprawdę wymaga danych z wielu kontekstów?
- [ ] Czy wydajność jest krytyczna dla tego zapytania?
- [ ] Czy eventual consistency jest akceptowalna?

### **Podczas implementacji:**
- [ ] Zdefiniować Read Model pasujący do UI needs
- [ ] Stworzyć optimized database schema
- [ ] Zaimplementować event handlers
- [ ] Dodać error handling i retry logic
- [ ] Napisać integration tests

### **Po implementacji:**
- [ ] Monitoring projekcji (delay, errors)
- [ ] Mechanizm rebuilding w razie problemów
- [ ] Performance metrics dla queries
- [ ] Archiwizacja starych danych

## 🚀 Dobre praktyki

1. **Nazywanie:** Używaj sufixu "ReadModel", "Projection" lub "View"
2. **Indeksy:** Optymalizuj pod konkretne query patterns
3. **Monitoring:** Śledź health i performance projekcji
4. **Cleanup:** Regularnie usuwaj nieaktualne dane
5. **Testing:** Testuj zarówno event handlers jak i query logic
6. **Documentation:** Dokumentuj mapping między events a projekcjami

---

*Ten dokument opisuje wzorzec Read Models/Projections w kontekście systemu Fishio, ale zasady mają zastosowanie uniwersalne w architekturach CQRS i Event-Driven.*