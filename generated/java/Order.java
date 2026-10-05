// This file is auto-generated. Do not edit directly.
package an5.client;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a customer order in the system.
 *
 * <p>Mutable with getters and setters rather than a record, because `update` and `upsert`
 * take a partly filled instance and a record cannot say "this column is unchanged".
 */
public class Order {

  // ── Relations ────────────────────────────────────────────────────────────
  private User user;

  private String id;
  private String userId;
  private Integer total;
  private String status;
  private LocalDateTime createdAt;

  public String getId() {
    return this.id;
  }

  public void setId(String value) {
    this.id = value;
  }

  /** Sets Id and returns this instance, for chained construction. */
  public Order withId(String value) {
    this.id = value;
    return this;
  }

  public String getUserId() {
    return this.userId;
  }

  public void setUserId(String value) {
    this.userId = value;
  }

  /** Sets UserId and returns this instance, for chained construction. */
  public Order withUserId(String value) {
    this.userId = value;
    return this;
  }

  public Integer getTotal() {
    return this.total;
  }

  public void setTotal(Integer value) {
    this.total = value;
  }

  /** Sets Total and returns this instance, for chained construction. */
  public Order withTotal(Integer value) {
    this.total = value;
    return this;
  }

  public String getStatus() {
    return this.status;
  }

  public void setStatus(String value) {
    this.status = value;
  }

  /** Sets Status and returns this instance, for chained construction. */
  public Order withStatus(String value) {
    this.status = value;
    return this;
  }

  public LocalDateTime getCreatedAt() {
    return this.createdAt;
  }

  public void setCreatedAt(LocalDateTime value) {
    this.createdAt = value;
  }

  /** Sets CreatedAt and returns this instance, for chained construction. */
  public Order withCreatedAt(LocalDateTime value) {
    this.createdAt = value;
    return this;
  }

  public User getUser() {
    return this.user;
  }

  public void setUser(User value) {
    this.user = value;
  }

  /**
   * Reads `Order` from a database row.
   *
   * <p>Every column goes through a converter rather than a cast: JDBC hands an `INT` back as
   * `Integer` on one driver and `Long` on another, and a `NUMERIC` column that fits in a
   * `long` still arrives as a `BigDecimal`.
   *
   * <p>Eager-loaded relations arrive as nested rows and are converted the same way. One that
   * was not asked for is left as it is, so `getOrders()` being `null` still means the query
   * did not include it.
   */
  public static Order fromRow(Map<String, Object> row) {
    Order value = new Order();
    value.id = An5Values.asString(row.get("id"));
    value.userId = An5Values.asString(row.get("userId"));
    value.total = An5Values.asInteger(row.get("total"));
    value.status = An5Values.asString(row.get("status"));
    value.createdAt = An5Values.asLocalDateTime(row.get("createdAt"));
    if (row.get("user") instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> relationRow = (Map<String, Object>) row.get("user");
      value.user = User.fromRow(relationRow);
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
    if (this.userId != null) {
      values.put("userId", this.userId);
    }
    if (this.total != null) {
      values.put("total", this.total);
    }
    if (this.status != null) {
      values.put("status", this.status);
    }
    if (this.createdAt != null) {
      values.put("createdAt", this.createdAt);
    }
    return values;
  }

  @Override
  public String toString() {
    return "Order" + toValues();
  }
}
