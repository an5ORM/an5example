// This file is auto-generated. Do not edit deliberately.
import Foundation
import An5Adapters

/// Represents a customer order in the system.
public struct Order {
    /// `TEXT`, primary key — Primary key for the Order table (auto-generated UUID)
    public let id: String?
    /// `VARCHAR(255)` — Foreign key linking to the User model who placed the order
    public let userId: String?
    /// `INTEGER` — Total cost amount of the order
    public let total: Int?
    /// `VARCHAR(50)` — Order status: open, paid, shipped, cancelled
    public let status: String?
    /// `DATETIME` — The date and time when the order was created
    public let createdAt: Date?

    /// Eager-loaded with `include: ["user": true]`.
    public var user: User? = nil

    public init(
        id: String? = nil,
        userId: String? = nil,
        total: Int? = nil,
        status: String? = nil,
        createdAt: Date? = nil
    ) {
        self.id = id
        self.userId = userId
        self.total = total
        self.status = status
        self.createdAt = createdAt
    }

    /// Reads `Order` from a database row.
    ///
    /// Every column goes through a converter rather than a cast: a `BOOL` arrives as an
    /// `Int` on one driver and `Bool` on another, and a `NUMERIC` column still arrives
    /// as a `Decimal` even when it would fit in an `Int`.
    ///
    /// Eager-loaded relations arrive as nested rows and are converted the same way; one
    /// that was not asked for keeps its default, so an empty `orders` does not say
    /// whether the query included it.
    public init(row: Row) {
        self.id = row.string("id")
        self.userId = row.string("userId")
        self.total = row.int("total")
        self.status = row.string("status")
        self.createdAt = row.date("createdAt")
        self.user = row.relatedOne("user").map { User(row: $0) }

    }

    /// The columns to write, in declaration order, with `nil` left out.
    ///
    /// An unset column takes the schema's DEFAULT, which is what leaving it out means —
    /// and what `update` needs so a partial value does not blank every other column.
    public var values: Values {
        var values = Values()
        if let value = self.id { values["id"] = value }
        if let value = self.userId { values["userId"] = value }
        if let value = self.total { values["total"] = value }
        if let value = self.status { values["status"] = value }
        if let value = self.createdAt { values["createdAt"] = value }
        return values
    }
}
