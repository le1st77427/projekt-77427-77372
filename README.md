# 📚 Book Catalogue API — projekt-77427-77372

> **MVP Phase 1** — A RESTful backend for a book catalogue web application inspired by [LubimyCzytać](https://lubimyczytac.pl).

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)  
2. [Tech Stack](#tech-stack)  
3. [Project Structure](#project-structure)  
4. [Getting Started](#getting-started)  
5. [API Reference](#api-reference)  
6. [Frontend Integration Guide](#frontend-integration-guide)  
7. [Data Model](#data-model)  
8. [Error Handling](#error-handling)  

---

## Project Overview

This is the backend service for Phase 1 (MVP) of the semester project. It provides a clean REST API that allows the frontend team to:

- Add new books to the catalogue.
- Retrieve a full list of all books.
- Retrieve detailed information for a single book.

The server also **serves static files** from the `./public` directory, so the frontend team can place their HTML/CSS/JS files there and everything runs from a single `npm start`.

---

## Tech Stack

| Layer       | Technology                                               |
|-------------|----------------------------------------------------------|
| Runtime     | Node.js (v18+)                                           |
| Framework   | Express 4                                                |
| Database    | SQLite (via `better-sqlite3` — file: `database.sqlite`)  |
| CORS        | `cors` middleware — enabled for all origins (dev mode)   |

---

## Project Structure

```
projekt-77427-77372/
├── db/
│   └── database.js      # SQLite connection & schema initialisation
├── routes/
│   └── books.js         # All /api/books route handlers
├── public/              # Static frontend files (drop yours here)
│   └── index.html       # Placeholder — replace with your UI
├── server.js            # Express app entry point
├── package.json
├── .gitignore
└── README.md
```

> **`database.sqlite`** — this file is created automatically the first time the server starts. It is listed in `.gitignore` and should never be committed.

---

## Getting Started

### Prerequisites

- **Node.js v18 or higher** — [download here](https://nodejs.org)
- **npm** (bundled with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/le1st77427/projekt-77427-77372.git
cd projekt-77427-77372
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

You should see:

```
─────────────────────────────────────────────
 📚  Book Catalogue API  —  MVP Phase 1
─────────────────────────────────────────────
 🌍  Environment : development
 🚀  Server      : http://localhost:3000
 📂  Static      : http://localhost:3000/
 🔌  Books API   : http://localhost:3000/api/books
─────────────────────────────────────────────
[DB] Connected to SQLite database at: .../database.sqlite
[DB] Schema verified — Books table is ready.
```

### 4. (Optional) Development mode with auto-restart

```bash
npm run dev
```

---

## API Reference

**Base URL:** `http://localhost:3000`

All API endpoints:
- Accept and return **JSON**.
- Return a consistent envelope: `{ success, data?, message?, errors?, count? }`.

---

### `GET /api/books`

Returns all books in the catalogue, ordered from newest to oldest.

**Request**

```
GET /api/books
```

**Success Response — `200 OK`**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 2,
      "title": "The Lord of the Rings",
      "description": "An epic high-fantasy novel by J.R.R. Tolkien.",
      "author": "J.R.R. Tolkien",
      "created_at": "2024-05-10T14:32:00Z"
    },
    {
      "id": 1,
      "title": "Dune",
      "description": "A science fiction masterpiece set on the desert planet Arrakis.",
      "author": "Frank Herbert",
      "created_at": "2024-05-10T14:30:00Z"
    }
  ]
}
```

---

### `GET /api/books/:id`

Returns a single book by its numeric ID.

**Request**

```
GET /api/books/1
```

**Success Response — `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Dune",
    "description": "A science fiction masterpiece set on the desert planet Arrakis.",
    "author": "Frank Herbert",
    "created_at": "2024-05-10T14:30:00Z"
  }
}
```

**Error Response — `404 Not Found`**

```json
{
  "success": false,
  "message": "Book with ID 99 was not found."
}
```

**Error Response — `400 Bad Request`** (non-numeric ID)

```json
{
  "success": false,
  "message": "\"abc\" is not a valid book ID. ID must be a positive integer."
}
```

---

### `POST /api/books`

Creates a new book record.

**Request Headers**

```
Content-Type: application/json
```

**Request Body**

```json
{
  "title":       "Dune",
  "description": "A science fiction masterpiece set on the desert planet Arrakis.",
  "author":      "Frank Herbert"
}
```

| Field         | Type   | Required | Notes                          |
|---------------|--------|----------|--------------------------------|
| `title`       | string | ✅ Yes   | Non-empty after trimming       |
| `description` | string | ✅ Yes   | Non-empty after trimming       |
| `author`      | string | ✅ Yes   | Full name, stored as plain text|

**Success Response — `201 Created`**

```json
{
  "success": true,
  "message": "Book created successfully.",
  "data": {
    "id": 1,
    "title": "Dune",
    "description": "A science fiction masterpiece set on the desert planet Arrakis.",
    "author": "Frank Herbert",
    "created_at": "2024-05-10T14:30:00Z"
  }
}
```

**Error Response — `400 Bad Request`** (missing fields)

```json
{
  "success": false,
  "message": "Validation failed. Please fix the errors below.",
  "errors": [
    "\"description\" is required and must be a non-empty string."
  ]
}
```

---

## Frontend Integration Guide

Below are ready-to-paste `fetch` snippets for each endpoint.

### Fetch all books

```js
async function getAllBooks() {
  const response = await fetch("http://localhost:3000/api/books");
  const result   = await response.json();

  if (result.success) {
    console.log(`Loaded ${result.count} books:`, result.data);
  }
}
```

### Fetch a single book

```js
async function getBook(id) {
  const response = await fetch(`http://localhost:3000/api/books/${id}`);
  const result   = await response.json();

  if (response.ok) {
    console.log("Book:", result.data);
  } else {
    console.error("Error:", result.message);
  }
}
```

### Add a new book (form submission example)

```js
async function addBook(title, description, author) {
  const response = await fetch("http://localhost:3000/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, author }),
  });

  const result = await response.json();

  if (response.ok) {
    console.log("Created:", result.data);  // includes the new id
  } else {
    // Show validation errors to the user
    console.error("Errors:", result.errors);
  }
}
```

---

## Data Model

### `Books` table

```sql
CREATE TABLE Books (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL,
  author      TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
```

> **Phase 2 note:** The `author` field is intentionally a plain text string for MVP. In the next phase it will be extracted into a dedicated `Authors` table with a foreign key relationship.

---

## Error Handling

All errors are returned as JSON with `"success": false` and a human-readable `"message"` field. HTTP status codes follow standard REST conventions:

| Code | Meaning                         |
|------|---------------------------------|
| 200  | OK — request succeeded          |
| 201  | Created — new resource created  |
| 400  | Bad Request — invalid input     |
| 404  | Not Found — resource not found  |
| 500  | Internal Server Error           |

---

*projekt-77427-77372 · MVP Phase 1*
