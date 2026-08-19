/**
 * SQLite integration test: generated an5Client + @an5/adapters against SQLite.
 *
 * Run: npm run build && node test/crud.sqlite.test.js
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { createAn5Adapter, setAdapterMetadata } = require('@an5/adapters');
const generated = require('../dist/generated/typescript/an5Metadata.js');
const { runCrudSuite } = require('./crud-suite.js');

const DB_FILE = path.join(__dirname, '..', 'crud-example.sqlite');
if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE);

// Build SQLite-friendly metadata: strip "[dbo]." prefixes and brackets.
const sqliteTables = {};
for (const [model, table] of Object.entries(generated.modelToTable)) {
  sqliteTables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
}

setAdapterMetadata({
  modelToTable: sqliteTables,
  modelFields: generated.modelFields,
  relationMap: generated.relationMap,
});

const db = createAn5Adapter({ connectionString: DB_FILE });

// Tables created via the shared setup helper.
const { createDatabase } = require('../scripts/db-setup.cjs');
const raw = createDatabase(DB_FILE);

async function main() {
  await runCrudSuite({ db, opts: { label: 'an5example SQLite CRUD + relations integration', rawUserTable: 'users' } });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect().catch(() => {});
    raw.close();
    if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE);
  });