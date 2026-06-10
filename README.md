# projekt BookVerse
## Ihor Kaniuk 77372
## Oleksandr Zavoloka 77427
W projekcie BookVerse odpowiadałem głównie za rozwój części frontendowej aplikacji. Moim zadaniem było stworzenie przejrzystego interfejsu użytkownika oraz zapewnienie poprawnej komunikacji pomiędzy frontendem a backendem.

## Zakres wykonanych prac

* Tworzenie i rozwój widoków aplikacji w React
* Implementacja strony głównej z listą książek
* Implementacja strony szczegółów książki
* Stworzenie formularza dodawania nowych książek
* Implementacja wyszukiwania książek po tytule i autorze
* Implementacja sortowania książek
* Dodanie obsługi kategorii książek po stronie interfejsu użytkownika
* Wyświetlanie danych pobieranych z API
* Testowanie działania aplikacji
* Współpraca przy integracji frontendu z backendem
* Rozwiązywanie problemów związanych z pobieraniem i wyświetlaniem danych

## Największe wyzwania

Największym wyzwaniem było połączenie frontendu z backendem oraz dostosowanie aplikacji do zmian wprowadzanych podczas rozwoju projektu. W trakcie pracy konieczne było testowanie komunikacji z API, poprawianie błędów oraz dostosowywanie interfejsu do nowych funkcjonalności.

## Czego się nauczyłem

Praca nad projektem pozwoliła mi lepiej poznać React, React Router, pracę z REST API oraz współpracę zespołową przy użyciu Git i GitHub. Zdobyłem również doświadczenie w analizowaniu błędów i rozwiązywaniu problemów pojawiających się podczas tworzenia aplikacji internetowych.

## Podsumowanie

Udział w projekcie pozwolił mi zdobyć praktyczne doświadczenie w tworzeniu nowoczesnych aplikacji webowych. Dzięki współpracy z partnerem udało się stworzyć funkcjonalną aplikację do zarządzania i przeglądania książek.


## Raport z realizacji projektu ReaderHub


Niniejszy dokument stanowi podsumowanie mojego wkładu w rozwój aplikacji BookVerse, realizowanej we współpracy z Igorem, odpowiedzialnym za warstwę frontendową. Moje zadania skupiały się na architekturze backendowej (Node.js/Express), zarządzaniu bazą danych (SQLite), wdrażaniu aplikacji na środowisko produkcyjne (Render) oraz nadzorze nad spójnością repozytorium Git.

## Zakres zrealizowanych zadań
Projektowanie i adaptacja API: Opracowałem logikę serwerową, zapewniając elastyczność i kompatybilność odpowiedzi API z wymaganiami komponentów React.

Konfiguracja środowiska produkcyjnego (Deploy): Wdrożyłem aplikację na platformę Render, gwarantując jej stabilną i ciągłą dostępność w sieci.

Integracja Express.js z React Router: Skonfigurowałem routing po stronie serwera, umożliwiając bezbłędne działanie aplikacji typu Single Page Application (SPA), eliminując błędy nawigacji przy odświeżaniu strony.

Zarządzanie systemem kontroli wersji (Git): Koordynowałem proces scalania gałęzi (merge), skutecznie rozwiązując konflikty plików konfiguracyjnych i systemowych.

Zarządzanie relacyjną bazą danych: Odpowiadałem za architekturę SQLite, optymalizację zapytań, realizację migracji tabel oraz synchronizację środowiska lokalnego z produkcyjnym.




## Rozwiązane problemy architektoniczne
1. Niespójność formatów danych (Obiekty vs Tablice)
Początkowo API zostało zaprojektowane zgodnie z dobrymi praktykami REST, zwracając dane w strukturyzowanych obiektach (np. { sukces: true, dane: [...] }). Aplikacja kliencka oczekiwała jednak czystych tablic, co prowadziło do błędu Uncaught TypeError: e.filter is not a function. Aby uniknąć konieczności głębokiego refaktoryzowania kodu frontendowego, zmodyfikowałem formatowanie odpowiedzi po stronie serwera, dostosowując je bezpośrednio do wymagań interfejsu.

2. Konflikty systemu Git z plikami tymczasowymi SQLite
Podczas synchronizacji repozytorium (git pull), proces scalania był trwale blokowany przez automatycznie generowane pliki dziennika bazy danych (database.sqlite-shm i -wal). Rozwiązanie wymagało tymczasowego odłożenia modyfikacji (git stash) oraz wymuszonego usunięcia procesów blokujących za pomocą powłoki PowerShell (Remove-Item -Force), co umożliwiło bezpieczną aktualizację bazy kodu.

3. Tymczasowe wyłączenie warstwy autoryzacji JWT (Zarządzanie endpointami)
Zaimplementowałem kompletny system zabezpieczeń oparty na tokenach JWT oraz middleware weryfikujący role użytkowników. Serwer funkcjonował poprawnie, odrzucając nieautoryzowane żądania błędem 401 Unauthorized. Ze względu na opóźnienia w implementacji formularzy logowania po stronie klienta, podjąłem decyzję o kontrolowanym rollbacku architektonicznym. Usunąłem zabezpieczenia endpointów w plikach konfiguracyjnych i zmieniłem logikę kontrolerów tak, by API tymczasowo przetwarzało operacje CRUD jako żądania publiczne, co umożliwiło sprawne przetestowanie wersji MVP przed terminem oddania projektu.

4. Konfiguracja routingu Express dla SPA (Błąd "Cannot GET")
Po wdrożeniu na środowisko produkcyjne (Render), serwer Node.js nie potrafił poprawnie obsłużyć bezpośrednich zapytań HTTP kierowanych pod adresy klienckie (np. /add-book), zwracając błąd 404. Problem ten rozwiązałem poprzez wdrożenie reguły typu "catch-all" (app.get("*", ...)). Dzięki temu backend przekierowuje nierozpoznane żądania do głównego pliku index.html, oddając pełną kontrolę nad routingiem aplikacji frontendowej.

5. Utrzymanie spójności migracji SQLite między środowiskami
Zaobserwowałem, że API na środowisku produkcyjnym nie zapisywało danych w polu nowej kategorii. Analiza wykazała niespójność schematów bazy danych: plik z bazą na serwerze Render nie posiadał najnowszej migracji DDL (brak kolumny category), która została już wdrożona na środowisku lokalnym. Rozwiązałem ten problem, wymuszając aktualizację schematu strukturalnego bezpośrednio na maszynie produkcyjnej, przywracając pełną zgodność środowisk.

## Podsumowanie
Realizacja tego projektu była wysoce wartościowym doświadczeniem inżynierskim. Kluczowym wnioskiem z procesu wytwórczego jest zrozumienie, że z perspektywy dostarczenia produktu (MVP), racjonalnym krokiem jest elastyczna rezygnacja z zaawansowanych funkcjonalności (jak autoryzacja JWT) na rzecz stabilnego i w pełni zintegrowanego systemu. Osiągnięty kompromis oraz systematyczne rozwiązywanie problemów synchronizacyjnych pozwoliły na dostarczenie wydajnej, spójnej i poprawnie działającej aplikacji.
