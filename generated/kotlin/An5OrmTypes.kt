// This file is auto-generated. Do not edit directly.
@file:Suppress("unused")

package an5.client

import an5.adapters.QueryBuilder
import an5.adapters.Where
import an5.adapters.andOf
import an5.adapters.notOf
import an5.adapters.orOf

/**
 * Typed filters for the generated models.
 *
 * A filter is a small builder whose [build] produces the filter tree the runtime's SQL
 * builder reads, so a query is checked at the call site and still compiles down to bind
 * parameters rather than interpolated SQL.
 */
object An5Orm {

    /** A filter on a string column. */
    data class StringFilter(
        val equals: String? = null,
        val not: String? = null,
        val `in`: List<String>? = null,
        val notIn: List<String>? = null,
        val contains: String? = null,
        val startsWith: String? = null,
        val endsWith: String? = null,
    ) {
        /** The filter as the runtime reads it, with every unset operator left out. */
        fun build(): Where = operatorMap {
            equals?.let { put("equals", it) }
            not?.let { put("not", it) }
            `in`?.let { put("in", it) }
            notIn?.let { put("notIn", it) }
            contains?.let { put("contains", it) }
            startsWith?.let { put("startsWith", it) }
            endsWith?.let { put("endsWith", it) }
        }

        companion object {
            /** The column equals [value]. */
            fun `is`(value: String) = StringFilter(equals = value)

            /** The column differs from [value]. */
            fun isNot(value: String) = StringFilter(not = value)

            /** The column contains [value]. */
            fun has(value: String) = StringFilter(contains = value)
        }
    }

    /** A filter on an integer, long or floating-point column. */
    data class NumberFilter(
        val equals: Number? = null,
        val not: Number? = null,
        val `in`: List<Number>? = null,
        val notIn: List<Number>? = null,
        val gt: Number? = null,
        val gte: Number? = null,
        val lt: Number? = null,
        val lte: Number? = null,
    ) {
        fun build(): Where = operatorMap {
            equals?.let { put("equals", it) }
            not?.let { put("not", it) }
            `in`?.let { put("in", it) }
            notIn?.let { put("notIn", it) }
            gt?.let { put("gt", it) }
            gte?.let { put("gte", it) }
            lt?.let { put("lt", it) }
            lte?.let { put("lte", it) }
        }

        companion object {
            fun `is`(value: Number) = NumberFilter(equals = value)
            fun isNot(value: Number) = NumberFilter(not = value)
            fun atLeast(value: Number) = NumberFilter(gte = value)
            fun atMost(value: Number) = NumberFilter(lte = value)
        }
    }

    /** A filter on a boolean column. */
    data class BoolFilter(val equals: Boolean? = null, val not: Boolean? = null) {
        fun build(): Where = operatorMap {
            equals?.let { put("equals", it) }
            not?.let { put("not", it) }
        }

        companion object {
            fun `is`(value: Boolean) = BoolFilter(equals = value)
        }
    }

    /** A filter on a date or time column. */
    data class DateFilter(
        val equals: Any? = null,
        val not: Any? = null,
        val `in`: List<Any>? = null,
        val notIn: List<Any>? = null,
        val gt: Any? = null,
        val gte: Any? = null,
        val lt: Any? = null,
        val lte: Any? = null,
    ) {
        fun build(): Where = operatorMap {
            equals?.let { put("equals", it) }
            not?.let { put("not", it) }
            `in`?.let { put("in", it) }
            notIn?.let { put("notIn", it) }
            gt?.let { put("gt", it) }
            gte?.let { put("gte", it) }
            lt?.let { put("lt", it) }
            lte?.let { put("lte", it) }
        }

        companion object {
            fun `is`(value: Any) = DateFilter(equals = value)
            fun atLeast(value: Any) = DateFilter(gte = value)
            fun atMost(value: Any) = DateFilter(lte = value)
        }
    }

    private fun operatorMap(block: MutableMap<String, Any?>.() -> Unit): Where {
        val map = LinkedHashMap<String, Any?>()
        map.block()
        return map
    }

    /** A `WHERE` for Order. Unset filters are left out. */
    data class OrderWhere(
        val and: List<OrderWhere>? = null,
        val or: List<OrderWhere>? = null,
        val not: List<OrderWhere>? = null,
        val id: StringFilter? = null,
        val userId: StringFilter? = null,
        val total: NumberFilter? = null,
        val status: StringFilter? = null,
        val createdAt: DateFilter? = null,
    ) {
        /** The filter tree as the runtime reads it. */
        fun build(): Where = operatorMap {
            and?.let { put("AND", it.map { clause -> clause.build() }) }
            or?.let { put("OR", it.map { clause -> clause.build() }) }
            not?.let { put("NOT", it.map { clause -> clause.build() }) }
            id?.let { put("id", it.build()) }
            userId?.let { put("userId", it.build()) }
            total?.let { put("total", it.build()) }
            status?.let { put("status", it.build()) }
            createdAt?.let { put("createdAt", it.build()) }
        }

        companion object {
            /** All of [clauses]; an empty list matches everything. */
            fun andOf(vararg clauses: OrderWhere) = OrderWhere(and = clauses.toList())

            /** Any of [clauses]; an empty list matches nothing. */
            fun orOf(vararg clauses: OrderWhere) = OrderWhere(or = clauses.toList())

            /** None of [clauses]; an empty list matches everything. */
            fun notOf(vararg clauses: OrderWhere) = OrderWhere(not = clauses.toList())
        }
    }

    /** An `ORDER BY` for Order. */
    data class OrderOrderBy(val entries: List<Map<String, String>> = emptyList()) {
        fun asc(vararg columns: String) = append(columns, "asc")
        fun desc(vararg columns: String) = append(columns, "desc")

        private fun append(columns: Array<out String>, direction: String) =
            OrderOrderBy(entries + columns.map { mapOf(it to direction) })

        /** The sort as the runtime reads it. */
        fun build(): List<Map<String, String>> = entries
    }

    /** A `WHERE` for User. Unset filters are left out. */
    data class UserWhere(
        val and: List<UserWhere>? = null,
        val or: List<UserWhere>? = null,
        val not: List<UserWhere>? = null,
        val id: StringFilter? = null,
        val email: StringFilter? = null,
        val name: StringFilter? = null,
        val isActive: BoolFilter? = null,
        val score: NumberFilter? = null,
        val embedding: StringFilter? = null,
        val createdAt: DateFilter? = null,
    ) {
        /** The filter tree as the runtime reads it. */
        fun build(): Where = operatorMap {
            and?.let { put("AND", it.map { clause -> clause.build() }) }
            or?.let { put("OR", it.map { clause -> clause.build() }) }
            not?.let { put("NOT", it.map { clause -> clause.build() }) }
            id?.let { put("id", it.build()) }
            email?.let { put("email", it.build()) }
            name?.let { put("name", it.build()) }
            isActive?.let { put("isActive", it.build()) }
            score?.let { put("score", it.build()) }
            embedding?.let { put("embedding", it.build()) }
            createdAt?.let { put("createdAt", it.build()) }
        }

        companion object {
            /** All of [clauses]; an empty list matches everything. */
            fun andOf(vararg clauses: UserWhere) = UserWhere(and = clauses.toList())

            /** Any of [clauses]; an empty list matches nothing. */
            fun orOf(vararg clauses: UserWhere) = UserWhere(or = clauses.toList())

            /** None of [clauses]; an empty list matches everything. */
            fun notOf(vararg clauses: UserWhere) = UserWhere(not = clauses.toList())
        }
    }

    /** An `ORDER BY` for User. */
    data class UserOrderBy(val entries: List<Map<String, String>> = emptyList()) {
        fun asc(vararg columns: String) = append(columns, "asc")
        fun desc(vararg columns: String) = append(columns, "desc")

        private fun append(columns: Array<out String>, direction: String) =
            UserOrderBy(entries + columns.map { mapOf(it to direction) })

        /** The sort as the runtime reads it. */
        fun build(): List<Map<String, String>> = entries
    }
}
