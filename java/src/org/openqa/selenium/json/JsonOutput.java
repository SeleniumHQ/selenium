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

import static java.util.concurrent.TimeUnit.MILLISECONDS;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URI;
import java.net.URL;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayDeque;
import java.util.Collection;
import java.util.Date;
import java.util.Deque;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.logging.LogLevelMapping;

/**
 * The <b>JsonOutput</b> class defines the operations used to serialize Java objects into JSON
 * strings.
 */
public class JsonOutput implements Closeable {
  private static final Logger LOG = Logger.getLogger(JsonOutput.class.getName());
  static final int MAX_DEPTH = 100;

  /** Number of chars of escaped output to accumulate before flushing to the appendable. */
  private static final int ESCAPE_BUFFER_SIZE = 4096;

  private static final Predicate<Class<?>> GSON_ELEMENT;

  static {
    Predicate<Class<?>> gsonElement;
    try {
      Class<?> elementClass = Class.forName("com.google.gson.JsonElement");

      gsonElement = elementClass::isAssignableFrom;
    } catch (ReflectiveOperationException e) {
      gsonElement = clazz -> false;
    }

    GSON_ELEMENT = gsonElement;
  }

  // https://www.json.org has some helpful comments on characters to escape
  // See also https://tools.ietf.org/html/rfc8259#section-7 and
  // https://github.com/google/gson/issues/341 so we escape those as well.
  // It's legal to escape any character, so to be nice to HTML parsers,
  // we'll also escape "<" and "&"
  private static final String[] ASCII_ESCAPES = buildAsciiEscapes();

  private static String[] buildAsciiEscapes() {
    String[] escapes = new String[128];

    for (int i = 0; i <= 0x1f; i++) {
      // We want nice looking escapes for these, which are called out
      // by json.org
      escapes[i] = String.format("\\u%04x", i);
    }

    escapes['"'] = "\\\"";
    escapes['\\'] = "\\\\";
    escapes['/'] = "\\u002f";
    escapes['\b'] = "\\b";
    escapes['\f'] = "\\f";
    escapes['\n'] = "\\n";
    escapes['\r'] = "\\r";
    escapes['\t'] = "\\t";

    escapes['<'] = String.format("\\u%04x", (int) '<');
    escapes['&'] = String.format("\\u%04x", (int) '&');

    return escapes;
  }

  /**
   * The serialization strategy depends only on the class of the value being written, so resolve it
   * once per class rather than probing (potentially with reflection) for every value written.
   */
  private static final ClassValue<DepthAwareConsumer> CONVERTERS =
      new ClassValue<DepthAwareConsumer>() {
        @Override
        protected DepthAwareConsumer computeValue(Class<?> type) {
          return resolveConverter(type);
        }
      };

  // Note: the order of the checks matters, and mirrors the historical converter list.
  private static DepthAwareConsumer resolveConverter(Class<?> cls) {
    if (CharSequence.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> out.writeString(obj);
    }
    if (Number.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> out.append(obj.toString());
    }
    if (Boolean.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> out.append((Boolean) obj ? "true" : "false");
    }
    if (Date.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) ->
          out.append(String.valueOf(MILLISECONDS.toSeconds(((Date) obj).getTime())));
    }
    if (Instant.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) ->
          out.writeString(DateTimeFormatter.ISO_INSTANT.format((Instant) obj));
    }
    if (Enum.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> out.writeString(obj);
    }
    if (File.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> out.append(((File) obj).getAbsolutePath());
    }
    if (URI.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> out.writeString(obj.toString());
    }
    if (URL.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> out.writeString(((URL) obj).toExternalForm());
    }
    if (UUID.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> out.writeString(obj.toString());
    }
    if (Level.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) ->
          out.writeString(LogLevelMapping.getName((Level) obj));
    }
    if (GSON_ELEMENT.test(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> {
        LOG.log(
            Level.WARNING,
            "Attempt to convert JsonElement from GSON. This functionality is deprecated. "
                + "Diagnostic stacktrace follows",
            new JsonException("Stack trace to determine cause of warning"));
        out.append(obj.toString());
      };
    }

    // Special handling of asMap and toJson
    Method toJson = getMethod(cls, "toJson");
    if (toJson != null) {
      return (out, obj, maxDepth, depthRemaining) ->
          out.convertUsingMethod(toJson, obj, maxDepth, depthRemaining);
    }
    Method asMap = getMethod(cls, "asMap");
    if (asMap != null) {
      return (out, obj, maxDepth, depthRemaining) ->
          out.convertUsingMethod(asMap, obj, maxDepth, depthRemaining);
    }
    Method toMap = getMethod(cls, "toMap");
    if (toMap != null) {
      return (out, obj, maxDepth, depthRemaining) ->
          out.convertUsingMethod(toMap, obj, maxDepth, depthRemaining);
    }

    // And then the collection types
    if (Collection.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> {
        if (depthRemaining < 1) {
          throw new JsonException(
              "Reached the maximum depth of " + maxDepth + " while writing JSON");
        }
        out.beginArray();
        for (Object o : (Collection<?>) obj) {
          if (o instanceof Optional && ((Optional<?>) o).isEmpty()) {
            continue;
          }
          out.write0(o, maxDepth, depthRemaining - 1);
        }
        out.endArray();
      };
    }

    if (Map.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> {
        if (depthRemaining < 1) {
          throw new JsonException(
              "Reached the maximum depth of " + maxDepth + " while writing JSON");
        }
        out.beginObject();
        ((Map<?, ?>) obj)
            .forEach(
                (key, value) -> {
                  if (value instanceof Optional && ((Optional<?>) value).isEmpty()) {
                    return;
                  }
                  out.name(String.valueOf(key)).write0(value, maxDepth, depthRemaining - 1);
                });
        out.endObject();
      };
    }

    if (cls.isArray()) {
      return (out, obj, maxDepth, depthRemaining) -> {
        if (depthRemaining < 1) {
          throw new JsonException(
              "Reached the maximum depth of " + maxDepth + " while writing JSON");
        }
        out.beginArray();
        for (Object o : (Object[]) obj) {
          if (o instanceof Optional && ((Optional<?>) o).isEmpty()) {
            continue;
          }
          out.write0(o, maxDepth, depthRemaining - 1);
        }
        out.endArray();
      };
    }

    if (Optional.class.isAssignableFrom(cls)) {
      return (out, obj, maxDepth, depthRemaining) -> {
        Optional<?> optional = (Optional<?>) obj;
        if (optional.isEmpty()) {
          out.append("null");
          return;
        }

        out.write0(optional.get(), maxDepth, depthRemaining);
      };
    }

    // Finally, attempt to convert as an object
    return (out, obj, maxDepth, depthRemaining) -> {
      if (depthRemaining < 1) {
        throw new JsonException("Reached the maximum depth of " + maxDepth + " while writing JSON");
      }
      out.mapObject(obj, maxDepth, depthRemaining - 1);
    };
  }

  private final Appendable appendable;
  private final Deque<Node> stack;
  private String indent = "";
  private String lineSeparator = "\n";
  private String indentBy = "  ";
  private String separator = ",\n";
  private String objectStart = "{\n";
  private String arrayStart = "[\n";
  private boolean writeClassName = true;

  JsonOutput(Appendable appendable) {
    this.appendable = Require.nonNull("Underlying appendable", appendable);

    this.stack = new ArrayDeque<>();
    this.stack.addFirst(new Root());
  }

  /**
   * Specify whether the serialized JSON object should be formatted with line breaks and indentation
   * ("pretty printed").
   *
   * @param enablePrettyPrinting {@code false} for compact format; {@code true} for "pretty
   *     printing" (default: {@code true})
   * @return this {@link JsonOutput} object
   */
  public JsonOutput setPrettyPrint(boolean enablePrettyPrinting) {
    this.lineSeparator = enablePrettyPrinting ? "\n" : "";
    this.indentBy = enablePrettyPrinting ? "  " : "";
    this.separator = "," + lineSeparator;
    this.objectStart = "{" + lineSeparator;
    this.arrayStart = "[" + lineSeparator;
    return this;
  }

  /**
   * Specify whether the serialized JSON object should include a "class" property whose value is the
   * fully-qualified class name of the Java object being serialized.
   *
   * @param writeClassName Whether to include the "class" property (default: {@code true})
   * @return this {@link JsonOutput} object
   */
  public JsonOutput writeClassName(boolean writeClassName) {
    this.writeClassName = writeClassName;
    return this;
  }

  /**
   * Begin a new JSON object.
   *
   * @return this {@link JsonOutput} object
   */
  public JsonOutput beginObject() {
    stack.getFirst().write(objectStart);
    indent += indentBy;
    stack.addFirst(new JsonObject());
    return this;
  }

  /**
   * Set the name of a new JSON object property.
   *
   * @param name JSON object property name
   * @return this {@link JsonOutput} object
   * @throws JsonException if top item on serialization object stack isn't a {@link JsonObject}
   * @throws java.util.NoSuchElementException if serialization object stack is empty
   */
  public JsonOutput name(String name) {
    if (!(stack.getFirst() instanceof JsonObject)) {
      throw new JsonException("Attempt to write name, but not writing a json object: " + name);
    }
    ((JsonObject) stack.getFirst()).name(name);
    return this;
  }

  /**
   * End the current JSON object.
   *
   * @return this {@link JsonOutput} object
   * @throws JsonException if top item on serialization object stack isn't a {@link JsonObject}
   * @throws java.util.NoSuchElementException if serialization object stack is empty
   */
  public JsonOutput endObject() {
    Node topOfStack = stack.getFirst();
    if (!(topOfStack instanceof JsonObject)) {
      throw new JsonException("Attempt to close a json object, but not writing a json object");
    }
    stack.removeFirst();
    indent = indent.substring(0, indent.length() - indentBy.length());

    if (!topOfStack.isEmpty) {
      rawAppend(lineSeparator);
      rawAppend(indent);
    } else {
      rawAppend(indent);
    }
    rawAppend("}");
    return this;
  }

  /**
   * Begin a new JSON array.
   *
   * @return this {@link JsonOutput} object
   */
  public JsonOutput beginArray() {
    append(arrayStart);
    indent += indentBy;
    stack.addFirst(new JsonCollection());
    return this;
  }

  /**
   * End the current JSON array.
   *
   * @return this {@link JsonOutput} object
   * @throws JsonException if top item on serialization object stack isn't a {@link JsonCollection}
   * @throws java.util.NoSuchElementException if serialization object stack is empty
   */
  public JsonOutput endArray() {
    Node topOfStack = stack.getFirst();
    if (!(topOfStack instanceof JsonCollection)) {
      throw new JsonException("Attempt to close a json array, but not writing a json array");
    }
    stack.removeFirst();
    indent = indent.substring(0, indent.length() - indentBy.length());

    if (!topOfStack.isEmpty) {
      rawAppend(lineSeparator);
      rawAppend(indent);
    } else {
      rawAppend(indent);
    }
    rawAppend("]");
    return this;
  }

  /**
   * Serialize the specified Java object as a JSON value.<br>
   * <b>NOTE</b>: This method limits traversal of nested objects to the default {@link #MAX_DEPTH
   * maximum depth}.
   *
   * @param value Java object to serialize
   * @return this {@link JsonOutput} object
   * @throws JsonException if allowed depth has been reached
   */
  public JsonOutput write(@Nullable Object value) {
    return write(value, MAX_DEPTH);
  }

  /**
   * Serialize the specified Java object as a JSON value.
   *
   * @param value Java object to serialize
   * @param maxDepth maximum depth of nested object traversal
   * @return this {@link JsonOutput} object
   * @throws JsonException if allowed depth has been reached
   */
  public JsonOutput write(@Nullable Object value, int maxDepth) {
    return write0(value, maxDepth, maxDepth);
  }

  private JsonOutput write0(@Nullable Object input, int maxDepth, int depthRemaining) {
    if (input == null) {
      append("null");
      return this;
    }
    CONVERTERS.get(input.getClass()).consume(this, input, maxDepth, depthRemaining);

    return this;
  }

  /**
   * {@inheritDoc}
   *
   * @throws JsonException if JSON stream isn't empty or an I/O exception is encountered
   * @throws java.util.NoSuchElementException if serialization object stack is empty
   */
  @Override
  public void close() {
    if (appendable instanceof Closeable) {
      try {
        ((Closeable) appendable).close();
      } catch (IOException e) {
        throw new JsonException(e);
      }
    }

    if (!(stack.getFirst() instanceof Root)) {
      throw new JsonException("Attempting to close incomplete json stream");
    }
  }

  private JsonOutput append(String text) {
    stack.getFirst().write(text);
    return this;
  }

  private void rawAppend(String text) {
    if (text.isEmpty()) {
      return;
    }

    try {
      appendable.append(text);
    } catch (IOException e) {
      throw new JsonException("Unable to write to underlying appendable", e);
    }
  }

  /**
   * Write the specified Java object as a quoted JSON string, handling any bookkeeping required by
   * the enclosing JSON container.
   *
   * @param obj Java object to be represented
   */
  private void writeString(Object obj) {
    String value = String.valueOf(obj);
    stack.getFirst().beginValue(value);
    writeEscaped(value);
  }

  /**
   * Write a quoted JSON string directly to the underlying appendable, escaping as needed. Runs of
   * characters that need no escaping are appended in bulk so no escaped copy of the value is ever
   * materialized.
   *
   * @param value string to be written
   */
  private void writeEscaped(String value) {
    try {
      appendable.append('"');

      int length = value.length();
      int plainStart = 0;
      // Escaped output is batched in here before being flushed to the appendable, so that a
      // heavily escaped value doesn't degrade into per-character appendable calls. Bounded by
      // the flush below, so no full escaped copy of the value is ever materialized.
      StringBuilder buffered = null;

      for (int i = 0; i < length; i++) {
        char c = value.charAt(i);
        String escape;
        if (c < 128) {
          escape = ASCII_ESCAPES[c];
        } else if (c == '\u2028') {
          escape = "\\u2028";
        } else {
          escape = null;
        }

        if (escape != null) {
          if (buffered == null) {
            buffered = new StringBuilder(Math.min(length + 16, ESCAPE_BUFFER_SIZE + 16));
          }
          buffered.append(value, plainStart, i).append(escape);
          if (buffered.length() >= ESCAPE_BUFFER_SIZE) {
            appendable.append(buffered);
            buffered.setLength(0);
          }
          plainStart = i + 1;
        }
      }

      if (buffered == null) {
        // No escaping was needed; write the whole value through unmodified.
        appendable.append(value);
      } else {
        if (buffered.length() > 0) {
          appendable.append(buffered);
        }
        if (plainStart < length) {
          appendable.append(value, plainStart, length);
        }
      }

      appendable.append('"');
    } catch (IOException e) {
      throw new JsonException("Unable to write to underlying appendable", e);
    }
  }

  /**
   * Get a reference to a method of the specified name with no argument in the indicated class or
   * one of its ancestors.
   *
   * @param clazz target Java class
   * @param methodName method name
   * @return {@link Method} object with 'accessible' flag set
   * @throws JsonException if a security violation is encountered
   */
  private static @Nullable Method getMethod(Class<?> clazz, String methodName) {
    if (Object.class.equals(clazz)) {
      return null;
    }

    try {
      Method method = clazz.getDeclaredMethod(methodName);
      method.setAccessible(true);
      return method;
    } catch (NoSuchMethodException e) {
      return getMethod(clazz.getSuperclass(), methodName);
    } catch (SecurityException e) {
      throw new JsonException(
          "Unable to find the method because of a security constraint: " + methodName, e);
    }
  }

  /**
   * Convert the specified Java object using the indicated zero-argument method of this object.
   *
   * @param method zero-argument method that produces the serializable form of the object
   * @param toConvert Java object to be converted
   * @param maxDepth maximum depth of nested object traversal
   * @param depthRemaining allowed traversal depth remaining
   * @return this {@link JsonOutput} object
   * @throws JsonException
   *     <ul>
   *       <li>if a reflective operation fails
   *       <li>if maximum traversal depth is exceeded
   *     </ul>
   */
  private JsonOutput convertUsingMethod(
      Method method, Object toConvert, int maxDepth, int depthRemaining) {
    try {
      Object value = method.invoke(toConvert);

      return write0(value, maxDepth, depthRemaining);
    } catch (ReflectiveOperationException e) {
      throw new JsonException(e);
    }
  }

  /**
   * Convert the specified Java object via accessors that conform to the {@code JavaBean}
   * specification.
   *
   * @param toConvert Java object to be converted
   * @param maxDepth maximum depth of nested object traversal
   * @param depthRemaining allowed traversal depth remaining
   * @throws JsonException if allowed depth has been reached
   */
  private void mapObject(Object toConvert, int maxDepth, int depthRemaining) {
    if (toConvert instanceof Class) {
      write(((Class<?>) toConvert).getName());
      return;
    }

    // Raw object via reflection? Nope, not needed
    beginObject();
    for (SimplePropertyDescriptor pd :
        SimplePropertyDescriptor.getPropertyDescriptors(toConvert.getClass())) {

      // Only include methods not on java.lang.Object to stop things being super-noisy
      Function<Object, @Nullable Object> readMethod = pd.getReadMethod();
      if (readMethod == null) {
        continue;
      }

      if (!writeClassName && "class".equals(pd.getName())) {
        continue;
      }

      Object value = readMethod.apply(toConvert);
      if (!Optional.empty().equals(value)) {
        name(pd.getName());
        write0(value, maxDepth, depthRemaining - 1);
      }
    }
    endObject();
  }

  /** Defines to common behavior of JSON containers (objects and arrays). */
  private abstract class Node {
    protected boolean isEmpty = true;

    /**
     * Perform the bookkeeping needed before a new value is written to this container.<br>
     * <b>NOTE</b>: If prior text has been written to this container, a comma and the defined line
     * separator (either {@literal <newline>} or empty string) are emitted to delimit a new object
     * property or array item.
     *
     * @param value the value about to be written, used only for error reporting
     */
    void beginValue(Object value) {
      if (isEmpty) {
        isEmpty = false;
      } else {
        rawAppend(separator);
      }

      rawAppend(indent);
    }

    /**
     * Write the specified text to the appendable of this JSON output object.
     *
     * @param text text to be appended to the output
     */
    public void write(String text) {
      beginValue(text);
      rawAppend(text);
    }
  }

  /** Represents the root of the JSON output. */
  private class Root extends Node {

    /**
     * {@inheritDoc}
     *
     * @throws JsonException if this {@link JsonOutput} has already been used.
     */
    @Override
    void beginValue(Object value) {
      if (!isEmpty) {
        throw new JsonException("Only allowed to write one value to a json stream");
      }

      super.beginValue(value);
    }
  }

  /** Represents a JSON array. */
  private class JsonCollection extends Node {}

  /** Represents a JSON object. */
  private class JsonObject extends Node {
    private boolean isNameNext = true;

    /**
     * Writes the name of a JSON property followed by a colon to the appendable of this JSON output
     * object.
     *
     * @param name JSON object property name
     * @throws JsonException if not expecting a new JSON property
     */
    public void name(String name) {
      if (!isNameNext) {
        throw new JsonException("Unexpected attempt to set name of json object: " + name);
      }
      isNameNext = false;
      super.beginValue(name);
      writeEscaped(name);
      rawAppend(": ");
    }

    /**
     * {@inheritDoc}
     *
     * @throws JsonException if not expecting a JSON property value
     */
    @Override
    void beginValue(Object value) {
      if (isNameNext) {
        throw new JsonException("Unexpected attempt to write value before name: " + value);
      }
      isNameNext = true;
    }
  }

  /**
   * Defines the common interface for the Java object traversal serializers of {@link JsonOutput}.
   */
  @FunctionalInterface
  private interface DepthAwareConsumer {

    /**
     * Consume the specified Java object, emitting its JSON representation to the appendable of the
     * supplied {@link JsonOutput}.
     *
     * @param out {@link JsonOutput} to write to
     * @param object Java object to be serialized
     * @param maxDepth maximum depth of nested object traversal
     * @param depthRemaining allowed traversal depth remaining
     */
    void consume(JsonOutput out, Object object, int maxDepth, int depthRemaining);
  }
}
