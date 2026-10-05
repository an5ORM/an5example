// This file is auto-generated. Do not edit directly.
package an5.client;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import an5.adapters.base.Metadata;

/**
 * The generated models' tables, columns and relations.
 *
 * <p>Registered with the adapter when a context is constructed. Without it the table clients
 * have no table names to work with and no primary key to fill in.
 */
public final class An5Metadata {

  private An5Metadata() {}

  /** Model name to table name, schema-qualified. */
  public static final Map<String, String> MODEL_TO_TABLE;

  /** Model name to its columns, as the adapter reads them. */
  public static final Map<String, List<Map<String, Object>>> MODEL_FIELDS;

  /** Model name to its relations, keyed by relation name. */
  public static final Map<String, Map<String, Map<String, String>>> RELATION_MAP;

  static {
    Map<String, String> tables = new LinkedHashMap<String, String>();
    Map<String, List<Map<String, Object>>> fields = new LinkedHashMap<String, List<Map<String, Object>>>();
    Map<String, Map<String, Map<String, String>>> relations =
        new LinkedHashMap<String, Map<String, Map<String, String>>>();

    tables.put("Order", "orders");
    fields.put("Order", Arrays.asList(
        field("id", "string", "TEXT", false, true, true, "Primary key for the Order table (auto-generated UUID)"),
        field("userId", "string", "VARCHAR(255)", false, false, false, "Foreign key linking to the User model who placed the order"),
        field("total", "number", "INTEGER", false, true, false, "Total cost amount of the order"),
        field("status", "string", "VARCHAR(50)", true, false, false, "Order status: open, paid, shipped, cancelled"),
        field("createdAt", "Date", "DATETIME", false, true, false, "The date and time when the order was created")
    ));
    Map<String, Map<String, String>> orderRelations =
        new LinkedHashMap<String, Map<String, String>>();
    orderRelations.put("user",
        relation("User", "", "userId", "id"));
    relations.put("Order", orderRelations);
    tables.put("User", "users");
    fields.put("User", Arrays.asList(
        field("id", "string", "TEXT", false, true, true, "Primary key for the User table (auto-generated UUID)"),
        field("email", "string", "VARCHAR(255)", false, false, false, "Unique email address used for login and notifications"),
        field("name", "string", "VARCHAR(255)", true, false, false, "Display name of the user"),
        field("isActive", "boolean", "BOOLEAN", false, true, false, "Whether the user account is active"),
        field("score", "number", "INTEGER", false, true, false, "Accumulated score used in aggregation examples"),
        field("createdAt", "Date", "DATETIME", false, true, false, "Timestamp when the user profile was created")
    ));
    Map<String, Map<String, String>> userRelations =
        new LinkedHashMap<String, Map<String, String>>();
    userRelations.put("orders",
        relation("Order", "", "userId", "id"));
    relations.put("User", userRelations);

    MODEL_TO_TABLE = Collections.unmodifiableMap(tables);
    MODEL_FIELDS = Collections.unmodifiableMap(fields);
    RELATION_MAP = Collections.unmodifiableMap(relations);
  }

  private static Map<String, Object> field(
      String name, String type, String sql, boolean optional, boolean hasDefault, boolean isId) {
    return field(name, type, sql, optional, hasDefault, isId, null);
  }

  private static Map<String, Object> field(
      String name,
      String type,
      String sql,
      boolean optional,
      boolean hasDefault,
      boolean isId,
      String description) {
    Map<String, Object> field = new LinkedHashMap<String, Object>();
    field.put("name", name);
    field.put("type", type);
    field.put("sql", sql);
    field.put("isOptional", Boolean.valueOf(optional));
    field.put("hasDefault", Boolean.valueOf(hasDefault));
    field.put("isId", Boolean.valueOf(isId));
    field.put("description", description);
    return field;
  }

  private static Map<String, String> relation(
      String modelName, String relationName, String foreignKey, String localKey) {
    Map<String, String> relation = new LinkedHashMap<String, String>();
    relation.put("modelName", modelName);
    relation.put("relationType", relationName);
    relation.put("foreignKey", foreignKey);
    relation.put("localKey", localKey);
    return relation;
  }

  /** Registers this schema with the adapter runtime. */
  public static void register() {
    Map<String, Object> metadata = new LinkedHashMap<String, Object>();
    metadata.put("modelToTable", MODEL_TO_TABLE);
    metadata.put("modelFields", MODEL_FIELDS);
    metadata.put("relationMap", RELATION_MAP);
    Metadata.setAdapterMetadata(metadata);
  }
}
