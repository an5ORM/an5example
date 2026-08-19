/**
 * Shared, dialect-parameterized CRUD + relations integration suite.
 *
 * Runs the same assertion set against any AN5 adapter engine (sqlite, postgres,
 * mysql, mssql) or the in-memory browser SQLite engine. Callers are responsible
 * for constructing the adapter, registering metadata and creating tables.
 *
 * Used by test/crud.sqlite.test.js, test/crud.live.test.js and
 * test/crud.browser.test.js.
 */
const assert = require('assert');

/**
 * @param {object} params
 * @param {any} params.db  configured, metadata-registered An5Adapter
 * @param {object} params.opts
 * @param {string} params.opts.label   human label printed on success
 * @param {(v:any)=>"1"|"0"} [params.opts.normalizeBool]
 * @param {string} [params.opts.rawUserTable]  table name for raw SQL assertions
 * @param {() => string} [params.opts.ts]      timestamp factory for createdAt
 */
async function runCrudSuite({ db, opts }) {
  const {
    label,
    normalizeBool = (v) => (v === true || v === 1 || v === '1' ? '1' : '0'),
    rawUserTable = 'users',
    ts = () => new Date().toISOString(),
  } = opts;

  await db.$connect();

  // ── CREATE (single) ────────────────────────────────────────────────────────
  const alice = await db.user.create({
    data: { createdAt: ts(), email: 'alice@example.com', name: 'Alice', score: 10 },
    include: { orders: true, _count: true },
  });
  assert.ok(alice.id, 'create should return the generated id');
  assert.strictEqual(alice.email, 'alice@example.com');
  assert.strictEqual(alice.score, 10);
  assert.deepStrictEqual(alice.orders, []);
  assert.deepStrictEqual(alice._count, { orders: 0 });

  // ── CREATE (nested writes) ─────────────────────────────────────────────────
  const bob = await db.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
      score: 20,
      orders: {
        create: [
          { createdAt: ts(), total: 100, status: 'open' },
          { createdAt: ts(), total: 250, status: 'paid' },
        ],
      },
    },
    include: { orders: { orderBy: { total: 'asc' } }, _count: true },
  });
  assert.strictEqual(bob.name, 'Bob');
  assert.deepStrictEqual(bob.orders.map((o) => o.total), [100, 250]);
  assert.deepStrictEqual(bob._count, { orders: 2 });

  // ── CREATE MANY ────────────────────────────────────────────────────────────
  const bulk = await db.user.createMany({
    data: [
      { createdAt: ts(), email: 'carol@example.com', name: 'Carol', score: 5 },
      { createdAt: ts(), email: 'dave@example.com', name: 'Dave', score: 15 },
      { createdAt: ts(), email: 'erin@example.com', name: 'Erin', score: 0 },
    ],
  });
  assert.strictEqual(bulk.count, 3);

  // ── FIND MANY (filters, orderBy, take) ─────────────────────────────────────
  const found = await db.user.findMany({
    where: { email: { contains: '@example.com' } },
    orderBy: { score: 'desc' },
  });
  assert.deepStrictEqual(found.map((u) => u.name), ['Bob', 'Dave', 'Alice', 'Carol', 'Erin']);
  assert.deepStrictEqual(found.map((u) => normalizeBool(u.isActive)), ['1', '1', '1', '1', '1']);

  const top2 = await db.user.findMany({ orderBy: { score: 'desc' }, take: 2 });
  assert.deepStrictEqual(top2.map((u) => u.name), ['Bob', 'Dave']);

  // ── FIND FIRST / FIND UNIQUE ───────────────────────────────────────────────
  const first = await db.user.findFirst({ where: { name: 'Carol' } });
  assert.strictEqual(first.email, 'carol@example.com');

  const unique = await db.user.findUnique({ where: { email: 'alice@example.com' } });
  assert.strictEqual(unique.id, alice.id);

  // ── RELATION FILTER + EAGER LOADING ────────────────────────────────────────
  const withOrders = await db.user.findMany({
    where: { orders: { some: { total: { gte: 200 } } } },
    include: { orders: { select: { id: true, total: true } }, _count: true },
  });
  assert.deepStrictEqual(withOrders.map((u) => u.name), ['Bob']);
  assert.strictEqual(withOrders[0].orders.length, 2);
  assert.strictEqual(withOrders[0]._count.orders, 2);

  // Many-to-one include from the child side.
  const paidOrders = await db.order.findMany({
    where: { status: 'paid' },
    include: { user: true },
  });
  assert.strictEqual(paidOrders.length, 1);
  assert.strictEqual(paidOrders[0].user.email, 'bob@example.com');

  // ── COUNT ──────────────────────────────────────────────────────────────────
  assert.strictEqual(await db.user.count(), 5);
  assert.strictEqual(await db.order.count({ where: { status: 'open' } }), 1);

  // ── UPDATE (field math) ────────────────────────────────────────────────────
  const updated = await db.user.update({
    where: { id: bob.id },
    data: { score: { increment: 5 } },
  });
  assert.strictEqual(Number(updated.score), 25);

  const multi = await db.user.updateMany({
    where: { score: { lte: 10 } },
    data: { score: { set: 50 } },
  });
  assert.strictEqual(multi.count, 3);

  // ── UPSERT ─────────────────────────────────────────────────────────────────
  const upserted = await db.user.upsert({
    where: { email: 'frank@example.com' },
    create: { createdAt: ts(), email: 'frank@example.com', name: 'Frank', score: 1 },
    update: { score: 99 },
  });
  assert.strictEqual(upserted.name, 'Frank');

  const upsertedExisting = await db.user.upsert({
    where: { email: 'alice@example.com' },
    create: { createdAt: ts(), email: 'alice@example.com', name: 'Alice', score: 1 },
    update: { score: 77 },
  });
  assert.strictEqual(Number(upsertedExisting.score), 77);

  // ── AGGREGATE ──────────────────────────────────────────────────────────────
  const stats = await db.order.aggregate({
    _count: true,
    _sum: { total: true },
    _avg: { total: true },
    _min: { total: true },
    _max: { total: true },
  });
  assert.strictEqual(Number(stats._count._all), 2);
  assert.strictEqual(Number(stats._sum.total), 350);
  assert.ok(Math.abs(Number(stats._avg.total) - 175) < 0.001);
  assert.strictEqual(Number(stats._min.total), 100);
  assert.strictEqual(Number(stats._max.total), 250);

  // ── GROUP BY ───────────────────────────────────────────────────────────────
  const grouped = await db.user.groupBy({
    by: 'isActive',
    _count: true,
    _sum: { score: true },
  });
  const byActive = Object.fromEntries(grouped.map((r) => [normalizeBool(r.isActive), Number(r._count)]));
  assert.strictEqual(byActive['1'], 6);

  // ── TRANSACTIONS ───────────────────────────────────────────────────────────
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: alice.id }, data: { score: { set: 123 } } });
    await tx.order.create({ data: { createdAt: ts(), userId: bob.id, total: 42, status: 'shipped' } });
  });
  assert.strictEqual(Number((await db.user.findUnique({ where: { id: alice.id } })).score), 123);
  assert.strictEqual(await db.order.count(), 3);

  await assert.rejects(
    () => db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: alice.id }, data: { score: { set: 999 } } });
      throw new Error('force rollback');
    }),
    /force rollback/
  );
  assert.strictEqual(Number((await db.user.findUnique({ where: { id: alice.id } })).score), 123, 'rollback should undo the update');

  // ── VECTOR SEARCH (in-memory fallback) ─────────────────────────────────────
  const vecRows = await db.user.vectorSearch({
    vector: [1, 0, 0],
    take: 3,
    vectorField: 'name',
    distanceMetric: 'cosine',
  });
  assert.ok(Array.isArray(vecRows));
  assert.ok(vecRows.every((r) => typeof r.distance === 'number'));

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const deleted = await db.order.delete({ where: { id: bob.orders[0].id } });
  assert.strictEqual(deleted.status, 'open');

  const delCount = await db.order.deleteMany({ where: { status: null } });
  assert.strictEqual(delCount.count, 0);

  assert.strictEqual(await db.order.count(), 2);

  // ── RAW QUERY ──────────────────────────────────────────────────────────────
  const rawRows = await db.$queryRawUnsafe(`SELECT COUNT(*) AS cnt FROM ${rawUserTable}`);
  assert.strictEqual(Number(rawRows[0].cnt), 6);

  console.log(`${label} passed`);
}

module.exports = { runCrudSuite };