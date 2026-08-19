/**
 * Live integration test harness — runs the shared CRUD suite against a real
 * database chosen via the AN5_DATABASE_URL environment variable.
 *
 *   postgres://user:pass@host:5432/db
 *   mysql://user:pass@host:3306/db
 *   Server=host;Database=db;User Id=u;Password=p;  (mssql)
 *   file.db / :memory: / sqlite://  (sqlite)
 *
 * If the variable is unset or the server is unreachable the test is SKIPPED
 * (exit 0) so the default `npm test` run works without any database server.
 *
 * Run: npm run build && AN5_DATABASE_URL=... node test/crud.live.test.js
 */
const assert = require('assert');
const path = require('path');

const { createAn5Adapter, setAdapterMetadata } = require('@an5/adapters');
const generated = require('../dist/generated/typescript/an5Metadata.js');
const { runCrudSuite } = require('./crud-suite.js');
const { DDL, TABLE_NAMES } = require('../scripts/ddl.cjs');

function detectDialect(connStr) {
  const cs = connStr.trim().toLowerCase();
  if (cs.startsWith('postgres://') || cs.startsWith('postgresql://')) return 'postgres';
  if (cs.startsWith('mysql://') || cs.startsWith('mariadb://')) return 'mysql';
  if (cs.startsWith('sqlite://') || cs.endsWith('.db') || cs.endsWith('.sqlite') || cs.endsWith('.sqlite3') || cs === ':memory:') return 'sqlite';
  return 'mssql';
}

function stripDbo(table) {
  return String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
}

function buildTables(dialect) {
  const tables = {};
  for (const [model, table] of Object.entries(generated.modelToTable)) {
    tables[model] = dialect === 'mssql' ? String(table) : stripDbo(table);
  }
  return tables;
}

async function main() {
  const connectionString = process.env.AN5_DATABASE_URL;
  if (!connectionString) {
    console.log('SKIPPED an5example live CRUD: AN5_DATABASE_URL not set');
    return;
  }

  const dialect = detectDialect(connectionString);
  if (!DDL[dialect]) throw new Error(`Unsupported dialect: ${dialect}`);

  setAdapterMetadata({
    modelToTable: buildTables(dialect),
    modelFields: generated.modelFields,
    relationMap: generated.relationMap,
  });

  const db = createAn5Adapter({ connectionString });
  let dbFile = null;

  // Local sqlite file cleanup (before connect so the handle isn't held yet)
  if (dialect === 'sqlite' && !connectionString.includes(':memory:')) {
    const fs = require('fs');
    dbFile = connectionString
      .replace(/^sqlite:\/\/\//, '')
      .replace(/^sqlite:\/\//, '')
      .replace(/^file:/, '');
    if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  }

  try {
    await db.$connect();
  } catch (err) {
    console.log(`SKIPPED an5example live CRUD (${dialect}): server unreachable (${err.message || err})`);
    return;
  }

  // Create schema
  for (const stmt of DDL[dialect]) {
    await db.$executeRawUnsafe(stmt);
  }

  try {
    await runCrudSuite({
      db,
      opts: {
        label: `an5example live CRUD + relations integration (${dialect})`,
        rawUserTable: TABLE_NAMES[dialect].users,
      },
    });
  } finally {
    await db.$disconnect().catch(() => {});
    // Tear down (after disconnect so file handles are released)
    if (dbFile) {
      const fs = require('fs');
      if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });