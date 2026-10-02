/**
 * AN5 example: generated TypeScript types + @an5/adapters runtime against SQLite.
 *
 * Runnable offline (better-sqlite3 is a devDependency of an5example).
 *
 * Run: npm run build && node dist/examples/typescript/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { modelToTable, modelFields, relationMap } from '../../generated/typescript/an5Metadata';
import type { UserTableClient } from '../../generated/typescript/User';
import type { OrderTableClient } from '../../generated/typescript/Order';

function ts(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString();
}

// The metadata is passed through as generated. The table names are already
// SQLite's, because an5Orm.config.js names a SQLite connection and the generator
// reads the provider from it; this used to strip a "[dbo]." prefix by hand.
setAdapterMetadata({ modelToTable, modelFields, relationMap });

// Typed model delegates (standard ORM access): `db.user` / `db.order` resolve
// through the adapter proxy with full autocomplete and argument checking.
interface ExampleModels {
  user: UserTableClient;
  users: UserTableClient;
  order: OrderTableClient;
  orders: OrderTableClient;
}

const db = createAn5Adapter<ExampleModels>({ connectionString: 'sqlite://:memory:' });

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

  const firstOrders = await db.orders.findMany({ take: 1 });
  const firstOrder = firstOrders[0];
  if (firstOrder === undefined) throw new Error('expected at least one order');
  const order = await db.order.findFirst({ where: { id: firstOrder.id }, include: { user: true } });
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
