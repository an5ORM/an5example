// This file is auto-generated. Do not edit directly.
package an5.client;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import an5.adapters.An5Aggregate;
import an5.adapters.An5GroupBy;
import an5.adapters.An5Query;
import an5.adapters.An5TableClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import an5.adapters.An5Adapter;
import an5.adapters.An5Aggregate;
import an5.adapters.An5GroupBy;
import an5.adapters.An5Query;
import an5.adapters.An5TableClient;

/**
 * A typed client for one model.
 *
 * <p>The row shape is supplied by the model class, so this stays generic: {@code findMany}
 * hands back {@code List<User>} rather than untyped maps, and {@code create} takes a
 * {@code User}.
 */
public final class ModelClient<T> {

  private final An5TableClient table;
  private final Function<Map<String, Object>, T> fromRow;
  private final Function<T, Map<String, Object>> toValues;

  ModelClient(
      An5TableClient table,
      Function<Map<String, Object>, T> fromRow,
      Function<T, Map<String, Object>> toValues) {
    this.table = table;
    this.fromRow = fromRow;
    this.toValues = toValues;
  }

  /** The model name this client reads and writes. */
  public String model() {
    return table.modelName();
  }

  public List<T> findMany() throws SQLException {
    return findMany(new An5Query());
  }

  public List<T> findMany(An5Query query) throws SQLException {
    return map(table.findMany(query));
  }

  public T findFirst(An5Query query) throws SQLException {
    return one(table.findFirst(query));
  }

  public T findFirst(Map<String, Object> where) throws SQLException {
    return one(table.findFirst(where));
  }

  public T findUnique(Map<String, Object> where) throws SQLException {
    return one(table.findUnique(where));
  }

  public long count(Map<String, Object> where) throws SQLException {
    return table.count(where);
  }

  /** Inserts a value and returns it as stored. */
  public T create(T value) throws SQLException {
    return one(table.create(toValues.apply(value)));
  }

  /** Inserts a value and returns it with the relations the query asked for. */
  public T create(T value, An5Query query) throws SQLException {
    return one(table.create(toValues.apply(value), query));
  }

  /** Inserts many values, one statement each. */
  public int createMany(List<T> values, boolean skipDuplicates) throws SQLException {
    List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
    for (T value : values) {
      rows.add(toValues.apply(value));
    }
    return affected(table.createMany(rows, skipDuplicates));
  }

  /** Updates the matching rows and returns the first of them re-read. */
  public T update(Map<String, Object> where, T value) throws SQLException {
    return one(table.update(where, toValues.apply(value)));
  }

  public T update(Map<String, Object> where, T value, An5Query query) throws SQLException {
    return one(table.update(new An5Query().where(where), toValues.apply(value), query));
  }

  /** Updates every matching row and gives back how many changed. */
  public int updateMany(Map<String, Object> where, T value) throws SQLException {
    return affected(table.updateMany(where, toValues.apply(value)));
  }

  /** Deletes the matching rows and returns the one that was there first. */
  public T delete(Map<String, Object> where) throws SQLException {
    return one(table.delete(where));
  }

  /** Deletes every matching row, or the whole table when `where` is `null`. */
  public int deleteMany(Map<String, Object> where) throws SQLException {
    return affected(table.deleteMany(where));
  }

  /** Updates the matching row when it exists, creates it otherwise. */
  public T upsert(Map<String, Object> where, T create, T update) throws SQLException {
    return one(table.upsert(where, toValues.apply(create), toValues.apply(update)));
  }

  /** One row of aggregate values, keyed `_count`, `_sum_<field>` and so on. */
  public Map<String, Object> aggregate(An5Aggregate aggregate) throws SQLException {
    return table.aggregate(aggregate);
  }

  /** One row per group. */
  public List<Map<String, Object>> groupBy(An5GroupBy group) throws SQLException {
    return table.groupBy(group);
  }

  /** The rows nearest a vector. */
  public List<T> vectorSearch(
      double[] vector, Integer take, Map<String, Object> where, String vectorField, String metric)
      throws SQLException {
    return map(table.vectorSearch(vector, take, where, vectorField, metric));
  }

  public List<T> vectorSearch(double[] vector, Integer take) throws SQLException {
    return vectorSearch(vector, take, null, "embedding", "cosine");
  }

  private List<T> map(List<Map<String, Object>> rows) {
    List<T> mapped = new ArrayList<T>();
    for (Map<String, Object> row : rows) {
      mapped.add(fromRow.apply(row));
    }
    return mapped;
  }

  private T one(Map<String, Object> row) {
    return row == null ? null : fromRow.apply(row);
  }

  private static int affected(Map<String, Object> result) {
    Object value = result.get("count");
    return value instanceof Number ? ((Number) value).intValue() : 0;
  }
}
