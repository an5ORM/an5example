// This file is auto-generated. Do not edit directly.
package an5.client;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import an5.adapters.An5Adapter;

/**
 * The AN5 entry point: one typed client per model, over one connection.
 *
 * <pre>
 * try (An5DbContext db = new An5DbContext(An5Config.connectionString())) {
 *   An5OrmTypes.UserWhere where = new An5OrmTypes.UserWhere();
 *   where.Name = An5OrmTypes.StringFilter.is("Ada");
 *   User ada = db.getUser().findUnique(where.toMap());
 * }
 * </pre>
 */
public class An5DbContext implements AutoCloseable {

  private final An5Adapter adapter;
  private final ModelClient<Order> orderClient;
  private final ModelClient<User> userClient;

  /** Opens a context, registering this schema with the adapter. */
  public An5DbContext(String connectionString) {
    An5Metadata.register();
    this.adapter = new An5Adapter(connectionString);
    this.orderClient = new ModelClient<Order>(
        adapter.table("Order"), Order::fromRow, Order::toValues);
    this.userClient = new ModelClient<User>(
        adapter.table("User"), User::fromRow, User::toValues);
  }

  /** Wraps an adapter the caller already opened. */
  public An5DbContext(An5Adapter adapter) {
    An5Metadata.register();
    this.adapter = adapter;
    this.orderClient = new ModelClient<Order>(
        adapter.table("Order"), Order::fromRow, Order::toValues);
    this.userClient = new ModelClient<User>(
        adapter.table("User"), User::fromRow, User::toValues);
  }

  /** The underlying adapter, for raw SQL and for tables outside this schema. */
  public An5Adapter adapter() {
    return adapter;
  }

  /** The dialect the connection string points at. */
  public an5.adapters.base.Dialect dialect() {
    return adapter.dialect();
  }

  /** Queries for `Order`. */
  public ModelClient<Order> getOrder() {
    return this.orderClient;
  }

  /** Queries for `User`. */
  public ModelClient<User> getUser() {
    return this.userClient;
  }

  /** A typed client for a table outside this schema. */
  public <T> ModelClient<T> table(
      String model, Function<Map<String, Object>, T> fromRow, Function<T, Map<String, Object>> toValues) {
    return new ModelClient<T>(adapter.table(model), fromRow, toValues);
  }

  /** A read-only client for a database view. */
  public an5.adapters.An5ViewClient view(String viewName) {
    return adapter.view(viewName);
  }

  /** Runs a query and returns its rows keyed by column label. */
  public List<Map<String, Object>> queryRaw(String sql, Object... parameters) throws SQLException {
    return adapter.queryRaw(sql, parameters);
  }

  /** Runs a statement that returns no rows. */
  public int executeRaw(String sql, Object... parameters) throws SQLException {
    return adapter.executeRaw(sql, parameters);
  }

  /** Runs work inside a transaction, committing on return and rolling back on failure. */
  public <T> T transaction(An5Adapter.TransactionWork<T> work) throws SQLException {
    return adapter.transaction(work);
  }

  @Override
  public void close() {
    adapter.close();
  }
}
