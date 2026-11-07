/**
 * AN5 TypeScript Example: SQLite Provider
 *
 * Provider: SQLite (embedded relational & vector engine)
 * Protocol: sqlite://, file path (.db, .sqlite), or :memory:
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/sqlite/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { modelToTable, modelFields, relationMap } from '../../../generated/typescript/an5Metadata';
import type { UserTableClient } from '../../../generated/typescript/User';
import type { OrderTableClient } from '../../../generated/typescript/Order';

export interface ExampleModels {
  user: UserTableClient;
  users: UserTableClient;
  order: OrderTableClient;
  orders: OrderTableClient;
}

function stripDbo(table: unknown): string {
  return String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
}

export function configureSqliteMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    tables[model] = stripDbo(table);
  }
  setAdapterMetadata({
    modelToTable: tables,
    modelFields,
    relationMap,
  });
}

export async function runSqliteExample(connectionString = 'sqlite://:memory:'): Promise<void> {
  console.log('--- [TypeScript / SQLite Provider] Starting example ---');
  configureSqliteMetadata();

  const db = createAn5Adapter<ExampleModels>({ connectionString });
  await db.$connect();

  // Create SQLite tables matching ./schema/*.an5
  await db.$executeRaw(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NULL,
      isActive INTEGER NOT NULL DEFAULT 1,
      score INTEGER NOT NULL DEFAULT 0,
      embedding BLOB NULL,
      createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
  `);

  await db.$executeRaw(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      total INTEGER NOT NULL DEFAULT 0,
      status TEXT NULL,
      createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  try {
    // 1. Create User with vector embedding
    const user = await db.user.create({
      data: {
        email: 'alice.sqlite@example.com',
        name: 'Alice SQLite',
        score: 100,
        embedding: [1.0, 0.0, 0.0],
      },
    });
    console.log(`[TypeScript/SQLite] Created user: id=${user.id}, email=${user.email}`);

    // 2. Create related Orders
    const order1 = await db.order.create({
      data: { userId: user.id, total: 350, status: 'completed' },
    });
    const order2 = await db.order.create({
      data: { userId: user.id, total: 150, status: 'pending' },
    });
    console.log(`[TypeScript/SQLite] Created orders: ${order1.id}, ${order2.id}`);

    // 3. Query with relation loading (include)
    const usersWithOrders = await db.user.findMany({
      where: { email: { contains: 'sqlite' } },
      include: { orders: true, _count: true },
    });
    console.log(`[TypeScript/SQLite] Found users: count=${usersWithOrders.length}, ordersCount=${usersWithOrders[0]?.orders?.length ?? 0}`);

    // 4. Aggregations
    const stats = await db.order.aggregate({
      _sum: { total: true },
      _count: true,
    });
    console.log(`[TypeScript/SQLite] Orders aggregate stats:`, JSON.stringify(stats));

    // 5. Cleanup
    await db.orders.deleteMany({ where: { userId: user.id } });
    await db.user.deleteMany({ where: { id: user.id } });
    console.log('[TypeScript/SQLite] Cleanup completed successfully.');
    console.log('--- [TypeScript / SQLite Provider] Finished successfully ---\n');
  } finally {
    await db.$disconnect().catch(() => {});
  }
}

if (require.main === module) {
  runSqliteExample().catch((err) => {
    console.error('[TypeScript/SQLite] Error:', err);
    process.exit(1);
  });
}
