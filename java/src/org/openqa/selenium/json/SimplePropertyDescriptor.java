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

import java.lang.invoke.CallSite;
import java.lang.invoke.LambdaMetafactory;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import org.jspecify.annotations.Nullable;

public class SimplePropertyDescriptor {

  private static final Function<Object, @Nullable Object> GET_CLASS_NAME = new GetClassName();
  private final Class<?> clazz;
  private final String name;
  private final @Nullable Function<Object, @Nullable Object> read;
  private final @Nullable Method write;

  public SimplePropertyDescriptor(
      Class<?> clazz,
      String name,
      @Nullable Function<Object, @Nullable Object> read,
      @Nullable Method write) {
    this.clazz = clazz;
    this.name = name;
    this.read = read;
    this.write = write;
  }

  public String getName() {
    return name;
  }

  public @Nullable Function<Object, @Nullable Object> getReadMethod() {
    return read;
  }

  public @Nullable Method getWriteMethod() {
    return write;
  }

  @Override
  public String toString() {
    return String.format("%s.%s", clazz.getSimpleName(), name);
  }

  /**
   * The descriptors depend only on the class, so compute them once per class rather than scanning
   * the class's methods on every call.
   */
  private static final ClassValue<SimplePropertyDescriptor[]> DESCRIPTOR_CACHE =
      new ClassValue<SimplePropertyDescriptor[]>() {
        @Override
        protected SimplePropertyDescriptor[] computeValue(Class<?> type) {
          return computePropertyDescriptors(type);
        }
      };

  public static SimplePropertyDescriptor[] getPropertyDescriptors(Class<?> clazz) {
    return DESCRIPTOR_CACHE.get(clazz).clone();
  }

  private static SimplePropertyDescriptor[] computePropertyDescriptors(Class<?> clazz) {
    Map<String, SimplePropertyDescriptor> properties = new HashMap<>();

    properties.put("class", new SimplePropertyDescriptor(clazz, "class", GET_CLASS_NAME, null));

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

      Function<Object, @Nullable Object> read = null;

      if (readMethod != null) {
        read = compileGetter(readMethod);
      }

      if (propertyName != null && (readMethod != null || writeMethod != null)) {
        SimplePropertyDescriptor descriptor =
            properties.getOrDefault(
                propertyName, new SimplePropertyDescriptor(clazz, propertyName, null, null));

        properties.put(
            propertyName,
            new SimplePropertyDescriptor(
                clazz,
                propertyName,
                read != null ? read : descriptor.getReadMethod(),
                writeMethod != null ? writeMethod : descriptor.getWriteMethod()));
      }
    }

    SimplePropertyDescriptor[] pdsArray = new SimplePropertyDescriptor[properties.size()];
    return properties.values().toArray(pdsArray);
  }

  /**
   * Produce a function that invokes the supplied getter. Where possible the getter is compiled to a
   * direct call via {@link LambdaMetafactory}, which is considerably faster than reflective
   * invocation; anything that cannot be compiled (inaccessible types, static methods, and the like)
   * falls back to {@link Method#invoke}, deferring accessibility problems to invocation time just
   * as reflective calls always have.
   */
  private static Function<Object, @Nullable Object> compileGetter(Method method) {
    try {
      MethodHandles.Lookup lookup = MethodHandles.lookup();
      MethodHandle handle = lookup.unreflect(method);
      CallSite site =
          LambdaMetafactory.metafactory(
              lookup,
              "apply",
              MethodType.methodType(Function.class),
              MethodType.methodType(Object.class, Object.class),
              handle,
              handle.type());
      @SuppressWarnings("unchecked")
      Function<Object, @Nullable Object> getter =
          (Function<Object, @Nullable Object>) site.getTarget().invokeExact();
      return obj -> {
        try {
          return getter.apply(obj);
        } catch (Exception e) {
          // Reflective invocation wrapped getter failures in a JsonException; stay consistent.
          throw new JsonException(e);
        }
      };
    } catch (Throwable t) {
      return obj -> {
        try {
          method.setAccessible(true);
          return method.invoke(obj);
        } catch (ReflectiveOperationException e) {
          throw new JsonException(e);
        }
      };
    }
  }

  private static String uncapitalize(String s) {
    return s.substring(0, 1).toLowerCase(Locale.ENGLISH) + s.substring(1);
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

  private static class GetClassName implements Function<Object, @Nullable Object> {
    @Override
    public @Nullable Object apply(Object obj) {
      if (obj == null) {
        return null;
      }

      if (obj instanceof Class) {
        return ((Class<?>) obj).getName();
      }

      return obj.getClass().getName();
    }
  }
}
