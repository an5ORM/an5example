package an5.example;

import an5.adapters.An5Aggregate;
import an5.adapters.An5Query;
import an5.client.An5Config;
import an5.client.An5DbContext;
import an5.client.An5OrmTypes.BoolFilter;
import an5.client.An5OrmTypes.NumberFilter;
import an5.client.An5OrmTypes.StringFilter;
import an5.client.An5OrmTypes.UserWhere;
import an5.client.Order;
import an5.client.User;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * AN5 example: generated Java client + JDBC runtime against SQLite.
 *
 * <p>Everything below goes through the generated typed handles — {@code db.getUser()} /
 * {@code db.getOrder()} — with no hand-written SQL for DML. The only raw SQL is the {@code
 * CREATE TABLE} bootstrap, because tables come from the schema, not the client.
 *
 * <p>It runs offline against a temporary SQLite database. Set {@code DATABASE_URL} to point it
 * at a reachable database instead, which is also what makes {@link An5Config} supply the
 * connection string rather than the example.
 *
 * <p>Run: {@code npm run test:java} from an5example.
 */
public final class CrudExample {

  private CrudExample() {}

  private static void check(boolean condition, String message) {
    if (!condition) {
      throw new IllegalStateException(message);
    }
  }

  /** A filter on one column: the map form the adapter's SQL builder reads. */
  private static Map<String, Object> filter(String column, Object condition) {
    Map<String, Object> out = new LinkedHashMap<String, Object>();
    out.put(column, condition);
    return out;
  }

  /** A single operator: {@code contains}, {@code equals}, {@code gte} and friends. */
  private static Map<String, Object> op(String name, Object value) {
    Map<String, Object> out = new LinkedHashMap<String, Object>();
    out.put(name, value);
    return out;
  }

  public static void main(String[] args) throws Exception {
    Path tempDatabase = null;
    String connectionString;
    String live = System.getenv("DATABASE_URL");
    if (live != null && !live.trim().isEmpty()) {
      connectionString = An5Config.connectionString();
    } else {
      // `sqlite:` plus an absolute path. The `sqlite:///` form drops the leading slash when
      // the wrapper is stripped, which turns an absolute path into a relative one.
      tempDatabase = Files.createTempFile("an5-java-example", ".sqlite");
      connectionString = "sqlite:" + tempDatabase.toAbsolutePath();
    }

    try {
      try (An5DbContext db = new An5DbContext(connectionString)) {
        createTables(db);

        // ── Create ─────────────────────────────────────────────────────────────
        User alice =
            db.getUser()
                .create(new User().withEmail("alice@example.com").withName("Alice").withScore(123)
                    .withEmbedding(new double[] {1.0, 0.0, 0.0}));
        System.out.println("created user " + alice.getId());
        check(alice.getId() != null, "create did not return the generated primary key");

        User bob =
            db.getUser()
                .create(new User().withEmail("bob@example.com").withName("Bob").withScore(7)
                    .withEmbedding(new double[] {0.0, 1.0, 0.0}));
        db.getOrder()
            .create(new Order().withUserId(alice.getId()).withTotal(250).withStatus("open"));
        db.getOrder()
            .create(new Order().withUserId(alice.getId()).withTotal(75).withStatus("paid"));

        // ── Vector search ──────────────────────────────────────────────────────
        // A `VECTOR(n)` column is stored as float32 bytes and read back through
        // `An5Values.asVector`; a null here means the generated converter and the
        // stored bytes had drifted apart.
        List<User> aliceRows =
            db.getUser().findMany(new An5Query().where(filter("email", op("contains", "alice"))));
        double[] readBack = aliceRows.get(0).getEmbedding();
        check(readBack != null && readBack.length == 3,
            "the stored vector reads back as 3 numbers, got "
                + (readBack == null ? "null" : readBack.length));
        check(Math.abs(readBack[0] - 1.0) < 1e-6, "wrong first component: " + readBack[0]);

        List<User> ranked = db.getUser().vectorSearch(new double[] {1.0, 0.0, 0.0}, 2, null, "embedding", "cosine");
        System.out.println("vector search returned " + ranked.size() + " rows");
        check(ranked.size() == 2, "both users carry an embedding, got " + ranked.size());
        check(alice.getId().equals(ranked.get(0).getId()),
            "the user whose embedding matches the query ranks first");

        // ── Read: typed string filter ──────────────────────────────────────────
        List<User> matching =
            db.getUser().findMany(new An5Query().where(filter("email", op("contains", "alice"))));
        System.out.println("users matching 'alice': " + matching.size());
        check(matching.size() == 1, "expected one alice, got " + matching.size());
        check("alice@example.com".equals(matching.get(0).getEmail()), "wrong row returned");

        // ── Read: typed number filter ──────────────────────────────────────────
        UserWhere highScore = new UserWhere();
        highScore.Score = NumberFilter.atLeast(100);
        List<User> strong = db.getUser().findMany(new An5Query().where(highScore.toMap()));
        System.out.println("users with score >= 100: " + strong.size());
        check(strong.size() == 1, "expected one high scorer, got " + strong.size());

        // ── Read: nested AND/OR through the typed where ────────────────────────
        // A filter the adapter cannot read is not an error, it is an empty WHERE, which
        // matches every row — so these counts are what prove the nested clauses survived.
        UserWhere active = new UserWhere();
        active.IsActive = BoolFilter.is(true);
        UserWhere aliceName = new UserWhere();
        aliceName.Name = StringFilter.is("Alice");
        UserWhere bobName = new UserWhere();
        bobName.Name = StringFilter.is("Bob");

        List<User> nestedAnd =
            db.getUser()
                .findMany(new An5Query().where(new UserWhere().and(active, highScore).toMap()));
        System.out.println("active users with score >= 100: " + nestedAnd.size());
        check(nestedAnd.size() == 1, "nested AND matched " + nestedAnd.size() + ", expected 1");

        List<User> nestedOr =
            db.getUser()
                .findMany(new An5Query().where(new UserWhere().or(aliceName, bobName).toMap()));
        System.out.println("users named Alice or Bob: " + nestedOr.size());
        check(nestedOr.size() == 2, "nested OR matched " + nestedOr.size() + ", expected 2");

        // ── Read: eager-loaded relation ────────────────────────────────────────
        List<User> withOrders =
            db.getUser()
                .findMany(
                    new An5Query()
                        .where(filter("email", op("equals", "alice@example.com")))
                        .include(filter("orders", Boolean.TRUE)));
        check(withOrders.size() == 1, "expected alice back");
        User loaded = withOrders.get(0);
        int orderCount = loaded.getOrders() == null ? -1 : loaded.getOrders().size();
        System.out.println("alice's orders, included: " + orderCount);
        check(orderCount == 2, "include returned " + orderCount + " orders, expected 2");
        check(
            loaded.getOrders().get(0).getTotal() != null,
            "the included rows were not mapped onto the model");

        // ── Read: relation filter on the child side ────────────────────────────
        List<Order> aliceOrders =
            db.getOrder()
                .findMany(
                    new An5Query()
                        .where(filter("userId", op("equals", alice.getId())))
                        .orderBy("total", "desc"));
        System.out.println("alice orders by total: " + aliceOrders.size());
        check(aliceOrders.size() == 2, "relation filter returned " + aliceOrders.size());
        check(aliceOrders.get(0).getTotal() == 250, "orderBy total desc was not applied");

        // ── Aggregate ──────────────────────────────────────────────────────────
        Map<String, Object> stats =
            db.getOrder().aggregate(new An5Aggregate().count().sum("total"));
        System.out.println("orders stat: " + stats);
        Object rowCount = stats.get("_count");
        check(
            rowCount instanceof Number && ((Number) rowCount).intValue() == 2,
            "aggregate count was " + rowCount);
        check(stats.get("_sum_total") instanceof Number, "aggregate sum was " + stats);

        // ── Count ──────────────────────────────────────────────────────────────
        long users = db.getUser().count(null);
        System.out.println("users before cleanup: " + users);
        check(users == 2, "count returned " + users);

        // ── Update ─────────────────────────────────────────────────────────────
        User updated =
            db.getUser()
                .update(
                    filter("email", op("equals", "bob@example.com")),
                    new User().withName("Bobby").withScore(50));
        check(updated != null, "update returned no row");
        System.out.println("bob is now " + updated.getName() + " with score " + updated.getScore());
        check("Bobby".equals(updated.getName()), "update did not persist the new name");
        check(
            updated.getScore() != null && updated.getScore() == 50,
            "update did not persist the new score");

        // ── Delete ─────────────────────────────────────────────────────────────
        int deletedOrders =
            db.getOrder().deleteMany(filter("userId", op("equals", alice.getId())));
        int deletedUsers =
            db.getUser().deleteMany(filter("email", op("contains", "example.com")));
        System.out.println("deleted " + deletedUsers + " users and " + deletedOrders + " orders");
        check(deletedUsers == 2, "deleteMany removed " + deletedUsers + " users, expected 2");

        long remaining = db.getUser().count(null);
        System.out.println("users after cleanup: " + remaining);
        check(remaining == 0, "cleanup left " + remaining + " users");

        // ── Escape hatch: raw SQL through the same adapter ─────────────────────
        List<Map<String, Object>> raw = db.queryRaw("SELECT 1 AS one");
        check(raw.size() == 1, "raw query returned " + raw.size() + " rows");
        System.out.println("raw SELECT 1: " + raw.get(0));
      }
    } finally {
      if (tempDatabase != null) {
        Files.deleteIfExists(tempDatabase);
      }
    }

    System.out.println("an5example Java CRUD example passed");
  }

  /**
   * The schema bootstrap an application would run with {@code npm run db:push}: tables come
   * from {@code schema/*.an5}, not from the client, so the client never writes DDL of its own.
   */
  private static void createTables(An5DbContext db) throws Exception {
    db.executeRaw(
        "CREATE TABLE IF NOT EXISTS users ("
            + "id TEXT PRIMARY KEY, "
            + "email TEXT NOT NULL UNIQUE, "
            + "name TEXT NULL, "
            + "isActive INTEGER NOT NULL DEFAULT 1, "
            + "score INTEGER NOT NULL DEFAULT 0, "
            + "embedding BLOB NULL, "
            + "createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')))");
    db.executeRaw(
        "CREATE TABLE IF NOT EXISTS orders ("
            + "id TEXT PRIMARY KEY, "
            + "userId TEXT NOT NULL, "
            + "total INTEGER NOT NULL DEFAULT 0, "
            + "status TEXT NULL, "
            + "createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), "
            + "FOREIGN KEY (userId) REFERENCES users(id))");
  }
}
