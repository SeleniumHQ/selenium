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

import java.io.Closeable;
import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;
import java.util.function.Function;
import org.openqa.selenium.internal.Require;

/**
 * The <b>JsonInput</b> class defines the operations used to deserialize JSON strings into Java
 * objects.
 */
public class JsonInput implements Closeable {

  private final Reader source;
  // FIXME: This flag is never set
  private final boolean readPerformed = false;
  private JsonTypeCoercer coercer;
  private PropertySetting setter;
  private final Input input;
  // Used when reading maps and collections so that we handle de-nesting and
  // figuring out whether we're expecting a NAME properly.
  private final Deque<Container> stack = new ArrayDeque<>();

  JsonInput(Reader source, JsonTypeCoercer coercer, PropertySetting setter) {
    this.source = Require.nonNull("Source", source);
    this.coercer = Require.nonNull("Coercer", coercer);
    this.input = new Input(source);
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
    return addCoercers(Arrays.asList(coercers));
  }

  /**
   * Add the specified type coercers to the set installed in the JSON coercion manager.
   *
   * @param coercers iterable collection of {@link TypeCoercer} objects
   * @return this {@link JsonInput} object with added type coercers
   * @throws JsonException if this {@code JsonInput} has already begun processing its input
   */
  public JsonInput addCoercers(Iterable<TypeCoercer<?>> coercers) {
    synchronized (this) {
      if (readPerformed) {
        throw new JsonException("JsonInput has already been used and may not be modified");
      }

      this.coercer = new JsonTypeCoercer(coercer, coercers);
    }

    return this;
  }

  /**
   * {@inheritDoc}
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  @Override
  public void close() {
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
    skipWhitespace(input);

    switch (input.peek()) {
      case 'f':
      case 't':
        return JsonType.BOOLEAN;

      case 'n':
        return JsonType.NULL;

      case '-':
      case '+':
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
        return JsonType.NUMBER;

      case '"':
        return isReadingName() ? JsonType.NAME : JsonType.STRING;

      case '{':
        return JsonType.START_MAP;

      case '}':
        return JsonType.END_MAP;

      case '[':
        return JsonType.START_COLLECTION;

      case ']':
        return JsonType.END_COLLECTION;

      case Input.EOF:
        return JsonType.END;

      default:
        char c = input.read();
        throw new JsonException("Unable to determine type from: " + c + ". " + input);
    }
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
    char read = input.read();
    if (read != ':') {
      throw new JsonException(
          "Unable to read name. Expected colon separator, but saw '" + read + "'");
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
  public Object nextNull() {
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
    // We know it's safe to use a do/while loop since the first character was a number
    boolean fractionalPart = false;
    do {
      char read = input.peek();
      if (Character.isDigit(read)
          || read == '+'
          || read == '-'
          || read == 'e'
          || read == 'E'
          || read == '.') {
        builder.append(input.read());
      } else {
        break;
      }

      fractionalPart |= (read == '.');
    } while (true);

    try {
      Number number = new BigDecimal(builder.toString());
      if (fractionalPart) {
        return number.doubleValue();
      }
      return number.longValue();
    } catch (NumberFormatException e) {
      throw new JsonException("Unable to parse to a number: " + builder + ". " + input);
    }
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
   * @return {@link Instant} object
   * @throws JsonException if the next element isn't a {@code Long}
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public Instant nextInstant() {
    Long time = read(Long.class);
    return (null != time) ? Instant.ofEpochSecond(time) : null;
  }

  /**
   * Determine whether an element is pending for the current container from the JSON input stream.
   *
   * @return {@code true} if an element is pending; otherwise {@code false}
   * @throws JsonException if no container is open
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public boolean hasNext() {
    if (stack.isEmpty()) {
      throw new JsonException(
          "Unable to determine if an item has next when not in a container type. " + input);
    }

    skipWhitespace(input);
    if (input.peek() == ',') {
      input.read();
      return true;
    }

    JsonType type = peek();
    return type != JsonType.END_COLLECTION && type != JsonType.END_MAP;
  }

  /**
   * Process the opening square bracket of a JSON array.
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public void beginArray() {
    expect(JsonType.START_COLLECTION);
    stack.addFirst(Container.COLLECTION);
    input.read();
  }

  /**
   * Process the closing square bracket of a JSON array.
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public void endArray() {
    expect(JsonType.END_COLLECTION);
    Container expectation = stack.removeFirst();
    if (expectation != Container.COLLECTION) {
      // The only other thing we could be closing is a map
      throw new JsonException(
          "Attempt to close a JSON List, but a JSON Object was expected. " + input);
    }
    input.read();
  }

  /**
   * Process the opening curly brace of a JSON object.
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public void beginObject() {
    expect(JsonType.START_MAP);
    stack.addFirst(Container.MAP_NAME);
    input.read();
  }

  /**
   * Process the closing curly brace of a JSON object.
   *
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  public void endObject() {
    expect(JsonType.END_MAP);
    Container expectation = stack.removeFirst();
    if (expectation != Container.MAP_NAME) {
      // The only other thing we could be closing is a map
      throw new JsonException("Attempt to close a JSON Map, but not ready to. " + input);
    }
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
  public <T> T read(Type type) {
    skipWhitespace(input);

    // Guard against reading an empty stream
    if (input.peek() == Input.EOF) {
      return null;
    }

    return coercer.coerce(this, type, setter);
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
  public <T> List<T> readArray(Type type) {
    List<T> toReturn = new ArrayList<>();

    beginArray();
    while (hasNext()) {
      toReturn.add(coercer.coerce(this, type, setter));
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
    return stack.peekFirst() == Container.MAP_NAME;
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

    // Special map handling. Woo!
    Container top = stack.peekFirst();

    if (type == JsonType.NAME) {
      if (top == Container.MAP_NAME) {
        stack.removeFirst();
        stack.addFirst(Container.MAP_VALUE);
        return;
      } else if (top != null) {
        throw new JsonException("Unexpected attempt to read name. " + input);
      }

      return; // End of Name handling
    }

    // Handle the case where we're reading a value
    if (top == Container.MAP_VALUE) {
      stack.removeFirst();
      stack.addFirst(Container.MAP_NAME);
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
  private <X> X read(String toCompare, Function<String, X> mapper) {
    skipWhitespace(input);

    for (int i = 0; i < toCompare.length(); i++) {
      char read = input.read();
      if (read != toCompare.charAt(i)) {
        throw new JsonException(
            String.format(
                "Unable to read %s. Saw %s at position %d. %s", toCompare, read, i, input));
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

    StringBuilder builder = new StringBuilder();
    char c;
    while (true) {
      c = input.read();
      switch (c) {
        case Input.EOF:
          throw new JsonException("Unterminated string: " + builder + ". " + input);
        case '"': // terminate string
          return builder.toString();
        case '\\': // quoted char
          readEscape(builder);
          break;
        default:
          builder.append(c);
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
    char read = input.read();

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
          char c = input.read();
          int digit = Character.digit(c, 16);
          if (digit == -1) {
            throw new JsonException(c + " is not a hexadecimal digit. " + input);
          }
          result += digit * multiplier;
          multiplier /= 16;
        }
        builder.append((char) result);
        break;

      case '/':
      case '\\':
      case '"':
        builder.append(read);
        break;

      default:
        throw new JsonException("Unexpected escape code: " + read + ". " + input);
    }
  }

  /**
   * Consume whitespace characters from the head of the specified input object.
   *
   * @param input {@link Input} object
   * @throws UncheckedIOException if an I/O exception is encountered
   */
  private void skipWhitespace(Input input) {
    while (input.peek() != Input.EOF && Character.isWhitespace(input.peek())) {
      input.read();
    }
  }

  /** Used to track the current container processing state. */
  private enum Container {

    /** Processing a JSON array */
    COLLECTION,
    /** Processing a JSON object property name */
    MAP_NAME,
    /** Processing a JSON object property value */
    MAP_VALUE,
  }
}
