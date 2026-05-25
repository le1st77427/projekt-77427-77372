/**
 * server.js
 * ---------------------------------------------------------------
 * Main entry point for the Book Catalogue REST API.
 *
 * Startup sequence:
 *   1. Load environment configuration (PORT, NODE_ENV).
 *   2. Initialise the SQLite database & verify the schema.
 *   3. Configure Express middleware (CORS, JSON parsing, static files).
 *   4. Mount API routes.
 *   5. Register the global error handler.
 *   6. Start listening.
 * ---------------------------------------------------------------
 */

"use strict";

const express  = require("express");
const cors     = require("cors");
const path     = require("path");

const { initDatabase } = require("./db/database");
const booksRouter      = require("./routes/books");

// ----------------------------------------------------------------
// 1. Configuration
// ----------------------------------------------------------------
const PORT     = process.env.PORT     || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ----------------------------------------------------------------
// 2. Database initialisation
//    Must happen before any request can be handled.
// ----------------------------------------------------------------
initDatabase();

// ----------------------------------------------------------------
// 3. Express application setup
// ----------------------------------------------------------------
const app = express();

// --- CORS ---
// Allows requests from any origin so the frontend team can run their
// HTML files from a different port (e.g., Live Server on 5500)
// without browser policy errors.
//
// In production you would restrict this to specific origins:
//   app.use(cors({ origin: "https://your-frontend-domain.com" }));
app.use(cors());

// --- Body parsing ---
// Parse incoming request bodies with Content-Type: application/json
app.use(express.json());

// --- Static files ---
// The frontend team drops their HTML/CSS/JS files inside ./public
// and they are served automatically by Express at the root URL.
// e.g., ./public/index.html  →  http://localhost:3000/
app.use(express.static(path.join(__dirname, "public")));

// ----------------------------------------------------------------
// 4. API Routes
// ----------------------------------------------------------------
app.use("/api/books", booksRouter);

// Catch-all for undefined API routes — returns a JSON 404
// so clients always receive JSON rather than an HTML error page.
app.use("/api/*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found. Please check the URL and HTTP method.",
  });
});

// ----------------------------------------------------------------
// 5. Global error handler
//    Any route that calls next(err) lands here.
//    Keeps stack traces out of production responses.
// ----------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);

  const statusCode = err.statusCode || 500;
  const message =
    NODE_ENV === "production"
      ? "An unexpected server error occurred."
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ----------------------------------------------------------------
// 6. Start server
// ----------------------------------------------------------------
app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────");
  console.log(" 📚  Book Catalogue API  —  MVP Phase 1");
  console.log("─────────────────────────────────────────────");
  console.log(` 🌍  Environment : ${NODE_ENV}`);
  console.log(` 🚀  Server      : http://localhost:${PORT}`);
  console.log(` 📂  Static      : http://localhost:${PORT}/`);
  console.log(` 🔌  Books API   : http://localhost:${PORT}/api/books`);
  console.log("─────────────────────────────────────────────");
});

module.exports = app; // exported for potential future testing
