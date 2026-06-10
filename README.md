# projekt BookVerse

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
## Ihor Kaniuk




Cześć! To mój raport z tego, jak razem z Igorem (moim partnerem od frontendu) poskładaliśmy ten projekt w całość. To było niezłe wyzwanie, w którym odpowiadałem za backend (Node.js/Express), bazę danych SQLite, wdrożenie (deploy) na platformę Render, a także za to, żeby nasze gałęzie w Git w końcu się dogadały i projekt zadziałał jako jedna spójna aplikacja.

🛠 Co dokładnie zrobiłem
Zaprojektowałem i dostosowałem API: Napisałem logikę serwera i elastycznie dopasowywałem odpowiedzi z backendu do tego, czego akurat potrzebował nasz React.

Skonfigurowałem deploy: Wdrożyłem nasz serwer na platformę Render, zapewniając jego stabilne działanie w sieci.

Połączyłem Express i React Router: Rozwiązałem problem routingu na serwerze, żeby frontend mógł bez problemu działać jako Single Page Application (brak błędów przy odświeżaniu strony).

Rozwiązywałem konflikty w Git: Koordynowałem scalanie kodu (merge), ogarniałem zablokowane pliki bazy danych i synchronizowałem nasze środowiska pracy.

Zarządzałem bazą danych: Odpowiadałem za architekturę SQLite, przeprowadzałem migracje tabel i synchronizowałem dane lokalne z bazą produkcyjną.

😌 Co było najprostsze
Najprostsze okazało się napisanie bazowego szkieletu serwera i podstawowych operacji CRUD dla książek. Logika dodawania, odczytu, usuwania i aktualizacji danych w SQLite za pomocą pakietu better-sqlite3 działała jak w zegarku od samego początku. Stworzenie bazy i jej podłączenie było najbardziej zrozumiałą i najszybszą częścią pracy, która dała nam świetny start.

🤯 Z czym były problemy (i jak je rozwiązałem)
1. Wojna formatów (Obiekty vs Tablice)
Na początku skonfigurowałem backend "profesjonalnie": API zwracało odpowiedzi owinięte w obiekt { sukces: true, dane: [...] }. Okazało się jednak, że frontend Igora oczekiwał czystej tablicy i od razu odpalał na niej metodę .filter(). Przez to React wywalał błąd Uncaught TypeError: e.filter is not a function. Zamiast zmuszać Igora do przepisywania całego frontendu, po prostu dostosowałem format API i cofnąłem go do zwracania czystych tablic.

2. Konflikty Git z plikami tymczasowymi SQLite
Kiedy próbowałem pobrać kod Igora (git pull), Git twardo blokował scalanie. Powód? Tymczasowe pliki systemowe bazy danych (database.sqlite-shm i -wal), które tworzyły się automatycznie. Musiałem ukryć moje lokalne zmiany przez git stash, wymusić usunięcie tych plików w konsoli PowerShell (Remove-Item -Force) i dopiero wtedy bezpiecznie pobrać aktualizacje.

3. Tymczasowe usunięcie warstwy JWT (Zarządzanie endpointami)
Zbudowałem pełny system autoryzacji na backendzie: generowanie tokenów JWT, haszowanie haseł w bazie oraz middleware weryfikujący role (admin/user). Serwer działał zgodnie z założeniami i bezwzględnie blokował niezabezpieczone żądania HTTP błędem 401 Unauthorized. Żeby jednak nie zablokować testowania MVP przed zbliżającym się deadlinem, podjąłem decyzję o kontrolowanym rollbacku architektonicznym. Przebudowałem pliki server.js, books.js oraz schemat SQLite, zdejmując middleware weryfikujące z endpointów API. Zmieniłem logikę kontrolerów tak, by API tymczasowo obsługiwało wszystkie operacje CRUD jako publiczne.

4. Konfiguracja routingu Express dla aplikacji SPA (Błąd "Cannot GET")
Po wdrożeniu na serwer Render, środowisko produkcyjne Node.js nie potrafiło poprawnie obsłużyć bezpośrednich zapytań o ścieżki, które nie należały do API (np. /add-book). Wynikało to z faktu, że Express oczekiwał konkretnych endpointów i zwracał błąd 404. Naprawiłem to na poziomie logiki serwera, implementując tzw. "catch-all route" (app.get("*", ...)). Dzięki temu backend przechwytuje teraz każde nierozpoznane żądanie HTTP i prawidłowo serwuje plik wejściowy, zamiast wyrzucać błąd braku endpointu.

5. Zarządzanie migracjami SQLite (Rozstrzał między środowiskami)
Zauważyłem, że API na środowisku produkcyjnym ignorowało zapisywanie jednej z wartości przy tworzeniu nowych zasobów. Po analizie backendu zdiagnozowałem problem z niespójnością schematów bazy danych: plik database.sqlite działający na Renderze posiadał przestarzałą architekturę tabel (brakowało kolumny category), podczas gdy u mnie na localhoście migracja struktury DDL już dawno się wykonała. Naprawiłem to, wymuszając aktualizację schematu bazy bezpośrednio na serwerze produkcyjnym, dzięki czemu środowiska zostały zsynchronizowane.

🎯 Podsumowanie
To było niesamowicie pouczające doświadczenie. Najważniejsza lekcja, jaką wyciągnąłem: czasami dla sukcesu projektu o wiele lepiej jest zrezygnować ze skomplikowanej funkcji (jak autoryzacja JWT), aby dowieźć w 100% działający produkt, niż mieć masę idealnego kodu serwerowego, który całkowicie blokuje pracę frontendu. Znaleźliśmy świetny kompromis, pokonaliśmy problemy z synchronizacją, a nasza aplikacja działa teraz szybko i stabilnie!

