/**
 * routes/books.js
 * ─────────────────────────────────────────────────────────────────
 * Router Express — wszystkie endpointy związane z książkami.
 *
 * Trasy i ochrona (Etap 6):
 *
 * PUBLICZNE (bez tokenu):
 * GET  /api/books                    – lista wszystkich książek
 * GET  /api/books/:id                – szczegóły książki
 * GET  /api/books/:id/comments       – komentarze do książki
 *
 * ZALOGOWANY UŻYTKOWNIK (verifyToken):
 * POST /api/books/:id/comments       – dodaj komentarz
 * POST /api/books/:id/rating         – dodaj ocenę
 *
 * TYLKO ADMIN (verifyToken + requireAdmin):
 * POST   /api/books                  – dodaj książkę
 * PUT    /api/books/:id              – edytuj książkę
 * DELETE /api/books/:id              – usuń książkę
 *
 * Zmiana w komentarzach (Etap 6):
 * author_name jest teraz pobierany z tokenu (req.user.username),
 * a nie z treści żądania — pole author_name w body jest ignorowane.
 *
 * Wszystkie komunikaty klienckie są w języku polskim.
 * ─────────────────────────────────────────────────────────────────
 */

"use strict";

const { Router }                    = require("express");
const { getDb }                     = require("../db/database");
const { verifyToken, requireAdmin } = require("../middlewares/authMiddleware");

const router = Router();

// ═════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════

function sanitize(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseId(raw) {
  const num = parseInt(raw, 10);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function fetchAverageRating(db, bookId) {
  const row = db
      .prepare("SELECT ROUND(AVG(rating), 1) AS avg FROM ratings WHERE book_id = ?")
      .get(bookId);
  return row.avg !== null ? row.avg : null;
}

function attachAverageRating(db, book) {
  book.average_rating = fetchAverageRating(db, book.id);
  return book;
}

// ═════════════════════════════════════════════════════════════════
// ETAP 1 + 3 — KSIĄŻKI
// ═════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// GET /api/books  [publiczny]
// Zwraca CZYSTĄ tablicę książek (żeby frontendowy .filter() działał)
// ─────────────────────────────────────────────────────────────────
router.get("/", (req, res, next) => {
  try {
    const db = getDb();

    const books = db
        .prepare("SELECT * FROM Books ORDER BY id DESC")
        .all()
        .map((book) => attachAverageRating(db, book));

    // Zwracamy czystą tablicę
    return res.status(200).json(books);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/books/:id  [publiczny]
// Zwraca CZYSTY obiekt książki
// ─────────────────────────────────────────────────────────────────
router.get("/:id", (req, res, next) => {
  try {
    const db = getDb();

    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        sukces:    false,
        komunikat: `"${req.params.id}" nie jest prawidłowym identyfikatorem. ID musi być dodatnią liczbą całkowitą.`,
      });
    }

    const book = db.prepare("SELECT * FROM Books WHERE id = ?").get(id);

    if (!book) {
      return res.status(404).json({
        sukces:    false,
        komunikat: `Książka o identyfikatorze ${id} nie została znaleziona.`,
      });
    }

    attachAverageRating(db, book);

    // Zwracamy czysty obiekt
    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/books  [tylko admin]
// ─────────────────────────────────────────────────────────────────
router.post("/", verifyToken, requireAdmin, (req, res, next) => {
  try {
    const db = getDb();
    const { title, description, author, category } = req.body ?? {};

    const errors = [];
    if (!sanitize(title))       errors.push('Pole "title" jest wymagane i nie może być puste.');
    if (!sanitize(description)) errors.push('Pole "description" jest wymagane i nie może być puste.');
    if (!sanitize(author))      errors.push('Pole "author" jest wymagane i nie może być puste.');

    if (errors.length > 0) {
      return res.status(400).json({
        sukces:    false,
        komunikat: "Walidacja nie powiodła się. Popraw poniższe błędy.",
        błędy:     errors,
      });
    }

    const result = db
        .prepare("INSERT INTO Books (title, description, author, category) VALUES (?, ?, ?, ?)")
        .run(
            sanitize(title),
            sanitize(description),
            sanitize(author),
            sanitize(category) ?? "Bez kategorii"
        );

    const newBook = db
        .prepare("SELECT * FROM Books WHERE id = ?")
        .get(result.lastInsertRowid);

    attachAverageRating(db, newBook);

    // Zwracamy czysty obiekt stworzonej książki
    return res.status(201).json(newBook);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/books/:id  [tylko admin]
// Aktualizuje dowolny podzbiór pól: title, description, author, category
// ─────────────────────────────────────────────────────────────────
router.put("/:id", verifyToken, requireAdmin, (req, res, next) => {
  try {
    const db = getDb();

    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        sukces:    false,
        komunikat: `"${req.params.id}" nie jest prawidłowym identyfikatorem.`,
      });
    }

    const book = db.prepare("SELECT * FROM Books WHERE id = ?").get(id);
    if (!book) {
      return res.status(404).json({
        sukces:    false,
        komunikat: `Książka o identyfikatorze ${id} nie została znaleziona.`,
      });
    }

    // Partial update — zachowaj stare wartości jeśli pole nie podano
    const { title, description, author, category } = req.body ?? {};

    const updatedTitle       = sanitize(title)       ?? book.title;
    const updatedDescription = sanitize(description) ?? book.description;
    const updatedAuthor      = sanitize(author)       ?? book.author;
    const updatedCategory    = sanitize(category)     ?? book.category;

    db.prepare(`
      UPDATE Books
      SET title = ?, description = ?, author = ?, category = ?
      WHERE id = ?
    `).run(updatedTitle, updatedDescription, updatedAuthor, updatedCategory, id);

    const updatedBook = db.prepare("SELECT * FROM Books WHERE id = ?").get(id);
    attachAverageRating(db, updatedBook);

    return res.status(200).json(updatedBook);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// DELETE /api/books/:id  [tylko admin]
// ─────────────────────────────────────────────────────────────────
router.delete("/:id", verifyToken, requireAdmin, (req, res, next) => {
  try {
    const db = getDb();

    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        sukces:    false,
        komunikat: `"${req.params.id}" nie jest prawidłowym identyfikatorem.`,
      });
    }

    const book = db.prepare("SELECT * FROM Books WHERE id = ?").get(id);
    if (!book) {
      return res.status(404).json({
        sukces:    false,
        komunikat: `Książka o identyfikatorze ${id} nie została znaleziona.`,
      });
    }

    db.prepare("DELETE FROM Books WHERE id = ?").run(id);

    return res.status(200).json({
      sukces:    true,
      komunikat: `Książka "${book.title}" (ID: ${id}) została trwale usunięta.`,
    });
  } catch (err) {
    next(err);
  }
});

// ═════════════════════════════════════════════════════════════════
// ETAP 4 — KOMENTARZE
// ═════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// GET /api/books/:id/comments  [publiczny]
// Zwraca CZYSTĄ tablicę
// ─────────────────────────────────────────────────────────────────
router.get("/:id/comments", (req, res, next) => {
  try {
    const db = getDb();

    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        sukces:    false,
        komunikat: `"${req.params.id}" nie jest prawidłowym identyfikatorem.`,
      });
    }

    const bookExists = db.prepare("SELECT 1 FROM Books WHERE id = ?").get(id);
    if (!bookExists) {
      return res.status(404).json({
        sukces:    false,
        komunikat: `Książka o identyfikatorze ${id} nie została znaleziona.`,
      });
    }

    const comments = db
        .prepare(`
          SELECT id, author_name, content, created_at
          FROM   comments
          WHERE  book_id = ?
          ORDER  BY id DESC
        `)
        .all(id);

    // Zwracamy czystą tablicę
    return res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/books/:id/comments  [zalogowany użytkownik]
// ─────────────────────────────────────────────────────────────────
router.post("/:id/comments", verifyToken, (req, res, next) => {
  try {
    const db = getDb();

    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        sukces:    false,
        komunikat: `"${req.params.id}" nie jest prawidłowym identyfikatorem.`,
      });
    }

    const bookExists = db.prepare("SELECT 1 FROM Books WHERE id = ?").get(id);
    if (!bookExists) {
      return res.status(404).json({
        sukces:    false,
        komunikat: `Książka o identyfikatorze ${id} nie została znaleziona.`,
      });
    }

    const { content } = req.body ?? {};

    if (!sanitize(content)) {
      return res.status(400).json({
        sukces:    false,
        komunikat: 'Pole "content" jest wymagane i nie może być puste.',
      });
    }

    const authorName = req.user.username;

    const result = db
        .prepare("INSERT INTO comments (book_id, author_name, content) VALUES (?, ?, ?)")
        .run(id, authorName, sanitize(content));

    const newComment = db
        .prepare("SELECT id, author_name, content, created_at FROM comments WHERE id = ?")
        .get(result.lastInsertRowid);

    return res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
});

// ═════════════════════════════════════════════════════════════════
// ETAP 5 — RATINGI
// ═════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// POST /api/books/:id/rating  [zalogowany użytkownik]
// ─────────────────────────────────────────────────────────────────
router.post("/:id/rating", verifyToken, (req, res, next) => {
  try {
    const db = getDb();

    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({
        sukces:    false,
        komunikat: `"${req.params.id}" nie jest prawidłowym identyfikatorem.`,
      });
    }

    const bookExists = db.prepare("SELECT 1 FROM Books WHERE id = ?").get(id);
    if (!bookExists) {
      return res.status(404).json({
        sukces:    false,
        komunikat: `Książka o identyfikatorze ${id} nie została znaleziona.`,
      });
    }

    const { rating } = req.body ?? {};
    const ratingNum  = Number(rating);

    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        sukces:    false,
        komunikat: 'Pole "rating" jest wymagane i musi być liczbą całkowitą od 1 do 5.',
      });
    }

    db.prepare("INSERT INTO ratings (book_id, rating) VALUES (?, ?)").run(id, ratingNum);

    const averageRating = fetchAverageRating(db, id);

    return res.status(201).json({
      book_id:        id,
      twoja_ocena:    ratingNum,
      average_rating: averageRating,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;