// This file is auto-generated. Do not edit directly.
package an5.client;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Typed filters for the generated models.
 *
 * <p>A filter is a small object whose `toMap()` produces the operator map the adapter's SQL
 * builder reads, so a query is type-checked at the call site and still compiles down to
 * bind parameters rather than interpolated SQL.
 */
public final class An5OrmTypes {

  private An5OrmTypes() {}

  /** Shorthands for the operator maps, for a one-off condition. */
  public static final class Filters {
    private Filters() {}

    public static Map<String, Object> eq(Object value) {
      return operator("equals", value);
    }

    public static Map<String, Object> neq(Object value) {
      return operator("not", value);
    }

    public static Map<String, Object> gt(Object value) {
      return operator("gt", value);
    }

    public static Map<String, Object> gte(Object value) {
      return operator("gte", value);
    }

    public static Map<String, Object> lt(Object value) {
      return operator("lt", value);
    }

    public static Map<String, Object> lte(Object value) {
      return operator("lte", value);
    }

    public static Map<String, Object> contains(String value) {
      return operator("contains", value);
    }

    public static Map<String, Object> startsWith(String value) {
      return operator("startsWith", value);
    }

    public static Map<String, Object> endsWith(String value) {
      return operator("endsWith", value);
    }

    /** An empty list matches nothing. */
    public static Map<String, Object> in(Object... values) {
      return operator("in", Arrays.asList(values));
    }

    /** An empty list matches everything. */
    public static Map<String, Object> notIn(Object... values) {
      return operator("notIn", Arrays.asList(values));
    }

    /** The column is `NULL`. */
    public static Map<String, Object> isNull() {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      filter.put("equals", null);
      return filter;
    }

    /** The column has a value. */
    public static Map<String, Object> isNotNull() {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      filter.put("not", null);
      return filter;
    }

    /** All of `clauses`; an empty array matches everything. */
    @SafeVarargs
    public static Map<String, Object> and(Map<String, Object>... clauses) {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      filter.put("AND", copyOf(clauses));
      return filter;
    }

    /** Any of `clauses`; an empty array matches nothing. */
    @SafeVarargs
    public static Map<String, Object> or(Map<String, Object>... clauses) {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      filter.put("OR", copyOf(clauses));
      return filter;
    }

    /** None of `clauses`; an empty array matches everything. */
    @SafeVarargs
    public static Map<String, Object> not(Map<String, Object>... clauses) {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      filter.put("NOT", copyOf(clauses));
      return filter;
    }

    private static Map<String, Object> operator(String name, Object value) {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      filter.put(name, value);
      return filter;
    }
  }

  /** Type-safe filter for string columns. */
  public static final class StringFilter {
    public String equals;
    public String not;
    public List<String> in;
    public List<String> notIn;
    public String contains;
    public String startsWith;
    public String endsWith;
    public String gt;
    public String gte;
    public String lt;
    public String lte;

    public Map<String, Object> toMap() {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      put(filter, "equals", equals);
      put(filter, "not", not);
      put(filter, "in", in);
      put(filter, "notIn", notIn);
      put(filter, "contains", contains);
      put(filter, "startsWith", startsWith);
      put(filter, "endsWith", endsWith);
      put(filter, "gt", gt);
      put(filter, "gte", gte);
      put(filter, "lt", lt);
      put(filter, "lte", lte);
      return filter;
    }

    public static StringFilter is(String value) {
      StringFilter filter = new StringFilter();
      filter.equals = value;
      return filter;
    }

    public static StringFilter isNot(String value) {
      StringFilter filter = new StringFilter();
      filter.not = value;
      return filter;
    }

    public static StringFilter has(String substring) {
      StringFilter filter = new StringFilter();
      filter.contains = substring;
      return filter;
    }
  }

  /** Type-safe filter for integer and numeric columns. */
  public static final class NumberFilter {
    public Number equals;
    public Number not;
    public List<Number> in;
    public List<Number> notIn;
    public Number gt;
    public Number gte;
    public Number lt;
    public Number lte;

    public Map<String, Object> toMap() {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      put(filter, "equals", equals);
      put(filter, "not", not);
      put(filter, "in", in);
      put(filter, "notIn", notIn);
      put(filter, "gt", gt);
      put(filter, "gte", gte);
      put(filter, "lt", lt);
      put(filter, "lte", lte);
      return filter;
    }

    public static NumberFilter atLeast(Number value) {
      NumberFilter filter = new NumberFilter();
      filter.gte = value;
      return filter;
    }

    public static NumberFilter atMost(Number value) {
      NumberFilter filter = new NumberFilter();
      filter.lte = value;
      return filter;
    }

    public static NumberFilter is(Number value) {
      NumberFilter filter = new NumberFilter();
      filter.equals = value;
      return filter;
    }
  }

  /** Type-safe filter for boolean columns. */
  public static final class BoolFilter {
    public Boolean equals;
    public Boolean not;

    public Map<String, Object> toMap() {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      put(filter, "equals", equals);
      put(filter, "not", not);
      return filter;
    }

    public static BoolFilter is(boolean value) {
      BoolFilter filter = new BoolFilter();
      filter.equals = Boolean.valueOf(value);
      return filter;
    }
  }

  /** Type-safe filter for date and time columns. */
  public static final class DateFilter {
    public Object equals;
    public Object not;
    public List<Object> in;
    public List<Object> notIn;
    public Object gt;
    public Object gte;
    public Object lt;
    public Object lte;

    public Map<String, Object> toMap() {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      put(filter, "equals", equals);
      put(filter, "not", not);
      put(filter, "in", in);
      put(filter, "notIn", notIn);
      put(filter, "gt", gt);
      put(filter, "gte", gte);
      put(filter, "lt", lt);
      put(filter, "lte", lte);
      return filter;
    }

    public static DateFilter atLeast(Object value) {
      DateFilter filter = new DateFilter();
      filter.gte = value;
      return filter;
    }
  }

  /**
   * Copies a clause array into a list.
   *
   * <p>Element by element rather than {@code Arrays.asList(clauses)}, which wraps the caller's
   * own array: a caller that later writes into it would change a filter already handed to a
   * query, and {@code @SafeVarargs} forbids letting the array escape at all.
   */
  @SafeVarargs
  private static List<Object> copyOf(Map<String, Object>... clauses) {
    List<Object> copy = new ArrayList<Object>();
    for (Map<String, Object> clause : clauses) {
      copy.add(clause);
    }
    return copy;
  }

  private static void put(Map<String, Object> filter, String name, Object value) {
    // A field left unset must not become `col IS NULL`: the builder treats an explicit null
    // as "match NULL", so an unset filter has to be absent from the map entirely.
    if (value != null) filter.put(name, value);
  }

  // ── Order ─────────────────────────────────────────────────────────────────────

  /** Type-safe `WHERE` for Order. Unset filters are left out. */
  public static final class OrderWhere {
    public List<OrderWhere> and;
    public List<OrderWhere> or;
    public OrderWhere not;
    public StringFilter Id;
    public StringFilter UserId;
    public NumberFilter Total;
    public StringFilter Status;
    public DateFilter CreatedAt;

    public OrderWhere and(OrderWhere... clauses) {
      this.and = Arrays.asList(clauses);
      return this;
    }

    public OrderWhere or(OrderWhere... clauses) {
      this.or = Arrays.asList(clauses);
      return this;
    }

    public OrderWhere not(OrderWhere clause) {
      this.not = clause;
      return this;
    }

    /** The filter as the adapter reads it, with every unset condition left out. */
    public Map<String, Object> toMap() {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      if (and != null) filter.put("AND", toMapValues(and));
      if (or != null) filter.put("OR", toMapValues(or));
      if (not != null) filter.put("NOT", toMapValues(Arrays.asList(not)));
      if (Id != null) filter.put("id", Id.toMap());
      if (UserId != null) filter.put("userId", UserId.toMap());
      if (Total != null) filter.put("total", Total.toMap());
      if (Status != null) filter.put("status", Status.toMap());
      if (CreatedAt != null) filter.put("createdAt", CreatedAt.toMap());
      return filter;
    }

    /**
     * The filter tree as the adapter reads it.
     *
     * <p>Nested clauses have to be converted here rather than handed over as objects: the
     * SQL builder only understands maps, and an object in the list parses as an empty
     * clause, which matches every row instead of failing.
     */
    private static Object toMapValue(Object value) {
      if (value instanceof OrderWhere) return ((OrderWhere) value).toMap();
      return value;
    }

    /** Converts a group of nested clauses to the map form the adapter reads. */
    private static List<Object> toMapValues(List<OrderWhere> clauses) {
      List<Object> values = new ArrayList<Object>(clauses.size());
      for (OrderWhere clause : clauses) values.add(toMapValue(clause));
      return values;
    }
  }

  /** Type-safe `ORDER BY` for Order. */
  public static final class OrderOrderBy {
    private final List<Map<String, String>> entries = new ArrayList<Map<String, String>>();

    public OrderOrderBy by(String... columns) {
      for (String column : columns) {
        entries.add(single(column, "asc"));
      }
      return this;
    }

    public OrderOrderBy desc(String column) {
      entries.add(single(column, "desc"));
      return this;
    }

    private static Map<String, String> single(String column, String direction) {
      Map<String, String> entry = new LinkedHashMap<String, String>();
      entry.put(column, direction);
      return entry;
    }

    public List<Map<String, String>> toList() {
      return entries;
    }
  }

  // ── User ─────────────────────────────────────────────────────────────────────

  /** Type-safe `WHERE` for User. Unset filters are left out. */
  public static final class UserWhere {
    public List<UserWhere> and;
    public List<UserWhere> or;
    public UserWhere not;
    public StringFilter Id;
    public StringFilter Email;
    public StringFilter Name;
    public BoolFilter IsActive;
    public NumberFilter Score;
    public DateFilter CreatedAt;

    public UserWhere and(UserWhere... clauses) {
      this.and = Arrays.asList(clauses);
      return this;
    }

    public UserWhere or(UserWhere... clauses) {
      this.or = Arrays.asList(clauses);
      return this;
    }

    public UserWhere not(UserWhere clause) {
      this.not = clause;
      return this;
    }

    /** The filter as the adapter reads it, with every unset condition left out. */
    public Map<String, Object> toMap() {
      Map<String, Object> filter = new LinkedHashMap<String, Object>();
      if (and != null) filter.put("AND", toMapValues(and));
      if (or != null) filter.put("OR", toMapValues(or));
      if (not != null) filter.put("NOT", toMapValues(Arrays.asList(not)));
      if (Id != null) filter.put("id", Id.toMap());
      if (Email != null) filter.put("email", Email.toMap());
      if (Name != null) filter.put("name", Name.toMap());
      if (IsActive != null) filter.put("isActive", IsActive.toMap());
      if (Score != null) filter.put("score", Score.toMap());
      if (CreatedAt != null) filter.put("createdAt", CreatedAt.toMap());
      return filter;
    }

    /**
     * The filter tree as the adapter reads it.
     *
     * <p>Nested clauses have to be converted here rather than handed over as objects: the
     * SQL builder only understands maps, and an object in the list parses as an empty
     * clause, which matches every row instead of failing.
     */
    private static Object toMapValue(Object value) {
      if (value instanceof UserWhere) return ((UserWhere) value).toMap();
      return value;
    }

    /** Converts a group of nested clauses to the map form the adapter reads. */
    private static List<Object> toMapValues(List<UserWhere> clauses) {
      List<Object> values = new ArrayList<Object>(clauses.size());
      for (UserWhere clause : clauses) values.add(toMapValue(clause));
      return values;
    }
  }

  /** Type-safe `ORDER BY` for User. */
  public static final class UserOrderBy {
    private final List<Map<String, String>> entries = new ArrayList<Map<String, String>>();

    public UserOrderBy by(String... columns) {
      for (String column : columns) {
        entries.add(single(column, "asc"));
      }
      return this;
    }

    public UserOrderBy desc(String column) {
      entries.add(single(column, "desc"));
      return this;
    }

    private static Map<String, String> single(String column, String direction) {
      Map<String, String> entry = new LinkedHashMap<String, String>();
      entry.put(column, direction);
      return entry;
    }

    public List<Map<String, String>> toList() {
      return entries;
    }
  }
}
