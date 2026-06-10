/**
 * middlewares/authMiddleware.js
 * ─────────────────────────────────────────────────────────────────
 * Middleware autoryzacyjne dla Express.
 *
 * Eksportuje:
 *   verifyToken   – sprawdza JWT z nagłówka Authorization,
 *                   dołącza payload do req.user
 *   requireAdmin  – sprawdza czy req.user ma rolę 'admin';
 *                   musi być użyty PO verifyToken
 *
 * Format nagłówka:
 *   Authorization: Bearer <token>
 *
 * Wszystkie komunikaty zwracane klientowi są w języku polskim.
 * ─────────────────────────────────────────────────────────────────
 */

"use strict";

const jwt = require("jsonwebtoken");

// Pobierz sekret z env; jeśli brak — ostrzeż i użyj fallbacku.
// W środowisku produkcyjnym JWT_SECRET MUSI być ustawiony w .env
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn(
    "[OSTRZEŻENIE] JWT_SECRET nie jest ustawiony! Używam domyślnej wartości — NIE używaj tego w produkcji."
  );
  return "zmien_ten_sekret_na_produkcji";
})();

// ─────────────────────────────────────────────────────────────────
// verifyToken
// ─────────────────────────────────────────────────────────────────

/**
 * Weryfikuje token JWT przesłany w nagłówku Authorization.
 *
 * Po pomyślnej weryfikacji ustawia req.user z polami:
 *   { id, username, email, role }
 *
 * W przypadku błędu zwraca 401 lub 403 z komunikatem po polsku.
 *
 * @type {import('express').RequestHandler}
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Nagłówek musi istnieć i mieć format "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      sukces: false,
      komunikat:
        "Brak tokenu autoryzacji. Zaloguj się i podaj token w nagłówku Authorization: Bearer <token>.",
    });
  }

  const token = authHeader.slice(7); // usuń "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Dołącz dane użytkownika do obiektu request
    req.user = {
      id:       payload.id,
      username: payload.username,
      email:    payload.email,
      role:     payload.role,
    };

    next();
  } catch (err) {
    // TokenExpiredError — token wygasł
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        sukces: false,
        komunikat: "Token autoryzacji wygasł. Zaloguj się ponownie.",
      });
    }

    // JsonWebTokenError — token nieprawidłowy / zmodyfikowany
    return res.status(403).json({
      sukces: false,
      komunikat: "Token autoryzacji jest nieprawidłowy lub uszkodzony.",
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// requireAdmin
// ─────────────────────────────────────────────────────────────────

/**
 * Sprawdza czy zalogowany użytkownik posiada rolę 'admin'.
 * Musi być stosowany wyłącznie PO middleware verifyToken,
 * który ustawia req.user.
 *
 * @type {import('express').RequestHandler}
 */
function requireAdmin(req, res, next) {
  // Dodatkowe zabezpieczenie: jeśli verifyToken nie był wywołany
  if (!req.user) {
    return res.status(401).json({
      sukces: false,
      komunikat: "Brak danych użytkownika. Upewnij się, że middleware verifyToken jest aktywny.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      sukces: false,
      komunikat: "Dostęp zabroniony. Ta operacja wymaga uprawnień administratora.",
    });
  }

  next();
}

module.exports = { verifyToken, requireAdmin };
