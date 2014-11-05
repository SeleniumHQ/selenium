/*
Copyright 2007-2009 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
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

public class JsonToBeanConverter {

  public <T> T convert(Class<T> clazz, Object text) throws JsonException {
    try {
      return convert(clazz, text, 0);
    } catch (JsonSyntaxException e) {
      throw new JsonException(e, text);
    }
  }

  @SuppressWarnings("unchecked")
  private <T> T convert(Class<T> clazz, Object text, int depth) {
    if (text == null) {
      return null;
    }

    if (text instanceof JsonElement) {
      JsonElement json = (JsonElement) text;

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

    if (isPrimitive(text.getClass())) {
      return (T) text;
    }

    if (isEnum(clazz, text)) {
      return (T) convertEnum(clazz, text);
    }

    if ("".equals(String.valueOf(text))) {
      return (T) text;
    }

    if (Command.class.equals(clazz)) {
      JsonObject json = new JsonParser().parse((String) text).getAsJsonObject();

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

    if (SessionId.class.equals(clazz)) {
      // Stupid heuristic to tell if we are dealing with a selenium 2 or 3 session id.
      JsonElement json = text instanceof String
          ? new JsonParser().parse((String) text).getAsJsonObject() : (JsonElement) text;
      if (json.isJsonPrimitive()) {
        return (T) new SessionId(json.getAsString());
      } else {
        return (T) new SessionId(json.getAsJsonObject().get("value").getAsString());
      }
    }

    if (Capabilities.class.isAssignableFrom(clazz)) {
      JsonObject json = text instanceof JsonElement
                        ? ((JsonElement) text).getAsJsonObject()
                        : new JsonParser().parse(text.toString()).getAsJsonObject();
      Map<String, Object> map = convertMap(json.getAsJsonObject(), depth);
      return (T) new DesiredCapabilities(map);
    }

    if (Date.class.equals(clazz)) {
      return (T) new Date(Long.valueOf(String.valueOf(text)));
    }

    if (text instanceof String && !((String) text).startsWith("{") && Object.class.equals(clazz)) {
      return (T) text;
    }

    Method fromJson = getMethod(clazz, "fromJson");
    if (fromJson != null) {
      try {
        return (T) fromJson.invoke(null, text.toString());
      } catch (IllegalArgumentException e) {
        throw new WebDriverException(e);
      } catch (IllegalAccessException e) {
        throw new WebDriverException(e);
      } catch (InvocationTargetException e) {
        throw new WebDriverException(e);
      }
    }

    if (depth == 0) {
      if (text instanceof String) {
        text = new JsonParser().parse((String) text);
      }
    }

    if (text instanceof JsonElement) {
      JsonElement element = (JsonElement) text;

      if (element.isJsonPrimitive()) {
        return (T) convertJsonPrimitive(element.getAsJsonPrimitive());
      }

      if (element.isJsonArray()) {
        return (T) convertList(element.getAsJsonArray(), depth);
      }

      if (element.isJsonNull()) {
        return null;
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

    return (T) text; // Crap shoot here; probably a string.
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
      } else {
        return json.getAsDouble();
      }
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
      } else {
        return Enum.valueOf(clazz, String.valueOf(text));
      }
    }

    Class[] allClasses = clazz.getClasses();
    for (Class current : allClasses) {
      if (current.isEnum()) {
        if (text instanceof JsonElement) {
          return Enum.valueOf(current, (String) convertJsonPrimitive((JsonElement) text));
        } else {
          return Enum.valueOf(current, String.valueOf(text));
        }
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

  @SuppressWarnings("unchecked")
  private Map convertMap(JsonObject toConvert, int depth) {
    Map map = new HashMap();

    for (Map.Entry<String, JsonElement> entry : toConvert.entrySet()) {
      map.put(entry.getKey(), convert(Object.class, entry.getValue(), depth + 1));
    }

    return map;
  }

  @SuppressWarnings("unchecked")
  private List convertList(JsonArray toConvert, int depth) {
    ArrayList list = new ArrayList(toConvert.size());
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
