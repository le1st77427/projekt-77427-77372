/**
 * db/database.js
 * ─────────────────────────────────────────────────────────────────
 * Połączenie z bazą SQLite oraz inicjalizacja schematu.
 *
 * Etapy:
 * Etap 1 – tabela Books
 * Etap 3 – kolumna category (migracja ADD COLUMN)
 * Etap 4 – tabela comments
 * Etap 5 – tabela ratings
 * ─────────────────────────────────────────────────────────────────
 */

"use strict";

const Database = require("better-sqlite3");
const path     = require("path");

const DB_PATH = path.join(__dirname, "..", "database.sqlite");

/** @type {import('better-sqlite3').Database|null} */
let db = null;

// ─────────────────────────────────────────────────────────────────
// Inicjalizacja
// ─────────────────────────────────────────────────────────────────

function initDatabase() {
    db = new Database(DB_PATH, {
        verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
    });

    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    _createTables();
    _runMigrations();
    _seedData(); //

    console.log(`[DB] Połączono z bazą: ${DB_PATH}`);
    console.log("[DB] Schemat zweryfikowany — wszystkie tabele gotowe.");

    return db;
}

// ─────────────────────────────────────────────────────────────────
// DDL
// ─────────────────────────────────────────────────────────────────

function _createTables() {
    // Etap 1 — Books (category dodawana migracją)
    db.exec(`
    CREATE TABLE IF NOT EXISTS Books (
                                       id          INTEGER PRIMARY KEY AUTOINCREMENT,
                                       title       TEXT    NOT NULL,
                                       description TEXT    NOT NULL,
                                       author      TEXT    NOT NULL,
                                       created_at  TEXT    NOT NULL
                                       DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      )
  `);

    // Etap 4 — comments
    db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
                                          id          INTEGER PRIMARY KEY AUTOINCREMENT,
                                          book_id     INTEGER NOT NULL
                                          REFERENCES Books(id) ON DELETE CASCADE,
      author_name TEXT    NOT NULL,
      content     TEXT    NOT NULL,
      created_at  TEXT    NOT NULL
      DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      )
  `);

    // Etap 5 — ratings
    db.exec(`
    CREATE TABLE IF NOT EXISTS ratings (
                                         id      INTEGER PRIMARY KEY AUTOINCREMENT,
                                         book_id INTEGER NOT NULL
                                         REFERENCES Books(id) ON DELETE CASCADE,
      rating  INTEGER NOT NULL
      CHECK (rating >= 1 AND rating <= 5)
      )
  `);
}

// ─────────────────────────────────────────────────────────────────
// Migracje
// ─────────────────────────────────────────────────────────────────

function _runMigrations() {
    const columns   = db.pragma("table_info(Books)");
    const hasCategory = columns.some((col) => col.name === "category");

    if (!hasCategory) {
        db.exec(`
      ALTER TABLE Books
        ADD COLUMN category TEXT NOT NULL DEFAULT 'Bez kategorii'
    `);
        console.log("[DB] Migracja: dodano kolumnę 'category' do tabeli Books.");
    }
}

// ─────────────────────────────────────────────────────────────────
// Automatyczne zapełnianie bazy (Seeding)
// ─────────────────────────────────────────────────────────────────
function _seedData() {
    // Sprawdzamy, czy w tabeli Books są już jakieś rekordy
    const row = db.prepare("SELECT COUNT(*) AS count FROM Books").get();

    if (row.count === 0) {
        console.log("[DB] Baza danych jest pusta. Dodawanie początkowych książek...");

        const insert = db.prepare(`
      INSERT INTO Books (title, description, author, category)
      VALUES (?, ?, ?, ?)
    `);

        // Dodajemy kilka książek z różnymi kategoriami, żeby aktywować listę rozwijaną
        insert.run("Wiedźmin: Ostatnie życzenie", "Zbiór opowiadań o wiedźminie Geralcie.", "Andrzej Sapkowski", "Fantastyka");
        insert.run("Sherlock Holmes: Studium w szkarłacie", "Klasyczna powieść detektywistyczna.", "Arthur Conan Doyle", "Kryminał");
        insert.run("Diuna", "Klasyka literatury science fiction.", "Frank Herbert", "Sci-Fi");
        insert.run("Duma i uprzedzenie", "Klasyczny romans obyczajowy.", "Jane Austen", "Romans");

        console.log("[DB] Pomyślnie dodano dane początkowe.");
    }
}

// ─────────────────────────────────────────────────────────────────
// Getter
// ─────────────────────────────────────────────────────────────────

function getDb() {
    if (!db) {
        throw new Error(
            "[DB] Baza danych nie została zainicjalizowana. Wywołaj najpierw initDatabase()."
        );
    }
    return db;
}

module.exports = { initDatabase, getDb };