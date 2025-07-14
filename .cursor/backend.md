### **Specyfikacja Funkcjonalna Platformy Wędkarskiej - Wersja MVP**

#### **Funkcje Publiczne (Dostępne dla Każdego Odwiedzającego)**

- **Przeglądanie Kalendarza Zawodów:** Dostęp do publicznej listy nadchodzących, otwartych zawodów wędkarskich.
- **Wyszukiwanie i Filtrowanie:** Możliwość znajdowania zawodów według:
  - Dyscypliny wędkarskiej (np. Spinning, Method Feeder, Karpiowe).
  - Lokalizacji (województwa).
  - Daty.
- **Podgląd Szczegółów Zawodów:** Wyświetlanie pełnych informacji o publicznych zawodach, w tym:
  - Nazwa, data, lokalizacja.
  - Szczegółowy regulamin i harmonogram.
  - Lista zdefiniowanych klasyfikacji i przypisanych do nich nagród.
  - Informacje o wpisowym i statusie płatności (jeśli włączone).
- **Przeglądanie Lig i Cykli Zawodów:**
  - Dedykowana sekcja prezentująca wszystkie aktywne ligi i cykle.
  - Możliwość wyświetlenia strony głównej ligi z jej regulaminem, listą powiązanych zawodów (eliminacji) oraz **dynamicznie aktualizowaną tabelą klasyfikacji generalnej cyklu**.
- **Przeglądanie Wyników na Żywo:** Dostęp (poprzez unikalny link) do publicznej strony wyników zawodów, z możliwością śledzenia postępów w czasie rzeczywistym dla wszystkich zdefiniowanych klasyfikacji.
- **Profile Publiczne Organizatorów i Łowisk:**
  - Każdy organizator i łowisko ma swoją publiczną stronę-wizytówkę.
  - Profil agreguje listę wszystkich powiązanych, publicznych zawodów (nadchodzących i archiwalnych), budując ich historię i markę.

---

#### **👤 Funkcje dla Zarejestrowanych Użytkowników (Wędkarzy)**

- **Personalizowany Panel (Dashboard):** Centralne miejsce podsumowujące aktywność użytkownika.
- **Zarządzanie Profilem:** Możliwość edycji własnego profilu, w tym dodania danych opcjonalnych (data urodzenia, płeć) do automatycznej kwalifikacji w rankingach.
- **Zapisy na Zawody i Płatności Online:**
  - Prosty proces dołączania do otwartych zawodów publicznych.
  - **Integracja z bramką płatności online (np. PayU, Przelewy24):** Jeśli organizator ustawił opłatę wpisową, użytkownik po zapisaniu się jest kierowany do procesu płatności.
  - System automatycznie weryfikuje status płatności i aktualizuje go na liście startowej.
- **Przegląd Aktywności:** Dostęp do spersonalizowanych list:
  - **Nadchodzące starty:** Lista zawodów, w których użytkownik bierze udział, wraz ze statusem opłaty wpisowego.
  - **Historia wyników:** Archiwum wszystkich poprzednich startów i osiągniętych miejsc.
  - **Moje Ligi:** Lista cykli zawodów, w których użytkownik bierze udział, z szybkim podglądem jego aktualnej pozycji w klasyfikacji generalnej.
  - **Zawody organizowane i sędziowane.**
- **System Powiadomień:**
  - Automatyczne powiadomienia e-mail (i opcjonalnie w aplikacji) o:
    - Potwierdzeniu zapisu na zawody.
    - Potwierdzeniu dokonania płatności.
    - Przypomnieniu o zbliżających się zawodach.
    - Istotnych zmianach w zawodach (zmiana daty, regulaminu, odwołanie).
    - Opublikowaniu oficjalnych wyników.

---

#### **🛠️ Funkcje dla Organizatorów Zawodów**

- **Tworzenie i Zarządzanie Zawodami:**
  - **Dwa typy zawodów:** Publiczne (widoczne w kalendarzu) i Prywatne (dostęp tylko przez link).
  - **Kompleksowa konfiguracja:** Nazwa, data, lokalizacja, format (indywidualny/drużynowy), opis, regulamin, harmonogram.
  - **Zarządzanie Wpisowym:** Możliwość zdefiniowania kwoty wpisowego i **aktywowania płatności online** dla swoich zawodów. Organizator ma wgląd w status płatności każdego uczestnika.
- **Elastyczne Zarządzanie Klasyfikacjami:**
  - Tworzenie **dowolnej liczby niezależnych rankingów** w ramach jednych zawodów.
  - Wybór logiki dla każdej klasyfikacji, np.:
    - Suma wag lub długości wszystkich ryb.
    - Suma wag/długości **X** największych ryb.
    - Największa/najdłuższa ryba zawodów.
    - Największa ryba **konkretnego gatunku**.
    - Rankingi ograniczone do kategorii (np. "Najlepsza Kobieta", "Najlepszy Junior U18").
- **Strukturyzowane Zarządzanie Nagrodami i Sponsorami:**
  - Możliwość dodania opisu nagrody (pieniężna, rzeczowa, voucher), jej wartości oraz **powiązania jej z konkretnym sponsorem**, którego logo i nazwa będą widoczne przy nagrodzie.
- **Zarządzanie Uczestnikami i Rolami:**
  - Akceptowanie zapisów, ręczne dodawanie gości bez konta w systemie.
  - Przypisywanie roli **Sędziego** innym użytkownikom (organizator domyślnie posiada uprawnienia sędziego).
- **Zarządzanie Ligami i Cyklami Zawodów:**
  - Możliwość **tworzenia nowego cyklu/ligi**, definiując jej nazwę, regulamin i logo.
  - Możliwość **łączenia wielu zawodów** (istniejących lub przyszłych) w jeden cykl.
  - **Definiowanie systemu punktacji generalnej:** Organizator decyduje, jak punkty są przyznawane w lidze (np. punkty za zajęte miejsce w zawodach eliminacyjnych, suma punktów z najlepszych startów).
  - System automatycznie oblicza i prezentuje tabelę generalną ligi na podstawie wyników z zakończonych zawodów w cyklu.

---

#### **⚖️ Funkcje dla Sędziów (Wagowych)**

- **Dostęp do Panelu Sędziowskiego:** Specjalny, uproszczony interfejs dostępny tylko na czas trwania zawodów, do których sędzia został przypisany.
- **Rejestracja Połowów:** Prosty w obsłudze formularz do zapisywania wyników osiągniętych przez uczestników.
- **Wprowadzanie Danych Ryby:** Możliwość dodania wagi i/lub długości, gatunku oraz opcjonalnego zdjęcia jako dowodu. Wprowadzone dane **natychmiast i automatycznie** aktualizują wszystkie powiązane tabele wyników.

---

#### **🏆 Zarządzanie Wynikami i Rankingami**

- **Dynamiczna Strona Wyników:** Automatyczne generowanie osobnej tabeli wyników dla **każdej** zdefiniowanej przez organizatora klasyfikacji.
- **Przełączanie Widoków:** Łatwe przełączanie się między poszczególnymi rankingami (np. "Klasyfikacja Generalna", "Największa Ryba", "Ranking Juniorów") w obrębie jednych zawodów.
- **Transparentność Wyników:** Czytelne przedstawienie informacji o zwycięzcach i przypisanych im nagrodach (wraz z informacją o sponsorze) w każdej klasyfikacji.
