# 🐟 Fishio — Aplikacja dla wędkarzy i organizatorów zawodów

**Fishio** to platforma webowa (zoptymalizowana pod kątem urządzeń mobilnych) służąca do organizacji i uczestnictwa w zawodach wędkarskich. Głównym celem jest zapewnienie intuicyjnego narzędzia, które ułatwi zarządzanie zawodami dla organizatorów i usprawni udział dla wędkarzy na różnych poziomach zaawansowania.

## 🎯 Główne Założenia

- **Publiczna Strona Powitalna (`/`):** Prezentuje aplikację i zachęca do rejestracji/logowania.
- **Dashboard (`/dashboard`):** Główny widok dla zalogowanego użytkownika, podsumowujący aktywności.
- **Nawigacja Mobilna:** Informacja o aplikacji z tytułem strony i ikoną użytkownika (Clerk). Dolny pasek nawigacyjny z głównymi sekcjami i centralnym przyciskiem akcji.
- **Informacje o Wersji:** Dostępne na dedykowanej stronie "O Aplikacji".

## 🛠️ Stack technologiczny

- **Backend**: .NET 9
- **Frontend**: Next.js
- **UI**: [shadcn/ui](https://ui.shadcn.dev/) + TailwindCSS
- **Zarządzanie Użytkownikami**: Clerk
- **Zarządzanie Stanem (Klient):** Zustand (globalny), TanStack Query (stan serwera)
- **Formularze:** TanStack Form
- **Baza danych**: PostgreSQL
- **Hosting Zdjęć**: Zewnętrzny serwis (np. Cloudinary)

## ✅ Kluczowe Funkcjonalności (Zakres MVP)

Poniższe funkcjonalności stanowią rdzeń aplikacji planowany na pierwszą wersję.

### 🏆 Zarządzanie Zawodami

- Tworzenie zawodów przez zalogowanych użytkowników (stają się Organizatorami).
  - Definiowanie typu zawodów: Otwarte (każdy zalogowany może dołączyć) lub Zamknięte (uczestnicy dodawani tylko przez Organizatora).
  - Konfiguracja danych: Nazwa, Data/Czas rozpoczęcia i zakończenia, Lokalizacja (tekstowo), Regulamin (tekstowo), opcjonalne zdjęcie zawodów.
  - **Wybór Głównej Kategorii Punktacji:** Określenie, jak będzie liczony główny ranking (np. suma wag, suma długości).
  - **Wybór Kategorii Specjalnych:** Możliwość zdefiniowania dodatkowych kategorii (np. Największa Ryba, Najdłuższa Ryba, Najwięcej Sztuk).
  - Automatyczne generowanie unikalnego tokena (`resultsToken`) dla publicznego linku do wyników przy tworzeniu zawodów.
- Przeglądanie listy otwartych zawodów (z informacją o kategoriach).
- Przeglądanie listy "Moje Zawody" (zawody organizowane, sędziowane lub w których użytkownik bierze udział, z wizualnym rozróżnieniem statusu i informacją o kategoriach).
- Widok szczegółów zawodów (z informacją o kategoriach i linkiem do publicznych wyników).

### 👤 Zarządzanie Uczestnikami i Rolami w Zawodach

- **Model Hybrydowy Uczestnictwa:**
  - Możliwość samodzielnego dołączania do zawodów _Otwartych_ przez zalogowanych użytkowników.
  - Możliwość _ręcznego dodawania_ uczestników do zawodów przez Organizatora:
    - Dodawanie zarejestrowanych użytkowników (wyszukiwanie).
    - Dodawanie uczestników-gości bez konta (wymagane Imię/Nazwisko/Ksywka, opcjonalny unikalny identyfikator).
- **System Ról w Kontekście Zawodów:**
  - **Organizator (Zalogowany):** Tworzy zawody, zarządza uczestnikami, sędziami, kategoriami.
  - **Sędzia/Wagowy (Zalogowany):** Wyznaczony przez Organizatora; jedyna osoba mogąca rejestrować połowy _podczas zawodów_.
  - **Uczestnik (Zalogowany/Gość):** Bierze udział w zawodach.
- Możliwość wyznaczenia/usunięcia Sędziego (zarejestrowanego użytkownika) dla zawodów przez Organizatora.
- Możliwość usunięcia uczestnika przez Organizatora (przed startem zawodów).

### 📊 Wyniki i Rankingi (w Zawodach)

- Rejestracja złowionych ryb _wyłącznie przez Sędziego_ podczas trwania zawodów (wybór uczestnika, dane ryby, zdjęcie).
- **Publiczna Strona Wyników (`/results/[token]`):**
  - Dostępna przez unikalny, zawsze aktywny link.
  - Dynamicznie wyświetla zawartość w zależności od statusu zawodów:
    - **Zaplanowane (Upcoming):** Informacja o nadchodzących zawodach.
    - **Trwające (Ongoing):** Symulowane/rzeczywiste wyniki "na żywo", placeholder dla wykresu bieżącego rankingu.
    - **Zakończone (Finished):** Oficjalna tabela wyników (główna klasyfikacja), sekcje dla zwycięzców zdefiniowanych kategorii specjalnych, placeholdery dla dwóch wykresów (np. wizualizacja rankingu ogólnego i analiza kategorii).
- Wyświetlanie informacji o głównej kategorii punktacji i kategoriach specjalnych na stronie szczegółów zawodów.

### 📱 Interfejs i Użytkownicy

- **Dashboard (`/dashboard`):** Spersonalizowany widok dla zalogowanego użytkownika
- Profil użytkownika (obsługiwany przez Clerk `<UserProfile />` na ścieżce catch-all `/profile/[[...user-profile]]`).
- Strona "O Aplikacji" (`/about`) z informacjami o wersji i buildzie.
- Uwierzytelnianie i zarządzanie sesją przez **Clerk**.
- Responsywny design z optymalizacją dla urządzeń mobilnych (Mobile-first).

### ⚙️ Backend i Infrastruktura

- Automatyczne generowanie informacji o wersji aplikacji (tag/SHA Git, data buildu) podczas procesu CI/CD (GitHub Actions).
- Dockerfile zoptymalizowany pod kątem Next.js (`standalone` output) dla wdrożeń.
- Podstawowa konfiguracja `docker-compose.yml` z możliwością automatycznych aktualizacji obrazu klienta (np. przez Watchtower).

## 🚀 Plany na Przyszłość (Poza MVP)

Następujące funkcjonalności są planowane w dalszym rozwoju aplikacji, po wdrożeniu i zebraniu feedbacku z wersji MVP+:

- **Zaawansowane Zarządzanie Zawodami:**
  - Obsługa wpisowego i integracja z systemami płatności online.
  - Zarządzanie sektorami i stanowiskami na łowisku.
  - Możliwość definiowania przez organizatora niestandardowych pól dla zgłoszeń ryb (np. metoda połowu, przynęta).
  - Archiwum zawodów z zaawansowanym wyszukiwaniem i filtrowaniem.
- **Komunikacja i Powiadomienia:**
  - Rozbudowany system powiadomień (np. Uczestnik -> Sędzia: "Złowiłem rybę"; Sędzia -> Uczestnicy: "Nowy wpis w rankingu"; o starcie zawodów). Panel powiadomień w Navbarze.
  - Moduł komunikacji wewnętrznej (czat w ramach zawodów, ogłoszenia).
- **Statystyki i Analizy:**
  - Szczegółowe statystyki i analizy połowów (indywidualne i zbiorcze).
  - Implementacja rzeczywistych wykresów na stronie wyników.
  - Zaawansowane opcje filtrowania i sortowania danych na listach.
- **Obsługa stowarzyszeń wędkarskich:**
  - Zarządzanie członkami stworzyszenia
  - (Potencjalnie) Rozbudowane profile publiczne, listy znajomych, możliwość udostępniania połowów.
- **Społeczność i Reputacja:**
  - System ocen i reputacji organizatorów oraz łowisk.
  - (Potencjalnie) Rozbudowane profile publiczne, listy znajomych, możliwość udostępniania połowów.
- **Administracja i Narzędzia:**
  - Rozbudowany Panel Administracyjny (zarządzanie użytkownikami, globalne zarządzanie łowiskami, gatunkami ryb, zawodami, moderacja).
  - Import/Eksport danych (np. lista uczestników w CSV, wyniki).
- **Lokalizacja:**
  - Wsparcie dla wielu języków (i18n).
- **Zaawansowane Zarządzanie Łowiskami:**
  - Integracja z mapami interaktywnymi, dodawanie współrzędnych, rysowanie granic łowisk.
  - Możliwość dodawania przez użytkowników zdjęć łowisk, komentarzy.
- **Ulepszenia UX/UI:**
  - Implementacja menu bocznego (sidebar/drawer) otwieranego ikoną hamburgera.
  - Bardziej zaawansowane komponenty wyboru (np. MultiSelect dla gatunków ryb, kategorii specjalnych).

### 💡 Nowe Kierunki Rozwoju (Wizja Długoterminowa)

Poniższe funkcje reprezentują bardziej zaawansowane lub innowacyjne kierunki, które mogłyby zostać zaimplementowane w dalszej perspektywie, po ugruntowaniu pozycji aplikacji i zebraniu szerszego feedbacku:

#### 🧠 Inteligentne Funkcje i Personalizacja (AI):

- Automatyczne Rozpoznawanie Gatunku Ryby: Integracja z modelem AI umożliwiającym rozpoznawanie gatunku ryby na podstawie przesłanego zdjęcia, co mogłoby usprawnić proces dodawania połowów.
- Spersonalizowane Rekomendacje: System rekomendujący łowiska, przynęty, techniki czy pory połowu, bazujący na historii użytkownika, danych pogodowych, fazach księżyca, aktywności innych wędkarzy (z pełnym poszanowaniem prywatności i anonimizacją danych zbiorczych) oraz popularności określonych metod na danym łowisku.
- Predykcyjne Analizy Brań: Zaawansowane analizy sugerujące prawdopodobieństwo dobrych brań określonych gatunków na wybranych łowiskach w określonym czasie, uwzględniające wiele czynników.

#### 🏆 Zaawansowana Gamifikacja i Elementy Społecznościowe:

- Globalny System Osiągnięć i Odznak: Rozbudowany system nagradzania użytkowników za różnorodne aktywności (np. "Mistrz Okonia Mazowsza", "Odkrywca 100 Łowisk", "Ekspert Metody Spławikowej", "Ambasador C&R").
- Wyzwania Wędkarskie: Możliwość tworzenia i uczestniczenia w cyklicznych lub jednorazowych wyzwaniach (np. "Złów największego szczupaka miesiąca w Polsce", "Skompletuj 5 gatunków ryb drapieżnych w sezonie").
- Kluby/Drużyny Wędkarskie: Funkcjonalność tworzenia i zarządzania wirtualnymi klubami lub drużynami wędkarskimi w aplikacji, z własnymi forami dyskusyjnymi, wewnętrznymi rankingami i planowaniem wspólnych wypraw czy startów w zawodach.
- Interaktywna Mapa Połowów (Heatmapa): Zanonimizowana, agregująca dane mapa pokazująca ogólne trendy i "gorące" miejsca połowów (wymagająca zgody użytkowników na udostępnianie zanonimizowanych danych lokalizacyjnych połowów).

#### 🔗 Integracja z Ekosystemem Wędkarskim i IoT:

- Zaawansowana Integracja Pogodowa: Szczegółowe dane pogodowe dla lokalizacji łowisk (temperatura wody, ciśnienie atmosferyczne, kierunek i siła wiatru, nasłonecznienie) oraz alerty pogodowe.
- Kalendarz Brań i Fazy Księżyca: Zintegrowany, konfigurowalny kalendarz brań oparty o różne teorie i fazy księżyca.
- Zgłaszanie Stanu Wody i Środowiska: Możliwość zgłaszania przez użytkowników i przeglądania informacji o stanie wody (np. przejrzystość, poziom), zanieczyszczeniach, zakwitach glonów czy innych ważnych czynnikach środowiskowych na łowiskach.
- (Opcjonalnie) Integracja z Urządzeniami Zewnętrznymi: Możliwość importu danych z popularnych urządzeń wędkarskich (np. logi z echosond, dane z smartwatchy dotyczące aktywności).

#### 📚 Edukacja, Bezpieczeństwo i Odpowiedzialne Wędkarstwo:

- Rozbudowana Baza Wiedzy: Interaktywna encyklopedia gatunków ryb (z dokładnymi opisami, zdjęciami, mapami występowania, okresami i wymiarami ochronnymi obowiązującymi w różnych regionach/wodach PZW), technik połowu, sprzętu, przynęt.
- Moduł Zgłaszania Nieprawidłowości: Dedykowany system zgłaszania przypadków kłusownictwa, zanieczyszczenia wód, czy innych nielegalnych działań, z możliwością (za zgodą użytkownika) przekazania informacji odpowiednim służbom (np. PSR, WIOŚ) lub organizacjom (np. PZW).
- Promowanie Zasad "Złów i Wypuść" (Catch & Release): Specjalne oznaczenia dla wędkarzy i zawodów promujących C&R, dedykowane rankingi C&R, materiały edukacyjne na temat prawidłowego obchodzenia się z rybami.
- Lokalne Regulaminy i Przepisy: Dostęp do aktualnych regulaminów amatorskiego połowu ryb (RAPR PZW) oraz specyficznych regulaminów dla poszczególnych łowisk (jeśli dostępne).

#### 🌐 Funkcjonalności Offline i Dostępność:

- Tryb Offline dla Kluczowych Funkcji: Możliwość dodawania wpisów do osobistego dziennika połowów, przeglądania pobranych wcześniej danych o łowiskach i gatunkach ryb bez dostępu do internetu, z automatyczną synchronizacją danych po odzyskaniu połączenia.
- Ułatwienia Dostępu (Accessibility): Dalsze prace nad zapewnieniem zgodności z WCAG dla osób z niepełnosprawnościami.

#### 💰 Zaawansowane Opcje Monetyzacji (jeśli aplikacja ma generować przychód):

- Konta Premium (Subskrypcje): Wprowadzenie płatnych kont premium oferujących dodatkowe korzyści, np. zaawansowane statystyki i analizy, nielimitowane miejsce na zdjęcia, brak reklam (jeśli takowe się pojawią w wersji darmowej), wcześniejszy dostęp do nowych funkcji, ekskluzywne odznaki.
- Płatne Promowanie: Możliwość płatnego wyróżniania zawodów, łowisk komercyjnych, sklepów wędkarskich czy usług przewodników wędkarskich w dedykowanych sekcjach aplikacji.
- Marketplace Wędkarski: Stworzenie wewnątrz aplikacji bezpiecznej platformy do handlu nowym i używanym sprzętem wędkarskim, rękodziełem (np. przynęty) lub usługami (np. rezerwacja miejsc u przewodników wędkarskich).

---

> Projekt przygotowany przez [Bartosz Świerzewski]
> Kontakt: [swierzewski.bartosz@gmail.com]
