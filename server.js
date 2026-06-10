/**
 * server.js
 * ─────────────────────────────────────────────────────────────────
 * Punkt wejścia aplikacji REST API — Katalog Książek.
 *
 * Zmienne środowiskowe (utwórz plik .env w katalogu głównym):
 * PORT        – numer portu (domyślnie: 3000)
 * NODE_ENV    – 'development' | 'production' (domyślnie: 'development')
 *
 * Kolejność startowa:
 * 1. Wczytaj zmienne środowiskowe
 * 2. Inicjalizuj bazę danych + schemat
 * 3. Skonfiguruj middleware Express
 * 4. Zamontuj routery
 * 5. Globalny handler błędów
 * 6. Uruchom nasłuchiwanie
 * ─────────────────────────────────────────────────────────────────
 */

"use strict";

const express  = require("express");
const cors     = require("cors");
const path     = require("path");

const { initDatabase } = require("./db/database");
const booksRouter      = require("./routes/books");

// ─────────────────────────────────────────────────────────────────
// Konfiguracja
// ─────────────────────────────────────────────────────────────────

const PORT     = process.env.PORT     || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ─────────────────────────────────────────────────────────────────
// Inicjalizacja bazy
// ─────────────────────────────────────────────────────────────────

initDatabase();

// ─────────────────────────────────────────────────────────────────
// Aplikacja Express
// ─────────────────────────────────────────────────────────────────

const app = express();

// CORS — zezwól na żądania z dowolnego origin (dev)
app.use(cors());

// Parsowanie JSON
app.use(express.json());

// Pliki statyczne frontendu
app.use(express.static(path.join(__dirname, "public")));

// ─────────────────────────────────────────────────────────────────
// Routery API
// ─────────────────────────────────────────────────────────────────

app.use("/api/books", booksRouter);

// Fallback dla nieistniejących tras API
app.use("/api/*", (_req, res) => {
  res.status(404).json({
    sukces:    false,
    komunikat: "Endpoint API nie istnieje. Sprawdź adres URL i metodę HTTP.",
  });
});

// ─────────────────────────────────────────────────────────────────
// Globalny handler błędów
// ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[BŁĄD]", err);

  const statusCode = err.statusCode || 500;
  const komunikat  =
      NODE_ENV === "production"
          ? "Wystąpił nieoczekiwany błąd serwera."
          : err.message;

  res.status(statusCode).json({
    sukces: false,
    komunikat,
    ...(NODE_ENV !== "production" && { stos: err.stack }),
  });
});

// ─────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────────────");
  console.log("  📚  Katalog Książek API — MVP (Kategorie i Oceny)");
  console.log("─────────────────────────────────────────────────────");
  console.log(`  🌍  Środowisko  : ${NODE_ENV}`);
  console.log(`  🚀  Serwer      : http://localhost:${PORT}`);
  console.log(`  📖  Books API   : http://localhost:${PORT}/api/books`);
  console.log("─────────────────────────────────────────────────────");
});

module.exports = app;