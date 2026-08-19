/**
 * AN5 example: generated TypeScript types + @an5/adapters runtime against SQLite.
 *
 * Runnable offline (better-sqlite3 is a devDependency of an5example).
 *
 * Run: npm run build && node dist/examples/typescript/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { modelToTable, modelFields, relationMap } from '../../generated/typescript/an5Metadata';
import type { An5 } from '../../generated/typescript';

function ts(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString();
}

// SQLite-friendly metadata: strip "[dbo]." prefixes and brackets.
const sqliteTables: Record<string, string> = {};
for (const [model, table] of Object.entries(modelToTable)) {
  sqliteTables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
}
setAdapterMetadata({ modelToTable: sqliteTables, modelFields, relationMap });

interface ExampleDb {
  user: any;
  orders: any;
  order: any;
  $executeRawUnsafe(query: string, ...values: any[]): Promise<number>;
  $executeRaw(query: string, ...values: any[]): Promise<number>;
}

const db = createAn5Adapter({ connectionString: 'sqlite://:memory:' }) as unknown as ExampleDb & {
  $connect(): Promise<void>;
};

async function createTables(): Promise<void> {
  await db.$executeRaw(
    `CREATE TABLE IF NOT EXISTS users (
       id TEXT PRIMARY KEY,
       email TEXT NOT NULL UNIQUE,
       name TEXT NULL,
       isActive INTEGER NOT NULL DEFAULT 1,
       score INTEGER NOT NULL DEFAULT 0,
       createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
     )`,
  );
  await db.$executeRaw(
    `CREATE TABLE IF NOT EXISTS orders (
       id TEXT PRIMARY KEY,
       userId TEXT NOT NULL,
       total INTEGER NOT NULL DEFAULT 0,
       status TEXT NULL,
       createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
       FOREIGN KEY (userId) REFERENCES users(id)
     )`,
  );
}

async function main(): Promise<void> {
  await db.$connect();
  await createTables();

  const alice = await db.user.create({
    data: { email: 'alice@example.com', name: 'Alice', score: 123, createdAt: ts() },
    include: { orders: true, _count: true },
  });

  await db.orders.create({ data: { userId: alice.id, total: 250, status: 'open', createdAt: ts() } });
  await db.order.create({ data: { userId: alice.id, total: 75, status: 'open', createdAt: ts(1) } });

  const found = await db.user.findMany({ where: { email: { contains: 'alice' } }, include: { orders: true, _count: true } });
  console.log(`users matching 'alice': ${found.length}`);

  const order = await db.order.findFirst({ where: { id: (await db.orders.findMany({ take: 1 }))[0].id }, include: { user: true } });
  console.log(`order ${order?.id} belongs to ${order?.user?.email}`);

  const stats = await db.order.aggregate({ _sum: { total: true }, _count: true });
  console.log(`orders stat: ${JSON.stringify(stats)}`);

  await db.orders.deleteMany({ where: { status: 'open' } });
  await db.user.deleteMany({ where: { email: { contains: 'alice' } } });
  const remains = await db.user.count();
  console.log(`users after cleanup: ${remains}`);
}

main().then(
  () => console.log('an5example TypeScript CRUD example passed'),
  (err) => {
    console.error(err);
    throw err;
  },
);
