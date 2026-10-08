// This file is auto-generated. Do not edit deliberately.
import Foundation
import An5Adapters

/// Represents a registered user in the database.
public struct User {
    /// `TEXT`, primary key — Primary key for the User table (auto-generated UUID)
    public let id: String?
    /// `VARCHAR(255)` — Unique email address used for login and notifications
    public let email: String?
    /// `VARCHAR(255)` — Display name of the user
    public let name: String?
    /// `BOOLEAN` — Whether the user account is active
    public let isActive: Bool?
    /// `INTEGER` — Accumulated score used in aggregation examples
    public let score: Int?
    /// `VECTOR(3)` — Embedding vector for the semantic-search example
    public let embedding: [Double]?
    /// `DATETIME` — Timestamp when the user profile was created
    public let createdAt: Date?

    /// Eager-loaded with `include: ["orders": true]`.
    public var orders: [Order] = []

    public init(
        id: String? = nil,
        email: String? = nil,
        name: String? = nil,
        isActive: Bool? = nil,
        score: Int? = nil,
        embedding: [Double]? = nil,
        createdAt: Date? = nil
    ) {
        self.id = id
        self.email = email
        self.name = name
        self.isActive = isActive
        self.score = score
        self.embedding = embedding
        self.createdAt = createdAt
    }

    /// Reads `User` from a database row.
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
        self.email = row.string("email")
        self.name = row.string("name")
        self.isActive = row.bool("isActive")
        self.score = row.int("score")
        self.embedding = row.vector("embedding")
        self.createdAt = row.date("createdAt")
        self.orders = row.related("orders").map { Order(row: $0) }

    }

    /// The columns to write, in declaration order, with `nil` left out.
    ///
    /// An unset column takes the schema's DEFAULT, which is what leaving it out means —
    /// and what `update` needs so a partial value does not blank every other column.
    public var values: Values {
        var values = Values()
        if let value = self.id { values["id"] = value }
        if let value = self.email { values["email"] = value }
        if let value = self.name { values["name"] = value }
        if let value = self.isActive { values["isActive"] = value }
        if let value = self.score { values["score"] = value }
        if let value = self.embedding { values["embedding"] = value }
        if let value = self.createdAt { values["createdAt"] = value }
        return values
    }
}
