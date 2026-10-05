// This file is auto-generated. Do not edit directly.
@file:Suppress("RedundantVisibilityModifier", "unused")

package an5.client

import java.time.LocalDateTime
import an5.adapters.Data as Values
import an5.adapters.Row
import an5.adapters.stringOrNull
import an5.adapters.intOrNull
import an5.adapters.localDateTimeOrNull
import an5.adapters.relatedOne

/**
 * Represents a customer order in the system.
 *
 * Every property is nullable and defaults to `null`, because `update` and `upsert` take a
 * partly filled value and a property left alone has to stay out of the statement.
 */
data class Order(
    val user: User? = null,
    val id: String? = null,
    val userId: String? = null,
    val total: Int? = null,
    val status: String? = null,
    val createdAt: LocalDateTime? = null
) {

    /**
     * The columns to write, in declaration order, with `null` left out.
     *
     * An unset column takes the schema's DEFAULT, which is what leaving it out means.
     */
    fun toValues(): Values = buildValues {
        this["id"] = this@Order.id
        this["userId"] = this@Order.userId
        this["total"] = this@Order.total
        this["status"] = this@Order.status
        this["createdAt"] = this@Order.createdAt
    }

    companion object {
        /**
         * Reads a Order out of a database row.
         *
         * Eager-loaded relations arrive as nested rows and are converted the same way; one
         * that was not asked for stays at its default, so an empty `orders` does not say
         * whether the query included it.
         */
        fun fromRow(row: Row): Order = Order(
            id = row.stringOrNull("id"),
            userId = row.stringOrNull("userId"),
            total = row.intOrNull("total"),
            status = row.stringOrNull("status"),
            createdAt = row.localDateTimeOrNull("createdAt"),
            user = row.relatedOne("user")?.let { User.fromRow(it) },
        )
    }
}

/** Collects column values, skipping the ones left unset. */
private inline fun buildValues(block: MutableMap<String, Any?>.() -> Unit): Values {
    val values = LinkedHashMap<String, Any?>()
    values.block()
    values.entries.removeAll { it.value == null }
    return values
}
