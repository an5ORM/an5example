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
import an5.adapters.An5ViewClient;

/** A read-only, typed client for one database view. */
public final class ViewClient<T> {

  private final An5ViewClient view;
  private final Function<Map<String, Object>, T> fromRow;

  ViewClient(An5ViewClient view, Function<Map<String, Object>, T> fromRow) {
    this.view = view;
    this.fromRow = fromRow;
  }

  /** The view name this client reads. */
  public String view() {
    return view.viewName();
  }

  public List<T> findMany() throws SQLException {
    return findMany(new An5Query());
  }

  public List<T> findMany(An5Query query) throws SQLException {
    return map(view.findMany(query));
  }

  public T findFirst(An5Query query) throws SQLException {
    return one(view.findFirst(query));
  }

  public T findFirst(Map<String, Object> where) throws SQLException {
    return one(view.findFirst(where));
  }

  public T findUnique(Map<String, Object> where) throws SQLException {
    return one(view.findUnique(where));
  }

  public long count(Map<String, Object> where) throws SQLException {
    return view.count(where);
  }

  public Map<String, Object> aggregate(An5Aggregate aggregate) throws SQLException {
    return view.aggregate(aggregate);
  }

  public List<Map<String, Object>> groupBy(An5GroupBy group) throws SQLException {
    return view.groupBy(group);
  }

  public List<T> vectorSearch(
      double[] vector, Integer take, Map<String, Object> where, String vectorField, String metric)
      throws SQLException {
    return map(view.vectorSearch(vector, take, where, vectorField, metric));
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
}
