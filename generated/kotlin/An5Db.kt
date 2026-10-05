// This file is auto-generated. Do not edit directly.
package an5.client

import an5.adapters.AggregateBuilder
import an5.adapters.An5
import an5.adapters.Data
import an5.adapters.DistanceMetric
import an5.adapters.QueryBuilder
import an5.adapters.Row
import an5.adapters.TableClient
import an5.adapters.Where
import an5.adapters.andOf
import an5.adapters.contains
import an5.adapters.eq
import an5.adapters.endsWith
import an5.adapters.gte
import an5.adapters.gt
import an5.adapters.lte
import an5.adapters.lt
import an5.adapters.notOf
import an5.adapters.orOf
import an5.adapters.startsWith

/**
 * A typed client for one model.
 *
 * The runtime's [TableClient] works on untyped rows so it stays independent of the schema;
 * this adds the model's own types on top, which is what makes `db.user.findMany {}` come
 * back as `List<User>`.
 */
class ModelClient<T : Any>(
    private val delegate: TableClient,
    private val read: (Row) -> T,
    private val write: (T) -> Data,
) {

    /** The model this client reads and writes. */
    val model: String get() = delegate.model

    fun findMany(): List<T> = delegate.findMany().map(read)

    fun findMany(block: QueryBuilder.() -> Unit): List<T> = delegate.findMany(block).map(read)

    fun findMany(filter: Where): List<T> = delegate.findMany(filter).map(read)

    fun findFirst(block: QueryBuilder.() -> Unit = {}): T? = delegate.findFirst(block)?.let(read)

    fun findFirst(filter: Where): T? = delegate.findFirst(filter)?.let(read)

    fun findUnique(filter: Where): T? = delegate.findUnique(filter)?.let(read)

    fun count(filter: Where? = null): Long = delegate.count(filter)

    /** Inserts a value and returns it as stored. */
    fun create(value: T): T = delegate.create(write(value)).let(read)

    /** Inserts many values, one statement each. */
    fun createMany(values: List<T>, skipDuplicates: Boolean = false): Int =
        delegate.createMany(values.map(write), skipDuplicates)

    /** Updates the matching rows and returns the first of them re-read. */
    fun update(filter: Where, value: T): T? = delegate.update(filter, write(value))?.let(read)

    /** Updates every matching row and gives back how many changed. */
    fun updateMany(filter: Where?, value: T): Int = delegate.updateMany(filter, write(value))

    /** Deletes the matching rows and returns the one that was there first. */
    fun delete(filter: Where): T? = delegate.delete(filter)?.let(read)

    /** Deletes every matching row, or the whole table when [filter] is `null`. */
    fun deleteMany(filter: Where? = null): Int = delegate.deleteMany(filter)

    /** Updates the matching row when it exists, creates it otherwise. */
    fun upsert(filter: Where, create: T, update: T): T =
        delegate.upsert(filter, write(create), write(update)).let(read)

    /** One row of aggregate values, keyed `_count`, `_sum_<field>` and so on. */
    fun aggregate(block: AggregateBuilder.() -> Unit): Row = delegate.aggregate(block)

    /** One row per group, each carrying the group's count and aggregates. */
    fun groupBy(vararg by: String, block: AggregateBuilder.() -> Unit = {}): List<Row> =
        delegate.groupBy(*by, block = block)

    /** The rows nearest [vector]. */
    fun vectorSearch(
        vector: DoubleArray,
        take: Int = 10,
        filter: Where? = null,
        vectorField: String = "embedding",
        metric: DistanceMetric = DistanceMetric.COSINE,
    ): List<T> = delegate.vectorSearch(vector, take, filter, vectorField, metric).map(read)
}

/**
 * The AN5 entry point: one typed client per model, over one connection.
 *
 * ```
 * An5Db(An5Config.connectionString()).use { db ->
 *     val ada = db.user.findUnique(mapOf("name" to "Ada"))
 * }
 * ```
 *
 * Not thread-safe, exactly like the runtime underneath: a transaction holds one open
 * connection that every statement in the block has to share.
 */
class An5Db internal constructor(private val an5: An5) : AutoCloseable {

    /** Opens a client, registering this schema with the runtime. */
    constructor(connectionString: String) : this(open(connectionString))

    /** Queries for `Order`. */
    val order: ModelClient<Order> =
        ModelClient(an5.table("Order"), Order::fromRow, Order::toValues)

    /** Queries for `User`. */
    val user: ModelClient<User> =
        ModelClient(an5.table("User"), User::fromRow, User::toValues)

    /** The dialect the connection string points at. */
    val dialect get() = an5.dialect

    /** A read-only client for a database view. */
    fun view(name: String) = an5.view(name)

    /** A typed client for a table outside this schema. */
    fun <T : Any> table(
        model: String,
        read: (Row) -> T,
        write: (T) -> Data,
    ): ModelClient<T> = ModelClient(an5.table(model), read, write)

    /** Runs a query and returns its rows keyed by column label. */
    fun query(sql: String, vararg parameters: Any?): List<Row> = an5.queryRaw(sql, *parameters)

    /** Runs a statement that returns no rows and gives back the affected row count. */
    fun execute(sql: String, vararg parameters: Any?): Int = an5.executeRaw(sql, *parameters)

    /** Runs [block] inside a transaction, committing on return and rolling back on failure. */
    fun <T> transaction(block: (An5) -> T): T = an5.transaction(block)

    /** The runtime underneath, for anything the typed clients do not cover. */
    fun adapter(): An5 = an5

    override fun close() = an5.close()

    companion object {
        private fun open(connectionString: String): An5 {
            An5Metadata.register()
            return An5(connectionString)
        }
    }
}
