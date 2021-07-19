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

import org.openqa.selenium.internal.Require;

import java.io.Closeable;
import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;
import java.util.function.Function;

public class JsonInput implements Closeable {

  private final Reader source;
  private volatile boolean readPerformed = false;
  private JsonTypeCoercer coercer;
  private PropertySetting setter;
  private Input input;
  // Used when reading maps and collections so that we handle de-nesting and
  // figuring out whether we're expecting a NAME properly.
  private Deque<Container> stack = new ArrayDeque<>();

  JsonInput(Reader source, JsonTypeCoercer coercer, PropertySetting setter) {
    this.source = Require.nonNull("Source", source);
    this.coercer = Require.nonNull("Coercer", coercer);
    this.input = new Input(source);
    this.setter = Require.nonNull("Setter", setter);
  }

  /**
   * Change how property setting is done. It's polite to set the value back once done processing.
   * @param setter The new {@link PropertySetting} to use.
   * @return The previous {@link PropertySetting} that has just been replaced.
   */
  public PropertySetting propertySetting(PropertySetting setter) {
    PropertySetting previous = this.setter;
    this.setter = Require.nonNull("Setter", setter);
    return previous;
  }

  public JsonInput addCoercers(TypeCoercer<?>... coercers) {
    return addCoercers(Arrays.asList(coercers));
  }

  public JsonInput addCoercers(Iterable<TypeCoercer<?>> coercers) {
    synchronized (this) {
      if (readPerformed) {
        throw new JsonException("JsonInput has already been used and may not be modified");
      }

      this.coercer = new JsonTypeCoercer(coercer, coercers);
    }

    return this;
  }

  @Override
  public void close() {
    try {
      source.close();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public JsonType peek() {
    skipWhitespace(input);

    switch (input.peek()) {
      case 'f': case 't':
        return JsonType.BOOLEAN;

      case 'n':
        return JsonType.NULL;

      case '-': case '+':
      case '0': case '1':
      case '2': case '3':
      case '4': case '5':
      case '6': case '7':
      case '8': case '9':
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

  public boolean nextBoolean() {
    expect(JsonType.BOOLEAN);
    return read(input.peek() == 't' ? "true" : "false", Boolean::valueOf);
  }

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

  public Object nextNull() {
    expect(JsonType.NULL);
    return read("null", str -> null);
  }

  public Number nextNumber() {
    expect(JsonType.NUMBER);
    StringBuilder builder = new StringBuilder();
    // We know it's safe to use a do/while loop since the first character was a number
    boolean fractionalPart = false;
    do {
      char read = input.peek();
      if (Character.isDigit(read) ||
          read == '+' || read == '-' ||
          read == 'e' || read == 'E' ||
          read == '.') {
        builder.append(input.read());
      } else {
        break;
      }

      if (read == '.') {
        fractionalPart = true;
      }
    } while (true);

    try {
      Number number = new BigDecimal(builder.toString());
      if (fractionalPart) {
        return number.doubleValue();
      }
      return number.longValue();
    } catch (NumberFormatException e) {
      throw new JsonException("Unable to parse to a number: " + builder.toString() + ". " + input);
    }
  }

  public String nextString() {
    expect(JsonType.STRING);
    return readString();
  }

  public Instant nextInstant() {
    Long time = read(Long.class);
    return (null != time) ? Instant.ofEpochSecond(time) : null;
  }

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

  public void beginArray() {
    expect(JsonType.START_COLLECTION);
    stack.addFirst(Container.COLLECTION);
    input.read();
  }

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

  public void beginObject() {
    expect(JsonType.START_MAP);
    stack.addFirst(Container.MAP_NAME);
    input.read();
  }

  public void endObject() {
    expect(JsonType.END_MAP);
    Container expectation = stack.removeFirst();
    if (expectation != Container.MAP_NAME) {
      // The only other thing we could be closing is a map
      throw new JsonException("Attempt to close a JSON Map, but not ready to. " + input);
    }
    input.read();
  }

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

  public <T> T read(Type type) {
    skipWhitespace(input);

    // Guard against reading an empty stream
    if (input.peek() == Input.EOF) {
      return null;
    }

    return coercer.coerce(this, type, setter);
  }


  private boolean isReadingName() {
    return stack.peekFirst() == Container.MAP_NAME;
  }

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

      return;  // End of Name handling
    }

    // Handle the case where we're reading a value
    if (top == Container.MAP_VALUE) {
      stack.removeFirst();
      stack.addFirst(Container.MAP_NAME);
    }
  }

  private <X> X read(String toCompare, Function<String, X> mapper) {
    skipWhitespace(input);

    for (int i = 0; i < toCompare.length(); i++) {
      char read = input.read();
      if (read != toCompare.charAt(i)) {
        throw new JsonException(String.format(
            "Unable to read %s. Saw %s at position %d. %s",
            toCompare,
            read,
            i,
            input));
      }
    }

    return mapper.apply(toCompare);
  }

  private String readString() {
    input.read();  // Skip leading quote

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

      case 'u':  // Unicode digit. The next four characters count.
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

  private void skipWhitespace(Input input) {
    while (input.peek() != Input.EOF && Character.isWhitespace(input.peek())) {
      input.read();
    }
  }

  private enum Container {
    COLLECTION,
    MAP_NAME,
    MAP_VALUE,
  }
}
