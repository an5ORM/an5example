// This file is auto-generated. Do not edit directly.
package an5.client;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a registered user in the database.
 *
 * <p>Mutable with getters and setters rather than a record, because `update` and `upsert`
 * take a partly filled instance and a record cannot say "this column is unchanged".
 */
public class User {

  // ── Relations ────────────────────────────────────────────────────────────
  private List<Order> orders;

  private String id;
  private String email;
  private String name;
  private Boolean isActive;
  private Integer score;
  private double[] embedding;
  private LocalDateTime createdAt;

  public String getId() {
    return this.id;
  }

  public void setId(String value) {
    this.id = value;
  }

  /** Sets Id and returns this instance, for chained construction. */
  public User withId(String value) {
    this.id = value;
    return this;
  }

  public String getEmail() {
    return this.email;
  }

  public void setEmail(String value) {
    this.email = value;
  }

  /** Sets Email and returns this instance, for chained construction. */
  public User withEmail(String value) {
    this.email = value;
    return this;
  }

  public String getName() {
    return this.name;
  }

  public void setName(String value) {
    this.name = value;
  }

  /** Sets Name and returns this instance, for chained construction. */
  public User withName(String value) {
    this.name = value;
    return this;
  }

  public Boolean getIsActive() {
    return this.isActive;
  }

  public void setIsActive(Boolean value) {
    this.isActive = value;
  }

  /** Sets IsActive and returns this instance, for chained construction. */
  public User withIsActive(Boolean value) {
    this.isActive = value;
    return this;
  }

  public Integer getScore() {
    return this.score;
  }

  public void setScore(Integer value) {
    this.score = value;
  }

  /** Sets Score and returns this instance, for chained construction. */
  public User withScore(Integer value) {
    this.score = value;
    return this;
  }

  public double[] getEmbedding() {
    return this.embedding;
  }

  public void setEmbedding(double[] value) {
    this.embedding = value;
  }

  /** Sets Embedding and returns this instance, for chained construction. */
  public User withEmbedding(double[] value) {
    this.embedding = value;
    return this;
  }

  public LocalDateTime getCreatedAt() {
    return this.createdAt;
  }

  public void setCreatedAt(LocalDateTime value) {
    this.createdAt = value;
  }

  /** Sets CreatedAt and returns this instance, for chained construction. */
  public User withCreatedAt(LocalDateTime value) {
    this.createdAt = value;
    return this;
  }

  public List<Order> getOrders() {
    return this.orders;
  }

  public void setOrders(List<Order> value) {
    this.orders = value;
  }

  /**
   * Reads `User` from a database row.
   *
   * <p>Every column goes through a converter rather than a cast: JDBC hands an `INT` back as
   * `Integer` on one driver and `Long` on another, and a `NUMERIC` column that fits in a
   * `long` still arrives as a `BigDecimal`.
   *
   * <p>Eager-loaded relations arrive as nested rows and are converted the same way. One that
   * was not asked for is left as it is, so `getOrders()` being `null` still means the query
   * did not include it.
   */
  public static User fromRow(Map<String, Object> row) {
    User value = new User();
    value.id = An5Values.asString(row.get("id"));
    value.email = An5Values.asString(row.get("email"));
    value.name = An5Values.asString(row.get("name"));
    value.isActive = An5Values.asBoolean(row.get("isActive"));
    value.score = An5Values.asInteger(row.get("score"));
    value.embedding = An5Values.asVector(row.get("embedding"));
    value.createdAt = An5Values.asLocalDateTime(row.get("createdAt"));
    if (row.get("orders") instanceof List) {
      List<Order> related = new ArrayList<Order>();
      for (Object item : (List<?>) row.get("orders")) {
        if (item instanceof Map) {
          @SuppressWarnings("unchecked")
          Map<String, Object> relationRow = (Map<String, Object>) item;
          related.add(Order.fromRow(relationRow));
        }
      }
      value.orders = related;
    }
    return value;
  }

  /**
   * The columns to write, in declaration order, with `null` left out.
   *
   * <p>An unset column takes the schema's DEFAULT, which is what leaving it out means — and
   * what `update` needs so a partial instance does not blank every other column.
   */
  public Map<String, Object> toValues() {
    Map<String, Object> values = new LinkedHashMap<String, Object>();
    if (this.id != null) {
      values.put("id", this.id);
    }
    if (this.email != null) {
      values.put("email", this.email);
    }
    if (this.name != null) {
      values.put("name", this.name);
    }
    if (this.isActive != null) {
      values.put("isActive", this.isActive);
    }
    if (this.score != null) {
      values.put("score", this.score);
    }
    if (this.embedding != null) {
      values.put("embedding", this.embedding);
    }
    if (this.createdAt != null) {
      values.put("createdAt", this.createdAt);
    }
    return values;
  }

  @Override
  public String toString() {
    return "User" + toValues();
  }
}
