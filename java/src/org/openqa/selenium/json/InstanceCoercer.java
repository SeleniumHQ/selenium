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

import static java.util.stream.Collectors.toMap;

import java.lang.invoke.CallSite;
import java.lang.invoke.LambdaMetafactory;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Stream;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;

class InstanceCoercer extends TypeCoercer<Object> {

  private final JsonTypeCoercer coercer;

  InstanceCoercer(JsonTypeCoercer coercer) {
    this.coercer = Require.nonNull("Coercer", coercer);
  }

  @Override
  public boolean test(Class aClass) {
    try {
      getConstructor(aClass);
      return true;
    } catch (JsonException ex) {
      return false;
    }
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Object> apply(Type type) {
    Constructor<?> constructor = getConstructor(type);
    // The writers depend only on the type and the property-setting strategy, so compute them
    // once per strategy rather than reflecting over the type for every instance created.
    Map<PropertySetting, Map<String, TypeAndWriter>> writersBySetting = new ConcurrentHashMap<>();

    return (jsonInput, setter) -> {
      try {
        Object instance = constructor.newInstance();

        Map<String, TypeAndWriter> allWriters =
            writersBySetting.computeIfAbsent(setter, key -> getWriters(constructor, key));

        jsonInput.beginObject();

        while (jsonInput.hasNext()) {
          String key = jsonInput.nextName();

          TypeAndWriter writer = allWriters.get(key);
          if (writer == null) {
            jsonInput.skipValue();
            continue;
          }

          Object value = writer.coercion.apply(jsonInput, setter);
          writer.writer.accept(instance, value);
        }

        jsonInput.endObject();

        return instance;
      } catch (ReflectiveOperationException e) {
        throw new JsonException(e);
      }
    };
  }

  private Map<String, TypeAndWriter> getWriters(
      Constructor<?> constructor, PropertySetting setter) {
    Map<String, TypeAndWriter> writers;
    switch (setter) {
      case BY_FIELD:
        writers = getFieldWriters(constructor);
        break;

      case BY_NAME:
        writers = getBeanWriters(constructor);
        break;

      default:
        throw new JsonException("Cannot determine how to find fields: " + setter);
    }

    // Resolve the property coercers once per type rather than per value read.
    writers.values().forEach(writer -> writer.coercion = coercer.lazyResolve(writer.type));
    return writers;
  }

  private Map<String, TypeAndWriter> getFieldWriters(Constructor<?> constructor) {
    List<Field> fields = new LinkedList<>();
    for (Class<?> current = constructor.getDeclaringClass();
        current != Object.class;
        current = current.getSuperclass()) {
      fields.addAll(List.of(current.getDeclaredFields()));
    }

    return fields.stream()
        .filter(field -> !Modifier.isTransient(field.getModifiers()))
        .filter(field -> !Modifier.isStatic(field.getModifiers()))
        .peek(field -> field.setAccessible(true))
        .collect(
            toMap(
                Field::getName,
                new FieldTypeAndWriter(),
                (existing, replacement) -> {
                  throw new JsonException(
                      String.format(
                          "Duplicate JSON field name detected while "
                              + "collecting field writers: %s vs %s",
                          existing, replacement));
                }));
  }

  private Map<String, TypeAndWriter> getBeanWriters(Constructor<?> constructor) {
    SimplePropertyDescriptor[] propertyDescriptors =
        SimplePropertyDescriptor.getPropertyDescriptors(constructor.getDeclaringClass());
    return Stream.of(propertyDescriptors)
        .filter(desc -> desc.getWriteMethod() != null)
        .collect(
            toMap(
                SimplePropertyDescriptor::getName,
                new SimplePropertyTypeAndWriter(),
                (existing, replacement) -> {
                  throw new JsonException(
                      String.format(
                          "Duplicate JSON field name detected while "
                              + "collecting field writers: %s vs %s",
                          existing, replacement));
                }));
  }

  private Constructor<?> getConstructor(Type type) {
    Class<?> target = getClss(type);

    try {
      Constructor<?> constructor = target.getDeclaredConstructor();
      constructor.setAccessible(true);
      return constructor;
    } catch (ReflectiveOperationException e) {
      throw new JsonException("Cannot create instance of " + type, e);
    }
  }

  private static Class<?> getClss(Type type) {
    if (type instanceof Class) {
      return (Class<?>) type;
    } else if (type instanceof ParameterizedType) {
      Type rawType = ((ParameterizedType) type).getRawType();
      if (rawType instanceof Class) {
        return (Class<?>) rawType;
      }
    }

    throw new JsonException("Cannot determine base class for " + type);
  }

  private static class TypeAndWriter {
    private final Type type;
    private final BiConsumer<Object, Object> writer;
    private BiFunction<JsonInput, PropertySetting, Object> coercion;

    TypeAndWriter(Type type, BiConsumer<Object, Object> writer) {
      this.type = type;
      this.writer = writer;
    }

    @Override
    public String toString() {
      return writer.toString();
    }
  }

  private static class FieldTypeAndWriter implements Function<Field, TypeAndWriter> {
    @Override
    public TypeAndWriter apply(Field field) {
      Type type = field.getGenericType();
      return new TypeAndWriter(type, new FieldWriter(field));
    }
  }

  private static class FieldWriter implements BiConsumer<Object, Object> {
    private final Field field;

    FieldWriter(Field field) {
      this.field = field;
    }

    @Override
    public void accept(Object instance, Object value) {
      try {
        field.set(instance, value);
      } catch (IllegalAccessException e) {
        throw new JsonException(
            String.format(
                "Cannot set %s.%s = %s", instance.getClass().getName(), field.getName(), value),
            e);
      }
    }

    @Override
    public String toString() {
      return String.format(
          "%s(%s.%s)",
          getClass().getSimpleName(), field.getDeclaringClass().getName(), field.getName());
    }
  }

  private static class SimplePropertyTypeAndWriter
      implements Function<SimplePropertyDescriptor, TypeAndWriter> {
    @Override
    public TypeAndWriter apply(SimplePropertyDescriptor desc) {
      Method method = desc.getWriteMethod();
      Type type = method.getGenericParameterTypes()[0];
      return new TypeAndWriter(type, new SimplePropertyWriter(desc, method));
    }
  }

  private static class SimplePropertyWriter implements BiConsumer<Object, Object> {
    private final SimplePropertyDescriptor desc;
    private final Method method;
    private final @Nullable BiConsumer<Object, Object> compiled;

    SimplePropertyWriter(SimplePropertyDescriptor desc, Method method) {
      this.desc = desc;
      this.method = method;
      this.compiled = compileSetter(method);
    }

    /**
     * Compile the setter to a direct call via {@link LambdaMetafactory}, which is considerably
     * faster than reflective invocation. Returns {@code null} for anything that cannot be compiled
     * (inaccessible types and the like), in which case {@link Method#invoke} is used, deferring
     * accessibility problems to invocation time just as reflective calls always have.
     */
    private static @Nullable BiConsumer<Object, Object> compileSetter(Method method) {
      try {
        MethodHandles.Lookup lookup = MethodHandles.lookup();
        MethodHandle handle = lookup.unreflect(method);
        CallSite site =
            LambdaMetafactory.metafactory(
                lookup,
                "accept",
                MethodType.methodType(BiConsumer.class),
                MethodType.methodType(void.class, Object.class, Object.class),
                handle,
                handle.type().changeReturnType(void.class));
        @SuppressWarnings("unchecked")
        BiConsumer<Object, Object> setter =
            (BiConsumer<Object, Object>) site.getTarget().invokeExact();
        return setter;
      } catch (Throwable t) {
        return null;
      }
    }

    @Override
    public void accept(Object instance, Object value) {
      try {
        if (compiled != null) {
          compiled.accept(instance, value);
          return;
        }

        method.setAccessible(true);
        method.invoke(instance, value);
      } catch (Exception e) {
        throw new JsonException(
            String.format(
                "Cannot call method %s.%s(%s)",
                instance.getClass().getName(), method.getName(), value),
            e);
      }
    }

    @Override
    public String toString() {
      return String.format("%s(%s)", getClass().getSimpleName(), desc);
    }
  }
}
