/**
 * AN5 TypeScript Example: MySQL / MariaDB Provider
 *
 * Provider: MySQL / MariaDB
 * Protocol: mysql://, mariadb://
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/mysql/crud.js
 *   MYSQL_URL=mysql://root:pass@localhost:3306/db node dist/examples/typescript/mysql/crud.js
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

export function configureMysqlMetadata(): void {
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

export async function runMysqlExample(): Promise<void> {
  const connectionString =
    process.env.MYSQL_URL ||
    process.env.DATABASE_URL ||
    'mysql://root:password@localhost:3306/an5_example';

  console.log('--- [TypeScript / MySQL Provider] Starting example ---');
  configureMysqlMetadata();

  const db = createAn5Adapter<ExampleModels>({ connectionString });

  // 1. Probe server connection
  try {
    await db.$connect();
  } catch (err: any) {
    console.log(
      `[TypeScript/MySQL] SKIPPED: Server not reachable at "${connectionString}".\n` +
      `  Reason: ${err?.message?.split('\n')[0] || err}\n` +
      '  To run live: set MYSQL_URL=mysql://user:password@localhost:3306/mydb'
    );
    console.log('--- [TypeScript / MySQL Provider] Completed (offline safe) ---\n');
    return;
  }

  try {
    console.log(`[TypeScript/MySQL] Connected to server: ${connectionString.replace(/:[^:@]+@/, ':***@')}`);

    // 2. Setup schema DDL
    const ddlStatements = [
      `DROP TABLE IF EXISTS orders;`,
      `DROP TABLE IF EXISTS users;`,
      `CREATE TABLE users (
         id          VARCHAR(191) PRIMARY KEY,
         email       VARCHAR(255) NOT NULL UNIQUE,
         name        VARCHAR(255) NULL,
         \`isActive\`  BOOLEAN NOT NULL DEFAULT TRUE,
         score       INT NOT NULL DEFAULT 0,
         embedding   JSON NULL,
         \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
       );`,
      `CREATE TABLE orders (
         id          VARCHAR(191) PRIMARY KEY,
         \`userId\`    VARCHAR(191) NOT NULL,
         total       INT NOT NULL DEFAULT 0,
         status      VARCHAR(50) NULL,
         \`createdAt\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
         CONSTRAINT fk_orders_user FOREIGN KEY (\`userId\`) REFERENCES users(id)
       );`,
    ];

    for (const stmt of ddlStatements) {
      await db.$executeRawUnsafe(stmt);
    }
    console.log('[TypeScript/MySQL] Schema initialized.');

    // 3. Create records
    const bob = await db.user.create({
      data: {
        email: 'bob.mysql@example.com',
        name: 'Bob MySQL',
        score: 180,
      },
    });
    console.log(`[TypeScript/MySQL] Created user: id=${bob.id}`);

    const order = await db.order.create({
      data: {
        userId: bob.id,
        total: 120,
        status: 'open',
      },
    });
    console.log(`[TypeScript/MySQL] Created order: id=${order.id}`);

    // 4. Query with relation loading (include)
    const users = await db.user.findMany({
      where: { email: { contains: 'bob.mysql' } },
      include: { orders: true, _count: true },
    });
    console.log(`[TypeScript/MySQL] Found ${users.length} user with ${users[0]?.orders?.length ?? 0} orders.`);

    // 5. Transaction test
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: bob.id },
        data: { score: 200 },
      });
    });
    console.log('[TypeScript/MySQL] Transaction committed.');

    // 6. Cleanup
    await db.orders.deleteMany({ where: { userId: bob.id } });
    await db.user.deleteMany({ where: { id: bob.id } });
    console.log('[TypeScript/MySQL] Cleanup completed.');
    console.log('--- [TypeScript / MySQL Provider] Finished successfully ---\n');
  } finally {
    await db.$disconnect().catch(() => {});
  }
}

if (require.main === module) {
  runMysqlExample().catch((err) => {
    console.error('[TypeScript/MySQL] Error:', err);
    process.exit(1);
  });
}
