// This file is auto-generated. Do not edit directly.
@file:Suppress("unused")

package an5.client

import an5.adapters.AggregateBuilder
import an5.adapters.QueryBuilder
import an5.adapters.Sort
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
        val mode: String? = null,
    ) {
        /** Sets the match mode (`"default"` or `"insensitive"`). */
        fun mode(value: String) = copy(mode = value)

        /** Marks this string filter case-insensitive (`mode = "insensitive"`). */
        fun insensitive() = copy(mode = "insensitive")

        fun inList(values: List<String>) = copy(`in` = values)

        fun notInList(values: List<String>) = copy(notIn = values)

        /** The filter as the runtime reads it, with every unset operator left out. */
        fun build(): Where = operatorMap {
            equals?.let { put("equals", it) }
            not?.let { put("not", it) }
            `in`?.let { put("in", it) }
            notIn?.let { put("notIn", it) }
            contains?.let { put("contains", it) }
            startsWith?.let { put("startsWith", it) }
            endsWith?.let { put("endsWith", it) }
            mode?.let { put("mode", it) }
        }

        companion object {
            /** The column equals [value]. */
            fun `is`(value: String) = StringFilter(equals = value)

            /** The column differs from [value]. */
            fun isNot(value: String) = StringFilter(not = value)

            /** The column contains [value]. */
            fun has(value: String) = StringFilter(contains = value)

            /** The column starts with [value]. */
            fun starts(value: String) = StringFilter(startsWith = value)

            /** The column ends with [value]. */
            fun ends(value: String) = StringFilter(endsWith = value)

            /** The column matches any value in [values]. */
            fun inList(values: List<String>) = StringFilter(`in` = values)

            /** The column matches no value in [values]. */
            fun notInList(values: List<String>) = StringFilter(notIn = values)
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
        fun inList(values: List<Number>) = copy(`in` = values)

        fun notInList(values: List<Number>) = copy(notIn = values)

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
            fun greater(value: Number) = NumberFilter(gt = value)
            fun less(value: Number) = NumberFilter(lt = value)
            fun inList(values: List<Number>) = NumberFilter(`in` = values)
            fun notInList(values: List<Number>) = NumberFilter(notIn = values)
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
            fun isNot(value: Boolean) = BoolFilter(not = value)
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

    /** Common interface implemented by generated model `WHERE` builders. */
    interface WhereBuilder {
        fun build(): Where
    }

    /** Common interface implemented by generated model `HAVING` builders. */
    interface HavingBuilder {
        fun build(): Where
    }

    /** Common interface implemented by generated model `groupBy` builders. */
    interface GroupByBuilder {
        fun build(): AggregateBuilder
    }

    /** A filter on a to-many relation (`some`, `none`, `every`). */
    class ListRelationFilter<T : WhereBuilder> private constructor(
        private val operators: Map<String, Any?> = emptyMap(),
    ) {
        fun some(filter: T? = null) = ListRelationFilter<T>(operators + ("some" to (filter?.build() ?: emptyMap<String, Any?>())))
        fun none(filter: T? = null) = ListRelationFilter<T>(operators + ("none" to (filter?.build() ?: emptyMap<String, Any?>())))
        fun every(filter: T) = ListRelationFilter<T>(operators + ("every" to filter.build()))
        fun build(): Where = LinkedHashMap(operators)

        companion object {
            fun <T : WhereBuilder> some(filter: T? = null) = ListRelationFilter<T>().some(filter)
            fun <T : WhereBuilder> none(filter: T? = null) = ListRelationFilter<T>().none(filter)
            fun <T : WhereBuilder> every(filter: T) = ListRelationFilter<T>().every(filter)
        }
    }

    /** A filter on a to-one relation (`is`, `isNot`). */
    class RelationFilter<T : WhereBuilder> private constructor(
        private val operators: Map<String, Any?> = emptyMap(),
    ) {
        fun `is`(filter: T?) = RelationFilter<T>(operators + ("is" to filter?.build()))
        fun isNot(filter: T?) = RelationFilter<T>(operators + ("isNot" to filter?.build()))
        fun build(): Where = LinkedHashMap(operators)

        companion object {
            fun <T : WhereBuilder> `is`(filter: T?) = RelationFilter<T>().`is`(filter)
            fun <T : WhereBuilder> isNot(filter: T?) = RelationFilter<T>().isNot(filter)
        }
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
        val user: RelationFilter<UserWhere>? = null,
    ) : WhereBuilder {
        /** The filter tree as the runtime reads it. */
        override fun build(): Where = operatorMap {
            and?.let { put("AND", it.map { clause -> clause.build() }) }
            or?.let { put("OR", it.map { clause -> clause.build() }) }
            not?.let { put("NOT", it.map { clause -> clause.build() }) }
            id?.let { put("id", it.build()) }
            userId?.let { put("userId", it.build()) }
            total?.let { put("total", it.build()) }
            status?.let { put("status", it.build()) }
            createdAt?.let { put("createdAt", it.build()) }
            user?.let { put("user", it.build()) }
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

    /** Count aggregate filter for Order.groupBy() HAVING clauses. */
    data class OrderCountAggregateFilter(
        val _all: NumberFilter? = null,
        val id: NumberFilter? = null,
        val userId: NumberFilter? = null,
        val total: NumberFilter? = null,
        val status: NumberFilter? = null,
        val createdAt: NumberFilter? = null,
    ) {
        fun build(): Where = operatorMap {
            _all?.let { put("_all", it.build()) }
            id?.let { put("id", it.build()) }
            userId?.let { put("userId", it.build()) }
            total?.let { put("total", it.build()) }
            status?.let { put("status", it.build()) }
            createdAt?.let { put("createdAt", it.build()) }
        }
    }

    /** Numeric aggregate filter (`_sum`/`_avg`) for Order.groupBy() HAVING clauses. */
    data class OrderNumericAggregateFilter(
        val total: NumberFilter? = null,
    ) {
        fun build(): Where = operatorMap {
            total?.let { put("total", it.build()) }
        }
    }

    /** Scalar aggregate filter (`_min`/`_max`) for Order.groupBy() HAVING clauses. */
    data class OrderScalarAggregateFilter(
        val id: StringFilter? = null,
        val userId: StringFilter? = null,
        val total: NumberFilter? = null,
        val status: StringFilter? = null,
        val createdAt: DateFilter? = null,
    ) {
        fun build(): Where = operatorMap {
            id?.let { put("id", it.build()) }
            userId?.let { put("userId", it.build()) }
            total?.let { put("total", it.build()) }
            status?.let { put("status", it.build()) }
            createdAt?.let { put("createdAt", it.build()) }
        }
    }

    /** Type-safe `HAVING` builder for Order.groupBy() queries. */
    data class OrderAggregateHaving(
        val and: List<OrderAggregateHaving>? = null,
        val or: List<OrderAggregateHaving>? = null,
        val not: List<OrderAggregateHaving>? = null,
        val _count: OrderCountAggregateFilter? = null,
        val _sum: OrderNumericAggregateFilter? = null,
        val _avg: OrderNumericAggregateFilter? = null,
        val _min: OrderScalarAggregateFilter? = null,
        val _max: OrderScalarAggregateFilter? = null,
        val id: StringFilter? = null,
        val userId: StringFilter? = null,
        val total: NumberFilter? = null,
        val status: StringFilter? = null,
        val createdAt: DateFilter? = null,
    ) : HavingBuilder {
        override fun build(): Where = operatorMap {
            and?.let { put("AND", it.map { clause -> clause.build() }) }
            or?.let { put("OR", it.map { clause -> clause.build() }) }
            not?.let { put("NOT", it.map { clause -> clause.build() }) }
            _count?.let { put("_count", it.build()) }
            _sum?.let { put("_sum", it.build()) }
            _avg?.let { put("_avg", it.build()) }
            _min?.let { put("_min", it.build()) }
            _max?.let { put("_max", it.build()) }
            id?.let { put("id", it.build()) }
            userId?.let { put("userId", it.build()) }
            total?.let { put("total", it.build()) }
            status?.let { put("status", it.build()) }
            createdAt?.let { put("createdAt", it.build()) }
        }

        companion object {
            /** All of [clauses]; an empty list matches everything. */
            fun andOf(vararg clauses: OrderAggregateHaving) = OrderAggregateHaving(and = clauses.toList())

            /** Any of [clauses]; an empty list matches nothing. */
            fun orOf(vararg clauses: OrderAggregateHaving) = OrderAggregateHaving(or = clauses.toList())

            /** None of [clauses]; an empty list matches everything. */
            fun notOf(vararg clauses: OrderAggregateHaving) = OrderAggregateHaving(not = clauses.toList())
        }
    }

    /** Type-safe `groupBy` builder for Order. */
    class OrderGroupBy : GroupByBuilder {
        private val builder = AggregateBuilder()

        fun by(vararg columns: String): OrderGroupBy = apply { builder.groupedBy(*columns) }

        fun where(filter: OrderWhere): OrderGroupBy = apply { builder.where(filter.build()) }

        fun where(filter: Where): OrderGroupBy = apply { builder.where(filter) }

        fun having(filter: OrderAggregateHaving): OrderGroupBy = apply { builder.having(filter.build()) }

        fun having(filter: Where): OrderGroupBy = apply { builder.having(filter) }

        fun orderBy(order: OrderOrderBy): OrderGroupBy = apply { builder.orderBy(order.build()) }

        fun orderBy(column: String, direction: Sort = Sort.ASC): OrderGroupBy =
            apply { builder.orderBy(column, direction) }

        fun skip(count: Int): OrderGroupBy = apply { builder.skip(count) }

        fun take(count: Int?): OrderGroupBy = apply { builder.take(count) }

        fun count(): OrderGroupBy = apply { builder.count() }

        fun count(vararg columns: String): OrderGroupBy = apply { builder.count(*columns) }

        fun sum(vararg columns: String): OrderGroupBy = apply { builder.sum(*columns) }

        fun avg(vararg columns: String): OrderGroupBy = apply { builder.avg(*columns) }

        fun min(vararg columns: String): OrderGroupBy = apply { builder.min(*columns) }

        fun max(vararg columns: String): OrderGroupBy = apply { builder.max(*columns) }

        override fun build(): AggregateBuilder = builder
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
        val orders: ListRelationFilter<OrderWhere>? = null,
    ) : WhereBuilder {
        /** The filter tree as the runtime reads it. */
        override fun build(): Where = operatorMap {
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
            orders?.let { put("orders", it.build()) }
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

    /** Count aggregate filter for User.groupBy() HAVING clauses. */
    data class UserCountAggregateFilter(
        val _all: NumberFilter? = null,
        val id: NumberFilter? = null,
        val email: NumberFilter? = null,
        val name: NumberFilter? = null,
        val isActive: NumberFilter? = null,
        val score: NumberFilter? = null,
        val embedding: NumberFilter? = null,
        val createdAt: NumberFilter? = null,
    ) {
        fun build(): Where = operatorMap {
            _all?.let { put("_all", it.build()) }
            id?.let { put("id", it.build()) }
            email?.let { put("email", it.build()) }
            name?.let { put("name", it.build()) }
            isActive?.let { put("isActive", it.build()) }
            score?.let { put("score", it.build()) }
            embedding?.let { put("embedding", it.build()) }
            createdAt?.let { put("createdAt", it.build()) }
        }
    }

    /** Numeric aggregate filter (`_sum`/`_avg`) for User.groupBy() HAVING clauses. */
    data class UserNumericAggregateFilter(
        val score: NumberFilter? = null,
    ) {
        fun build(): Where = operatorMap {
            score?.let { put("score", it.build()) }
        }
    }

    /** Scalar aggregate filter (`_min`/`_max`) for User.groupBy() HAVING clauses. */
    data class UserScalarAggregateFilter(
        val id: StringFilter? = null,
        val email: StringFilter? = null,
        val name: StringFilter? = null,
        val isActive: BoolFilter? = null,
        val score: NumberFilter? = null,
        val embedding: StringFilter? = null,
        val createdAt: DateFilter? = null,
    ) {
        fun build(): Where = operatorMap {
            id?.let { put("id", it.build()) }
            email?.let { put("email", it.build()) }
            name?.let { put("name", it.build()) }
            isActive?.let { put("isActive", it.build()) }
            score?.let { put("score", it.build()) }
            embedding?.let { put("embedding", it.build()) }
            createdAt?.let { put("createdAt", it.build()) }
        }
    }

    /** Type-safe `HAVING` builder for User.groupBy() queries. */
    data class UserAggregateHaving(
        val and: List<UserAggregateHaving>? = null,
        val or: List<UserAggregateHaving>? = null,
        val not: List<UserAggregateHaving>? = null,
        val _count: UserCountAggregateFilter? = null,
        val _sum: UserNumericAggregateFilter? = null,
        val _avg: UserNumericAggregateFilter? = null,
        val _min: UserScalarAggregateFilter? = null,
        val _max: UserScalarAggregateFilter? = null,
        val id: StringFilter? = null,
        val email: StringFilter? = null,
        val name: StringFilter? = null,
        val isActive: BoolFilter? = null,
        val score: NumberFilter? = null,
        val embedding: StringFilter? = null,
        val createdAt: DateFilter? = null,
    ) : HavingBuilder {
        override fun build(): Where = operatorMap {
            and?.let { put("AND", it.map { clause -> clause.build() }) }
            or?.let { put("OR", it.map { clause -> clause.build() }) }
            not?.let { put("NOT", it.map { clause -> clause.build() }) }
            _count?.let { put("_count", it.build()) }
            _sum?.let { put("_sum", it.build()) }
            _avg?.let { put("_avg", it.build()) }
            _min?.let { put("_min", it.build()) }
            _max?.let { put("_max", it.build()) }
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
            fun andOf(vararg clauses: UserAggregateHaving) = UserAggregateHaving(and = clauses.toList())

            /** Any of [clauses]; an empty list matches nothing. */
            fun orOf(vararg clauses: UserAggregateHaving) = UserAggregateHaving(or = clauses.toList())

            /** None of [clauses]; an empty list matches everything. */
            fun notOf(vararg clauses: UserAggregateHaving) = UserAggregateHaving(not = clauses.toList())
        }
    }

    /** Type-safe `groupBy` builder for User. */
    class UserGroupBy : GroupByBuilder {
        private val builder = AggregateBuilder()

        fun by(vararg columns: String): UserGroupBy = apply { builder.groupedBy(*columns) }

        fun where(filter: UserWhere): UserGroupBy = apply { builder.where(filter.build()) }

        fun where(filter: Where): UserGroupBy = apply { builder.where(filter) }

        fun having(filter: UserAggregateHaving): UserGroupBy = apply { builder.having(filter.build()) }

        fun having(filter: Where): UserGroupBy = apply { builder.having(filter) }

        fun orderBy(order: UserOrderBy): UserGroupBy = apply { builder.orderBy(order.build()) }

        fun orderBy(column: String, direction: Sort = Sort.ASC): UserGroupBy =
            apply { builder.orderBy(column, direction) }

        fun skip(count: Int): UserGroupBy = apply { builder.skip(count) }

        fun take(count: Int?): UserGroupBy = apply { builder.take(count) }

        fun count(): UserGroupBy = apply { builder.count() }

        fun count(vararg columns: String): UserGroupBy = apply { builder.count(*columns) }

        fun sum(vararg columns: String): UserGroupBy = apply { builder.sum(*columns) }

        fun avg(vararg columns: String): UserGroupBy = apply { builder.avg(*columns) }

        fun min(vararg columns: String): UserGroupBy = apply { builder.min(*columns) }

        fun max(vararg columns: String): UserGroupBy = apply { builder.max(*columns) }

        override fun build(): AggregateBuilder = builder
    }
}
