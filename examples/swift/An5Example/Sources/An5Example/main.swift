// AN5 example: generated Swift client + the SQLite driver that ships with the AN5 runtime.
//
// Everything below goes through the generated typed handles — `db.user` / `db.order` — with
// no hand-written SQL for DML. The only raw SQL is the `CREATE TABLE` bootstrap, because
// tables come from the schema, not the client.
//
// The runtime is the mobile-facing one: it talks to SQLite through `CSQLite`, the same
// system library an app links on iOS, tvOS, watchOS, macOS and Android, so nothing here is
// desktop-only.
//
// It runs offline against a temporary database. Set `AN5_DATABASE_URL` to point it at a
// reachable database instead, which is also what makes `An5Config` supply the connection
// string rather than the example.
//
// Run: `npm run test:swift` from an5example.
import An5Adapters
import An5Client
import Foundation

/// A failed check carries the message all the way to `main`, where it is printed and the
/// process exits non-zero — a silent `assert` would vanish in release builds.
struct ExampleError: Error, CustomStringConvertible {
    let message: String

    init(_ message: String) {
        self.message = message
    }

    var description: String { message }
}

func check(_ condition: Bool, _ message: String) throws {
    if !condition {
        throw ExampleError(message)
    }
}

/// An aggregate cell as a number, whichever width SQLite picked for it.
///
/// The row type holds every value one optional deep, and a `count` may arrive as `Int` or
/// `Int64` depending on how the driver read the column — so this unwraps first and then
/// accepts either, the way the Java and Kotlin examples test against `Number`.
func aggregateNumber(_ value: Any??) -> Int? {
    guard let raw = value ?? nil else { return nil }
    switch raw {
    case let number as Int:
        return number
    case let number as Int64:
        return Int(number)
    case let number as Double:
        return Int(number)
    default:
        return nil
    }
}

func createTables(_ db: An5Db) throws {
    try db.execute(
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
        """)
    try db.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          total INTEGER NOT NULL DEFAULT 0,
          status TEXT NULL,
          createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
          FOREIGN KEY (userId) REFERENCES users(id)
        )
        """)
}

func runExample() throws {
    var temporaryDatabase: String?
    let db: An5Db
    if let live = ProcessInfo.processInfo.environment["AN5_DATABASE_URL"]?
        .trimmingCharacters(in: .whitespacesAndNewlines), !live.isEmpty {
        db = try An5Db(connectionString: try An5Config.connectionString())
    } else {
        let path = (NSTemporaryDirectory() as NSString)
            .appendingPathComponent("an5-swift-example-\(UUID().uuidString).sqlite")
        temporaryDatabase = path
        db = try An5Db(path: path)
    }

    defer {
        if let path = temporaryDatabase {
            try? FileManager.default.removeItem(atPath: path)
        }
    }

    try createTables(db)

    // ── Create ────────────────────────────────────────────────────────────────
    let alice = try db.user.create(User(email: "alice@example.com", name: "Alice", score: 123, embedding: [1.0, 0.0, 0.0]))
    guard let aliceId = alice.id else {
        throw ExampleError("create did not return the generated primary key")
    }
    print("created user \(aliceId)")

    _ = try db.user.create(User(email: "bob@example.com", name: "Bob", score: 7, embedding: [0.0, 1.0, 0.0]))
    _ = try db.order.create(Order(userId: aliceId, total: 250, status: "open"))
    _ = try db.order.create(Order(userId: aliceId, total: 75, status: "paid"))

    // ── Vector search ─────────────────────────────────────────────────────────
    // A `VECTOR(n)` column is stored as float32 bytes and read back as numbers, which
    // is what `row.vector` decodes; a column that came back empty here would mean the
    // generated model and the stored bytes had drifted apart.
    var aliceVectorWhere = An5Orm.UserWhere()
    aliceVectorWhere.email = An5Orm.StringFilter.has("alice")
    let aliceRows = try db.user.findMany(filter: aliceVectorWhere.build())
    let readBack = aliceRows.first?.embedding ?? []
    try check(readBack.count == 3, "the stored vector reads back as 3 numbers, got \(readBack.count)")
    try check(abs(readBack[0] - 1.0) < 1e-6, "wrong first component: \(readBack[0])")

    let ranked = try db.user.vectorSearch([1.0, 0.0, 0.0], take: 2, vectorField: "embedding", metric: .cosine)
    print("vector search returned \(ranked.count) rows")
    try check(ranked.count == 2, "both users carry an embedding, got \(ranked.count)")
    try check(ranked.first?.id == aliceId, "the user whose embedding matches the query ranks first")

    // ── Read: typed string filter ─────────────────────────────────────────────
    var aliceWhere = An5Orm.UserWhere()
    aliceWhere.email = An5Orm.StringFilter.has("alice")
    let matching = try db.user.findMany(filter: aliceWhere.build())
    print("users matching 'alice': \(matching.count)")
    try check(matching.count == 1, "expected one alice, got \(matching.count)")
    try check(matching.first?.email == "alice@example.com", "wrong row returned")

    // ── Read: typed number filter ─────────────────────────────────────────────
    var highScoreWhere = An5Orm.UserWhere()
    highScoreWhere.score = An5Orm.NumberFilter.atLeast(100)
    let strong = try db.user.findMany(filter: highScoreWhere.build())
    print("users with score >= 100: \(strong.count)")
    try check(strong.count == 1, "expected one high scorer, got \(strong.count)")

    // ── Read: nested AND/OR through the typed where ───────────────────────────
    // A filter the adapter cannot read is not an error, it is an empty WHERE, which matches
    // every row — so these counts are what prove the conditions survived the trip.
    var activeWhere = An5Orm.UserWhere()
    activeWhere.isActive = An5Orm.BoolFilter.`is`(true)
    let nestedAnd = try db.user.findMany(
        filter: An5Orm.UserWhere().and(activeWhere, highScoreWhere).build()
    )
    print("active users with score >= 100: \(nestedAnd.count)")
    try check(nestedAnd.count == 1, "nested AND matched \(nestedAnd.count), expected 1")

    var aliceName = An5Orm.UserWhere()
    aliceName.name = An5Orm.StringFilter.`is`("Alice")
    var bobName = An5Orm.UserWhere()
    bobName.name = An5Orm.StringFilter.`is`("Bob")
    // The receiver of `or` contributes its own conditions alongside the group, so the group
    // is built on an empty where — the same shape the Java and Kotlin examples use.
    let nestedOr = try db.user.findMany(
        filter: An5Orm.UserWhere().or(aliceName, bobName).build()
    )
    print("users named Alice or Bob: \(nestedOr.count)")
    try check(nestedOr.count == 2, "nested OR matched \(nestedOr.count), expected 2")

    // ── Read: eager-loaded relation ───────────────────────────────────────────
    let withOrders = try db.user.findMany(
        Query(
            filter: ["email": ["equals": "alice@example.com"]],
            include: ["orders": true]
        )
    )
    try check(withOrders.count == 1, "expected alice back")
    let loaded = withOrders[0]
    print("alice's orders, included: \(loaded.orders.count)")
    try check(loaded.orders.count == 2, "include returned \(loaded.orders.count) orders, expected 2")
    try check(loaded.orders.first?.total != nil, "the included rows were not mapped onto the model")

    // ── Read: relation filter on the child side ───────────────────────────────
    let aliceOrders = try db.order.findMany(
        Query(
            filter: ["userId": ["equals": aliceId]],
            orderBy: [["total": "desc"]]
        )
    )
    print("alice orders by total: \(aliceOrders.count)")
    try check(aliceOrders.count == 2, "relation filter returned \(aliceOrders.count)")
    try check(aliceOrders.first?.total == 250, "orderBy total desc was not applied")

    // ── Aggregate ─────────────────────────────────────────────────────────────
    var ordersAggregate = Aggregate()
    ordersAggregate.count = true
    ordersAggregate.sum = ["total"]
    let stats = try db.order.aggregate(ordersAggregate)
    print("orders stat: \(stats)")
    try check(aggregateNumber(stats["_count"]) == 2, "aggregate count was \(stats)")
    try check(aggregateNumber(stats["_sum_total"]) == 325, "aggregate sum was \(stats)")

    // ── Count ─────────────────────────────────────────────────────────────────
    let users = try db.user.count()
    print("users before cleanup: \(users)")
    try check(users == 2, "count returned \(users)")

    // ── Update ────────────────────────────────────────────────────────────────
    var bobWhere = An5Orm.UserWhere()
    bobWhere.email = An5Orm.StringFilter.`is`("bob@example.com")
    guard let updated = try db.user.update(
        filter: bobWhere.build(),
        data: User(name: "Bobby", score: 50)
    ) else {
        throw ExampleError("update returned no row")
    }
    print("bob is now \(updated.name ?? "unknown") with score \(updated.score ?? -1)")
    try check(updated.name == "Bobby", "update did not persist the new name")
    try check(updated.score == 50, "update did not persist the new score")

    // ── Delete ────────────────────────────────────────────────────────────────
    let deletedOrders = try db.order.deleteMany(filter: ["userId": ["equals": aliceId]])
    let deletedUsers = try db.user.deleteMany(filter: ["email": ["contains": "example.com"]])
    print("deleted \(deletedUsers) users and \(deletedOrders) orders")
    try check(deletedUsers == 2, "deleteMany removed \(deletedUsers) users, expected 2")

    let remaining = try db.user.count()
    print("users after cleanup: \(remaining)")
    try check(remaining == 0, "cleanup left \(remaining) users")

    // ── Escape hatch: raw SQL through the same adapter ────────────────────────
    let raw = try db.query("SELECT 1 AS one")
    try check(raw.count == 1, "raw query returned \(raw.count) rows")
    print("raw SELECT 1: \(raw[0])")
}

do {
    try runExample()
    print("an5example Swift CRUD example passed")
} catch {
    print("an5example Swift CRUD example failed: \(error)")
    exit(1)
}
