// This file is auto-generated. Do not edit directly.
package an5.client

import an5.adapters.base.Metadata

/**
 * The generated models' tables, columns and relations.
 *
 * Registered with the runtime when a client is constructed. Without it the table clients have
 * no table names to work with and no primary key to fill in.
 */
object An5Metadata {

    /** Model name to table name, schema-qualified. */
    val modelToTable: Map<String, String> = linkedMapOf(
        "Order" to "orders",
        "User" to "users",
    )

    /** Model name to its columns, as the runtime reads them. */
    val modelFields: Map<String, List<Map<String, Any?>>> = linkedMapOf(
        "Order" to listOf(
            field("id", "string", "TEXT", false, true, true, "Primary key for the Order table (auto-generated UUID)"),
            field("userId", "string", "VARCHAR(255)", false, false, false, "Foreign key linking to the User model who placed the order"),
            field("total", "number", "INTEGER", false, true, false, "Total cost amount of the order"),
            field("status", "string", "VARCHAR(50)", true, false, false, "Order status: open, paid, shipped, cancelled"),
            field("createdAt", "Date", "DATETIME", false, true, false, "The date and time when the order was created")
        ),
        "User" to listOf(
            field("id", "string", "TEXT", false, true, true, "Primary key for the User table (auto-generated UUID)"),
            field("email", "string", "VARCHAR(255)", false, false, false, "Unique email address used for login and notifications"),
            field("name", "string", "VARCHAR(255)", true, false, false, "Display name of the user"),
            field("isActive", "boolean", "BOOLEAN", false, true, false, "Whether the user account is active"),
            field("score", "number", "INTEGER", false, true, false, "Accumulated score used in aggregation examples"),
            field("createdAt", "Date", "DATETIME", false, true, false, "Timestamp when the user profile was created")
        ),
    )

    /** Model name to its relations, keyed by relation name. */
    val relationMap: Map<String, Map<String, Map<String, String>>> = linkedMapOf(
        "Order" to linkedMapOf(
            "user" to relation("User", "", "userId", "id")
        ),
        "User" to linkedMapOf(
            "orders" to relation("Order", "", "userId", "id")
        ),
    )

    /** Registers this schema with the runtime. */
    fun register() {
        Metadata.setAdapterMetadata(
            linkedMapOf<String, Any?>(
                "modelToTable" to modelToTable,
                "modelFields" to modelFields,
                "relationMap" to relationMap,
            )
        )
    }

    private fun field(
        name: String,
        type: String,
        sql: String,
        optional: Boolean,
        hasDefault: Boolean,
        isId: Boolean,
        description: String? = null,
    ): Map<String, Any?> = linkedMapOf(
        "name" to name,
        "type" to type,
        "sql" to sql,
        "isOptional" to optional,
        "hasDefault" to hasDefault,
        "isId" to isId,
        "description" to description,
    )

    private fun relation(
        modelName: String,
        relationType: String,
        foreignKey: String,
        localKey: String,
    ): Map<String, String> = linkedMapOf(
        "modelName" to modelName,
        "relationType" to relationType,
        "foreignKey" to foreignKey,
        "localKey" to localKey,
    )
}
