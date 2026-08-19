/**
 * Browser integration test: @an5/adapters/browser + SqliteBrowserEngine running
 * the shared CRUD suite against an in-memory sql.js (SQLite WASM) database.
 *
 * Run: node test/crud.browser.test.js
 */
const assert = require('assert');

const initSqlJs = require('sql.js');
const { createAn5Adapter, setAdapterMetadata } = require('@an5/adapters/browser');
const generated = require('../dist/generated/typescript/an5Metadata.js');
const { runCrudSuite } = require('./crud-suite.js');
const { DDL } = require('../scripts/ddl.cjs');

async function main() {
  const SQL = await initSqlJs();
  const rawDb = new SQL.Database();

  // Create tables via the sql.js driver directly.
  for (const stmt of DDL.sqlite) {
    rawDb.run(stmt);
  }

  // SQLite-friendly metadata (strip "[dbo]." prefixes and brackets).
  const sqliteTables = {};
  for (const [model, table] of Object.entries(generated.modelToTable)) {
    sqliteTables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
  }
  setAdapterMetadata({
    modelToTable: sqliteTables,
    modelFields: generated.modelFields,
    relationMap: generated.relationMap,
  });

  // Adapter backed by the in-memory sql.js database.
  const db = createAn5Adapter({ db: rawDb });

  await runCrudSuite({ db, opts: { label: 'an5example browser (sql.js) CRUD + relations integration', rawUserTable: 'users' } });

  await db.$disconnect();
  rawDb.close();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });