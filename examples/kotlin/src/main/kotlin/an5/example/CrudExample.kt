package an5.example

import an5.adapters.Sort
import an5.client.An5Config
import an5.client.An5Db
import an5.client.An5Orm
import an5.client.Order
import an5.client.User
import java.nio.file.Files
import java.nio.file.Path

/**
 * AN5 example: generated Kotlin client + the JVM adapter it fronts.
 *
 * Everything below goes through the generated typed handles — `db.user` / `db.order` — with
 * no hand-written SQL for DML. The only raw SQL is the `CREATE TABLE` bootstrap, because
 * tables come from the schema, not the client.
 *
 * The Kotlin runtime is a front door over the same SQL builder the Java runtime uses, so
 * this exercises the interop the Java example cannot: the filter DSL, the query builder
 * lambda, and the immutable model that `update` writes from a partly filled value.
 *
 * It runs offline against a temporary SQLite database. Set `DATABASE_URL` to point it at a
 * reachable database instead, which is also what makes [An5Config] supply the connection
 * string rather than the example.
 *
 * Run: `npm run test:kotlin` from an5example.
 */
fun main() {
    var tempDatabase: Path? = null
    val connectionString = System.getenv("DATABASE_URL")
        ?.takeIf { it.isNotBlank() }
        ?.let { An5Config.connectionString() }
        ?: Files.createTempFile("an5-kotlin-example", ".sqlite").also { tempDatabase = it }
            // `sqlite:` plus an absolute path. The `sqlite:///` form drops the leading slash
            // when the wrapper is stripped, which turns an absolute path into a relative one.
            .let { "sqlite:" + it.toAbsolutePath() }

    try {
        An5Db(connectionString).use { db ->
            createTables(db)

            // ── Create ─────────────────────────────────────────────────────────
            val alice = db.user.create(
                User(email = "alice@example.com", name = "Alice", score = 123, embedding = doubleArrayOf(1.0, 0.0, 0.0))
            )
            val aliceId = checkNotNull(alice.id) { "create did not return the generated primary key" }
            println("created user $aliceId")

            val bob = db.user.create(
                User(email = "bob@example.com", name = "Bob", score = 7, embedding = doubleArrayOf(0.0, 1.0, 0.0))
            )
            db.order.create(Order(userId = aliceId, total = 250, status = "open"))
            db.order.create(Order(userId = aliceId, total = 75, status = "paid"))

            // ── Vector search ─────────────────────────────────────────────────────
            // A `VECTOR(n)` column is stored as float32 bytes and read back through
            // `vectorOrNull`; an empty result here means the generated model and the
            // stored bytes had drifted apart.
            val aliceRows = db.user.findMany(
                An5Orm.UserWhere(email = An5Orm.StringFilter.has("alice")).build()
            )
            val readBack = aliceRows.firstOrNull()?.embedding
            check(readBack != null && readBack.size == 3) {
                "the stored vector reads back as 3 numbers, got ${readBack?.size}"
            }
            check(kotlin.math.abs(readBack!![0] - 1.0) < 1e-6) { "wrong first component: ${readBack[0]}" }

            val ranked = db.user.vectorSearch(doubleArrayOf(1.0, 0.0, 0.0), take = 2, vectorField = "embedding")
            println("vector search returned ${ranked.size} rows")
            check(ranked.size == 2) { "both users carry an embedding, got ${ranked.size}" }
            check(ranked.first().id == aliceId) { "the user whose embedding matches the query ranks first" }

            // ── Read: typed string filter ──────────────────────────────────────
            val matching = db.user.findMany(
                An5Orm.UserWhere(email = An5Orm.StringFilter.has("alice")).build()
            )
            println("users matching 'alice': ${matching.size}")
            check(matching.size == 1) { "expected one alice, got ${matching.size}" }
            check(matching.first().email == "alice@example.com") { "wrong row returned" }

            // ── Read: typed number filter ──────────────────────────────────────
            val highScore = An5Orm.UserWhere(score = An5Orm.NumberFilter.atLeast(100))
            val strong = db.user.findMany(highScore.build())
            println("users with score >= 100: ${strong.size}")
            check(strong.size == 1) { "expected one high scorer, got ${strong.size}" }

            // ── Read: nested AND/OR through the typed where ────────────────────
            // A filter the adapter cannot read is not an error, it is an empty WHERE, which
            // matches every row — so these counts are what prove the nested clauses survived.
            val active = An5Orm.UserWhere(isActive = An5Orm.BoolFilter.`is`(true))
            val nestedAnd = db.user.findMany(An5Orm.UserWhere.andOf(active, highScore).build())
            println("active users with score >= 100: ${nestedAnd.size}")
            check(nestedAnd.size == 1) { "nested AND matched ${nestedAnd.size}, expected 1" }

            val nestedOr = db.user.findMany(
                An5Orm.UserWhere.orOf(
                    An5Orm.UserWhere(name = An5Orm.StringFilter.`is`("Alice")),
                    An5Orm.UserWhere(name = An5Orm.StringFilter.`is`("Bob"))
                ).build()
            )
            println("users named Alice or Bob: ${nestedOr.size}")
            check(nestedOr.size == 2) { "nested OR matched ${nestedOr.size}, expected 2" }

            // ── Read: eager-loaded relation ────────────────────────────────────
            val withOrders = db.user.findMany {
                where(mapOf("email" to mapOf("equals" to "alice@example.com")))
                include(mapOf("orders" to true))
            }
            check(withOrders.size == 1) { "expected alice back" }
            val loaded = withOrders.first()
            println("alice's orders, included: ${loaded.orders.size}")
            check(loaded.orders.size == 2) {
                "include returned ${loaded.orders.size} orders, expected 2"
            }
            check(loaded.orders.first().total != null) { "the included rows were not mapped" }

            // ── Read: relation filter on the child side ────────────────────────
            val aliceOrders = db.order.findMany {
                where(mapOf("userId" to mapOf("equals" to aliceId)))
                orderBy("total", Sort.DESC)
            }
            println("alice orders by total: ${aliceOrders.size}")
            check(aliceOrders.size == 2) { "relation filter returned ${aliceOrders.size}" }
            check(aliceOrders.first().total == 250) { "orderBy total desc was not applied" }

            // ── Aggregate ──────────────────────────────────────────────────────
            val stats = db.order.aggregate {
                count()
                sum("total")
            }
            println("orders stat: $stats")
            check((stats["_count"] as? Number)?.toInt() == 2) { "aggregate count was $stats" }
            check(stats["_sum_total"] is Number) { "aggregate sum was $stats" }

            // ── Count ──────────────────────────────────────────────────────────
            val users = db.user.count()
            println("users before cleanup: $users")
            check(users == 2L) { "count returned $users" }

            // ── Update ─────────────────────────────────────────────────────────
            val updated = db.user.update(
                An5Orm.UserWhere(email = An5Orm.StringFilter.`is`("bob@example.com")).build(),
                User(name = "Bobby", score = 50)
            )
            checkNotNull(updated) { "update returned no row" }
            println("bob is now ${updated.name} with score ${updated.score}")
            check(updated.name == "Bobby") { "update did not persist the new name" }
            check(updated.score == 50) { "update did not persist the new score" }

            // ── Delete ─────────────────────────────────────────────────────────
            val deletedOrders = db.order.deleteMany(
                mapOf("userId" to mapOf("equals" to aliceId))
            )
            val deletedUsers = db.user.deleteMany(
                mapOf("email" to mapOf("contains" to "example.com"))
            )
            println("deleted $deletedUsers users and $deletedOrders orders")
            check(deletedUsers == 2) { "deleteMany removed $deletedUsers users, expected 2" }

            val remaining = db.user.count()
            println("users after cleanup: $remaining")
            check(remaining == 0L) { "cleanup left $remaining users" }

            // ── Escape hatch: raw SQL through the same adapter ─────────────────
            val raw = db.query("SELECT 1 AS one")
            check(raw.size == 1) { "raw query returned ${raw.size} rows" }
            println("raw SELECT 1: ${raw.first()}")
        }
    } finally {
        tempDatabase?.let { Files.deleteIfExists(it) }
    }

    println("an5example Kotlin CRUD example passed")
}

/**
 * The schema bootstrap an application would run with `npm run db:push`: tables come from
 * the `.an5` files under `schema`, not from the client, so the client never writes DDL of
 * its own.
 */
private fun createTables(db: An5Db) {
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          score INTEGER NOT NULL DEFAULT 0,
          embedding BLOB NULL,
          createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        )
        """.trimIndent()
    )
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          total INTEGER NOT NULL DEFAULT 0,
          status TEXT NULL,
          createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
          FOREIGN KEY (userId) REFERENCES users(id)
        )
        """.trimIndent()
    )
}
