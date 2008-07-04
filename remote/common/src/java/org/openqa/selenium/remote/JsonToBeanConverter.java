package org.openqa.selenium.remote;

import org.json.JSONObject;
import org.json.JSONTokener;
import org.json.JSONException;
import org.json.JSONArray;

import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.StringReader;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

public class JsonToBeanConverter {

  @SuppressWarnings("unchecked")
  public <T> T convert(Class<T> clazz, Object text) throws Exception {
    if (text == null) {
      return null;
    }

    if (String.class.equals(clazz)) {
      return (T) text;
    }

    if (isPrimitive(clazz)) {
      return (T) text;
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

    if (text != null && text instanceof String && !((String) text).startsWith("{") && Object.class
        .equals(clazz)) {
      return (T) text;
    }

    if (text instanceof JSONArray) {
      return (T) convertList((JSONArray) text);
    }

    JSONObject o;
    try {
      if (text instanceof JSONObject)
        o = (JSONObject) text;
      else if (text != null && text instanceof String) {
        if (((String) text).startsWith("[")) {
          return (T) convert(List.class, new JSONArray((String) text));
        }
      }
      o = new JSONObject(String.valueOf(text));
    } catch (JSONException e) {
      return (T) text;
    }

    if (Map.class.isAssignableFrom(clazz)) {
      return (T) convertMap(o);
    }

//    if (List.class.isAssignableFrom(o.getClass())) {
//      return (T) convertList(o);
//    }

    if (isPrimitive(o.getClass())) {
      return (T) o;
    }

    if (Object.class.equals(clazz)) {
      return (T) convertMap(o);
    }

    return convertBean(clazz, o);
  }

  @SuppressWarnings("unchecked")
  private Enum convertEnum(Class clazz, Object text) {
    if (clazz.isEnum()) {
      return Enum.valueOf(clazz, String.valueOf(text));
    }

    Class[] allClasses = clazz.getClasses();
    for (Class current : allClasses) {
      if (current.isEnum()) {
        return Enum.valueOf(current, String.valueOf(text));
      }
    }

    return null;
  }

  private boolean isEnum(Class<?> clazz, Object text) {
    return clazz.isEnum() || text instanceof Enum;
  }

  private Object convert(Object toConvert) throws Exception {
    return toConvert;
  }

  public <T> T convertBean(Class<T> clazz, JSONObject toConvert) throws Exception {
    T t = clazz.newInstance();
    PropertyDescriptor[] allProperties = Introspector.getBeanInfo(clazz).getPropertyDescriptors();
    for (PropertyDescriptor property : allProperties) {
      if (!toConvert.has(property.getName()))
        continue;

      Object value = toConvert.get(property.getName());

      Method write = property.getWriteMethod();
      if (write == null) {
        continue;
      }

      Class<?> type = write.getParameterTypes()[0];

      try {
        write.invoke(t, convert(type, value));
      } catch (Exception e) {
        throw new Exception(
            String.format("Property name: %s -> %s on class %s", property.getName(), value, type),
            e);
      }
    }

    return t;
  }

  @SuppressWarnings("unchecked")
  private Map convertMap(JSONObject toConvert) throws Exception {
    Map map = new HashMap();

    Iterator allEntries = toConvert.sortedKeys();
    while (allEntries.hasNext()) {
      String key = (String) allEntries.next();
      map.put(key, convert(Object.class, toConvert.get(key)));
    }

    return map;
  }

  @SuppressWarnings("unchecked")
  private List convertList(JSONArray toConvert) throws Exception {
    ArrayList list = new ArrayList(toConvert.length());
    for (int i = 0; i < toConvert.length(); i++) {
      list.add(convert(Object.class, toConvert.get(i)));
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
