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
import java.util.Collections;
import java.util.Date;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.logging.LogLevelMapping;

public class JsonOutput implements Closeable {
  private static final Logger LOG = Logger.getLogger(JsonOutput.class.getName());
  static final int MAX_DEPTH = 10;

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
    // increased initial capacity to avoid hash collisions, especially for the following ranges:
    // '0' to '9', 'a' to 'z', 'A' to 'Z'
    Map<Integer, String> builder = new LinkedHashMap<>(128);

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

  private final Map<Predicate<Class<?>>, DepthAwareConsumer> converters;
  private final Appendable appendable;
  private final Consumer<String> appender;
  private Deque<Node> stack;
  private String indent = "";
  private String lineSeparator = "\n";
  private String indentBy = "  ";
  private boolean writeClassName = true;

  JsonOutput(Appendable appendable) {
    this.appendable = Require.nonNull("Underlying appendable", appendable);

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
    Map<Predicate<Class<?>>, DepthAwareConsumer> builder = new LinkedHashMap<>();
    builder.put(Objects::isNull, (obj, maxDepth, depthRemaining) -> append("null"));
    builder.put(
        CharSequence.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> append(asString(obj)));
    builder.put(
        Number.class::isAssignableFrom, (obj, maxDepth, depthRemaining) -> append(obj.toString()));
    builder.put(
        Boolean.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> append((Boolean) obj ? "true" : "false"));
    builder.put(
        Date.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) ->
            append(String.valueOf(MILLISECONDS.toSeconds(((Date) obj).getTime()))));
    builder.put(
        Instant.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) ->
            append(asString(DateTimeFormatter.ISO_INSTANT.format((Instant) obj))));
    builder.put(
        Enum.class::isAssignableFrom, (obj, maxDepth, depthRemaining) -> append(asString(obj)));
    builder.put(
        File.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> append(((File) obj).getAbsolutePath()));
    builder.put(
        URI.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> append(asString((obj).toString())));
    builder.put(
        URL.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> append(asString(((URL) obj).toExternalForm())));
    builder.put(
        UUID.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> append(asString(obj.toString())));
    builder.put(
        Level.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> append(asString(LogLevelMapping.getName((Level) obj))));
    builder.put(
        GSON_ELEMENT,
        (obj, maxDepth, depthRemaining) -> {
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
        (obj, maxDepth, depthRemaining) ->
            convertUsingMethod("toJson", obj, maxDepth, depthRemaining));
    builder.put(
        cls -> getMethod(cls, "asMap") != null,
        (obj, maxDepth, depthRemaining) ->
            convertUsingMethod("asMap", obj, maxDepth, depthRemaining));
    builder.put(
        cls -> getMethod(cls, "toMap") != null,
        (obj, maxDepth, depthRemaining) ->
            convertUsingMethod("toMap", obj, maxDepth, depthRemaining));

    // And then the collection types
    builder.put(
        Collection.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> {
          if (depthRemaining < 1) {
            throw new JsonException(
                "Reached the maximum depth of " + maxDepth + " while writing JSON");
          }
          beginArray();
          ((Collection<?>) obj)
              .stream()
                  .filter(o -> (!(o instanceof Optional) || ((Optional<?>) o).isPresent()))
                  .forEach(o -> write0(o, maxDepth, depthRemaining - 1));
          endArray();
        });

    builder.put(
        Map.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> {
          if (depthRemaining < 1) {
            throw new JsonException(
                "Reached the maximum depth of " + maxDepth + " while writing JSON");
          }
          beginObject();
          ((Map<?, ?>) obj)
              .forEach(
                  (key, value) -> {
                    if (value instanceof Optional && !((Optional) value).isPresent()) {
                      return;
                    }
                    name(String.valueOf(key)).write0(value, maxDepth, depthRemaining - 1);
                  });
          endObject();
        });
    builder.put(
        Class::isArray,
        (obj, maxDepth, depthRemaining) -> {
          if (depthRemaining < 1) {
            throw new JsonException(
                "Reached the maximum depth of " + maxDepth + " while writing JSON");
          }
          beginArray();
          Stream.of((Object[]) obj)
              .filter(o -> (!(o instanceof Optional) || ((Optional<?>) o).isPresent()))
              .forEach(o -> write0(o, maxDepth, depthRemaining - 1));
          endArray();
        });

    builder.put(
        Optional.class::isAssignableFrom,
        (obj, maxDepth, depthRemaining) -> {
          Optional<?> optional = (Optional<?>) obj;
          if (!optional.isPresent()) {
            append("null");
            return;
          }

          write0(optional.get(), maxDepth, depthRemaining);
        });

    // Finally, attempt to convert as an object
    builder.put(
        cls -> true,
        (obj, maxDepth, depthRemaining) -> {
          if (depthRemaining < 1) {
            throw new JsonException(
                "Reached the maximum depth of " + maxDepth + " while writing JSON");
          }
          mapObject(obj, maxDepth, depthRemaining - 1);
        });

    this.converters = Collections.unmodifiableMap(builder);
  }

  public JsonOutput setPrettyPrint(boolean enablePrettyPrinting) {
    this.lineSeparator = enablePrettyPrinting ? "\n" : "";
    this.indentBy = enablePrettyPrinting ? "  " : "";
    return this;
  }

  public JsonOutput writeClassName(boolean writeClassName) {
    this.writeClassName = writeClassName;
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
    indent += indentBy;
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

  public JsonOutput write(Object value, int maxDepth) {
    return write0(value, maxDepth, maxDepth);
  }

  private JsonOutput write0(Object input, int maxDepth, int depthRemaining) {
    converters.entrySet().stream()
        .filter(entry -> entry.getKey().test(input == null ? null : input.getClass()))
        .findFirst()
        .map(Map.Entry::getValue)
        .orElseThrow(() -> new JsonException("Unable to write " + input))
        .consume(input, maxDepth, depthRemaining);

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
        .forEach(
            i -> {
              String escaped = ESCAPES.get(i);
              if (escaped != null) {
                toReturn.append(escaped);
              } else {
                toReturn.append((char) i);
              }
            });

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
          "Unable to find the method because of a security constraint: " + methodName, e);
    }
  }

  private JsonOutput convertUsingMethod(
      String methodName, Object toConvert, int maxDepth, int depthRemaining) {
    try {
      Method method = getMethod(toConvert.getClass(), methodName);
      if (method == null) {
        throw new JsonException(
            String.format("Unable to read object %s using method %s", toConvert, methodName));
      }
      Object value = method.invoke(toConvert);

      return write0(value, maxDepth, depthRemaining);
    } catch (ReflectiveOperationException e) {
      throw new JsonException(e);
    }
  }

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
      Function<Object, Object> readMethod = pd.getReadMethod();
      if (readMethod == null) {
        continue;
      }

      if (!writeClassName && "class".equals(pd.getName())) {
        continue;
      }

      Object value = pd.getReadMethod().apply(toConvert);
      if (!Optional.empty().equals(value)) {
        name(pd.getName());
        write0(value, maxDepth, depthRemaining - 1);
      }
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

  private class JsonCollection extends Node {}

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
  private interface DepthAwareConsumer {
    void consume(Object object, int maxDepth, int depthRemaining);
  }
}
