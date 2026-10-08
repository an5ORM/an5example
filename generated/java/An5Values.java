// This file is auto-generated. Do not edit directly.
package an5.client;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Column-value converters for JDBC drivers.
 *
 * <p>A cast is not enough. The same `INT` column arrives as `Integer`, `Long` or
 * `BigDecimal` depending on the driver and the declared width; a timestamp arrives as
 * `java.sql.Timestamp`, a string, or a `Long` of epoch milliseconds; and a vector column
 * arrives as text on all three vector stores. Each converter accepts every form, so a
 * generated model never has to know which driver is underneath it.
 */
public final class An5Values {

  private An5Values() {}

  /** The value as text, or {@code null} for a SQL `NULL`. */
  public static String asString(Object value) {
    if (value == null) return null;
    if (value instanceof String) return (String) value;
    if (value instanceof byte[]) return new String((byte[]) value, StandardCharsets.UTF_8);
    if (value instanceof UUID) return value.toString();
    return String.valueOf(value);
  }

  public static Integer asInteger(Object value) {
    if (value == null) return null;
    if (value instanceof Number) return ((Number) value).intValue();
    if (value instanceof Boolean) return ((Boolean) value) ? 1 : 0;
    try {
      return Integer.valueOf(String.valueOf(value).trim());
    } catch (NumberFormatException error) {
      return null;
    }
  }

  public static Long asLong(Object value) {
    if (value == null) return null;
    if (value instanceof Number) return ((Number) value).longValue();
    if (value instanceof Boolean) return ((Boolean) value) ? 1L : 0L;
    try {
      return Long.valueOf(String.valueOf(value).trim());
    } catch (NumberFormatException error) {
      return null;
    }
  }

  public static Double asDouble(Object value) {
    if (value == null) return null;
    if (value instanceof Number) return ((Number) value).doubleValue();
    if (value instanceof Boolean) return ((Boolean) value) ? 1.0 : 0.0;
    try {
      return Double.valueOf(String.valueOf(value).trim());
    } catch (NumberFormatException error) {
      return null;
    }
  }

  public static BigDecimal asBigDecimal(Object value) {
    if (value == null) return null;
    if (value instanceof BigDecimal) return (BigDecimal) value;
    if (value instanceof Double || value instanceof Float) {
      // Through the string form, not `new BigDecimal(double)`: that constructor takes the
      // binary expansion, so 0.1 becomes 0.1000000000000000055511151231257827.
      return BigDecimal.valueOf(((Number) value).doubleValue());
    }
    if (value instanceof Number) return BigDecimal.valueOf(((Number) value).longValue());
    try {
      return new BigDecimal(String.valueOf(value).trim());
    } catch (NumberFormatException error) {
      return null;
    }
  }

  public static Boolean asBoolean(Object value) {
    if (value == null) return null;
    if (value instanceof Boolean) return (Boolean) value;
    if (value instanceof Number) return ((Number) value).intValue() != 0;
    String text = String.valueOf(value).trim();
    if ("1".equals(text) || "true".equalsIgnoreCase(text)) return Boolean.TRUE;
    if ("0".equals(text) || "false".equalsIgnoreCase(text)) return Boolean.FALSE;
    return null;
  }

  public static LocalDateTime asLocalDateTime(Object value) {
    if (value == null) return null;
    if (value instanceof LocalDateTime) return (LocalDateTime) value;
    if (value instanceof Timestamp) return ((Timestamp) value).toLocalDateTime();
    if (value instanceof java.sql.Date) return ((java.sql.Date) value).toLocalDate().atStartOfDay();
    if (value instanceof OffsetDateTime) return ((OffsetDateTime) value).toLocalDateTime();
    if (value instanceof Number) {
      return LocalDateTime.ofInstant(Instant.ofEpochMilli(((Number) value).longValue()), ZoneOffset.UTC);
    }
    String text = String.valueOf(value).trim();
    try {
      return LocalDateTime.parse(text.replace(' ', 'T'));
    } catch (RuntimeException error) {
      return null;
    }
  }

  public static LocalDate asLocalDate(Object value) {
    if (value == null) return null;
    if (value instanceof LocalDate) return (LocalDate) value;
    if (value instanceof java.sql.Date) return ((java.sql.Date) value).toLocalDate();
    if (value instanceof Timestamp) return ((Timestamp) value).toLocalDateTime().toLocalDate();
    if (value instanceof LocalDateTime) return ((LocalDateTime) value).toLocalDate();
    try {
      return LocalDate.parse(String.valueOf(value).trim());
    } catch (RuntimeException error) {
      LocalDateTime parsed = asLocalDateTime(value);
      return parsed == null ? null : parsed.toLocalDate();
    }
  }

  public static LocalTime asLocalTime(Object value) {
    if (value == null) return null;
    if (value instanceof LocalTime) return (LocalTime) value;
    if (value instanceof Timestamp) return ((Timestamp) value).toLocalDateTime().toLocalTime();
    if (value instanceof java.sql.Time) return ((java.sql.Time) value).toLocalTime();
    try {
      return LocalTime.parse(String.valueOf(value).trim());
    } catch (RuntimeException error) {
      LocalDateTime parsed = asLocalDateTime(value);
      return parsed == null ? null : parsed.toLocalTime();
    }
  }

  public static OffsetDateTime asOffsetDateTime(Object value) {
    if (value == null) return null;
    if (value instanceof OffsetDateTime) return (OffsetDateTime) value;
    if (value instanceof Timestamp) return ((Timestamp) value).toInstant().atOffset(ZoneOffset.UTC);
    try {
      return OffsetDateTime.parse(String.valueOf(value).trim());
    } catch (RuntimeException error) {
      LocalDateTime parsed = asLocalDateTime(value);
      return parsed == null ? null : parsed.atOffset(ZoneOffset.UTC);
    }
  }

  public static byte[] asBytes(Object value) {
    if (value == null) return null;
    if (value instanceof byte[]) return (byte[]) value;
    return String.valueOf(value).getBytes(StandardCharsets.UTF_8);
  }

  public static UUID asUuid(Object value) {
    String text = asString(value);
    if (text == null || text.isEmpty()) return null;
    try {
      return UUID.fromString(text);
    } catch (IllegalArgumentException error) {
      return null;
    }
  }

  /**
   * A stored vector as a double array.
   *
   * <p>Delegates to the runtime codec rather than parsing text here: SQLite stores a
   * {@code VECTOR(n)} column as float32 bytes, while SQL Server's {@code VECTOR} and
   * PostgreSQL's {@code vector} hand back text, and a column written before the byte
   * encoding holds JSON. The runtime already reads all three.
   */
  public static double[] asVector(Object value) {
    return an5.adapters.base.SqliteVectors.decodeVector(value, 0);
  }

  /** Renders a vector the way the vector stores expect it, as `[0.1, 0.2]`. */
  public static String formatVector(double[] vector) {
    StringBuilder out = new StringBuilder("[");
    for (int i = 0; i < vector.length; i++) {
      if (i > 0) out.append(", ");
      out.append(vector[i]);
    }
    return out.append(']').toString();
  }

  /** The value as a list, so a filter's `in` list accepts a single item. */
  public static List<Object> asList(Object value) {
    List<Object> list = new ArrayList<Object>();
    if (value == null) return list;
    if (value instanceof List) {
      for (Object entry : (List<?>) value) list.add(entry);
      return list;
    }
    list.add(value);
    return list;
  }
}
