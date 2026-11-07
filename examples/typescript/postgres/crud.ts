/**
 * AN5 TypeScript Example: PostgreSQL Provider
 *
 * Provider: PostgreSQL
 * Protocol: postgres://, postgresql://
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/postgres/crud.js
 *   POSTGRES_URL=postgres://user:pass@localhost:5432/db node dist/examples/typescript/postgres/crud.js
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

export function configurePostgresMetadata(): void {
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

export async function runPostgresExample(): Promise<void> {
  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/an5_example';

  console.log('--- [TypeScript / PostgreSQL Provider] Starting example ---');
  configurePostgresMetadata();

  const db = createAn5Adapter<ExampleModels>({ connectionString });

  // 1. Probe server connection
  try {
    await db.$connect();
  } catch (err: any) {
    console.log(
      `[TypeScript/PostgreSQL] SKIPPED: Server not reachable at "${connectionString}".\n` +
      `  Reason: ${err?.message?.split('\n')[0] || err}\n` +
      '  To run live: set POSTGRES_URL=postgres://user:password@localhost:5432/mydb'
    );
    console.log('--- [TypeScript / PostgreSQL Provider] Completed (offline safe) ---\n');
    return;
  }

  try {
    console.log(`[TypeScript/PostgreSQL] Connected to server: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);

    // 2. Setup schema DDL
    const ddlStatements = [
      `DROP TABLE IF EXISTS orders;`,
      `DROP TABLE IF EXISTS users;`,
      `CREATE TABLE users (
         id          TEXT PRIMARY KEY,
         email       TEXT NOT NULL UNIQUE,
         name        TEXT NULL,
         "isActive"  BOOLEAN NOT NULL DEFAULT TRUE,
         score       INTEGER NOT NULL DEFAULT 0,
         embedding   JSONB NULL,
         "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
       );`,
      `CREATE TABLE orders (
         id          TEXT PRIMARY KEY,
         "userId"    TEXT NOT NULL,
         total       INTEGER NOT NULL DEFAULT 0,
         status      TEXT NULL,
         "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
         CONSTRAINT fk_orders_user FOREIGN KEY ("userId") REFERENCES users(id)
       );`,
    ];

    for (const stmt of ddlStatements) {
      await db.$executeRawUnsafe(stmt);
    }
    console.log('[TypeScript/PostgreSQL] Schema initialized.');

    // 3. Create records
    const alice = await db.user.create({
      data: {
        email: 'alice.pg@example.com',
        name: 'Alice Postgres',
        score: 250,
        embedding: [0.1, 0.2, 0.3],
      },
    });
    console.log(`[TypeScript/PostgreSQL] Created user: id=${alice.id}`);

    const order = await db.order.create({
      data: {
        userId: alice.id,
        total: 500,
        status: 'paid',
      },
    });
    console.log(`[TypeScript/PostgreSQL] Created order: id=${order.id}`);

    // 4. Query with relations (include)
    const users = await db.user.findMany({
      where: { email: { contains: 'alice.pg' } },
      include: { orders: true, _count: true },
    });
    console.log(`[TypeScript/PostgreSQL] Found ${users.length} user with ${users[0]?.orders?.length ?? 0} orders.`);

    // 5. Transaction test
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: alice.id },
        data: { score: 300 },
      });
    });
    console.log('[TypeScript/PostgreSQL] Transaction committed.');

    // 6. Cleanup
    await db.orders.deleteMany({ where: { userId: alice.id } });
    await db.user.deleteMany({ where: { id: alice.id } });
    console.log('[TypeScript/PostgreSQL] Cleanup completed.');
    console.log('--- [TypeScript / PostgreSQL Provider] Finished successfully ---\n');
  } finally {
    await db.$disconnect().catch(() => {});
  }
}

if (require.main === module) {
  runPostgresExample().catch((err) => {
    console.error('[TypeScript/PostgreSQL] Error:', err);
    process.exit(1);
  });
}
