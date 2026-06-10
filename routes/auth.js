/**
 * routes/auth.js
 * ─────────────────────────────────────────────────────────────────
 * Router Express — rejestracja i logowanie użytkowników.
 *
 * Trasy:
 *   POST /api/auth/register  – rejestracja nowego konta
 *   POST /api/auth/login     – logowanie i zwrot tokenu JWT
 *
 * Zależności:
 *   bcryptjs      – synchroniczne hashowanie haseł
 *   jsonwebtoken  – generowanie i podpisywanie tokenów JWT
 *
 * Wszystkie komunikaty klienckie są w języku polskim.
 * ─────────────────────────────────────────────────────────────────
 */

"use strict";

const { Router } = require("express");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const { getDb }  = require("../db/database");

const router = Router();

// Konfiguracja
const SALT_ROUNDS  = 10;  // koszt hashowania bcrypt
const TOKEN_EXPIRY = "24h"; // czas życia tokenu JWT

const JWT_SECRET = process.env.JWT_SECRET || "zmien_ten_sekret_na_produkcji";

// ─────────────────────────────────────────────────────────────────
// Pomocniki walidacyjne
// ─────────────────────────────────────────────────────────────────

/**
 * Przycina łańcuch i zwraca undefined jeśli jest pusty.
 *
 * @param {*} value
 * @returns {string|undefined}
 */
function sanitize(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Prosta weryfikacja formatu adresu e-mail.
 * Nie zastępuje walidacji po stronie serwera pocztowego,
 * ale eliminuje oczywiste błędy wpisywania.
 *
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────

/**
 * Rejestracja nowego użytkownika.
 *
 * Oczekiwane body (JSON):
 *   username  {string} – unikalna nazwa użytkownika
 *   email     {string} – unikalny adres e-mail
 *   password  {string} – min. 6 znaków (przechowywany jako hash)
 *
 * Odpowiedź 201:
 *   { sukces, komunikat, dane: { id, username, email, role, created_at } }
 */
router.post("/register", (req, res, next) => {
  try {
    const db = getDb();
    const { username, email, password } = req.body ?? {};

    // ── Walidacja pól ─────────────────────────────────────────────
    const errors = [];

    const cleanUsername = sanitize(username);
    const cleanEmail    = sanitize(email);
    const cleanPassword = sanitize(password);

    if (!cleanUsername)
      errors.push('Pole "username" jest wymagane i nie może być puste.');

    if (!cleanEmail)
      errors.push('Pole "email" jest wymagane i nie może być puste.');
    else if (!isValidEmail(cleanEmail))
      errors.push('Pole "email" zawiera nieprawidłowy format adresu e-mail.');

    if (!cleanPassword)
      errors.push('Pole "password" jest wymagane i nie może być puste.');
    else if (cleanPassword.length < 6)
      errors.push('Hasło musi mieć co najmniej 6 znaków.');

    if (errors.length > 0) {
      return res.status(400).json({
        sukces: false,
        komunikat: "Walidacja nie powiodła się. Popraw poniższe błędy.",
        błędy: errors,
      });
    }

    // ── Unikalność: username ──────────────────────────────────────
    const existingUsername = db
      .prepare("SELECT 1 FROM users WHERE username = ?")
      .get(cleanUsername);

    if (existingUsername) {
      return res.status(409).json({
        sukces: false,
        komunikat: `Nazwa użytkownika "${cleanUsername}" jest już zajęta. Wybierz inną.`,
      });
    }

    // ── Unikalność: email ─────────────────────────────────────────
    const existingEmail = db
      .prepare("SELECT 1 FROM users WHERE email = ?")
      .get(cleanEmail);

    if (existingEmail) {
      return res.status(409).json({
        sukces: false,
        komunikat: `Adres e-mail "${cleanEmail}" jest już przypisany do innego konta.`,
      });
    }

    // ── Hashowanie hasła ──────────────────────────────────────────
    // bcrypt.hashSync jest kompatybilny z synchronicznym better-sqlite3
    const passwordHash = bcrypt.hashSync(cleanPassword, SALT_ROUNDS);

    // ── Zapis do bazy ─────────────────────────────────────────────
    const result = db
      .prepare(`
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `)
      .run(cleanUsername, cleanEmail, passwordHash);

    // Pobierz pełny wiersz (bez password_hash) do odpowiedzi
    const newUser = db
      .prepare(
        "SELECT id, username, email, role, created_at FROM users WHERE id = ?"
      )
      .get(result.lastInsertRowid);

    return res.status(201).json({
      sukces: true,
      komunikat: "Rejestracja zakończona pomyślnie. Możesz się teraz zalogować.",
      dane: newUser,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────

/**
 * Logowanie użytkownika — zwraca podpisany token JWT.
 *
 * Oczekiwane body (JSON):
 *   email     {string}
 *   password  {string}
 *
 * Odpowiedź 200:
 *   { sukces, komunikat, token, dane: { id, username, email, role } }
 *
 * Token należy przesyłać w nagłówku:
 *   Authorization: Bearer <token>
 */
router.post("/login", (req, res, next) => {
  try {
    const db = getDb();
    const { email, password } = req.body ?? {};

    // ── Walidacja ─────────────────────────────────────────────────
    const cleanEmail    = sanitize(email);
    const cleanPassword = sanitize(password);

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({
        sukces: false,
        komunikat: 'Pola "email" i "password" są wymagane.',
      });
    }

    // ── Wyszukaj użytkownika ──────────────────────────────────────
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(cleanEmail);

    // Celowo takie same komunikaty dla braku użytkownika i złego hasła
    // — nie ujawniamy czy konto istnieje (security best practice)
    if (!user) {
      return res.status(401).json({
        sukces: false,
        komunikat: "Nieprawidłowy adres e-mail lub hasło.",
      });
    }

    // ── Weryfikacja hasła ─────────────────────────────────────────
    const passwordMatches = bcrypt.compareSync(cleanPassword, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        sukces: false,
        komunikat: "Nieprawidłowy adres e-mail lub hasło.",
      });
    }

    // ── Generowanie tokenu JWT ────────────────────────────────────
    // Payload zawiera tylko dane niezbędne do autoryzacji.
    // NIE umieszczamy w nim password_hash ani wrażliwych danych.
    const tokenPayload = {
      id:       user.id,
      username: user.username,
      email:    user.email,
      role:     user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return res.status(200).json({
      sukces: true,
      komunikat: `Zalogowano pomyślnie. Witaj, ${user.username}!`,
      token,
      dane: {
        id:       user.id,
        username: user.username,
        email:    user.email,
        role:     user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
