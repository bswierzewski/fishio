# 🐟 Fishio — Nowoczesna Platforma dla Organizatorów Zawodów 🎣

> Budujemy społeczność 👥, upraszczamy organizację ⚙️, celebrujemy zwycięstwa 🏆.

**Fishio** to nowoczesna platforma webowa, zoptymalizowana pod kątem urządzeń mobilnych, służąca do kompleksowej organizacji i uczestnictwa w zawodach wędkarskich. Niezależnie od tego, czy organizujesz duże, komercyjne wydarzenie, **wieloetapową ligę z punktacją generalną**, czy po prostu nieformalne spotkanie z przyjaciółmi nad wodą, Fishio dostarcza wszystkich narzędzi potrzebnych do łatwej organizacji, rejestracji, **pobierania opłat** i śledzenia wyników na żywo.

## 🎯 Jak to działa?

Przepływ informacji i interakcji w Fishio został zaprojektowany tak, aby był intuicyjny zarówno dla organizatorów, jak i uczestników.

1.  **Utworzenie Zawodów:** Organizator tworzy nowe zawody, konfigurując wszystkie szczegóły: nazwę, datę, regulamin, opłatę wpisową oraz definiując dowolną liczbę klasyfikacji (np. "Największa Ryba", "Suma Wag", "Najlepszy Junior", "Punktacja za gatunki").
2.  **Udostępnienie Linku:** System generuje unikalny, publiczny link do strony zawodów. Organizator może go udostępnić na forach internetowych, w mediach społecznościowych lub wysłać bezpośrednio do zainteresowanych.
3.  **Zapisy Uczestników:** Każdy, kto otrzyma link, może wejść na stronę zawodów i dołączyć do listy startowej. Jeśli zawody są płatne, system automatycznie przekieruje uczestnika do bramki płatności w celu uiszczenia opłaty.
4.  **Zarządzanie Zgłoszeniami:** Organizator ma pełną kontrolę nad listą uczestników. Może akceptować lub odrzucać zgłoszenia oraz na bieżąco monitorować status płatności każdego zawodnika.
5.  **Wyznaczenie Sędziów:** Organizator może nadać uprawnienia sędziego wybranym użytkownikom. Sędziowie uzyskują dostęp do specjalnego panelu umożliwiającego rejestrację połowów.
6.  **Rejestracja Połowów:** W trakcie zawodów, tylko organizator i wyznaczeni sędziowie mogą dodawać ryby do systemu. Robią to za pomocą prostego formularza na urządzeniu mobilnym, wybierając zawodnika z listy i wpisując wagę lub długość ryby.
7.  **Wyniki na Żywo:** Wszystkie zarejestrowane połowy natychmiast aktualizują tabele wyników. Każdy (uczestnik, kibic, organizator) może śledzić rywalizację w czasie rzeczywistym na publicznej stronie wyników, przełączając się między zdefiniowanymi klasyfikacjami.

## 🌟 Główne Funkcjonalności

### **🌍 Funkcje Publiczne (Dla Każdego Odwiedzającego)**

- **Kalendarz Zawodów i Lig:** Przeglądanie, wyszukiwanie i filtrowanie nadchodzących wydarzeń według dyscypliny, lokalizacji i daty.
- **Szczegóły Zawodów:** Dostęp do pełnych informacji o zawodach: regulamin, harmonogram, zdefiniowane klasyfikacje, nagrody i sponsorzy.
- **Wyniki na Żywo:** Publiczny dostęp (przez unikalny link) do strony wyników z aktualizacjami w czasie rzeczywistym.
- **Zaawansowane Rankingi:** Automatyczne rozstrzyganie remisów, rankingi dla kategorii (kobiety, juniorzy) i filtrów gatunków.
- **Profile Publiczne:** Strony-wizytówki dla organizatorów i łowisk, agregujące ich historię i nadchodzące wydarzenia.

### **👤 Funkcje dla Zarejestrowanych Użytkowników (Wędkarzy)**

- **Personalizowany Panel (Dashboard):** Centrum zarządzania aktywnością: nadchodzące starty, historia wyników, obserwowane ligi.
- **Zapisy i Płatności Online:** Prosty proces dołączania do zawodów i bezpieczne płatności online przez zintegrowaną bramkę.
- **Zarządzanie Profilem:** Edycja danych, które mogą być używane do automatycznej kategoryzacji w rankingach (np. wiek).
- **System Powiadomień:** Automatyczne powiadomienia (e-mail + w aplikacji) o potwierdzeniu zapisu, płatności, zbliżających się zawodach czy publikacji wyników.

### **🛠️ Funkcje dla Organizatorów Zawodów**

- **Tworzenie i Zarządzanie Zawodami:** Konfiguracja zawodów publicznych (widocznych w kalendarzu) lub prywatnych (tylko na zaproszenie przez link).
- **Elastyczne Zarządzanie Klasyfikacjami:** Tworzenie **dowolnej liczby niezależnych rankingów** w ramach jednych zawodów (np. suma wag, największa ryba, top 5 ryb, największy leszcz, etc.).
- **Zarządzanie Ligami i Cyklami:** Łączenie wielu zawodów w jeden cykl ze wspólną klasyfikacją generalną i zaawansowanymi zasadami punktacji (np. punkty za miejsca, odrzucanie najsłabszych wyników).
- **Zarządzanie Uczestnikami i Rolami:** Akceptowanie zapisów, ręczne dodawanie gości, przypisywanie roli **Sędziego**.
- **Zarządzanie Nagrodami i Sponsorami:** Możliwość dodania opisu nagrody, jej wartości oraz powiązania jej z konkretnym sponsorem, którego logo będzie widoczne przy nagrodzie.

## 🧑‍🤝‍🧑 Role w Systemie

- **Organizator:** Posiada pełne uprawnienia do tworzenia i zarządzania zawodami, uczestnikami oraz finansami. Może również pełnić rolę sędziego.
- **Sędzia:** Użytkownik wyznaczony przez organizatora, którego głównym zadaniem jest rejestrowanie połowów w trakcie trwania zawodów.
- **Uczestnik (Wędkarz):** Każdy zarejestrowany użytkownik, który może dołączać do zawodów, śledzić swoje wyniki i zarządzać swoim profilem.

## 💻 Stos Technologiczny

### **Backend (.NET 9)**

- **Architektura**: Clean Architecture (Domain, Application, Infrastructure, API)
- **Wzorce**: CQRS z MediatR, Repository Pattern
- **ORM**: Entity Framework Core
- **Baza danych**: PostgreSQL 🐘
- **Autentykacja**: Clerk Integration 🔑
- **API**: Minimal API + Controllers

### **Frontend (Next.js)**

- **Framework**: Next.js 14+ (App Router) 🖥️
- **Language**: TypeScript
- **UI**: shadcn/ui + TailwindCSS 🎨
- **Zarządzanie Stanem**: Zustand (client), TanStack Query (server) 🧠
- **Formularze**: TanStack Form 📝
- **Mobile-First**: Responsive design

### **Infrastruktura**

- **Hosting Plików**: Cloudinary ☁️
- **Płatności**: Integracja z bramką płatniczą (PayU, Przelewy24) 💳
- **Powiadomienia**: Email + In-app notifications
- **Real-time**: SignalR dla live results

## 🚀 Kierunki dalszego rozwoju

Platforma jest stale rozwijana. Główne kierunki na przyszłość to:

- **Wsparcie dla zawodów drużynowych.**
- **Zarządzanie sektorami i losowanie stanowisk.**
- **Szablony zawodów** do szybkiego tworzenia cyklicznych imprez.
- **Rozbudowane statystyki** dla zawodników i łowisk.
- **Tie-Breaking Rules**: Automatyczne rozstrzyganie remisów według konfigurowalnych reguł
- **Elastyczne Metody Obliczania**: Suma wag, długości, największa ryba, top X ryb
- **Kategorie Uczestników**: Automatyczne rankingi dla kobiet, mężczyzn, juniorów, seniorów
- **Filtry Gatunków**: Dedykowane rankingi dla konkretnych gatunków ryb

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
