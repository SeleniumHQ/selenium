package org.openqa.selenium.remote;

import org.json.JSONArray;
import org.json.JSONObject;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Array;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Map;

public class BeanToJsonConverter {

  private final static int MAX_DEPTH = 8;

  public String convert(Object toConvert) throws Exception {
    Object returned = realConvert(toConvert, MAX_DEPTH);
    return returned == null ? null : returned.toString();
  }

  @SuppressWarnings("unchecked")
  private Object realConvert(Object toConvert, int maxDepth) throws Exception {
    if (maxDepth < 1) {
      return null;
    }

    if (toConvert == null) {
      return null;
    }

    if (toConvert.getClass().isArray()) {
      return convertArray(toConvert, maxDepth - 1);
    }

    // Assume that strings have already been converted
    if (isPrimitiveType(toConvert)) {
      return toConvert;
    }

    if (toConvert instanceof String) {
      return toConvert;
    }

    if (toConvert instanceof Map) {
      return convertMap((Map) toConvert, maxDepth - 1);
    }

    if (toConvert instanceof Collection) {
      return convertCollection((Collection) toConvert, maxDepth - 1);
    }

    if (toConvert.getClass().isEnum() || toConvert instanceof Enum) {
      return toConvert.toString();
    }

    return convertBean(toConvert, maxDepth - 1);
  }

  // I'm missing something really obvious
  private boolean isPrimitiveType(Object toConvert) {
    if (toConvert.getClass().isPrimitive()) {
      return true;
    }

    if (toConvert instanceof Boolean) {
      return true;
    }

    if (toConvert instanceof Byte) {
      return true;
    }

    if (toConvert instanceof Character) {
      return true;
    }

    if (toConvert instanceof Double) {
      return true;
    }

    if (toConvert instanceof Float) {
      return true;
    }

    if (toConvert instanceof Integer) {
      return true;
    }

    if (toConvert instanceof Long) {
      return true;
    }

    if (toConvert instanceof Short) {
      return true;
    }

    if (toConvert instanceof Void) {
      return true;
    }

    return false;
  }

  @SuppressWarnings("unchecked")
  private Object convertCollection(Collection collection, int maxDepth) throws Exception {
    JSONArray json = new JSONArray();

    if (collection == null) {
      return json;
    }

    for (Object o : collection) {
      json.put(realConvert(o, maxDepth));
    }

    return json;
  }

  @SuppressWarnings("unchecked")
  private Object convertArray(Object array, int maxDepth) throws Exception {
    JSONArray json = new JSONArray();

    int length = Array.getLength(array);
    for (int i = 0; i < length; i++) {
      json.put(realConvert(Array.get(array, i), maxDepth - 1));
    }

    return json;
  }

  @SuppressWarnings("unchecked")
  private Object convertBean(Object toConvert, int maxDepth) throws Exception {
    JSONObject json = new JSONObject();

    BeanInfo beanInfo = Introspector.getBeanInfo(toConvert.getClass());
    PropertyDescriptor[] allProperties = beanInfo.getPropertyDescriptors();
    for (PropertyDescriptor property : allProperties) {
      if ("class".equals(property.getName())) {
        json.put("class", toConvert.getClass().getName());
        continue;
      }

      Method read = property.getReadMethod();
      if (read == null) {
        continue;
      }

      try {
        Object result = read.invoke(toConvert);
        json.put(property.getName(), realConvert(result, maxDepth - 1));
      } catch (Exception e) {
        // Skip this property
      }
    }

    return json;
  }

  @SuppressWarnings("unchecked")
  private Object convertMap(Map map, int maxDepth) throws Exception {
    JSONObject json = new JSONObject();
    for (Object rawEntry : map.entrySet()) {
      Map.Entry entry = (Map.Entry) rawEntry;
      json.put(String.valueOf(entry.getKey()), realConvert(entry.getValue(), maxDepth - 1));
    }

    return json;
  }
}
