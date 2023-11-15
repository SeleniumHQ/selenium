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

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class SimplePropertyDescriptor {

  private static final Function<Object, Object> GET_CLASS_NAME =
      obj -> {
        if (obj == null) {
          return null;
        }

        if (obj instanceof Class) {
          return ((Class<?>) obj).getName();
        }

        return obj.getClass().getName();
      };

  private final String name;
  private final Function<Object, Object> read;
  private final Method write;

  public SimplePropertyDescriptor(String name, Function<Object, Object> read, Method write) {
    this.name = name;
    this.read = read;
    this.write = write;
  }

  public String getName() {
    return name;
  }

  public Function<Object, Object> getReadMethod() {
    return read;
  }

  public Method getWriteMethod() {
    return write;
  }

  public static SimplePropertyDescriptor[] getPropertyDescriptors(Class<?> clazz) {
    Map<String, SimplePropertyDescriptor> properties = new HashMap<>();

    properties.put("class", new SimplePropertyDescriptor("class", GET_CLASS_NAME, null));

    for (Method m : clazz.getMethods()) {
      if (Class.class.equals(m.getDeclaringClass()) || Object.class.equals(m.getDeclaringClass())) {
        continue;
      }

      String methodName = m.getName();
      String propertyName = null;

      Method readMethod = null;
      Method writeMethod = null;

      if (hasPrefix("is", methodName)) {
        readMethod = m;
        propertyName = uncapitalize(methodName.substring(2));
      } else if (hasPrefix("get", methodName) || hasPrefix("has", methodName)) {
        readMethod = m;
        propertyName = uncapitalize(methodName.substring(3));
      } else if (hasPrefix("set", methodName)) {
        if (m.getParameterCount() == 1) {
          writeMethod = m;
          propertyName = uncapitalize(methodName.substring(3));
        }
      }

      if (readMethod != null && readMethod.getParameterCount() != 0) {
        readMethod = null;
      }

      Function<Object, Object> read = null;

      if (readMethod != null) {
        final Method finalReadMethod = readMethod;

        read =
            obj -> {
              try {
                finalReadMethod.setAccessible(true);
                return finalReadMethod.invoke(obj);
              } catch (ReflectiveOperationException e) {
                throw new JsonException(e);
              }
            };
      }

      if (readMethod != null || writeMethod != null) {
        SimplePropertyDescriptor descriptor =
            properties.getOrDefault(
                propertyName, new SimplePropertyDescriptor(propertyName, null, null));

        properties.put(
            propertyName,
            new SimplePropertyDescriptor(
                propertyName,
                read != null ? read : descriptor.getReadMethod(),
                writeMethod != null ? writeMethod : descriptor.getWriteMethod()));
      }
    }

    SimplePropertyDescriptor[] pdsArray = new SimplePropertyDescriptor[properties.size()];
    return properties.values().toArray(pdsArray);
  }

  private static String uncapitalize(String s) {
    return s.substring(0, 1).toLowerCase() + s.substring(1);
  }

  private static boolean hasPrefix(String prefix, String methodName) {
    if (methodName.length() < prefix.length() + 1) {
      return false;
    }

    if (!methodName.startsWith(prefix)) {
      return false;
    }

    return Character.isUpperCase(methodName.charAt(prefix.length()));
  }
}
