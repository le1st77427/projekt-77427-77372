const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.sqlite");

let db;

function initDatabase() {
  db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
  });

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS Books (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      author      TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    )
  `);

  console.log(`[DB] Connected to SQLite database at: ${DB_PATH}`);
  console.log("[DB] Schema verified — Books table is ready.");

  return db;
}

function getDb() {
  if (!db) {
    throw new Error(
      "[DB] Database has not been initialised. Call initDatabase() first."
    );
  }
  return db;
}

module.exports = { initDatabase, getDb };