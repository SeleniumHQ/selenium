/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.DoNotUseProxyPac;

import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

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

    if (text instanceof Number) {
      // Thank you type erasure.
      if (text instanceof Double || text instanceof Float) {
        return (T) Double.valueOf(String.valueOf(text));
      }
      return (T) Long.valueOf(String.valueOf(text));
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
      JSONObject rawCommand = new JSONObject((String) text);

      SessionId sessionId = null;
      if (rawCommand.has("sessionId"))
        sessionId = convert(SessionId.class, rawCommand.getString("sessionId"));

      String name = rawCommand.getString("name");
      if (rawCommand.has("parameters")) {
        Map<String, ?> args =
            (Map<String, ?>) convert(HashMap.class, rawCommand.getJSONObject("parameters"));
        return (T) new Command(sessionId, name, args);
      }

      return (T) new Command(sessionId, name);
    }

    if (SessionId.class.equals(clazz)) {
      JSONObject object = new JSONObject((String) text);
      String value = object.getString("value");
      return (T) new SessionId(value);
    }

    if (Capabilities.class.equals(clazz)) {
      JSONObject object = new JSONObject((String) text);
      DesiredCapabilities caps = new DesiredCapabilities();
      Iterator allKeys = object.keys();
      while (allKeys.hasNext()) {
        String key = (String) allKeys.next();
        caps.setCapability(key, object.get(key));
      }
      return (T) caps;
    }

    if (DoNotUseProxyPac.class.equals(clazz)) {
      JSONObject object = new JSONObject((String) text);
      DoNotUseProxyPac pac = new DoNotUseProxyPac();

      if (object.has("directUrls")) {
        JSONArray allUrls = object.getJSONArray("directUrls");
        for (int i = 0; i < allUrls.length(); i++) {
          pac.map(allUrls.getString(i)).toNoProxy();
        }
      }

      if (object.has("directHosts")) {
        JSONArray allHosts = object.getJSONArray("directHosts");
        for (int i = 0; i < allHosts.length(); i++) {
          pac.mapHost(allHosts.getString(i)).toNoProxy();
        }
      }

      if (object.has("proxiedHosts")) {
        JSONObject proxied = object.getJSONObject("proxiedHosts");
        Iterator allHosts = proxied.keys();
        while (allHosts.hasNext()) {
          String host = (String) allHosts.next();
          pac.mapHost(host).toProxy(proxied.getString(host));
        }
      }

      if (object.has("proxiedUrls")) {
        JSONObject proxied = object.getJSONObject("proxiedUrls");
        Iterator allUrls = proxied.keys();
        while (allUrls.hasNext()) {
          String host = (String) allUrls.next();
          pac.map(host).toProxy(proxied.getString(host));
        }
      }

      if (object.has("proxiedRegexUrls")) {
        JSONObject proxied = object.getJSONObject("proxiedRegexUrls");
        Iterator allUrls = proxied.keys();
        while (allUrls.hasNext()) {
          String host = (String) allUrls.next();
          pac.map(host).toProxy(proxied.getString(host));
        }
      }

      if (object.has("defaultProxy")) {
        if ("'DIRECT'".equals(object.getString("defaultProxy"))) {
          pac.defaults().toNoProxy();
        } else {
          pac.defaults().toProxy(object.getString("defaultProxy"));
        }
      }

      if (object.has("deriveFrom")) {
        pac.deriveFrom(new URI(object.getString("deriveFrom")));
      }

      return (T) pac;
    }

    if (text != null && text instanceof String && !((String) text).startsWith("{") && Object.class
        .equals(clazz)) {
      return (T) text;
    }

    if (text instanceof JSONArray) {
      return (T) convertList((JSONArray) text);
    }

    if (text == JSONObject.NULL) {
      return null;
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
    return clazz.isEnum() || text instanceof Enum<?>;
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

    Iterator allEntries = toConvert.keys();
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
