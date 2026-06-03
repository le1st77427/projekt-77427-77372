/**
 * routes/books.js
 * ---------------------------------------------------------------
 * Express Router — all /api/books endpoints.
 *
 * Routes implemented:
 *   GET  /api/books       → list all books
 *   GET  /api/books/:id   → get one book by id
 *   POST /api/books       → create a new book
 *
 * All handlers are intentionally synchronous with respect to the
 * database layer because better-sqlite3 is a synchronous driver.
 * Error handling is delegated to Express's default error handler
 * via next(err) so that a single failure doesn't crash the server.
 * ---------------------------------------------------------------
 */

const { Router } = require("express");
const { getDb } = require("../db/database");

const router = Router();

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

/**
 * Trims a value and returns undefined if the result is an empty
 * string, making it easy to detect missing required fields.
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
 * Validates that all required book fields are present and non-empty.
 *
 * @param {{ title, description, author }} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateBookPayload({ title, description, author }) {
  const errors = [];

  if (!sanitize(title))       errors.push('"title" is required and must be a non-empty string.');
  if (!sanitize(description)) errors.push('"description" is required and must be a non-empty string.');
  if (!sanitize(author))      errors.push('"author" is required and must be a non-empty string.');

  return { valid: errors.length === 0, errors };
}

// ----------------------------------------------------------------
// GET /api/books
// Returns all books ordered by newest first.
// ----------------------------------------------------------------
router.get("/", (req, res, next) => {
  try {
    const db = getDb();

    const books = db
      .prepare("SELECT * FROM Books ORDER BY id DESC")
      .all();

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------
// GET /api/books/:id
// Returns a single book or 404 if not found.
// ----------------------------------------------------------------
router.get("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    // Validate that :id is a positive integer before hitting the DB
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId < 1) {
      return res.status(400).json({
        success: false,
        message: `"${id}" is not a valid book ID. ID must be a positive integer.`,
      });
    }

    const book = db
      .prepare("SELECT * FROM Books WHERE id = ?")
      .get(numericId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID ${numericId} was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------
// POST /api/books
// Creates a new book record. Returns 201 Created with the full
// newly-inserted row (including auto-generated id & created_at).
// ----------------------------------------------------------------
router.post("/", (req, res, next) => {
  try {
    const db = getDb();
    const { title, description, author } = req.body ?? {};

    // --- Input validation ---
    const { valid, errors } = validateBookPayload({ title, description, author });
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please fix the errors below.",
        errors,
      });
    }

    // --- Insert ---
    const stmt = db.prepare(`
      INSERT INTO Books (title, description, author)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      sanitize(title),
      sanitize(description),
      sanitize(author)
    );

    // Fetch the full row that was just inserted so we return
    // the complete object (including id & created_at) to the caller.
    const newBook = db
      .prepare("SELECT * FROM Books WHERE id = ?")
      .get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: "Book created successfully.",
      data: newBook,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------
// DELETE /api/books/:id
// Deletes a book by ID.
// ----------------------------------------------------------------
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const numericId = parseInt(id, 10);

    if (isNaN(numericId) || numericId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    const result = db
        .prepare("DELETE FROM Books WHERE id = ?")
        .run(numericId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
    });

  } catch (err) {
    next(err);
  }
});


module.exports = router;
