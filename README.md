# 🐟 Fishio — Nowoczesna Platforma dla Organizatorów Zawodów 🎣

> Budujemy społeczność 👥, upraszczamy organizację ⚙️, celebrujemy zwycięstwa 🏆.

**Fishio** to nowoczesna platforma webowa, zoptymalizowana pod kątem urządzeń mobilnych, służąca do kompleksowej organizacji i uczestnictwa w zawodach wędkarskich. Niezależnie od tego, czy organizujesz duże, komercyjne wydarzenie, **wieloetapową ligę z punktacją generalną**, czy po prostu nieformalne spotkanie z przyjaciółmi nad wodą, Fishio dostarcza wszystkich narzędzi potrzebnych do łatwej organizacji, rejestracji, **pobierania opłat** i śledzenia wyników na żywo.

## Spis Treści

1.  [Kluczowe Pojęcia (Słownik Domenowy)](#kluczowe-pojęcia-słownik-domenowy)
2.  [Architektura Logiki Biznesowej](#architektura-logiki-biznesowej-buduj-raz-używaj-wielokrotnie)
3.  [Jak to działa?](#jak-to-działa)
4.  [Uniwersalny Kreator Szablonów Klasyfikacji](#uniwersalny-kreator-szablonów-klasyfikacji)
5.  [Zaawansowana Struktura Rywalizacji](#zaawansowana-struktura-rywalizacji-ligi-sektory-i-drużyny)
6.  [Główne Funkcjonalności](#główne-funkcjonalności)
7.  [Role użytkowników](#role-użytkowników--elastyczny-model-ról)
8.  [Stos Technologiczny](#stos-technologiczny)
9.  [Kierunki dalszego rozwoju](#kierunki-dalszego-rozwoju)

## Kluczowe Pojęcia (Słownik Domenowy)

- **System Punktowy:** Niezależny, reużywalny zbiór reguł przeliczania połowów na punkty (np. punkty/kg dla danego gatunku). Użytkownik tworzy własną bibliotekę systemów punktowych.
- **Szablon Klasyfikacji:** Reużywalna, kompletna definicja rankingu. Składa się ze Źródła Danych, Sposobu Agregacji, Filtrów oraz opcjonalnych Zasad Rozstrzygania Remisów. Może (ale nie musi) wykorzystywać System Punktowy.
- **Klasyfikacja (w Zawodach):** Konkretna instancja _Szablonu Klasyfikacji_ przypisana do danych zawodów. Jest to "żyjący" ranking w ramach jednego wydarzenia.

## 🧠 Architektura Logiki Biznesowej: Buduj raz, używaj wielokrotnie

W Fishio stawiamy na elastyczność i oszczędność Twojego czasu. Zamiast konfigurować wszystko od zera przy każdych zawodach, dajemy Ci narzędzia do budowania **reużywalnych komponentów**:

1.  **Menedżer Systemów Punktowych:** W osobnym module tworzysz i zarządzasz własną biblioteką systemów punktacji (np. "Punktacja PZW Mazowsze", "Punkty za drapieżniki").
2.  **Kreator Szablonów Klasyfikacji:** W dedykowanym kreatorze budujesz szablony klasyfikacji (np. "Suma Wag", "Top 3 Juniorów", "Punktacja za Gatunki"), wykorzystując m.in. stworzone wcześniej systemy punktowe.
3.  **Konfigurator Zawodów:** Podczas tworzenia nowych zawodów, skupiasz się już tylko na podstawowych informacjach (data, miejsce, regulamin), a następnie **jednym kliknięciem dodajesz gotowe klasyfikacje z Twojej biblioteki szablonów**.

Dzięki temu podejściu organizacja kolejnych, podobnych wydarzeń staje się błyskawiczna.

## 🎯 Jak to działa?

Przepływ informacji i interakcji w Fishio został zaprojektowany tak, aby był intuicyjny i efektywny.

1.  **Utworzenie Zawodów:** Organizator tworzy nowe zawody, konfigurując podstawowe szczegóły: nazwę, datę i regulamin. Następnie **wybiera z biblioteki gotowe szablony klasyfikacji**, które będą obowiązywać w danym wydarzeniu (np. "Największa Ryba", "Suma Wag", "Top 5 Spinning").
2.  **Udostępnienie Linku:** System generuje unikalny, publiczny link do strony zawodów. Organizator może go udostępnić na forach internetowych, w mediach społecznościowych lub wysłać bezpośrednio do zainteresowanych.
3.  **Zapisy Uczestników:** Każdy, kto otrzyma link, może wejść na stronę zawodów i dołączyć do listy startowej. Jeśli zawody są płatne, system automatycznie przekieruje uczestnika do bramki płatności.
4.  **Zarządzanie Zgłoszeniami:** Organizator ma pełną kontrolę nad listą uczestników. Może akceptować lub odrzucać zgłoszenia oraz na bieżąco monitorować status płatności.
5.  **Wyznaczenie Sędziów:** Organizator może nadać uprawnienia sędziego wybranym użytkownikom, którzy uzyskują dostęp do panelu rejestracji połowów.
6.  **Rejestracja Połowów:** W trakcie zawodów, tylko organizator i wyznaczeni sędziowie mogą dodawać ryby do systemu za pomocą prostego formularza na urządzeniu mobilnym.
7.  **Wyniki na Żywo:** Wszystkie zarejestrowane połowy natychmiast aktualizują tabele wyników. Każdy może śledzić rywalizację w czasie rzeczywistym, przełączając się między aktywnymi klasyfikacjami.

## ⚙️ Uniwersalny Kreator Szablonów Klasyfikacji

W Fishio tworzenie klasyfikacji to nie jednorazowa czynność, a inwestycja. W dedykowanym kreatorze budujesz **reużywalne szablony klasyfikacji**, które tworzą Twoją osobistą bibliotekę.

### 🧩 Jak działa kreator szablonów?

Każdy szablon klasyfikacji powstaje z **czterech podstawowych elementów**, które możesz dowolnie kombinować:

#### **1. 📊 Źródło Danych** — Co liczymy?

- **Waga ryb** — klasyczne podejście wagowe
- **Długość ryb** — idealne dla drapieżników
- **Liczba ryb** — kto złowił najwięcej
- **Liczba gatunków** — różnorodność połowów
- **Punkty** — zaawansowane systemy punktowe

#### **2. 🎯 Agregacja** — Jak obliczamy wynik?

- **Suma** — zsumuj wszystkie wartości
- **Maksimum** — znajdź największą wartość
- **Top X** — suma X największych (np. Największe 3, Największe 5)
- **Średnia** — jakość zamiast ilości
- **Najbliższy celowi** — Lucky Weight i podobne
- **Liczba** — po prostu policz elementy

#### **3. 🔍 Filtry** — Które ryby/uczestnicy się liczą?

- **Gatunek ryby** — tylko określone gatunki
- **Przedział czasowy** — Golden Hour, pierwsze 2h zawodów
- **Wiek uczestnika** — juniorzy, seniorzy, niestandardowe zakresy
- **Płeć** — kobiety, mężczyźni
- **Minimalna waga/długość** — tylko większe ryby

#### **4. 🧮 System Punktowy — Wybór z biblioteki**

Klasyfikacje punktowe wykorzystują **reużywalne Systemy Punktowe**, które tworzysz i przechowujesz w osobnej bibliotece. Tutaj po prostu wybierasz odpowiedni z listy.

_Przykład Systemu Punktowego o nazwie "Klasyk Karpiowy":_

- karp → 5 pkt / 1 kg
- karaś → 3 pkt / 1 kg
- szczupak → −5 pkt / 1 kg

### 🎨 Przykłady szablonów, które możesz stworzyć

**🔥 Szablon "Klasyka":**

> Źródło: Waga → Agregacja: Suma → Filtry: brak
> **Rezultat:** "Suma wag wszystkich ryb"

**🏅 Szablon "Big 3 Karpi":**

> Źródło: Waga → Agregacja: Top 3 → Filtry: Gatunek=Karp
> **Rezultat:** "Suma wag 3 największych karpi"

**⭐ Szablon "Panie Senior":**

> Źródło: Waga → Agregacja: Suma → Filtry: Płeć=Kobieta + Wiek≥55
> **Rezultat:** "Suma wag dla kobiet powyżej 55 lat"

**🌅 Złota Godzina:**

> Źródło: Waga → Agregacja: Maksimum → Filtry: Czas=12:00-13:00 → Zakres: Indywidualny  
> **Rezultat:** "Największa ryba złowiona w południe"

**🎣 Spinning Master:**

> Źródło: Waga → Agregacja: Top 5 → Filtry: Metoda=Spinning + MinWaga=1000g → Zakres: Indywidualny  
> **Rezultat:** "Top 5 ryb spinningiem, minimum 1kg każda"

### 💡 Jak korzystać z kreatora szablonów? — Proste jak składanie klocków

**Krok 1:** Wejdź do modułu "Moje Szablony Klasyfikacji" i kliknij "Stwórz nowy".
**Krok 2:** Nazwij swój szablon (np. "Top 5 Drapieżników Spinning").
**Krok 3:** Złóż go z klocków: wybierz **źródło danych**, **sposób agregacji** i dodaj **filtry**.
**Krok 4:** Jeśli wybrałeś punkty jako źródło, wybierz z listy jeden z Twoich **systemów punktowych**.
**Krok 5:** Zapisz. Od teraz ten szablon jest dostępny do użycia w każdych zawodach, które stworzysz!

### 🚀 Twoja wyobraźnia = jedyne ograniczenie

Dzięki kreatorowi szablonów możesz:

- **Stworzyć bibliotekę** idealnie dopasowaną do Twoich potrzeb.
- **Kopiować i modyfikować** istniejące szablony, tworząc ich warianty.
- **Eksperymentować** z nowymi, kreatywnymi klasyfikacjami, które zaskoczą uczestników.

### ⚖️ Rozstrzyganie Remisów — Precyzyjne Zasady Sprawiedliwości

Co w sytuacji, gdy dwóch zawodników ma identyczny wynik? Fishio pozwala na zdefiniowanie **kaskadowego systemu rozstrzygania remisów** dla każdego **Szablonu Klasyfikacji** z osobna. Organizator może ustawić kolejność kryteriów, które będą sprawdzane jedno po drugim, aż do wyłonienia zwycięzcy.

**Przykład konfiguracji dla szablonu "Suma Wag":**
Załóżmy, że dwóch zawodników, Jan i Piotr, uzyskało identyczną sumę wag: 15 kg. System automatycznie sprawdzi kolejne reguły:

1.  **Reguła 1 (pierwszeństwo):** W przypadku remisu w sumie wag, wygrywa zawodnik, który złowił **największą pojedynczą rybę** (wagowo).
    - _Wynik: Największa ryba Jana ważyła 5 kg, a Piotra 4,5 kg. Jan wygrywa._
2.  **Reguła 2 (jeśli Reguła 1 nie rozstrzygnie):** Jeśli nadal jest remis (identyczna suma wag i identyczna waga największej ryby), wygrywa zawodnik, który złowił **większą liczbę ryb**.
    - _Wynik: Obaj złowili po 3 ryby. Remis utrzymany, system przechodzi dalej._
3.  **Reguła 3 (ostateczność):** Jeśli i to nie rozstrzygnie remisu, o wyższym miejscu decyduje **czas zgłoszenia pierwszej ryby** (kto pierwszy, ten lepszy).
    - _Wynik: Jan zgłosił swoją pierwszą rybę o 8:15, a Piotr o 8:30. Jan zajmuje wyższe miejsce._

Dzięki temu systemowi wyniki są zawsze jednoznaczne, a zasady transparentne dla wszystkich uczestników jeszcze przed rozpoczęciem rywalizacji.

## 🏗️ Zaawansowana Struktura Rywalizacji: Ligi, Sektory i Drużyny

Fishio to nie tylko pojedyncze zawody. Platforma oferuje potężne narzędzia do budowania złożonych, wieloetapowych i angażujących struktur rywalizacji, które odzwierciedlają najbardziej wymagające formaty wędkarskie.

### 🏆 Ligi i Cykle Wieloetapowe

Chcesz zorganizować cykl Grand Prix, który potrwa cały sezon? Z Fishio to proste.

1.  **Tworzenie Ligi:** Najpierw tworzysz "kontener" dla swojej ligi, nadając mu nazwę (np. "Puchar Polski w Wędkarstwie Spławikowym 2025"), opisując ogólne zasady i definiując sponsorów całego cyklu.
2.  **Dodawanie Zawodów:** Do stworzonej ligi możesz dodawać poszczególne zawody ("tury" lub "eliminacje"). Mogą być one tworzone na bieżąco w trakcie sezonu.
3.  **Konfiguracja Punktacji Generalnej:** To serce każdej ligi. Ty decydujesz, jak będą liczone punkty do klasyfikacji generalnej:
    - **Punktacja za miejsca:** Przypisuj punkty za zajęte pozycje w każdych zawodach (np. 100 pkt za 1. miejsce, 99 za 2. itd.).
    - **Suma wyników:** Klasyfikacja generalna może być sumą wag lub długości ryb ze wszystkich zawodów cyklu.
    - **Odrzucanie najsłabszych wyników (Drop Results):** Pozwól zawodnikom na jeden słabszy występ. System może automatycznie odrzucić najgorszy wynik z np. 5 tur, co zwiększa rywalizację do samego końca.
4.  **Wyniki na Żywo:** Tabela klasyfikacji generalnej ligi aktualizuje się automatycznie po zakończeniu i zatwierdzeniu wyników każdej tury, zapewniając emocje przez cały sezon.

### 🗺️ Zarządzanie Sektorami i Losowanie Stanowisk

Duże zawody na rozległych łowiskach wymagają podziału na sektory, aby zapewnić równe szanse i ułatwić logistykę.

1.  **Definiowanie Sektorów:** Podczas tworzenia zawodów, możesz włączyć opcję podziału na sektory. Następnie tworzysz je, nadając im nazwy (np. "Sektor A", "Sektor B", "Zatoka Północna").
2.  **Przypisywanie Uczestników:** Masz pełną kontrolę nad tym, kto gdzie łowi:
    - **Losowanie:** Najbardziej sprawiedliwa metoda. Jednym kliknięciem system losowo przydziela zawodników do zdefiniowanych sektorów.
    - **Ręczne przypisanie:** Możesz ręcznie przypisać każdego zawodnika do wybranego sektora, co jest przydatne w specyficznych sytuacjach.
3.  **Losowanie Stanowisk:** Oprócz sektorów, możesz zarządzać konkretnymi, numerowanymi stanowiskami. System pozwala na ich losowanie, a wylosowany numer pojawia się na publicznej liście startowej przy nazwisku zawodnika.
4.  **Wyniki Sektorowe:** Oprócz głównej klasyfikacji generalnej zawodów, system automatycznie tworzy **osobne rankingi dla każdego sektora**. Pozwala to na przyznanie dodatkowych nagród dla "zwycięzców sektorów".

### 🤝 Rywalizacja Drużynowa

Wędkarstwo to także sport zespołowy. Fishio w pełni wspiera rywalizację drużynową.

1.  **Włączenie Trybu Drużynowego:** W ustawieniach zawodów zaznaczasz, że będą one rozgrywane w formacie drużynowym.
2.  **Tworzenie Drużyn:**
    - **Organizator tworzy drużyny:** Możesz samodzielnie zdefiniować składy i przypisać do nich zapisanych uczestników.
    - **Kapitanowie tworzą drużyny:** Możesz pozwolić, aby zawodnicy sami tworzyli drużyny. Jeden z nich zostaje kapitanem, który zaprasza pozostałych członków do swojego zespołu.
3.  **Definiowanie Zasad Punktacji Drużynowej:** Ty decydujesz, jak będzie liczony wynik zespołu:
    - **Suma wyników wszystkich członków:** Prosta suma wag/długości ryb złowionych przez cały zespół.
    - **Suma wyników X najlepszych zawodników:** Bardzo popularna reguła, np. "do wyniku drużyny liczy się suma wag 2 najlepszych zawodników".
    - **Suma punktów za miejsca:** Wynik drużyny to suma punktów sektorowych zdobytych przez jej członków.
4.  **Osobna Klasyfikacja:** Wyniki drużynowe są prezentowane w dedykowanej, osobnej tabeli "Klasyfikacja Drużynowa", która jest aktualizowana na żywo, równolegle do wyników indywidualnych.

## 🌟 Główne Funkcjonalności

### **🌍 Funkcje Publiczne (Dla Każdego Odwiedzającego)**

- **Kalendarz Zawodów i Lig:** Przeglądanie, wyszukiwanie i filtrowanie nadchodzących wydarzeń.
- **Szczegóły Zawodów:** Dostęp do pełnych informacji o zawodach: regulamin, harmonogram, aktywne klasyfikacje, nagrody i sponsorzy.
- **Wyniki na Żywo:** Publiczny dostęp do strony wyników z aktualizacjami w czasie rzeczywistym.
- **Zaawansowane Rankingi:** Automatyczne rozstrzyganie remisów, rankingi dla kategorii i filtrów.
- **Profile Publiczne:** Strony-wizytówki dla organizatorów i łowisk.

### **👤 Funkcje dla Zarejestrowanych Użytkowników (Wędkarzy)**

- **Personalizowany Panel (Dashboard):** Centrum zarządzania aktywnością: nadchodzące starty, historia wyników.
- **Zapisy i Płatności Online:** Prosty proces dołączania do zawodów i bezpieczne płatności.
- **Zarządzanie Profilem:** Edycja danych (np. wiek) do automatycznej kategoryzacji.
- **System Powiadomień:** Automatyczne powiadomienia o kluczowych zdarzeniach.

### **🛠️ Funkcje dla Organizatorów Zawodów**

- **Tworzenie i Zarządzanie Zawodami:** Prosty proces konfiguracji zawodów i dołączania do nich gotowych klasyfikacji z Twojej biblioteki szablonów.
- **Zarządzanie Szablonami Klasyfikacji:** Dedykowany kreator do tworzenia i zarządzania reużywalnymi szablonami klasyfikacji. Budujesz je raz, a potem dodajesz do zawodów jednym kliknięciem.
- **Zarządzanie Systemami Punktowymi:** Osobny moduł do definiowania własnych, reużywalnych systemów punktacji za gatunki, które można później wykorzystać w szablonach klasyfikacji.
- **Zarządzanie Ligami i Cyklami:** Łączenie wielu zawodów w jeden cykl ze wspólną klasyfikacją generalną.
- **Zaawansowane Zarządzanie Uczestnikami:** Pełna kontrola nad listą startową, akceptowanie/odrzucanie zapisów, przypisywanie ról.
- **Zarządzanie Nagrodami i Sponsorami:** Możliwość powiązania nagród i sponsorów z konkretnymi klasyfikacjami.

## 🧑‍🤝‍🧑 Role użytkowników — elastyczny model ról

W Fishio nie przypisujemy stałych ról do użytkowników (np. "sędzia", "organizator", "zawodnik"). Zamiast tego — **rola użytkownika jest kontekstowa i zależna od zawodów**, w których bierze udział.

Rola użytkownika w zawodach zależy od jego relacji z danym wydarzeniem:

| Rola w zawodach | Jak ją uzyskuje użytkownik?                      |
| --------------- | ------------------------------------------------ |
| **Organizator** | Tworzy zawody w systemie                         |
| **Sędzia**      | Zostaje przypisany do zawodów przez organizatora |
| **Zawodnik**    | Dołącza do zawodów poprzez publiczny link        |

Każdy użytkownik może pełnić różne role w różnych zawodach, np.:

- Użytkownik A może być **organizatorem** jednych zawodów,
- a jednocześnie **zawodnikiem** w innych,
- i **sędzią** w jeszcze innych.

Dzięki temu modelowi możliwe jest naturalne odwzorowanie rzeczywistych ról w społeczności wędkarskiej — elastyczne, zależne od kontekstu i zmienne w czasie.

### 🎯 Przykłady:

- **Tomasz** tworzy zawody "Puchar Mazur 2025" → automatycznie staje się ich **organizatorem**.
- **Anna** otrzymuje od Tomasza uprawnienia sędziego → może dodawać połowy uczestników jako **sędzia**.
- **Michał** znajduje link do zawodów i zapisuje się → zostaje dodany do listy oczekujących i w zależności od decyzji organizatora staje się **zawodnikiem** w tych zawodach lub jest odrzucony.
- W tym samym czasie **Michał** może być **organizatorem** innego cyklu zawodów.

### 📋 Szczegółowy opis ról:

- **Organizator:** Posiada pełne uprawnienia do tworzenia i zarządzania zawodami, uczestnikami oraz finansami. Może również pełnić rolę sędziego w swoich zawodach.
- **Sędzia:** Użytkownik wyznaczony przez organizatora, którego głównym zadaniem jest rejestrowanie połowów w trakcie trwania zawodów. Może być sędzią w wielu różnych zawodach jednocześnie.
- **Uczestnik (Zawodnik):** Każdy zarejestrowany użytkownik, który dołączył do konkretnych zawodów, może śledzić swoje wyniki i zarządzać swoim profilem. Ten sam użytkownik może być uczestnikiem wielu zawodów równocześnie.
- **Gość:** Niezarejestrowany uczestnik dodany ręcznie przez organizatora. Bierze pełnoprawny udział w rywalizacji, ale nie posiada dostępu do panelu użytkownika.

## 💻 Stos Technologiczny

### **Backend (.NET 10)**

- **Architektura**: Clean Architecture (Domain, Application, Infrastructure, API)
- **Wzorce**: CQRS z MediatR, Repository Pattern
- **ORM**: Entity Framework Core
- **Baza danych**: PostgreSQL 🐘
- **Autentykacja**: Clerk Integration 🔑
- **API**: Minimal API

### **Frontend (Next.js)**

- **Framework**: Next.js 15+ (App Router) 🖥️
- **Language**: TypeScript
- **UI**: shadcn/ui + TailwindCSS 🎨
- **Zarządzanie Stanem**: Zustand (client), TanStack Query (server) 🧠
- **Formularze**: TanStack Form 📝
- **Mobile-First**: Responsive design

### **Infrastruktura**

- **Hosting Plików**: S3 ☁️
- **Płatności**: Integracja z bramką płatniczą (PayU, Przelewy24) 💳
- **Powiadomienia**: Email + In-app notifications
- **Real-time**: SignalR dla live results

## 🚀 Kierunki dalszego rozwoju

Platforma jest stale rozwijana. Główne kierunki na przyszłość to:

- **Wsparcie dla zawodów drużynowych.**
- **Zarządzanie sektorami i losowanie stanowisk.**
- **Szablony zawodów** do szybkiego tworzenia cyklicznych imprez.
- **Rozbudowane statystyki** dla zawodników i łowisk.
- **Uniwersalny System Klasyfikacji**: Kompozycyjny kreator zamiast predefiniowanych typów — nieograniczone możliwości
- **Inteligentne Filtry**: Łączenie filtrów według gatunku, wieku, płci, metody, czasu, sektora
- **Elastyczne Agregacje**: Suma, maksimum, top X, średnia, lucky weight — wszystko w jednym silniku
- **Smart Templates**: Gotowe szablony najpopularniejszych klasyfikacji z możliwością modyfikacji

### **🏆 Strukturalne Ligi i Cykle**

- **Punktacja Pozycyjna**: Konfiguracja punktów za zajęte miejsca w zawodach
- **Drop Results**: Możliwość odrzucania najsłabszych wyników z klasyfikacji generalnej
- **Wieloetapowe Cykle**: Łączenie zawodów w ligi z automatyczną punktacją
- **Dynamiczne Tabele**: Real-time aktualizacja klasyfikacji generalnej

### **📁 Centralne Zarządzanie Mediami**

- **Attachment System**: Ujednolicone zarządzanie zdjęciami, logami i dokumentami
- **Automatyczne Metadane**: Tytuły, opisy, rozmiary plików, typy MIME
- **Cloudinary Integration**: Optymalizacja i transformacja obrazów
- **Bezpieczne Przechowywanie**: Kontrola dostępu i auditing

### **🏠 Zaawansowane Profile Łowisk**

- **Address Value Objects**: Strukturalne dane adresowe z walidacją
- **GPS Coordinates**: Precyzyjne lokalizacje z mapami
- **Profile Właścicieli**: Historia i reputacja łowisk
- **Agregacja Wydarzeń**: Wszystkie zawody na danym łowisku

### **💰 Kompleksowy System Płatności**

- **Multi-Gateway Support**: PayU, Przelewy24, Stripe
- **Status Tracking**: Real-time śledzenie statusu płatności
- **Automatic Confirmation**: Automatyczne potwierdzanie uczestnictwa po płatności
- **Refund Support**: Obsługa zwrotów i anulowań

### **🔔 Inteligentny System Powiadomień**

- **Multi-Channel**: Email + in-app notifications
- **Event-Driven**: Automatyczne powiadomienia o kluczowych wydarzeniach
- **Personalizacja**: Konfigurowane preferencje użytkowników
- **Rich Content**: Powiadomienia z linkami do powiązanych zasobów

## 🚀 Dalszy Rozwój (Roadmap)

Fishio będzie stale rozwijane. Po udostępnieniu wersji MVP, skupimy się na kolejnych funkcjach:

- ➡️ **Zaawansowane Profile Społecznościowe:** Możliwość dodawania znajomych, tworzenia grup i śledzenia ich aktywności.
- ➡️ **Integracje z Mediami Społecznościowymi:** Automatyczne generowanie i udostępnianie grafik z wynikami i listami startowymi.
- ➡️ **System Rezerwacji Stanowisk:** Moduł dla właścicieli łowisk do zarządzania rezerwacjami poza zawodami.
- ➡️ **Zaawansowany Moduł Sponsoringu:** Dedykowane panele dla sponsorów ze statystykami i możliwościami promocyjnymi.
