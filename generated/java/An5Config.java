// This file is auto-generated. Do not edit directly.
package an5.client;

/**
 * Where the connection string comes from.
 *
 * <p>`DATABASE_URL` first, then the system property, so one deployment can override a
 * checked-in default without the file changing.
 */
public final class An5Config {

  private An5Config() {}

  /** The connection string, from the environment or the `an5.connectionString` property. */
  public static String connectionString() {
    String fromEnvironment = System.getenv("DATABASE_URL");
    if (fromEnvironment != null && !fromEnvironment.trim().isEmpty()) {
      return fromEnvironment.trim();
    }
    String fromProperty = System.getProperty("an5.connectionString");
    if (fromProperty != null && !fromProperty.trim().isEmpty()) {
      return fromProperty.trim();
    }
    throw new IllegalStateException(
        "No connection string: set DATABASE_URL or the an5.connectionString system property.");
  }
}
