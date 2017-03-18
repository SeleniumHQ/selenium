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

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSyntaxException;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class JsonToBeanConverter {

  private ErrorCodes errorCodes = new ErrorCodes();

  public <T> T convert(Class<T> clazz, Object source) throws JsonException {
    try {
      return convert(clazz, source, 0);
    } catch (JsonSyntaxException e) {
      throw new JsonException(e, source);
    }
  }

  @SuppressWarnings("unchecked")
  private <T> T convert(Class<T> clazz, Object source, int depth) {
    if (source == null || source instanceof JsonNull) {
      return null;
    }

    if (source instanceof JsonElement) {
      JsonElement json = (JsonElement) source;

      if (json.isJsonPrimitive()) {
        JsonPrimitive jp = json.getAsJsonPrimitive();

        if (String.class.equals(clazz)) {
          return (T) jp.getAsString();
        }

        if (jp.isNumber()) {
          if (Integer.class.isAssignableFrom(clazz) || int.class.equals(clazz)) {
            return (T) Integer.valueOf(jp.getAsNumber().intValue());
          } else if (Long.class.isAssignableFrom(clazz) || long.class.equals(clazz)) {
            return (T) Long.valueOf(jp.getAsNumber().longValue());
          } else if (Float.class.isAssignableFrom(clazz) || float.class.equals(clazz)) {
            return (T) Float.valueOf(jp.getAsNumber().floatValue());
          } else if (Double.class.isAssignableFrom(clazz) || double.class.equals(clazz)) {
            return (T) Double.valueOf(jp.getAsNumber().doubleValue());
          } else {
            return (T) convertJsonPrimitive(jp);
          }
        }
      }
    }

    if (isPrimitive(source.getClass())) {
      return (T) source;
    }

    if (isEnum(clazz, source)) {
      return (T) convertEnum(clazz, source);
    }

    if ("".equals(String.valueOf(source))) {
      return (T) source;
    }

    if (Command.class.equals(clazz)) {
      JsonObject json = new JsonParser().parse((String) source).getAsJsonObject();

      SessionId sessionId = null;
      if (json.has("sessionId") && !json.get("sessionId").isJsonNull()) {
        sessionId = convert(SessionId.class, json.get("sessionId"), depth + 1);
      }

      String name = json.get("name").getAsString();
      if (json.has("parameters")) {
        Map<String, ?> args = (Map<String, ?>) convert(HashMap.class, json.get("parameters"), depth + 1);
        return (T) new Command(sessionId, name, args);
      }

      return (T) new Command(sessionId, name);
    }

    if (Response.class.equals(clazz)) {
      Response response = new Response();
      JsonObject json = source instanceof JsonObject
                        ? (JsonObject) source
                        : new JsonParser().parse((String) source).getAsJsonObject();

      if (json.has("error") && ! json.get("error").isJsonNull()) {
        String state = json.get("error").getAsString();
        response.setState(state);
        response.setStatus(errorCodes.toStatus(state, Optional.empty()));
        response.setValue(convert(Object.class, json.get("message")));
      }
      if (json.has("state") && ! json.get("state").isJsonNull()) {
        String state = json.get("state").getAsString();
        response.setState(state);
        response.setStatus(errorCodes.toStatus(state, Optional.empty()));
      }
      if (json.has("status") && ! json.get("status").isJsonNull()) {
        JsonElement status = json.get("status");
        if (status.getAsJsonPrimitive().isString()) {
          String state = status.getAsString();
          response.setState(state);
          response.setStatus(errorCodes.toStatus(state, Optional.empty()));
        } else {
          int intStatus = status.getAsInt();
          response.setState(errorCodes.toState(intStatus));
          response.setStatus(intStatus);
        }
      }
      if (json.has("sessionId") && ! json.get("sessionId").isJsonNull()) {
        response.setSessionId(json.get("sessionId").getAsString());
      }

      if (json.has("value")) {
        response.setValue(convert(Object.class, json.get("value")));
      } else {
        response.setValue(convert(Object.class, json));
      }

      return (T) response;
    }

    if (SessionId.class.equals(clazz)) {
      // Stupid heuristic to tell if we are dealing with a selenium 2 or 3 session id.
      JsonElement json = source instanceof String
          ? new JsonParser().parse((String) source).getAsJsonObject() : (JsonElement) source;
      if (json.isJsonPrimitive()) {
        return (T) new SessionId(json.getAsString());
      }
      return (T) new SessionId(json.getAsJsonObject().get("value").getAsString());
    }

    if (Capabilities.class.isAssignableFrom(clazz)) {
      JsonObject json = source instanceof JsonElement
                        ? ((JsonElement) source).getAsJsonObject()
                        : new JsonParser().parse(source.toString()).getAsJsonObject();
      Map<String, Object> map = convertMap(json.getAsJsonObject(), depth);
      return (T) new DesiredCapabilities(map);
    }

    if (Date.class.equals(clazz)) {
      return (T) new Date(Long.valueOf(String.valueOf(source)));
    }

    if (source instanceof String && !((String) source).startsWith("{") && Object.class.equals(clazz)) {
      return (T) source;
    }

    Method fromJson = getMethod(clazz, "fromJson");
    if (fromJson != null) {
      try {
        return (T) fromJson.invoke(null, source.toString());
      } catch (IllegalArgumentException e) {
        throw new WebDriverException(e);
      } catch (IllegalAccessException e) {
        throw new WebDriverException(e);
      } catch (InvocationTargetException e) {
        throw new WebDriverException(e);
      }
    }

    if (depth == 0) {
      if (source instanceof String) {
        source = new JsonParser().parse((String) source);
      }
    }

    if (source instanceof JsonElement) {
      JsonElement element = (JsonElement) source;

      if (element.isJsonNull()) {
        return null;
      }

      if (element.isJsonPrimitive()) {
        return (T) convertJsonPrimitive(element.getAsJsonPrimitive());
      }

      if (element.isJsonArray()) {
        return (T) convertList(element.getAsJsonArray(), depth);
      }

      if (element.isJsonObject()) {
        if (Map.class.isAssignableFrom(clazz)) {
          return (T) convertMap(element.getAsJsonObject(), depth);
        }

        if (Object.class.equals(clazz)) {
          return (T) convertMap(element.getAsJsonObject(), depth);
        }

        return convertBean(clazz, element.getAsJsonObject(), depth);
      }
    }

    return (T) source; // Crap shoot here; probably a string.
  }

  private Method getMethod(Class<?> clazz, String methodName) {
    try {
      return clazz.getMethod(methodName, String.class);
    } catch (SecurityException e) {
      // fall through
    } catch (NoSuchMethodException e) {
      // fall through
    }

    return null;
  }

  private Object convertJsonPrimitive(JsonElement json) {
    return convertJsonPrimitive(json.getAsJsonPrimitive());
  }

  private Object convertJsonPrimitive(JsonPrimitive json) {
    if (json.isBoolean()) {
      return json.getAsBoolean();
    } else if (json.isNumber()) {
      if (json.getAsLong() == json.getAsDouble()) {
        return json.getAsLong();
      }
      return json.getAsDouble();
    } else if (json.isString()) {
      return json.getAsString();
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  private Enum convertEnum(Class clazz, Object text) {
    if (clazz.isEnum()) {
      if (text instanceof JsonElement) {
        return Enum.valueOf(clazz, (String) convertJsonPrimitive((JsonElement) text));
      }
      return Enum.valueOf(clazz, String.valueOf(text));
    }

    Class[] allClasses = clazz.getClasses();
    for (Class current : allClasses) {
      if (current.isEnum()) {
        if (text instanceof JsonElement) {
          return Enum.valueOf(current, (String) convertJsonPrimitive((JsonElement) text));
        }
        return Enum.valueOf(current, String.valueOf(text));
      }
    }

    return null;
  }

  private boolean isEnum(Class<?> clazz, Object text) {
    return clazz.isEnum() || text instanceof Enum<?>;
  }

  private <T> T convertBean(Class<T> clazz, JsonObject toConvert, int depth) {
    T t = newInstance(clazz);
    SimplePropertyDescriptor[] allProperties =
        SimplePropertyDescriptor.getPropertyDescriptors(clazz);
    for (SimplePropertyDescriptor property : allProperties) {
      if (!toConvert.has(property.getName()))
        continue;

      JsonElement value = toConvert.get(property.getName());

      Method write = property.getWriteMethod();
      if (write == null) {
        continue;
      }

      Class<?> type = write.getParameterTypes()[0];

      try {
        if (value.isJsonNull()) {
          value = null;
        }
        write.invoke(t, convert(type, value, depth + 1));
      } catch (IllegalArgumentException e) {
        throw propertyWriteException(property, value, type, e);
      } catch (IllegalAccessException e) {
        throw propertyWriteException(property, value, type, e);
      } catch (InvocationTargetException e) {
        throw propertyWriteException(property, value, type, e);
      }
    }

    return t;
  }

  private <T> T newInstance(Class<T> clazz) {
    try {
      return clazz.newInstance();
    } catch (InstantiationException e) {
      throw new WebDriverException(e);
    } catch (IllegalAccessException e) {
      throw new WebDriverException(e);
    }
  }

  private WebDriverException propertyWriteException(
      SimplePropertyDescriptor property, Object value, Class<?> type, Throwable cause) {
    throw new WebDriverException(
        String.format("Property name: %s -> %s on class %s", property.getName(), value, type),
        cause);
  }

  private Map<String, Object> convertMap(JsonObject toConvert, int depth) {
    Map<String, Object> map = new HashMap<>();

    for (Map.Entry<String, JsonElement> entry : toConvert.entrySet()) {
      map.put(entry.getKey(), convert(Object.class, entry.getValue(), depth + 1));
    }

    return map;
  }

  private List<?> convertList(JsonArray toConvert, int depth) {
    List<Object> list = new ArrayList<>(toConvert.size());
    for (int i = 0; i < toConvert.size(); i++) {
      list.add(convert(Object.class, toConvert.get(i), depth + 1));
    }
    return list;
  }


  private boolean isPrimitive(Class<?> clazz) {
    if (clazz.isPrimitive()) {
      return true;
    }

    if (Boolean.class.isAssignableFrom(clazz)) {
      return true;
    }

    if (Byte.class.isAssignableFrom(clazz)) {
      return true;
    }

    if (Character.class.isAssignableFrom(clazz)) {
      return true;
    }

    if (Double.class.isAssignableFrom(clazz)) {
      return true;
    }

    if (Float.class.isAssignableFrom(clazz)) {
      return true;
    }

    if (Integer.class.isAssignableFrom(clazz)) {
      return true;
    }

    if (Long.class.isAssignableFrom(clazz)) {
      return true;
    }

    if (Short.class.isAssignableFrom(clazz)) {
      return true;
    }

    if (Void.class.isAssignableFrom(clazz)) {
      return true;
    }

    return false;
  }
}
