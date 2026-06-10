#  BookVerse

BookVerse to aplikacja internetowa inspirowana serwisami do katalogowania książek, takimi jak LubimyCzytać. Projekt umożliwia przeglądanie książek, wyszukiwanie ich, filtrowanie według kategorii oraz wyświetlanie szczegółowych informacji o wybranej pozycji.

---

## Funkcjonalności

### Książki

* Wyświetlanie listy wszystkich książek
* Podgląd szczegółów książki
* Dodawanie nowych książek
* Sortowanie książek (od najnowszych i najstarszych)
* Wyszukiwanie książek po tytule i autorze

### Kategorie

* Przypisywanie kategorii do książek
* Wyświetlanie kategorii na liście książek
* Wyświetlanie kategorii w szczegółach książki
* Filtrowanie książek według kategorii

### Backend

* REST API oparte na Express.js
* Baza danych SQLite
* Operacje CRUD dla książek
* Obsługa komentarzy i ocen
* System użytkowników oraz autoryzacji JWT

---

## 🛠 Technologie

### Frontend

* React
* React Router
* JavaScript (ES6+)
* CSS

### Backend

* Node.js
* Express.js
* SQLite
* better-sqlite3
* JWT (JSON Web Token)
* bcryptjs

### Narzędzia

* Git
* GitHub
* Render

---

##  Struktura aplikacji

### Home Page

Lista wszystkich książek wraz z wyszukiwaniem, sortowaniem i filtrowaniem.

### Book Details Page

Szczegółowe informacje o książce, autorze, kategorii oraz dodatkowych danych.

### Add Book Page

Formularz dodawania nowych książek.

### Authors Page

Informacje o autorach książek.

---

##  Mój wkład (Frontend)

Byłem odpowiedzialny głównie za warstwę frontendową aplikacji:

* Tworzenie komponentów React
* Implementację routingu w React Router
* Stworzenie strony głównej z listą książek
* Stworzenie strony szczegółów książki
* Stworzenie formularza dodawania książek
* Implementację wyszukiwania książek
* Implementację sortowania książek
* Implementację kategorii po stronie interfejsu użytkownika
* Wyświetlanie danych pobieranych z API
* Testowanie komunikacji frontend ↔ backend
* Naprawianie błędów związanych z renderowaniem danych

---

##  Wkład partnera (Backend)

Mój partner odpowiadał za część backendową projektu:

* Projektowanie i implementację REST API
* Tworzenie oraz konfigurację bazy danych SQLite
* Implementację operacji CRUD
* Tworzenie migracji bazy danych
* Implementację systemu użytkowników
* Implementację autoryzacji JWT
* Zarządzanie rolami użytkowników (admin/user)
* Wdrożenie aplikacji na platformę Render
* Rozwiązywanie problemów związanych z Git oraz synchronizacją projektu

---

##  Największe wyzwania

Podczas realizacji projektu napotkaliśmy kilka problemów:

* Synchronizacja pracy frontendu i backendu
* Konflikty Git podczas scalania zmian
* Integracja React z REST API
* Migracje bazy danych SQLite
* Konfiguracja routingu dla aplikacji typu SPA
* Zarządzanie środowiskiem lokalnym i produkcyjnym

Dzięki współpracy udało się rozwiązać wszystkie kluczowe problemy i stworzyć działającą aplikację.

---

##  Możliwe dalsze rozszerzenia

* Rozbudowany system komentarzy
* Rozbudowany system ocen książek
* Pełna integracja logowania i rejestracji użytkowników w interfejsie frontendowym
* Panel administratora
* Edycja i usuwanie książek przez administratora
* Zdjęcia okładek książek
* Profile użytkowników

---

##  Autorzy

Projekt został wykonany w ramach zajęć akademickich na Uniwersytecie Vistula.

Frontend: Igor
Backend: Partner projektu
