// This file is auto-generated. Do not edit deliberately.
import Foundation
import An5Adapters

/// A typed client for one model.
///
/// The runtime's `TableClient` works on untyped rows so it stays independent of the
/// schema; this adds the model's own type on top, which is what makes
/// `db.order.findMany()` come back as
/// `[Order]` rather than `[Row]`.
public struct ModelClient<T> {

    private let table: TableClient
    private let read: (Row) -> T
    private let write: (T) -> Values

    init(table: TableClient, read: @escaping (Row) -> T, write: @escaping (T) -> Values) {
        self.table = table
        self.read = read
        self.write = write
    }

    /// The model this client reads and writes.
    public var model: String { table.model }

    public func findMany() throws -> [T] { try table.findMany().map { read($0) } }

    public func findMany(_ query: Query) throws -> [T] { try table.findMany(query).map { read($0) } }

    public func findMany(filter: Where) throws -> [T] { try table.findMany(filter: filter).map { read($0) } }

    public func findFirst(_ query: Query = Query()) throws -> T? { try table.findFirst(query).map { read($0) } }

    public func findFirst(filter: Where) throws -> T? { try table.findFirst(filter: filter).map { read($0) } }

    public func findUnique(filter: Where) throws -> T? { try table.findUnique(filter: filter).map { read($0) } }

    public func count(_ filter: Where? = nil) throws -> Int { try table.count(filter) }

    /// Inserts a value and returns it as stored.
    @discardableResult
    public func create(_ value: T) throws -> T { read(try table.create(write(value))) }

    /// Inserts a value and returns it with the relations the query asked for.
    @discardableResult
    public func create(_ value: T, _ query: Query) throws -> T { read(try table.create(write(value), query)) }

    /// Inserts many values, one statement each.
    @discardableResult
    public func createMany(_ values: [T], skipDuplicates: Bool = false) throws -> Int {
        try table.createMany(values.map(write), skipDuplicates: skipDuplicates)
    }

    /// Updates the matching rows and returns the first of them re-read.
    @discardableResult
    public func update(filter: Where, data: T) throws -> T? { try table.update(filter: filter, data: write(data)).map { read($0) } }

    /// Updates every matching row and gives back how many changed.
    @discardableResult
    public func updateMany(filter: Where?, data: T) throws -> Int { try table.updateMany(filter: filter, data: write(data)) }

    /// Deletes the matching rows and returns the one that was there first.
    @discardableResult
    public func delete(filter: Where) throws -> T? { try table.delete(filter: filter).map { read($0) } }

    /// Deletes every matching row, or the whole table when `filter` is `nil`.
    @discardableResult
    public func deleteMany(filter: Where? = nil) throws -> Int { try table.deleteMany(filter: filter) }

    /// Updates the matching row when it exists, creates it otherwise.
    @discardableResult
    public func upsert(filter: Where, create: T, update: T) throws -> T {
        read(try table.upsert(filter: filter, create: write(create), update: write(update)))
    }

    /// One row of aggregate values, keyed `_count`, `_sum_<field>` and so on.
    public func aggregate(_ aggregate: Aggregate) throws -> Row { try table.aggregate(aggregate) }

    /// One row per group, each carrying the group's count and aggregates.
    public func groupBy(_ aggregate: Aggregate) throws -> [Row] { try table.groupBy(aggregate) }

    /// The rows nearest a vector.
    public func vectorSearch(
        _ vector: [Double],
        take: Int = 10,
        filter: Where? = nil,
        vectorField: String = "embedding",
        metric: DistanceMetric = .cosine
    ) throws -> [T] {
        try table.vectorSearch(vector, take: take, filter: filter, vectorField: vectorField, metric: metric).map { read($0) }
    }
}

/// The AN5 entry point: one typed client per model, over one connection.
///
/// ```
/// let db = try An5Db(path: ":memory:")
/// let ada = try db.user.findUnique(filter: ["name": "Ada"])
/// ```
public final class An5Db {

    /// The runtime underneath, for raw SQL and for anything the typed clients miss.
    public let an5: An5Adapter

    /// Queries for `Order`.
    public let order: ModelClient<Order>

    /// Queries for `User`.
    public let user: ModelClient<User>

    /// Opens a database from a connection string, registering this schema with the runtime.
    public convenience init(connectionString: String) throws {
        let driver = try SQLiteDriver(path: An5Db.path(connectionString))
        self.init(adapter: An5Adapter(driver: driver,
                                          connectionString: connectionString,
                                          metadata: An5Metadata.metadata))
    }

    /// Opens an in-memory or on-disk database, registering this schema with the runtime.
    public convenience init(path: String) throws {
        let driver = try SQLiteDriver(path: path)
        self.init(adapter: An5Adapter(driver: driver,
                                          connectionString: "sqlite::memory:",
                                          metadata: An5Metadata.metadata))
    }

    /// Wraps a runtime the caller already opened.
    public init(adapter: An5Adapter) {
        self.an5 = adapter
        self.order = ModelClient(
            table: adapter.table("Order"),
            read: { Order(row: $0) },
            write: { $0.values })
        self.user = ModelClient(
            table: adapter.table("User"),
            read: { User(row: $0) },
            write: { $0.values })
    }

    /// A typed client for a table outside this schema.
    public func table<T>(_ model: String, read: @escaping (Row) -> T, write: @escaping (T) -> Values) -> ModelClient<T> {
        ModelClient(table: an5.table(model), read: read, write: write)
    }

    /// A read-only client for a database view.
    public func view(_ name: String) -> ViewClient { an5.view(name) }

    /// The dialect the connection string points at.
    public var dialect: Dialect { an5.dialect }

    /// Runs a query and returns its rows keyed by column label.
    public func query(_ sql: String, _ parameters: [Any?] = []) throws -> [Row] {
        try an5.query(sql, parameters)
    }

    /// Runs a statement that returns no rows and gives back the affected row count.
    @discardableResult
    public func execute(_ sql: String, _ parameters: [Any?] = []) throws -> Int {
        try an5.execute(sql, parameters)
    }

    /// Runs `body` inside a transaction, committing on return and rolling back on failure.
    public func transaction<T>(_ body: (An5Adapter) throws -> T) throws -> T {
        try an5.transaction(body)
    }

    private static func path(_ connectionString: String) -> String {
        for prefix in ["sqlite:///", "sqlite://", "sqlite:"] where connectionString.hasPrefix(prefix) {
            return String(connectionString.dropFirst(prefix.count))
        }
        return connectionString
    }
}
