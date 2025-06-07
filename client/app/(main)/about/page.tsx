'use client';

import { APP_VERSION, BUILD_DATE } from '@/lib/appVersion';
import { format, isValid, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { FileText, GitCommit, Info, Mail, Users } from 'lucide-react';
// Usunąłem Shield, bo nie był używany
import Link from 'next/link';

// Import polskiej lokalizacji

import { useGetApplicationInformation } from '@/lib/api/endpoints/about';

// Style (zakładamy, że są zdefiniowane globalnie)
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';
const sectionHeaderBgClass = 'bg-secondary';
const sectionHeaderTextColorClass = 'text-secondary-foreground';

export default function AboutPage() {
  const { data } = useGetApplicationInformation();

  const formatDateWithFns = (dateInput: string | Date | undefined | null): string => {
    if (!dateInput) {
      return 'Nieznana';
    }

    try {
      // Jeśli dateInput jest stringiem, próbujemy go sparsować jako ISO date.
      // Jeśli jest już obiektem Date, parseISO go zwróci.
      const dateObject = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;

      if (!isValid(dateObject)) {
        console.warn('Invalid date provided to formatDateWithFns:', dateInput);
        return 'Nieprawidłowa data';
      }
      // Formatowanie: 'dd LLLL yyyy, HH:mm' da np. "18 maja 2025, 21:52"
      return format(dateObject, 'dd LLLL yyyy, HH:mm', { locale: pl });
    } catch (error) {
      console.error('Error formatting date with date-fns:', dateInput, error);
      return 'Błąd formatowania daty';
    }
  };

  const buildDateFormatted = formatDateWithFns(BUILD_DATE);
  const apiBuildDateFormatted = formatDateWithFns(data?.buildInfo?.buildTimestamp);

  return (
    <>
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <Info className={`mx-auto h-16 w-16 mb-4 text-primary`} />
          <h1 className={`text-3xl font-bold ${cardTextColorClass}`}>O Aplikacji Fisho</h1>
          <p className={`mt-2 text-lg ${cardMutedTextColorClass}`}>Wszystko, co musisz wiedzieć o naszej platformie.</p>
        </div>

        <section>
          <div
            className={`flex items-center space-x-2 rounded-t-lg p-3 ${sectionHeaderBgClass} ${sectionHeaderTextColorClass}`}
          >
            <GitCommit className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Wersja Aplikacji</h2>
          </div>
          <div
            className={`p-4 sm:p-6 border-x border-b rounded-b-lg ${cardBodyBgClass} ${cardTextColorClass} space-y-2 text-sm`}
          >
            <p>
              <strong>Aktualna Wersja (SHA):</strong> {APP_VERSION || 'Nieznana'}
            </p>
            <p>
              <strong>Data Buildu:</strong> {buildDateFormatted}
            </p>
            <p>
              <strong>Aktualna Wersja API (SHA):</strong> {data?.buildInfo?.gitSha || 'Nieznana'}
            </p>
            <p>
              <strong>Data Buildu API:</strong> {apiBuildDateFormatted}
            </p>
            <p>Dziękujemy za korzystanie z Fisho!</p>
          </div>
        </section>

        <section>
          <div
            className={`flex items-center space-x-2 rounded-t-lg p-3 ${sectionHeaderBgClass} ${sectionHeaderTextColorClass}`}
          >
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Kluczowe Funkcje</h2>
          </div>
          <div className={`p-4 sm:p-6 border-x border-b rounded-b-lg ${cardBodyBgClass} ${cardTextColorClass} text-sm`}>
            <ul className="list-disc list-inside space-y-1">
              <li>Organizowanie i zarządzanie zawodami wędkarskimi.</li>
              <li>Uczestnictwo w zawodach otwartych i zamkniętych.</li>
              <li>Prowadzenie osobistego dziennika połowów ze zdjęciami.</li>
              <li>Odkrywanie i zarządzanie informacjami o łowiskach.</li>
              <li>Śledzenie wyników i rankingów.</li>
            </ul>
          </div>
        </section>

        <section>
          <div
            className={`flex items-center space-x-2 rounded-t-lg p-3 ${sectionHeaderBgClass} ${sectionHeaderTextColorClass}`}
          >
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Przydatne Linki</h2>
          </div>
          <div
            className={`p-4 sm:p-6 border-x border-b rounded-b-lg ${cardBodyBgClass} ${cardTextColorClass} space-y-2 text-sm`}
          >
            <p>
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Polityka Prywatności
              </Link>{' '}
              (placeholder)
            </p>
            <p>
              <Link href="/terms-of-service" className="text-primary hover:underline">
                Regulamin Usługi
              </Link>{' '}
              (placeholder)
            </p>
          </div>
        </section>

        <section>
          <div
            className={`flex items-center space-x-2 rounded-t-lg p-3 ${sectionHeaderBgClass} ${sectionHeaderTextColorClass}`}
          >
            <Mail className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Kontakt</h2>
          </div>
          <div className={`p-4 sm:p-6 border-x border-b rounded-b-lg ${cardBodyBgClass} ${cardTextColorClass} text-sm`}>
            <p>Masz pytania lub sugestie? Skontaktuj się z nami:</p>
            <p className="mt-1">
              <a href="mailto:swierzewski.bartosz@gmail.com" className="text-primary hover:underline">
                swierzewski.bartosz@gmail.com
              </a>
            </p>
            <p className={`mt-2 text-xs ${cardMutedTextColorClass}`}>(Odpowiemy najszybciej jak to możliwe)</p>
          </div>
        </section>
      </div>
    </>
  );
}
