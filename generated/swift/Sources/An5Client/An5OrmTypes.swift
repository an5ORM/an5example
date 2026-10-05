// This file is auto-generated. Do not edit deliberately.
import Foundation
import An5Adapters

/// Typed filters for the generated models.
///
/// A filter is a small builder whose `build()` produces the filter tree the runtime's SQL
/// builder reads, so a query is checked at the call site and still compiles down to bind
/// parameters rather than interpolated SQL.
public enum An5Orm {

    /// A filter on a string column.
    public struct StringFilter {
        private var operators: Where = [:]

        public static func `is`(_ value: String?) -> StringFilter {
            var filter = StringFilter()
            filter.operators["equals"] = value
            return filter
        }

        public static func isNot(_ value: String?) -> StringFilter {
            var filter = StringFilter()
            filter.operators["not"] = value
            return filter
        }

        public static func has(_ value: String) -> StringFilter {
            var filter = StringFilter()
            filter.operators["contains"] = value
            return filter
        }

        public static func starts(_ value: String) -> StringFilter {
            var filter = StringFilter()
            filter.operators["startsWith"] = value
            return filter
        }

        public static func ends(_ value: String) -> StringFilter {
            var filter = StringFilter()
            filter.operators["endsWith"] = value
            return filter
        }

        public func inList(_ values: [String]) -> StringFilter {
            var filter = self
            filter.operators["in"] = values
            return filter
        }

        public func notInList(_ values: [String]) -> StringFilter {
            var filter = self
            filter.operators["notIn"] = values
            return filter
        }

        /// The filter as the runtime reads it.
        public func build() -> Where { operators }
    }

    /// A filter on an integer or floating-point column.
    public struct NumberFilter {
        private var operators: Where = [:]

        public static func `is`(_ value: Double?) -> NumberFilter {
            var filter = NumberFilter()
            filter.operators["equals"] = value
            return filter
        }

        public static func atLeast(_ value: Double?) -> NumberFilter {
            var filter = NumberFilter()
            filter.operators["gte"] = value
            return filter
        }

        public static func atMost(_ value: Double?) -> NumberFilter {
            var filter = NumberFilter()
            filter.operators["lte"] = value
            return filter
        }

        public static func greater(_ value: Double?) -> NumberFilter {
            var filter = NumberFilter()
            filter.operators["gt"] = value
            return filter
        }

        public static func less(_ value: Double?) -> NumberFilter {
            var filter = NumberFilter()
            filter.operators["lt"] = value
            return filter
        }

        public func inList(_ values: [Double]) -> NumberFilter {
            var filter = self
            filter.operators["in"] = values
            return filter
        }

        /// The filter as the runtime reads it.
        public func build() -> Where { operators }
    }

    /// A filter on a boolean column.
    public struct BoolFilter {
        private var operators: Where = [:]

        public static func `is`(_ value: Bool?) -> BoolFilter {
            var filter = BoolFilter()
            filter.operators["equals"] = value
            return filter
        }

        /// The filter as the runtime reads it.
        public func build() -> Where { operators }
    }

    /// A filter on a date column.
    public struct DateFilter {
        private var operators: Where = [:]

        public static func `is`(_ value: Date?) -> DateFilter {
            var filter = DateFilter()
            filter.operators["equals"] = value
            return filter
        }

        public static func atLeast(_ value: Date?) -> DateFilter {
            var filter = DateFilter()
            filter.operators["gte"] = value
            return filter
        }

        public static func atMost(_ value: Date?) -> DateFilter {
            var filter = DateFilter()
            filter.operators["lte"] = value
            return filter
        }

        /// The filter as the runtime reads it.
        public func build() -> Where { operators }
    }

    /// A `WHERE` for Order. Unset filters are left out.
    public struct OrderWhere {
        private var operators: Where = [:]
        public var id: StringFilter?
        public var userId: StringFilter?
        public var total: NumberFilter?
        public var status: StringFilter?
        public var createdAt: DateFilter?

        /// Creates a filter with every column unset; assign the ones you want to match.
        public init() {}

        public func and(_ clauses: OrderWhere...) -> OrderWhere {
            var filter = self
            filter.operators["AND"] = clauses.map { $0.build() }
            return filter
        }

        public func or(_ clauses: OrderWhere...) -> OrderWhere {
            var filter = self
            filter.operators["OR"] = clauses.map { $0.build() }
            return filter
        }

        public func not(_ clause: OrderWhere) -> OrderWhere {
            var filter = self
            filter.operators["NOT"] = [clause.build()]
            return filter
        }

        /// The filter tree as the runtime reads it.
        ///
        /// Column conditions are read from the properties here rather than written into
        /// `operators` as they are assigned, because a condition dropped on the way in is not
        /// an error — it is a filter that quietly matches every row.
        public func build() -> Where {
            var filter = operators
            if let id = id { filter["id"] = id.build() }
            if let userId = userId { filter["userId"] = userId.build() }
            if let total = total { filter["total"] = total.build() }
            if let status = status { filter["status"] = status.build() }
            if let createdAt = createdAt { filter["createdAt"] = createdAt.build() }
            return filter
        }
    }

    /// An `ORDER BY` for Order.
    public struct OrderOrderBy {
        private var entries: [[String: String]] = []

        public init() {}

        /// Orders by the columns, ascending.
        public func asc(_ columns: String...) -> OrderOrderBy {
            var order = self
            for column in columns { order.entries.append([column: "asc"]) }
            return order
        }

        /// Orders by the column, descending.
        public func desc(_ column: String) -> OrderOrderBy {
            var order = self
            order.entries.append([column: "desc"])
            return order
        }

        /// The sort as the runtime reads it.
        public func build() -> [[String: String]] { entries }
    }

    /// A `WHERE` for User. Unset filters are left out.
    public struct UserWhere {
        private var operators: Where = [:]
        public var id: StringFilter?
        public var email: StringFilter?
        public var name: StringFilter?
        public var isActive: BoolFilter?
        public var score: NumberFilter?
        public var createdAt: DateFilter?

        /// Creates a filter with every column unset; assign the ones you want to match.
        public init() {}

        public func and(_ clauses: UserWhere...) -> UserWhere {
            var filter = self
            filter.operators["AND"] = clauses.map { $0.build() }
            return filter
        }

        public func or(_ clauses: UserWhere...) -> UserWhere {
            var filter = self
            filter.operators["OR"] = clauses.map { $0.build() }
            return filter
        }

        public func not(_ clause: UserWhere) -> UserWhere {
            var filter = self
            filter.operators["NOT"] = [clause.build()]
            return filter
        }

        /// The filter tree as the runtime reads it.
        ///
        /// Column conditions are read from the properties here rather than written into
        /// `operators` as they are assigned, because a condition dropped on the way in is not
        /// an error — it is a filter that quietly matches every row.
        public func build() -> Where {
            var filter = operators
            if let id = id { filter["id"] = id.build() }
            if let email = email { filter["email"] = email.build() }
            if let name = name { filter["name"] = name.build() }
            if let isActive = isActive { filter["isActive"] = isActive.build() }
            if let score = score { filter["score"] = score.build() }
            if let createdAt = createdAt { filter["createdAt"] = createdAt.build() }
            return filter
        }
    }

    /// An `ORDER BY` for User.
    public struct UserOrderBy {
        private var entries: [[String: String]] = []

        public init() {}

        /// Orders by the columns, ascending.
        public func asc(_ columns: String...) -> UserOrderBy {
            var order = self
            for column in columns { order.entries.append([column: "asc"]) }
            return order
        }

        /// Orders by the column, descending.
        public func desc(_ column: String) -> UserOrderBy {
            var order = self
            order.entries.append([column: "desc"])
            return order
        }

        /// The sort as the runtime reads it.
        public func build() -> [[String: String]] { entries }
    }
}
