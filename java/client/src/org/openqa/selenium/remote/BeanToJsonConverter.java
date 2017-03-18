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

package org.openqa.selenium.remote;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogLevelMapping;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.logging.SessionLogs;

import java.io.File;
import java.lang.reflect.Array;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;

/**
 * Utility class for converting between JSON and Java Objects.
 */
public class BeanToJsonConverter {

  private static final int MAX_DEPTH = 5;

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
      JsonElement json = convertObject(object);
      return new GsonBuilder().disableHtmlEscaping().serializeNulls().create().toJson(json);
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
   */
  public JsonElement convertObject(Object object) {
    if (object == null) {
      return JsonNull.INSTANCE;
    }

    try {
      return convertObject(object, MAX_DEPTH);
    } catch (Exception e) {
      throw new WebDriverException("Unable to convert: " + object, e);
    }
  }

  @SuppressWarnings("unchecked")
  private JsonElement convertObject(Object toConvert, int maxDepth) throws Exception {
    if (toConvert == null) {
      return JsonNull.INSTANCE;
    }

    if (toConvert instanceof Boolean) {
      return new JsonPrimitive((Boolean) toConvert);
    }

    if (toConvert instanceof CharSequence) {
      return new JsonPrimitive(String.valueOf(toConvert));
    }

    if (toConvert instanceof Number) {
      return new JsonPrimitive((Number) toConvert);
    }

    if (toConvert instanceof Level) {
      return new JsonPrimitive(LogLevelMapping.getName((Level) toConvert));
    }

    if (toConvert.getClass().isEnum() || toConvert instanceof Enum) {
      return new JsonPrimitive(toConvert.toString());
    }

    if (toConvert instanceof LoggingPreferences) {
      LoggingPreferences prefs = (LoggingPreferences) toConvert;
      JsonObject converted = new JsonObject();
      for (String logType : prefs.getEnabledLogTypes()) {
        converted.addProperty(logType, LogLevelMapping.getName(prefs.getLevel(logType)));
      }
      return converted;
    }

    if (toConvert instanceof SessionLogs) {
      return convertObject(((SessionLogs)toConvert).getAll(), maxDepth - 1);
    }

    if (toConvert instanceof LogEntries) {
      return convertObject(((LogEntries)toConvert).getAll(), maxDepth - 1);
    }

    if (toConvert instanceof Map) {
      Map<String, Object> map = (Map<String, Object>) toConvert;
      if (map.size() == 1 && map.containsKey("w3c cookie")) {
        return convertObject(map.get("w3c cookie"));
      }

      JsonObject converted = new JsonObject();
      for (Map.Entry<String, Object> entry : map.entrySet()) {
        converted.add(entry.getKey(), convertObject(entry.getValue(), maxDepth - 1));
      }
      return converted;
    }

    if (toConvert instanceof JsonElement) {
      return (JsonElement) toConvert;
    }

    if (toConvert instanceof Collection) {
      JsonArray array = new JsonArray();
      for (Object o : (Collection<?>) toConvert) {
        array.add(convertObject(o, maxDepth - 1));
      }
      return array;
    }

    if (toConvert.getClass().isArray()) {
      JsonArray converted = new JsonArray();
      int length = Array.getLength(toConvert);
      for (int i = 0; i < length; i++) {
        converted.add(convertObject(Array.get(toConvert, i), maxDepth - 1));
      }
      return converted;
    }

    if (toConvert instanceof SessionId) {
      JsonObject converted = new JsonObject();
      converted.addProperty("value", toConvert.toString());
      return converted;
    }

    if (toConvert instanceof Date) {
      return new JsonPrimitive(TimeUnit.MILLISECONDS.toSeconds(((Date) toConvert).getTime()));
    }

    if (toConvert instanceof File) {
      return new JsonPrimitive(((File) toConvert).getAbsolutePath());
    }

    Method toMap = getMethod(toConvert, "toMap");
    if (toMap == null) {
      toMap = getMethod(toConvert, "asMap");
    }
    if (toMap != null) {
      try {
        return convertObject(toMap.invoke(toConvert), maxDepth - 1);
      } catch (ReflectiveOperationException e) {
        throw new WebDriverException(e);
      }
    }

    Method toJson = getMethod(toConvert, "toJson");
    if (toJson != null) {
      try {
        Object res = toJson.invoke(toConvert);
        if (res instanceof JsonElement) {
          return (JsonElement) res;
        }

        if (res instanceof Map) {
          return convertObject(res);
        } else if (res instanceof Collection) {
          return convertObject(res);
        } else if (res instanceof String) {
          try {
            return new JsonParser().parse((String) res);
          } catch (JsonParseException e) {
            return new JsonPrimitive((String) res);
          }
        }
      } catch (ReflectiveOperationException e) {
        throw new WebDriverException(e);
      }
    }

    try {
      return mapObject(toConvert, maxDepth - 1, toConvert instanceof Cookie);
    } catch (Exception e) {
      throw new WebDriverException(e);
    }
  }

  private Method getMethod(Object toConvert, String methodName) {
    try {
      return toConvert.getClass().getMethod(methodName);
    } catch (NoSuchMethodException | SecurityException e) {
      // fall through
    }

    return null;

  }

  private JsonElement mapObject(Object toConvert, int maxDepth, boolean skipNulls) throws Exception {
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

      Method readMethod = pd.getReadMethod();
      if (readMethod == null) {
        continue;
      }

      if (readMethod.getParameterTypes().length > 0) {
        continue;
      }

      readMethod.setAccessible(true);

      Object result = readMethod.invoke(toConvert);
      if (!skipNulls || result != null) {
        mapped.add(pd.getName(), convertObject(result, maxDepth - 1));
      }
    }

    return mapped;
  }
}
