// This file is auto-generated. Do not edit deliberately.
import Foundation
import An5Adapters

/// The generated models' tables, columns and relations.
///
/// Passed to the runtime when a database is opened. Without it the table clients have no
/// table names to work with and no primary key to fill in.
public enum An5Metadata {

    /// Model name to table name, schema-qualified.
    public static let modelToTable: [String: String] = [
        "Order": "orders",
        "User": "users",
    ]

    /// Model name to its columns, as the runtime reads them.
    public static let modelFields: [String: [[String: Any?]]] = [
        "Order": [
            ["name": "id", "type": "string", "sql": "TEXT", "isOptional": false, "hasDefault": true, "isId": true, "description": "Primary key for the Order table (auto-generated UUID)"],
            ["name": "userId", "type": "string", "sql": "VARCHAR(255)", "isOptional": false, "hasDefault": false, "isId": false, "description": "Foreign key linking to the User model who placed the order"],
            ["name": "total", "type": "number", "sql": "INTEGER", "isOptional": false, "hasDefault": true, "isId": false, "description": "Total cost amount of the order"],
            ["name": "status", "type": "string", "sql": "VARCHAR(50)", "isOptional": true, "hasDefault": false, "isId": false, "description": "Order status: open, paid, shipped, cancelled"],
            ["name": "createdAt", "type": "Date", "sql": "DATETIME", "isOptional": false, "hasDefault": true, "isId": false, "description": "The date and time when the order was created"],
        ],
        "User": [
            ["name": "id", "type": "string", "sql": "TEXT", "isOptional": false, "hasDefault": true, "isId": true, "description": "Primary key for the User table (auto-generated UUID)"],
            ["name": "email", "type": "string", "sql": "VARCHAR(255)", "isOptional": false, "hasDefault": false, "isId": false, "description": "Unique email address used for login and notifications"],
            ["name": "name", "type": "string", "sql": "VARCHAR(255)", "isOptional": true, "hasDefault": false, "isId": false, "description": "Display name of the user"],
            ["name": "isActive", "type": "boolean", "sql": "BOOLEAN", "isOptional": false, "hasDefault": true, "isId": false, "description": "Whether the user account is active"],
            ["name": "score", "type": "number", "sql": "INTEGER", "isOptional": false, "hasDefault": true, "isId": false, "description": "Accumulated score used in aggregation examples"],
            ["name": "embedding", "type": "number[] | string", "sql": "VECTOR(3)", "isOptional": true, "hasDefault": false, "isId": false, "description": "Embedding vector for the semantic-search example"],
            ["name": "createdAt", "type": "Date", "sql": "DATETIME", "isOptional": false, "hasDefault": true, "isId": false, "description": "Timestamp when the user profile was created"],
        ],
    ]

    /// Model name to its relations, keyed by relation name.
    public static let relationMap: [String: [String: [String: String]]] = [
        "Order": [
            "user": ["modelName": "User", "relationType": "", "foreignKey": "userId", "localKey": "id"],
        ],
        "User": [
            "orders": ["modelName": "Order", "relationType": "", "foreignKey": "userId", "localKey": "id"],
        ],
    ]

    /// This schema, in the shape the runtime reads.
    public static var metadata: Metadata {
        Metadata([
            "modelToTable": modelToTable,
            "modelFields": modelFields,
            "relationMap": relationMap,
        ]) ?? .empty
    }
}
