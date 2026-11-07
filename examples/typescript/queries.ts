/**
 * AN5 ORM: Complete Query API Showcase
 *
 * This example provides a full walkthrough of AN5 ORM query capabilities:
 * 1. Data Insertion (Single, Nested Writes, Bulk createMany)
 * 2. Advanced Filtering (Comparators, Strings, Sets, Arrays)
 * 3. Logical Combinators (AND, OR, NOT)
 * 4. Field Projection (select)
 * 5. Sorting & Pagination (orderBy, skip, take)
 * 6. Relational Joins & Filters (include, relation filters some/every/none)
 * 7. Mutations (update, atomic field math increment/decrement, upsert, delete)
 * 8. Aggregations & Group By (_count, _sum, _avg, _min, _max, groupBy)
 * 9. ACID Transactions (commit & automatic rollback on error)
 * 10. Semantic Vector Search (cosine similarity ranking)
 * 11. Raw SQL Escape Hatch ($queryRaw, $executeRaw)
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/queries.js
 */
import assert from 'assert';
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { modelToTable, modelFields, relationMap } from '../../generated/typescript/an5Metadata';
import type { UserTableClient } from '../../generated/typescript/User';
import type { OrderTableClient } from '../../generated/typescript/Order';

export interface ExampleModels {
  user: UserTableClient;
  users: UserTableClient;
  order: OrderTableClient;
  orders: OrderTableClient;
}

function ts(offsetMinutes = 0): string {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString();
}

function setupMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    tables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
  }
  setAdapterMetadata({
    modelToTable: tables,
    modelFields,
    relationMap,
  });
}

async function createSchema(db: any): Promise<void> {
  await db.$executeRaw(`
    CREATE TABLE IF NOT EXISTS users (
      id        TEXT PRIMARY KEY,
      email     TEXT NOT NULL UNIQUE,
      name      TEXT NULL,
      isActive  INTEGER NOT NULL DEFAULT 1,
      score     INTEGER NOT NULL DEFAULT 0,
      embedding BLOB NULL,
      createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );
  `);

  await db.$executeRaw(`
    CREATE TABLE IF NOT EXISTS orders (
      id        TEXT PRIMARY KEY,
      userId    TEXT NOT NULL,
      total     INTEGER NOT NULL DEFAULT 0,
      status    TEXT NULL,
      createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
}

async function main(): Promise<void> {
  console.log('================================================================');
  console.log('             AN5 ORM FULL QUERY API SHOWCASE                    ');
  console.log('================================================================\n');

  setupMetadata();
  const db = createAn5Adapter<ExampleModels>({ connectionString: 'sqlite://:memory:' });
  await db.$connect();
  await createSchema(db);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. DATA INSERTION: Single, Nested Writes, and createMany
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 1. DATA INSERTION');

  // 1.1 Single create
  const alice = await db.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      score: 100,
      embedding: [1.0, 0.0, 0.0],
      createdAt: ts(0),
    },
    include: { _count: true },
  });
  console.log(`  ✓ Created single User: id=${alice.id}, name=${alice.name}`);

  // 1.2 Nested relational write: creating User and Orders in one atomic call
  const bob = await db.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      score: 250,
      embedding: [0.0, 1.0, 0.0],
      createdAt: ts(1),
      orders: {
        create: [
          { total: 120, status: 'paid', createdAt: ts(1) },
          { total: 350, status: 'open', createdAt: ts(2) },
          { total: 80, status: 'paid', createdAt: ts(3) },
        ] as any,
      },
    },
    include: { orders: true, _count: true },
  });
  console.log(`  ✓ Created User with ${bob.orders?.length ?? 0} nested orders (id=${bob.id})`);

  // 1.3 Bulk insert: createMany
  const bulk = await db.user.createMany({
    data: [
      { email: 'charlie@example.com', name: 'Charlie Brown', score: 50, createdAt: ts(4) },
      { email: 'diana@example.com', name: 'Diana Prince', score: 300, createdAt: ts(5) },
      { email: 'edward@example.com', name: 'Edward Norton', score: 180, createdAt: ts(6) },
    ],
  });
  console.log(`  ✓ Bulk inserted ${bulk.count} users via createMany\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // 2. ADVANCED FILTERING & COMPARATORS
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 2. ADVANCED FILTERING & COMPARATORS');

  // Exact match and contains
  const matchingAlice = await db.user.findMany({
    where: { name: { contains: 'Alice' } },
  });
  console.log(`  ✓ contains('Alice'): found ${matchingAlice.length} user(s)`);

  // String startsWith and endsWith
  const domainUsers = await db.user.findMany({
    where: {
      email: { startsWith: 'd', endsWith: '@example.com' },
    },
  });
  console.log(`  ✓ startsWith('d') & endsWith('@example.com'): found ${domainUsers.map((u) => u.name).join(', ')}`);

  // Range comparators: gte, lte, gt, lt
  const highScorers = await db.user.findMany({
    where: { score: { gte: 200, lte: 300 } },
    orderBy: { score: 'desc' },
  });
  console.log(`  ✓ Range score >= 200 and <= 300: found ${highScorers.map((u) => `${u.name} (${u.score})`).join(', ')}`);

  // In / Not In sets
  const selectedScores = await db.user.findMany({
    where: { score: { in: [50, 100, 300] } },
  });
  console.log(`  ✓ in([50, 100, 300]): found ${selectedScores.length} user(s)\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // 3. LOGICAL COMBINATORS: AND, OR, NOT
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 3. LOGICAL COMBINATORS (AND, OR, NOT)');

  const complexQuery = await db.user.findMany({
    where: {
      OR: [
        { score: { gte: 250 } },
        {
          AND: [
            { score: { gte: 100 } },
            { email: { contains: 'alice' } },
          ],
        },
      ],
      NOT: [
        { name: { contains: 'Edward' } },
      ],
    },
  });
  console.log(`  ✓ (score >= 250 OR (score >= 100 AND alice)) AND NOT(Edward):`);
  for (const u of complexQuery) {
    console.log(`    - ${u.name} (score: ${u.score}, email: ${u.email})`);
  }
  console.log();

  // ───────────────────────────────────────────────────────────────────────────
  // 4. FIELD PROJECTIONS (select)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 4. FIELD PROJECTIONS (select)');

  const projected = await db.user.findMany({
    where: { score: { gt: 150 } },
    select: { id: true, name: true, score: true },
    orderBy: { score: 'desc' },
  });
  console.log(`  ✓ Projection select: { id, name, score }:`);
  console.log(`    ${JSON.stringify(projected[0])}\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // 5. SORTING & PAGINATION (orderBy, skip, take)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 5. SORTING & PAGINATION (orderBy, skip, take)');

  const page1 = await db.user.findMany({
    orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    skip: 0,
    take: 2,
  });
  console.log(`  ✓ Page 1 (take 2): ${page1.map((u) => `${u.name} (${u.score})`).join(', ')}`);

  const page2 = await db.user.findMany({
    orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
    skip: 2,
    take: 2,
  });
  console.log(`  ✓ Page 2 (skip 2, take 2): ${page2.map((u) => `${u.name} (${u.score})`).join(', ')}\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // 6. RELATIONS & DEEP JOINS (include & Relation Filters)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 6. RELATIONS & DEEP JOINS');

  // Add an order for Alice
  await db.order.create({
    data: { userId: alice.id, total: 500, status: 'paid', createdAt: ts(7) },
  });

  // Query User with eager-loaded Orders and relation _count
  const usersWithOrders = await db.user.findMany({
    where: { email: { in: ['alice@example.com', 'bob@example.com'] } },
    include: {
      orders: {
        where: { status: 'paid' },
        orderBy: { total: 'desc' },
      },
      _count: true,
    },
  });

  for (const u of usersWithOrders) {
    console.log(`  ✓ User "${u.name}" has ${u._count?.orders ?? 0} total order(s):`);
    for (const o of u.orders || []) {
      console.log(`    - Order ${o.id}: total=$${o.total}, status=${o.status}`);
    }
  }

  // Reverse relation: query Orders and eagerly include User
  const ordersWithUser = await db.order.findMany({
    where: { total: { gte: 300 } },
    include: { user: true },
    orderBy: { total: 'desc' },
  });
  console.log(`  ✓ Orders >= $300 including owner:`);
  for (const o of ordersWithUser) {
    console.log(`    - Order ${o.id} ($${o.total}) belongs to: ${o.user?.name} (${o.user?.email})`);
  }

  // Relation filtering: find users who have at least ONE order >= $400
  const usersWithBigOrders = await db.user.findMany({
    where: { orders: { some: { total: { gte: 400 } } } },
  });
  console.log(`  ✓ Relation filter (orders.some.total >= 400): found ${usersWithBigOrders.map((u) => u.name).join(', ')}\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // 7. MUTATIONS: update, Field Math, upsert, and delete
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 7. MUTATIONS: update, Field Math, upsert, and delete');

  // 7.1 Field math: atomic increment
  const updatedScore = await db.user.update({
    where: { id: alice.id },
    data: { score: { increment: 25 } },
  });
  console.log(`  ✓ Atomic field increment: Alice score 100 -> ${updatedScore.score}`);
  assert.strictEqual(updatedScore.score, 125);

  // 7.2 Bulk updateMany
  const updatedOrders = await db.orders.updateMany({
    where: { status: 'open' },
    data: { status: 'processing' },
  });
  console.log(`  ✓ updateMany: changed ${updatedOrders.count} order(s) from 'open' to 'processing'`);

  // 7.3 Upsert (insert when not found, update when found)
  const upsertNew = await db.user.upsert({
    where: { email: 'fiona@example.com' },
    create: { email: 'fiona@example.com', name: 'Fiona Gallagher', score: 75, createdAt: ts(8) },
    update: { score: 999 },
  });
  console.log(`  ✓ Upsert (created new): id=${upsertNew.id}, email=${upsertNew.email}`);

  const upsertExisting = await db.user.upsert({
    where: { email: 'alice@example.com' },
    create: { email: 'alice@example.com', name: 'Alice New', score: 0 },
    update: { score: 150 },
  });
  console.log(`  ✓ Upsert (updated existing): Alice score updated to ${upsertExisting.score}`);
  assert.strictEqual(upsertExisting.score, 150);

  // 7.4 Count before delete
  const totalUsersBefore = await db.user.count();
  console.log(`  ✓ Current total users count: ${totalUsersBefore}`);

  // Delete single record
  await db.user.delete({ where: { id: upsertNew.id } });
  console.log(`  ✓ Deleted user Fiona (id=${upsertNew.id})\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // 8. AGGREGATIONS & GROUP BY (_count, _sum, _avg, _min, _max, groupBy)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 8. AGGREGATIONS & GROUP BY');

  const orderStats = await db.order.aggregate({
    _count: true,
    _sum: { total: true },
    _avg: { total: true },
    _min: { total: true },
    _max: { total: true },
  });
  console.log('  ✓ Orders Aggregate Statistics:');
  console.log(`    Total count: ${orderStats._count._all}`);
  console.log(`    Sum total:   $${orderStats._sum.total}`);
  console.log(`    Average:     $${Number(orderStats._avg.total).toFixed(2)}`);
  console.log(`    Min / Max:   $${orderStats._min.total} / $${orderStats._max.total}`);

  // GroupBy status
  const groupedOrders = await db.order.groupBy({
    by: 'status',
    _count: true,
    _sum: { total: true },
  });
  console.log('  ✓ GroupBy status:');
  for (const g of groupedOrders) {
    console.log(`    - Status '${g.status}': count=${g._count}, sum=$${g._sum?.total ?? 0}`);
  }
  console.log();

  // ───────────────────────────────────────────────────────────────────────────
  // 9. ACID TRANSACTIONS ($transaction)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 9. ACID TRANSACTIONS');

  // 9.1 Successful atomic transaction
  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: alice.id },
      data: { score: 200 },
    });
    await tx.order.create({
      data: {
        userId: alice.id,
        total: 999,
        status: 'vip',
        createdAt: ts(9),
      },
    });
  });
  const aliceAfterTx = await db.user.findUnique({ where: { id: alice.id } });
  console.log(`  ✓ Transaction committed: Alice new score=${aliceAfterTx?.score}`);
  assert.strictEqual(aliceAfterTx?.score, 200);

  // 9.2 Transaction Rollback on Error
  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: alice.id },
        data: { score: 9999 },
      });
      // Deliberate error to trigger atomic rollback
      throw new Error('SIMULATED_PAYMENT_FAILURE');
    });
  } catch (err: any) {
    console.log(`  ✓ Transaction intercepted failure: "${err.message}" -> rolling back!`);
  }

  const aliceAfterRollback = await db.user.findUnique({ where: { id: alice.id } });
  console.log(`  ✓ Verified Rollback: Alice score remained ${aliceAfterRollback?.score} (not 9999)`);
  assert.strictEqual(aliceAfterRollback?.score, 200);
  console.log();

  // ───────────────────────────────────────────────────────────────────────────
  // 10. SEMANTIC VECTOR SIMILARITY SEARCH
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 10. SEMANTIC VECTOR SEARCH');

  // Alice: [1, 0, 0], Bob: [0, 1, 0]
  const vectorResults = await db.user.vectorSearch({
    vector: [0.95, 0.05, 0.0],
    take: 2,
    vectorField: 'embedding',
    distanceMetric: 'cosine',
  });

  console.log('  ✓ Query vector [0.95, 0.05, 0.0] nearest neighbors:');
  for (const match of vectorResults) {
    console.log(`    - User "${match.name}" (id: ${match.id}) distance: ${match.distance.toFixed(4)}`);
  }
  assert.strictEqual(vectorResults[0]?.id, alice.id, 'Alice must be ranked first as nearest vector');
  console.log();

  // ───────────────────────────────────────────────────────────────────────────
  // 11. RAW SQL ESCAPE HATCH ($queryRaw & $executeRaw)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('🔹 11. RAW SQL ESCAPE HATCH');

  // Parameterized raw query
  const rawUsers = await (db as any).$queryRawUnsafe(
    'SELECT id, email, score FROM users WHERE score >= @p_0 ORDER BY score DESC',
    150
  );
  console.log(`  ✓ $queryRawUnsafe: retrieved ${rawUsers.length} row(s) with score >= 150`);

  // Parameterized raw execute
  const rawAffected = await db.$executeRaw(
    'UPDATE users SET isActive = @p_0 WHERE score < @p_1',
    0,
    100
  );
  console.log(`  ✓ $executeRaw: marked ${rawAffected} user(s) as inactive\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // CLEANUP & SUMMARY
  // ───────────────────────────────────────────────────────────────────────────
  await db.orders.deleteMany({});
  await db.user.deleteMany({});
  const finalCount = await db.user.count();
  console.log(`  ✓ Cleanup finished. Final users count: ${finalCount}`);

  await db.$disconnect();

  console.log('\n================================================================');
  console.log('  🎉 ALL AN5 ORM QUERY API SHOWCASE CHECKS PASSED SUCCESSFULLY!  ');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('\n❌ Query showcase encountered an error:', err);
  process.exit(1);
});
