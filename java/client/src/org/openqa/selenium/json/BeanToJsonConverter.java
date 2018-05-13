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

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LogLevelMapping;
import org.openqa.selenium.remote.SessionId;

import java.io.File;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.stream.Collector;

/**
 * Utility class for converting between JSON and Java Objects.
 */
class BeanToJsonConverter {

  private static final int MAX_DEPTH = 5;

  private final Gson gson;

  private final Map<Predicate<Class<?>>, BiFunction<Integer, Object, JsonElement>> converters;

  public BeanToJsonConverter() {
    this(Json.GSON);
  }

  public BeanToJsonConverter(Gson gson) {
    this.gson = gson;

    this.converters = ImmutableMap.<Predicate<Class<?>>, BiFunction<Integer, Object, JsonElement>>builder()
        // Java types

        .put(Boolean.class::isAssignableFrom, (depth, o) -> new JsonPrimitive((Boolean) o))
        .put(CharSequence.class::isAssignableFrom, (depth, o) -> new JsonPrimitive(String.valueOf(o)))
        .put(Date.class::isAssignableFrom, (depth, o) -> new JsonPrimitive(MILLISECONDS.toSeconds(((Date) o).getTime())))
        .put(Enum.class::isAssignableFrom, (depth, o) -> new JsonPrimitive(o.toString()))
        .put(File.class::isAssignableFrom, (depth, o) -> new JsonPrimitive(((File) o).getAbsolutePath()))
        .put(Number.class::isAssignableFrom, (depth, o) -> new JsonPrimitive((Number) o))
        .put(URL.class::isAssignableFrom, (depth, o) -> new JsonPrimitive(((URL) o).toExternalForm()))

        // *sigh* gson
        .put(JsonElement.class::isAssignableFrom, (depth, o) -> (JsonElement) o)

        // Selenium classes
        .put(Level.class::isAssignableFrom, (depth, o) -> new JsonPrimitive(LogLevelMapping.getName((Level) o)))
        .put(SessionId.class::isAssignableFrom, (depth, o) -> {
          JsonObject converted = new JsonObject();
          converted.addProperty("value", o.toString());
          return converted;
        })


        // Special handling of asMap and toJson
        .put(
            cls -> getMethod(cls, "toJson") != null,
            (depth, o) -> convertUsingMethod("toJson", o, depth))
        .put(
            cls -> getMethod(cls, "asMap") != null,
            (depth, o) -> convertUsingMethod("asMap", o, depth))
        .put(
            cls -> getMethod(cls, "toMap") != null,
            (depth, o) -> convertUsingMethod("toMap", o, depth))

        // And then the collection types
        .put(
            Collection.class::isAssignableFrom,
            (depth, o) -> ((Collection<?>) o).stream()
                .map(obj -> convertObject(obj, depth - 1))
                .collect(Collector.of(JsonArray::new, JsonArray::add, (l, r) -> { l.addAll(r); return l;})))
        .put(
            Map.class::isAssignableFrom,
            (depth, o) -> {
               JsonObject converted = new JsonObject();
               ((Map<?, ?>) o).forEach(
                   (key, value) -> converted.add(String.valueOf(key), convertObject(value, depth - 1)));
               return converted;
             })
        .put(
            Class::isArray,
            (depth, o) -> {
              JsonArray converted = new JsonArray();
              Arrays.stream(((Object[]) o)).forEach(value -> converted.add(convertObject(value, depth -1)));
              return converted;
            }
        )

        // Finally, attempt to convert as an object
        .put(cls -> true, (depth, o) -> mapObject(o, depth - 1))
        .build();
  }

  /**
   * Convert an object that may or may not be a JsonElement into its JSON string
   * representation, handling the case where it is neither in a graceful way.
   *
   * @param object which needs conversion
   * @return the JSON string representation of object
   */
  public String convert(Object object) {
    if (object == null) {
      return null;
    }

    try {
      JsonElement json = convertObject(object, MAX_DEPTH);
      return gson.toJson(json);
    } catch (WebDriverException e) {
      throw e;
    } catch (Exception e) {
      throw new WebDriverException("Unable to convert: " + object, e);
    }
  }

  /**
   * Convert an object that may or may not be a JsonElement into its JSON object
   * representation, handling the case where it is neither in a graceful way.
   *
   * @param object which needs conversion
   * @return the JSON object representation of object
   * @deprecated Use {@link #convert(Object)} and normal java types.
   */
  @Deprecated
  JsonElement convertObject(Object object) {
    return convertObject(object, MAX_DEPTH);
  }

  @SuppressWarnings("unchecked")
  private JsonElement convertObject(Object toConvert, int maxDepth) {
    if (toConvert == null) {
      return JsonNull.INSTANCE;
    }

    return converters.entrySet().stream()
        .filter(entry -> entry.getKey().test(toConvert.getClass()))
        .map(Map.Entry::getValue)
        .findFirst()
        .map(to -> to.apply(maxDepth, toConvert))
        .orElse(null);
  }

  private Method getMethod(Class<?> clazz, String methodName) {
    try {
      Method method = clazz.getMethod(methodName);
      method.setAccessible(true);
      return method;
    } catch (NoSuchMethodException | SecurityException e) {
      // fall through
    }

    return null;

  }

  private JsonElement convertUsingMethod(String methodName, Object toConvert, int depth) {
    try {
      Method method = getMethod(toConvert.getClass(), methodName);
      Object value = method.invoke(toConvert);

      return convertObject(value, depth);
    } catch (ReflectiveOperationException e) {
      throw new WebDriverException(e);
    }
  }

  private JsonElement mapObject(Object toConvert, int maxDepth) {
    if (maxDepth < 1) {
      return JsonNull.INSTANCE;
    }

    // Raw object via reflection? Nope, not needed
    JsonObject mapped = new JsonObject();
    for (SimplePropertyDescriptor pd : SimplePropertyDescriptor
        .getPropertyDescriptors(toConvert.getClass())) {
      if ("class".equals(pd.getName())) {
        mapped.addProperty("class", toConvert.getClass().getName());
        continue;
      }

      // Only include methods not on java.lang.Object to stop things being super-noisy
      Method readMethod = pd.getReadMethod();
      if (readMethod == null || Object.class.equals(readMethod.getDeclaringClass())) {
        continue;
      }

      if (readMethod.getParameterTypes().length > 0) {
        continue;
      }

      readMethod.setAccessible(true);

      try {
        Object result = readMethod.invoke(toConvert);
        mapped.add(pd.getName(), convertObject(result, maxDepth - 1));
      } catch (ReflectiveOperationException e) {
        throw new WebDriverException(e);
      }
    }

    return mapped;
  }
}
