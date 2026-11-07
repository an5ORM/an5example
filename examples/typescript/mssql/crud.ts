/**
 * AN5 TypeScript Example: SQL Server (MSSQL) Provider
 *
 * Provider: Microsoft SQL Server
 * Protocol: sqlserver://, Server=host;Database=db;User Id=...;Password=...;
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/mssql/crud.js
 *   MSSQL_URL="Server=localhost;Database=master;User Id=sa;Password=Pass!;TrustServerCertificate=True;" node dist/examples/typescript/mssql/crud.js
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

export function configureMssqlMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    const raw = String(table).replace(/^\[|\]$/g, '');
    tables[model] = raw.includes('.') ? raw : `dbo.${raw}`;
  }
  setAdapterMetadata({
    modelToTable: tables,
    modelFields,
    relationMap,
  });
}

export async function runMssqlExample(): Promise<void> {
  const connectionString =
    process.env.MSSQL_URL ||
    process.env.DATABASE_URL ||
    'Server=localhost;Database=master;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True;Connect Timeout=3;';

  console.log('--- [TypeScript / SQL Server (MSSQL) Provider] Starting example ---');
  configureMssqlMetadata();

  const db = createAn5Adapter<ExampleModels>({ connectionString });

  // 1. Probe server connection
  try {
    await db.$connect();
  } catch (err: any) {
    console.log(
      `[TypeScript/MSSQL] SKIPPED: SQL Server not reachable at "${connectionString}".\n` +
      `  Reason: ${err?.message?.split('\n')[0] || err}\n` +
      '  To run live: set MSSQL_URL="Server=localhost;Database=master;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True;"'
    );
    console.log('--- [TypeScript / SQL Server (MSSQL) Provider] Completed (offline safe) ---\n');
    return;
  }

  try {
    console.log('[TypeScript/MSSQL] Connected to SQL Server instance.');

    // 2. Setup schema DDL (detect native VECTOR type on SQL Server 2025)
    const hasVectorType = await (db as any).$queryRawUnsafe(
      `SELECT TYPE_ID('VECTOR') AS has_vector;`
    ).then((r: any[]) => r[0]?.has_vector !== null && r[0]?.has_vector !== undefined).catch(() => false);

    const vectorColDef = hasVectorType ? 'VECTOR(3)' : 'NVARCHAR(MAX)';

    const ddlStatements = [
      `IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;`,
      `IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;`,
      `CREATE TABLE dbo.users (
         id        NVARCHAR(100) PRIMARY KEY,
         email     NVARCHAR(255) NOT NULL UNIQUE,
         name      NVARCHAR(255) NULL,
         isActive  BIT NOT NULL DEFAULT 1,
         score     INT NOT NULL DEFAULT 0,
         embedding ${vectorColDef} NULL,
         createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
       );`,
      `CREATE TABLE dbo.orders (
         id        NVARCHAR(100) PRIMARY KEY,
         userId    NVARCHAR(100) NOT NULL,
         total     INT NOT NULL DEFAULT 0,
         status    NVARCHAR(50) NULL,
         createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
         CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES dbo.users(id)
       );`,
    ];

    for (const stmt of ddlStatements) {
      await db.$executeRawUnsafe(stmt);
    }
    console.log(`[TypeScript/MSSQL] Schema initialized (vector: ${vectorColDef}).`);

    // 3. Create records
    const charlie = await db.user.create({
      data: {
        email: 'charlie.mssql@example.com',
        name: 'Charlie MSSQL',
        score: 320,
        embedding: [0.5, 0.5, 0.0],
      },
    });
    console.log(`[TypeScript/MSSQL] Created user: id=${charlie.id}`);

    const order = await db.order.create({
      data: {
        userId: charlie.id,
        total: 750,
        status: 'shipped',
      },
    });
    console.log(`[TypeScript/MSSQL] Created order: id=${order.id}`);

    // 4. Query with relation loading (include)
    const users = await db.user.findMany({
      where: { email: { contains: 'charlie.mssql' } },
      include: { orders: true, _count: true },
    });
    console.log(`[TypeScript/MSSQL] Found ${users.length} user with ${users[0]?.orders?.length ?? 0} orders.`);

    // 5. Transaction test
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: charlie.id },
        data: { score: 350 },
      });
    });
    console.log('[TypeScript/MSSQL] Transaction committed.');

    // 6. Cleanup
    await db.orders.deleteMany({ where: { userId: charlie.id } });
    await db.user.deleteMany({ where: { id: charlie.id } });
    console.log('[TypeScript/MSSQL] Cleanup completed.');
    console.log('--- [TypeScript / SQL Server (MSSQL) Provider] Finished successfully ---\n');
  } finally {
    await db.$disconnect().catch(() => {});
  }
}

if (require.main === module) {
  runMssqlExample().catch((err) => {
    console.error('[TypeScript/MSSQL] Error:', err);
    process.exit(1);
  });
}
