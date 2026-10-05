// This file is auto-generated. Do not edit directly.
package an5.client

/**
 * Where the connection string comes from.
 *
 * `DATABASE_URL` first, then the `an5.connectionString` system property, so one deployment
 * can override a checked-in default without the file changing.
 */
object An5Config {

    /** The connection string, or a message naming both places it can come from. */
    fun connectionString(): String {
        System.getenv("DATABASE_URL")?.takeIf { it.isNotBlank() }?.let { return it.trim() }
        System.getProperty("an5.connectionString")?.takeIf { it.isNotBlank() }?.let { return it.trim() }
        throw IllegalStateException(
            "No connection string: set DATABASE_URL or the an5.connectionString system property."
        )
    }
}
