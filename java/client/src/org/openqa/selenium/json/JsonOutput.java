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

import org.openqa.selenium.logging.LogLevelMapping;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URI;
import java.net.URL;
import java.util.ArrayDeque;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;

import static java.util.concurrent.TimeUnit.MILLISECONDS;

public class JsonOutput implements Closeable {
  private static final Logger LOG = Logger.getLogger(JsonOutput.class.getName());
  private static final int MAX_DEPTH = 5;

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
  private static final Map<Integer, String> ESCAPES;
  static {
    Map<Integer, String> builder = new LinkedHashMap<>();

    for (int i = 0; i <= 0x1f; i++) {
      // We want nice looking escapes for these, which are called out
      // by json.org
      if (!(i == '\b' || i == '\f' || i == '\n' || i == '\r' || i == '\t')) {
        builder.put(i, String.format("\\u%04x", i));
      }
    }

    builder.put((int) '"', "\\\"");
    builder.put((int) '\\', "\\\\");
    builder.put((int) '/', "\\u002f");
    builder.put((int) '\b', "\\b");
    builder.put((int) '\f', "\\f");
    builder.put((int) '\n', "\\n");
    builder.put((int) '\r', "\\r");
    builder.put((int) '\t', "\\t");

    builder.put((int) '\u2028', "\\u2028");
    builder.put((int) '<', String.format("\\u%04x", (int) '<'));
    builder.put((int) '&', String.format("\\u%04x", (int) '&'));
    ESCAPES = Collections.unmodifiableMap(builder);
  }

  private final Map<Predicate<Class<?>>, SafeBiConsumer<Object, Integer>> converters;
  private final Appendable appendable;
  private final Consumer<String> appender;
  private Deque<Node> stack;
  private String indent = "";
  private String lineSeparator = "\n";
  private String indentBy = "  ";

  JsonOutput(Appendable appendable) {
    this.appendable = Objects.requireNonNull(appendable);

    this.appender =
        str -> {
          try {
            appendable.append(str);
          } catch (IOException e) {
            throw new JsonException("Unable to write to underlying appendable", e);
          }
        };

    this.stack = new ArrayDeque<>();
    this.stack.addFirst(new Empty());

    // Order matters, since we want to handle null values first to avoid exceptions, and then then
    // common kinds of inputs next.
    Map<Predicate<Class<?>>, SafeBiConsumer<Object, Integer>> builder = new LinkedHashMap<>();
    builder.put(Objects::isNull, (obj, depth) -> append("null"));
    builder.put(CharSequence.class::isAssignableFrom, (obj, depth) -> append(asString(obj)));
    builder.put(Number.class::isAssignableFrom, (obj, depth) -> append(obj.toString()));
    builder.put(Boolean.class::isAssignableFrom, (obj, depth) -> append((Boolean) obj ? "true" : "false"));
    builder.put(Date.class::isAssignableFrom, (obj, depth) -> append(String.valueOf(MILLISECONDS.toSeconds(((Date) obj).getTime()))));
    builder.put(Enum.class::isAssignableFrom, (obj, depth) -> append(asString(obj)));
    builder.put(File.class::isAssignableFrom, (obj, depth) -> append(((File) obj).getAbsolutePath()));
    builder.put(URI.class::isAssignableFrom, (obj, depth) -> append(asString((obj).toString())));
    builder.put(URL.class::isAssignableFrom, (obj, depth) -> append(asString(((URL) obj).toExternalForm())));
    builder.put(UUID.class::isAssignableFrom, (obj, depth) -> append(asString(((UUID) obj).toString())));
    builder.put(Level.class::isAssignableFrom, (obj, depth) -> append(asString(LogLevelMapping.getName((Level) obj))));
    builder.put(
        GSON_ELEMENT,
        (obj, depth) -> {
          LOG.log(
              Level.WARNING,
              "Attempt to convert JsonElement from GSON. This functionality is deprecated. "
              + "Diagnostic stacktrace follows",
              new JsonException("Stack trace to determine cause of warning"));
          append(obj.toString());
        });
    // Special handling of asMap and toJson
    builder.put(
        cls -> getMethod(cls, "toJson") != null,
        (obj, depth) -> convertUsingMethod("toJson", obj, depth));
    builder.put(
        cls -> getMethod(cls, "asMap") != null,
        (obj, depth) -> convertUsingMethod("asMap", obj, depth));
    builder.put(
        cls -> getMethod(cls, "toMap") != null,
        (obj, depth) -> convertUsingMethod("toMap", obj, depth));

    // And then the collection types
    builder.put(
        Collection.class::isAssignableFrom,
        (obj, depth) -> {
          beginArray();
          ((Collection<?>) obj).forEach(o -> write(o, depth - 1));
          endArray();
        });

    builder.put(
        Map.class::isAssignableFrom,
        (obj, depth) -> {
          beginObject();
          ((Map<?, ?>) obj).forEach(
              (key, value) -> name(String.valueOf(key)).write(value, depth - 1));
          endObject();
        });
    builder.put(
        Class::isArray,
        (obj, depth) -> {
          beginArray();
          Stream.of((Object[]) obj).forEach(o -> write(o, depth - 1));
          endArray();
        });

    // Finally, attempt to convert as an object
    builder.put(cls -> true, (obj, depth) -> mapObject(obj, depth - 1));

    this.converters = Collections.unmodifiableMap(builder);
  }

  public JsonOutput setPrettyPrint(boolean enablePrettyPrinting) {
    this.lineSeparator = enablePrettyPrinting ? "\n" : "";
    this.indentBy = enablePrettyPrinting ? "  " : "";
    return this;
  }

  public JsonOutput beginObject() {
    stack.getFirst().write("{" + lineSeparator);
    indent += indentBy;
    stack.addFirst(new JsonObject());
    return this;
  }

  public JsonOutput name(String name) {
    if (!(stack.getFirst() instanceof JsonObject)) {
      throw new JsonException("Attempt to write name, but not writing a json object: " + name);
    }
    ((JsonObject) stack.getFirst()).name(name);
    return this;
  }

  public JsonOutput endObject() {
    Node topOfStack = stack.getFirst();
    if (!(topOfStack instanceof JsonObject)) {
      throw new JsonException("Attempt to close a json object, but not writing a json object");
    }
    stack.removeFirst();
    indent = indent.substring(0, indent.length() - indentBy.length());

    if (topOfStack.isEmpty) {
      appender.accept(indent + "}");
    } else {
      appender.accept(lineSeparator + indent + "}");
    }
    return this;
  }

  public JsonOutput beginArray() {
    append("[" + lineSeparator);
    indent += "  ";
    stack.addFirst(new JsonCollection());
    return this;
  }

  public JsonOutput endArray() {
    Node topOfStack = stack.getFirst();
    if (!(topOfStack instanceof JsonCollection)) {
      throw new JsonException("Attempt to close a json array, but not writing a json array");
    }
    stack.removeFirst();
    indent = indent.substring(0, indent.length() - indentBy.length());

    if (topOfStack.isEmpty) {
      appender.accept(indent + "]");
    } else {
      appender.accept(lineSeparator + indent + "]");
    }
    return this;
  }

  public JsonOutput write(Object value) {
    return write(value, MAX_DEPTH);
  }

  public JsonOutput write(Object input, int depthRemaining) {
    converters.entrySet().stream()
        .filter(entry -> entry.getKey().test(input == null ? null : input.getClass()))
        .findFirst()
        .map(Map.Entry::getValue)
        .orElseThrow(() -> new JsonException("Unable to write " + input))
        .consume(input, depthRemaining);

    return this;
  }

  @Override
  public void close() {
    if (appendable instanceof Closeable) {
      try {
        ((Closeable) appendable).close();
      } catch (IOException e) {
        throw new JsonException(e);
      }
    }

    if (!(stack.getFirst() instanceof Empty)) {
      throw new JsonException("Attempting to close incomplete json stream");
    }
  }

  private JsonOutput append(String text) {
    stack.getFirst().write(text);
    return this;
  }

  private String asString(Object obj) {
    StringBuilder toReturn = new StringBuilder("\"");

    String.valueOf(obj)
        .chars()
        .mapToObj(i -> ESCAPES.getOrDefault(i, "" + (char) i))
        .forEach(toReturn::append);

    toReturn.append('"');

    return toReturn.toString();
  }

  private Method getMethod(Class<?> clazz, String methodName) {
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
          "Unable to find the method because of a security constraint: " + methodName,
          e);
    }
  }

  private JsonOutput convertUsingMethod(String methodName, Object toConvert, int depth) {
    try {
      Method method = getMethod(toConvert.getClass(), methodName);
      if (method == null) {
        throw new JsonException(String.format(
            "Unable to read object %s using method %s",
            toConvert,
            methodName));
      }
      Object value = method.invoke(toConvert);

      return write(value, depth);
    } catch (ReflectiveOperationException e) {
      throw new JsonException(e);
    }
  }

  private void mapObject(Object toConvert, int maxDepth) {
    if (maxDepth < 1) {
      append("null");
      return;
    }

    if (toConvert instanceof Class) {
      write(((Class<?>) toConvert).getName());
      return;
    }

    // Raw object via reflection? Nope, not needed
    beginObject();
    for (SimplePropertyDescriptor pd :
        SimplePropertyDescriptor.getPropertyDescriptors(toConvert.getClass())) {

      // Only include methods not on java.lang.Object to stop things being super-noisy
      Function<Object, Object> readMethod = pd.getReadMethod();
      if (readMethod == null) {
        continue;
      }

      name(pd.getName());
      write(pd.getReadMethod().apply(toConvert), maxDepth - 1);
    }
    endObject();
  }

  private class Node {
    protected boolean isEmpty = true;

    public void write(String text) {
      if (isEmpty) {
        isEmpty = false;
      } else {
        appender.accept("," + lineSeparator);
      }

      appender.accept(indent);
      appender.accept(text);
    }
  }

  private class Empty extends Node {

    @Override
    public void write(String text) {
      if (!isEmpty) {
        throw new JsonException("Only allowed to write one value to a json stream");
      }

      super.write(text);
    }
  }

  private class JsonCollection extends Node {
  }

  private class JsonObject extends Node {
    private boolean isNameNext = true;

    public void name(String name) {
      if (!isNameNext) {
        throw new JsonException("Unexpected attempt to set name of json object: " + name);
      }
      isNameNext = false;
      super.write(asString(name));
      appender.accept(": ");
    }

    @Override
    public void write(String text) {
      if (isNameNext) {
        throw new JsonException("Unexpected attempt to write value before name: " + text);
      }
      isNameNext = true;

      appender.accept(text);
    }
  }

  @FunctionalInterface
  private interface SafeBiConsumer<T, U> {
    void consume(T t, U u);
  }
}
