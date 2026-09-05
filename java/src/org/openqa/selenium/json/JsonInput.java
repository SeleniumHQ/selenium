// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.json;

import static java.util.Objects.requireNonNull;

import java.io.Closeable;
import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

/**
 * The <b>JsonInput</b> class defines the operations used to deserialize JSON strings into Java
 * objects.
 *
 * <p>Instances of this class are not thread-safe: each instance wraps a single character stream and
 * must be confined to one thread.
 */
public class JsonInput implements Closeable {

  private final @Nullable Reader source;
  private boolean readPerformed = false;
  private JsonTypeCoercer coercer;
  private PropertySetting setter;
  private final Input input;
  // Stack of open containers, used to handle de-nesting and to figure out
  // whether we're expecting a NAME. Kept as plain arrays (rather than a deque
  // of objects) because the top of the stack is touched for every value read.
  private byte[] containerState = new byte[16];
  // Parallel stack tracking whether the current container has seen at least
  // one element. Used by hasNext() to enforce comma separators between
  // elements while remaining lenient about a single trailing comma.
  private boolean[] containerHasElement = new boolean[16];
  private int containerDepth;
  // Memoized type of the pending token; cleared whenever the token is consumed.
  private @Nullable JsonType peekedType;

  JsonInput(Reader source, JsonTypeCoercer coercer, PropertySetting setter) {

    this.source = Require.nonNull("Source", source);
    this.coercer = Require.nonNull("Coercer", coercer);
    this.input = new Input(source);
    this.setter = Require.nonNull("Setter", setter);
  }

  JsonInput(String source, JsonTypeCoercer coercer, PropertySetting setter) {

    this.source = null;
    this.coercer = Require.nonNull("Coercer", coercer);
    this.input = new Input(Require.nonNull("Source", source));
    this.setter = Require.nonNull("Setter", setter);
  }

  /**
   * Change how property setting is done. It's polite to set the value back once done processing.
   *
   * @param setter The new {@link PropertySetting} to use.
   * @return The previous {@link PropertySetting} that has just been replaced.
   */
  public PropertySetting propertySetting(PropertySetting setter) {
    PropertySetting previous = this.setter;
    this.setter = Require.nonNull("Setter", setter);
    return previous;
  }

  /**
   * Add the specified type coercers to the set installed in the JSON coercion manager.
   *
   * @param coercers array of zero or more {@link TypeCoercer} objects
   * @return this {@link JsonInput} object with added type coercers
   * @throws JsonException if this {@code JsonInput} has already begun processing its input
   */
  public JsonInput addCoercers(TypeCoercer<?>... coercers) {
    return addCoercers(List.of(coercers));
  }

  /**
   * Add the specified type coercers to the set installed in the JSON coercion manager.
   *
   * @param coercers iterable collection of {@link TypeCoercer} objects
   * @return this {@link JsonInput} object with added type coercers
   * @throws JsonException if this {@code JsonInput} has already begun processing its input
   */
  public JsonInput addCoercers(Iterable<TypeCoercer<?>> coercers) {
    if (readPerformed) {
      throw new JsonException("JsonInput has already been used and may not be modified");
    }

    this.coercer = new JsonTypeCoercer(coercer, coercers);

    return this;
  }

  /**
   * {@inheritDoc}
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  @Override
  public void close() {
    if (source == null) {
      return;
    }

    try {
      source.close();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  /**
   * Peek at the next input string character to determine the pending JSON element type.
   *
   * @return {@link JsonType} indicating the pending JSON element type
   * @throws JsonException if unable to determine the type of the pending element
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public JsonType peek() {
    // A single token is typically peeked at several times on its way through the coercers, so
    // the computed type is memoized until the token is consumed.
    JsonType type = peekedType;
    if (type != null) {
      return type;
    }

    skipWhitespace(input);

    switch (input.peek()) {
      case 'f':
      case 't':
        type = JsonType.BOOLEAN;
        break;

      case 'n':
        type = JsonType.NULL;
        break;

      case '-':
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        type = JsonType.NUMBER;
        break;

      case '"':
        type = isReadingName() ? JsonType.NAME : JsonType.STRING;
        break;

      case '{':
        type = JsonType.START_MAP;
        break;

      case '}':
        type = JsonType.END_MAP;
        break;

      case '[':
        type = JsonType.START_COLLECTION;
        break;

      case ']':
        type = JsonType.END_COLLECTION;
        break;

      case Input.EOF:
        type = JsonType.END;
        break;

      default:
        int c = input.read();
        throw new JsonException("Unable to determine type from: " + (char) c + ". " + input);
    }

    peekedType = type;
    return type;
  }

  /**
   * Read the next element of the JSON input stream as a boolean value.
   *
   * @return {@code true} or {@code false}
   * @throws JsonException if the next element isn't the expected boolean
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public boolean nextBoolean() {
    expect(JsonType.BOOLEAN);
    return read(input.peek() == 't' ? "true" : "false", Boolean::valueOf);
  }

  /**
   * Read the next element of the JSON input stream as an object property name.
   *
   * @return JSON object property name
   * @throws JsonException if the next element isn't a string followed by a colon
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public String nextName() {
    expect(JsonType.NAME);

    String name = readString();
    skipWhitespace(input);
    int read = input.read();
    if (read != ':') {
      throw new JsonException(
          "Unable to read name. Expected colon separator, but saw '" + (char) read + "'");
    }
    return name;
  }

  /**
   * Read the next element of the JSON input stream as a {@code null} object.
   *
   * @return {@code null} object
   * @throws JsonException if the next element isn't a {@code null}
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public @Nullable Object nextNull() {
    expect(JsonType.NULL);
    return read("null", str -> null);
  }

  /**
   * Read the next element of the JSON input stream as a number.
   *
   * @return {@link Number} object
   * @throws JsonException if the next element isn't a number
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public Number nextNumber() {
    expect(JsonType.NUMBER);
    StringBuilder builder = new StringBuilder();
    boolean isDecimal = false;

    // Optional leading minus. (Per RFC 8259 §6, a leading '+' is not allowed.)
    if (input.peek() == '-') {
      builder.append((char) input.read());
    }

    // Integer part: either "0" or [1-9] [0-9]*.
    int first = input.peek();
    if (first == '0') {
      builder.append((char) input.read());
      // Leading zeros ("00", "01", ...) are not allowed.
      if (isDigit(input.peek())) {
        throw new JsonException("Leading zeros are not permitted in JSON numbers. " + input);
      }
    } else if (first >= '1' && first <= '9') {
      input.appendDigits(builder);
    } else {
      throw new JsonException("Expected digit but saw " + describeChar(first) + ". " + input);
    }

    // Optional fractional part: '.' 1*DIGIT
    if (input.peek() == '.') {
      isDecimal = true;
      builder.append((char) input.read());
      if (!isDigit(input.peek())) {
        throw new JsonException(
            "Expected at least one digit after '.' but saw "
                + describeChar(input.peek())
                + ". "
                + input);
      }
      input.appendDigits(builder);
    }

    // Optional exponent part: ('e' | 'E') ('+' | '-')? 1*DIGIT
    if (input.peek() == 'e' || input.peek() == 'E') {
      isDecimal = true;
      builder.append((char) input.read());
      if (input.peek() == '+' || input.peek() == '-') {
        builder.append((char) input.read());
      }
      if (!isDigit(input.peek())) {
        throw new JsonException(
            "Expected at least one digit in exponent but saw "
                + describeChar(input.peek())
                + ". "
                + input);
      }
      input.appendDigits(builder);
    }

    try {
      // Fast path for integers: Long-valued when no fraction/exponent was present.
      if (!isDecimal) {
        // At most 18 digits (plus a sign) always fits in a long, so the allocation-free parse
        // cannot overflow. Longer inputs take the String path, which reports overflow with the
        // historical NumberFormatException message.
        if (builder.length() <= (builder.charAt(0) == '-' ? 19 : 18)) {
          return Long.parseLong(builder, 0, builder.length(), 10);
        }
        return Long.valueOf(builder.toString());
      }
      double value = parseDouble(builder);
      if (Double.isInfinite(value) || Double.isNaN(value)) {
        throw new JsonException("Number is out of range for a double: " + builder + ". " + input);
      }
      return value;
    } catch (NumberFormatException e) {
      throw new JsonException("Unable to parse to a number: " + builder + ". " + input, e);
    }
  }

  private static boolean isDigit(int c) {
    return c >= '0' && c <= '9';
  }

  /** Powers of ten that are exactly representable as doubles. */
  private static final double[] POW_10 = {
    1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15, 1e16,
    1e17, 1e18, 1e19, 1e20, 1e21, 1e22
  };

  /**
   * Parse a JSON number that contains a fraction or exponent, as lexed into {@code raw} by {@link
   * #nextNumber}.
   *
   * <p>Uses Clinger's fast path where possible: when the significand has at most 15 digits it is
   * exactly representable as a double, as are powers of ten up to 10^22, so a single floating-point
   * multiply or divide performs the one correctly-rounded step the conversion needs. Everything
   * else (long significands, large exponents) falls back to {@link Double#parseDouble}, so results
   * are always bit-for-bit identical to the JDK.
   */
  private static double parseDouble(StringBuilder raw) {
    int length = raw.length();
    int index = 0;
    boolean negative = false;
    if (raw.charAt(0) == '-') {
      negative = true;
      index = 1;
    }

    long significand = 0;
    int digits = 0;
    int fractionDigits = 0;

    while (index < length) {
      char c = raw.charAt(index);
      if (c < '0' || c > '9') {
        break;
      }
      significand = significand * 10 + (c - '0');
      digits++;
      index++;
    }

    if (index < length && raw.charAt(index) == '.') {
      index++;
      while (index < length) {
        char c = raw.charAt(index);
        if (c < '0' || c > '9') {
          break;
        }
        significand = significand * 10 + (c - '0');
        digits++;
        fractionDigits++;
        index++;
      }
    }

    int exponent = 0;
    if (index < length) {
      // By construction the remainder is ('e' | 'E') ('+' | '-')? 1*DIGIT.
      index++;
      boolean exponentNegative = false;
      char sign = raw.charAt(index);
      if (sign == '+' || sign == '-') {
        exponentNegative = sign == '-';
        index++;
      }
      while (index < length) {
        // Clamp rather than overflow; anything this large falls back below anyway.
        if (exponent < 100_000) {
          exponent = exponent * 10 + (raw.charAt(index) - '0');
        }
        index++;
      }
      if (exponentNegative) {
        exponent = -exponent;
      }
    }

    int netExponent = exponent - fractionDigits;

    if (digits <= 15 && netExponent >= -22 && netExponent <= 22) {
      double value = (double) significand;
      if (netExponent > 0) {
        value = value * POW_10[netExponent];
      } else if (netExponent < 0) {
        value = value / POW_10[-netExponent];
      }
      return negative ? -value : value;
    }

    return Double.parseDouble(raw.toString());
  }

  private static String describeChar(int c) {
    return c == Input.EOF ? "<EOF>" : "'" + (char) c + "'";
  }

  /**
   * Read the next element of the JSON input stream as a string.
   *
   * @return {@link String} object
   * @throws JsonException if the next element isn't a string
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public String nextString() {
    expect(JsonType.STRING);
    return readString();
  }

  /**
   * Read the next element of the JSON input stream as an instant.
   *
   * @deprecated Instant is not a basic JSON type, use the {@link InstantCoercer} instead.
   * @return {@link Instant} object
   * @throws JsonException if the next element isn't a {@code Long}
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  @Deprecated(forRemoval = true)
  public @Nullable Instant nextInstant() {
    Long time = read(Long.class);
    return (null != time) ? Instant.ofEpochSecond(time) : null;
  }

  /**
   * Read the next element of the JSON input stream and expect the end of the input.
   *
   * @throws JsonException if the next element isn't the end of the input
   */
  public void nextEnd() {
    expect(JsonType.END);
  }

  /**
   * Determine whether an element is pending for the current container from the JSON input stream.
   *
   * @return {@code true} if an element is pending; otherwise {@code false}
   * @throws JsonException if no container is open
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public boolean hasNext() {
    if (containerDepth == 0) {
      throw new JsonException(
          "Unable to determine if an item has next when not in a container type. " + input);
    }

    skipWhitespace(input);
    boolean seenElement = containerDepth > 0 && containerHasElement[containerDepth - 1];

    if (input.peek() == ',') {
      if (!seenElement) {
        throw new JsonException("Unexpected ',' before first element of container. " + input);
      }
      input.read();
      peekedType = null;
      // We've moved past the separator, so we're once again expecting an element rather than
      // another comma. Clear the flag so a repeat hasNext() before reading is a no-op.
      clearSeenElement();
      skipWhitespace(input);
      JsonType afterComma = peek();
      // Trailing comma leniency: '[1,]' and '{"a":1,}' are accepted.
      return afterComma != JsonType.END_COLLECTION && afterComma != JsonType.END_MAP;
    }

    JsonType type = peek();
    if (type == JsonType.END_COLLECTION || type == JsonType.END_MAP) {
      return false;
    }
    if (seenElement) {
      throw new JsonException("Expected ',' or end of container but saw " + type + ". " + input);
    }
    return true;
  }

  /**
   * Process the opening square bracket of a JSON array.
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public void beginArray() {
    expect(JsonType.START_COLLECTION);
    pushContainer(COLLECTION);
    input.read();
  }

  /**
   * Process the closing square bracket of a JSON array.
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public void endArray() {
    expect(JsonType.END_COLLECTION);
    if (topContainer() != COLLECTION) {
      // The only other thing we could be closing is a map
      throw new JsonException(
          "Attempt to close a JSON List, but a JSON Object was expected. " + input);
    }
    containerDepth--;
    input.read();
  }

  /**
   * Process the opening curly brace of a JSON object.
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public void beginObject() {
    expect(JsonType.START_MAP);
    pushContainer(MAP_NAME);
    input.read();
  }

  /**
   * Process the closing curly brace of a JSON object.
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public void endObject() {
    expect(JsonType.END_MAP);
    if (topContainer() != MAP_NAME) {
      throw new JsonException("Attempt to close a JSON Map, but not ready to. " + input);
    }
    containerDepth--;
    input.read();
  }

  /**
   * Discard the pending JSON property value.
   *
   * @throws JsonException if the pending element isn't a value type
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  // FIXME: This method doesn't verify that the prior element was a property name.
  // FIXME: This method doesn't enforce a depth limit when processing container types.
  public void skipValue() {
    switch (peek()) {
      case BOOLEAN:
        nextBoolean();
        break;

      case NAME:
        nextName();
        break;

      case NULL:
        nextNull();
        break;

      case NUMBER:
        nextNumber();
        break;

      case START_COLLECTION:
        beginArray();
        while (hasNext()) {
          skipValue();
        }
        endArray();
        break;

      case START_MAP:
        beginObject();
        while (hasNext()) {
          nextName();
          skipValue();
        }
        endObject();
        break;

      case STRING:
        nextString();
        break;

      default:
        throw new JsonException("Cannot skip " + peek() + ". " + input);
    }
  }

  private void markReadPerformed() {
    readPerformed = true;
  }

  /**
   * Read the next element from the JSON input stream as the specified type.
   *
   * @param type data type for deserialization (class or {@link TypeToken})
   * @return object of the specified type deserialized from the JSON input stream<br>
   *     <b>NOTE</b>: Returns {@code null} if the input string is exhausted.
   * @param <T> result type (as specified by [type])
   * @throws JsonException if coercion of the next element to the specified type fails
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public <T> @Nullable T read(Type type) {
    markReadPerformed();
    skipWhitespace(input);

    // Guard against reading an empty stream
    if (input.peek() == Input.EOF) {
      return null;
    }

    return coercer.coerce(this, type, setter);
  }

  public <T> T readNonNull(Type type) {
    return requireNonNull(read(type));
  }

  public <T> Map<String, T> readMap() {
    return requireNonNull(read(Map.class));
  }

  @SuppressWarnings("unchecked")
  public <T> T readMapElement(String key) {
    return (T) Require.nonNull(key, readMap().get(key));
  }

  /**
   * Read an array of elements from the JSON input stream with elements as the specified type.
   *
   * @param type data type for deserialization (class or {@link TypeToken})
   * @return list of objects of the specified type deserialized from the JSON input stream<br>
   *     <b>NOTE</b>: Returns {@code null} if the input string is exhausted.
   * @param <T> result type of the item in the list (as specified by [type])
   * @throws JsonException if coercion of the next element to the specified type fails
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  @SuppressWarnings("unchecked")
  public <T> List<T> readArray(Type type) {
    List<T> toReturn = new ArrayList<>();
    BiFunction<JsonInput, PropertySetting, Object> elementCoercer = coercer.resolve(type);

    beginArray();
    while (hasNext()) {
      toReturn.add((T) elementCoercer.apply(this, setter));
    }
    endArray();

    return toReturn;
  }

  /**
   * Determine if awaiting a JSON object property name.
   *
   * @return {@code true} is awaiting a property name; otherwise {@code false}
   */
  private boolean isReadingName() {
    return topContainer() == MAP_NAME;
  }

  /**
   * Verify that the type of the pending JSON element matches the specified type.
   *
   * @param type expected JSON element type
   * @throws JsonException if the pending element is not of the expected type
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  private void expect(JsonType type) {
    if (peek() != type) {
      throw new JsonException(
          "Expected to read a " + type + " but instead have: " + peek() + ". " + input);
    }

    // The pending token is about to be consumed, so the memoized type is no longer valid.
    peekedType = null;

    // Special map handling. Woo!
    byte top = topContainer();

    if (type == JsonType.NAME) {
      if (top == MAP_NAME) {
        containerState[containerDepth - 1] = MAP_VALUE;
        return;
      } else if (top != NONE) {
        throw new JsonException("Unexpected attempt to read name. " + input);
      }

      return; // End of Name handling
    }

    // Handle the case where we're reading a value.
    if (type == JsonType.END_COLLECTION || type == JsonType.END_MAP) {
      // Closing the container - don't treat as a new element in it.
      return;
    }
    if (top == MAP_VALUE) {
      containerState[containerDepth - 1] = MAP_NAME;
      markElementRead();
    } else if (top == COLLECTION) {
      markElementRead();
    }
  }

  private byte topContainer() {
    return containerDepth == 0 ? NONE : containerState[containerDepth - 1];
  }

  private void pushContainer(byte state) {
    if (containerDepth == containerState.length) {
      containerState = Arrays.copyOf(containerState, containerDepth * 2);
      containerHasElement = Arrays.copyOf(containerHasElement, containerDepth * 2);
    }
    containerState[containerDepth] = state;
    containerHasElement[containerDepth] = false;
    containerDepth++;
  }

  private void markElementRead() {
    if (containerDepth > 0) {
      containerHasElement[containerDepth - 1] = true;
    }
  }

  private void clearSeenElement() {
    if (containerDepth > 0) {
      containerHasElement[containerDepth - 1] = false;
    }
  }

  /**
   * Read the next element from the JSON input stream, converting with the supplied mapper if it's
   * the expected string.
   *
   * @param toCompare expected element string
   * @param mapper function to convert the element string to its corresponding type
   * @return value produced by the supplied mapper
   * @param <X> data type returned by the supplied mapper
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  private <X extends @Nullable Object> X read(String toCompare, Function<String, X> mapper) {
    skipWhitespace(input);

    int toCompareLength = toCompare.length();
    for (int i = 0; i < toCompareLength; i++) {
      int read = input.read();
      if (read != toCompare.charAt(i)) {
        throw new JsonException(
            String.format(
                "Unable to read %s. Saw %s at position %d. %s", toCompare, (char) read, i, input));
      }
    }

    return mapper.apply(toCompare);
  }

  /**
   * Read the next element from the JSON input stream as a string, converting escaped characters.
   *
   * @return {@link String} object
   * @throws JsonException if input stream ends without finding a closing quote
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  private String readString() {
    input.read(); // Skip leading quote

    // Fast path: an escape-free string that is fully buffered needs no intermediate copies.
    String simple = input.readSimpleString();
    if (simple != null) {
      return simple;
    }

    StringBuilder builder = new StringBuilder();
    while (true) {
      int c = input.appendStringContent(builder);
      switch (c) {
        case Input.EOF:
          throw new JsonException("Unterminated string: " + builder + ". " + input);
        case '"': // terminate string
          input.read();
          return builder.toString();
        case '\\': // quoted char
          input.read();
          readEscape(builder);
          break;
        default:
          // RFC 8259 §7: characters U+0000..U+001F MUST be escaped.
          input.read();
          throw new JsonException(
              String.format("Illegal unescaped control character U+%04X in string. %s", c, input));
      }
    }
  }

  /**
   * Convert the escape sequence at the current JSON input stream position, appending the result to
   * the provided builder.
   *
   * @param builder {@link StringBuilder}
   * @throws JsonException if an unsupported escape sequence is found
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  // FIXME: This function doesn't appear to support UTF-8 or UTF-32.
  private void readEscape(StringBuilder builder) {
    int read = input.read();

    // List from: https://tools.ietf.org/html/rfc7159.html#section-7
    switch (read) {
      case 'b':
        builder.append("\b");
        break;

      case 'f':
        builder.append("\f");
        break;

      case 'n':
        builder.append("\n");
        break;

      case 'r':
        builder.append("\r");
        break;

      case 't':
        builder.append("\t");
        break;

      case 'u': // Unicode digit. The next four characters count.
        int result = 0;
        int multiplier = 4096; // (16 * 16 * 16) as we start from the thousands and work to units.
        for (int i = 0; i < 4; i++) {
          int c = input.read();
          int digit = Character.digit(c, 16);
          if (digit == -1) {
            throw new JsonException((char) c + " is not a hexadecimal digit. " + input);
          }
          result += digit * multiplier;
          multiplier /= 16;
        }
        builder.append((char) result);
        break;

      case '/':
      case '\\':
      case '"':
        builder.append((char) read);
        break;

      default:
        throw new JsonException("Unexpected escape code: " + (char) read + ". " + input);
    }
  }

  /**
   * Consume whitespace characters from the head of the specified input object.
   *
   * @param input {@link Input} object
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  private void skipWhitespace(Input input) {
    input.skipWhitespace();
  }

  /** Container processing states: not in a container. */
  private static final byte NONE = 0;

  /** Container processing states: processing a JSON array. */
  private static final byte COLLECTION = 1;

  /** Container processing states: processing a JSON object property name. */
  private static final byte MAP_NAME = 2;

  /** Container processing states: processing a JSON object property value. */
  private static final byte MAP_VALUE = 3;
}
