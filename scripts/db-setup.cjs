/**
 * Creates the example SQLite database with tables that match the schema in
 * ./schema. Used by the runnable examples and integration tests.
 */
const Database = require('better-sqlite3');

const DB_PATH = process.env.AN5EXAMPLE_DB || 'example.sqlite';

function createDatabase(dbPath = DB_PATH) {
  const db = new Database(dbPath);

  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id        TEXT PRIMARY KEY,
      email     TEXT NOT NULL UNIQUE,
      name      TEXT NULL,
      isActive  INTEGER NOT NULL DEFAULT 1,
      score     INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id        TEXT PRIMARY KEY,
      userId    TEXT NOT NULL,
      total     INTEGER NOT NULL DEFAULT 0,
      status    TEXT NULL,
      createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  return db;
}

if (require.main === module) {
  const db = createDatabase();
  console.log(`Created SQLite database at ${DB_PATH}`);
  db.close();
}

module.exports = { createDatabase, DB_PATH };
