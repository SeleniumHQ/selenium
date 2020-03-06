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

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import java.util.stream.Stream;

class InstanceCoercer extends TypeCoercer<Object> {

  private final JsonTypeCoercer coercer;

  InstanceCoercer(JsonTypeCoercer coercer) {
    this.coercer = Objects.requireNonNull(coercer);
  }

  @Override
  public boolean test(Class aClass) {
    // If the class doesn't have a no-arg constructor, abandon hope
    return getConstructor(aClass) != null;
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Object> apply(Type type) {
    Constructor<?> constructor = getConstructor(type);

    return (jsonInput, setter) -> {
      try {
        Object instance = constructor.newInstance();

        Map<String, TypeAndWriter> allWriters;
        switch (setter) {
          case BY_FIELD:
            allWriters = getFieldWriters(constructor);
            break;

          case BY_NAME:
            allWriters = getBeanWriters(constructor);
            break;

          default:
            throw new JsonException("Cannot determine how to find fields: " + setter);
        }

        jsonInput.beginObject();

        List<TypeAndWriter> usedWriters = new ArrayList<>();

        while (jsonInput.hasNext()) {
          String key = jsonInput.nextName();

          TypeAndWriter writer = allWriters.get(key);
          if (writer == null) {
            jsonInput.skipValue();
            continue;
          }
          usedWriters.add(writer);

          Object value = coercer.coerce(jsonInput, writer.type, setter);
          writer.writer.accept(instance, value);
        }

        jsonInput.endObject();

        return instance;
      } catch (ReflectiveOperationException e) {
        throw new JsonException(e);
      }
    };
  }

  private Map<String, TypeAndWriter> getFieldWriters(Constructor<?> constructor) {
    List<Field> fields = new LinkedList<>();
    for (Class current = constructor.getDeclaringClass(); current != Object.class; current = current.getSuperclass()) {
      fields.addAll(Arrays.asList(current.getDeclaredFields()));
    }

    return fields.stream()
        .filter(field -> !Modifier.isTransient(field.getModifiers()))
        .filter(field -> !Modifier.isStatic(field.getModifiers()))
        .peek(field -> field.setAccessible(true))
        .collect(
            Collectors.toMap(
                Field::getName,
                field -> {
                  TypeAndWriter tw = new TypeAndWriter();
                  tw.type = field.getGenericType();
                  tw.writer =
                      (instance, value) -> {
                        try {
                          field.set(instance, value);
                        } catch (IllegalAccessException e) {
                          throw new JsonException(e);
                        }
                      };
                  return tw;
                }));
  }

  private Map<String, TypeAndWriter> getBeanWriters(Constructor<?> constructor) {
    return Stream.of(
            SimplePropertyDescriptor.getPropertyDescriptors(constructor.getDeclaringClass()))
        .filter(desc -> desc.getWriteMethod() != null)
        .collect(
            Collectors.toMap(
                SimplePropertyDescriptor::getName,
                desc -> {
                  TypeAndWriter tw = new TypeAndWriter();
                  tw.type = desc.getWriteMethod().getGenericParameterTypes()[0];
                  tw.writer = (instance, value) -> {
                      Method method = desc.getWriteMethod();
                      method.setAccessible(true);
                      try {
                        method.invoke(instance, value);
                      } catch (ReflectiveOperationException e) {
                        throw new JsonException(e);
                      }
                    };
                  return tw;
                }));
  }

  private Constructor<?> getConstructor(Type type) {
    Class target = getClss(type);

    try {
      @SuppressWarnings("unchecked") Constructor<?> constructor = target.getDeclaredConstructor();
      constructor.setAccessible(true);
      return constructor;
    } catch (ReflectiveOperationException e) {
      throw new JsonException(e);
    }
  }

  private Class getClss(Type type) {
    Class target = null;

    if (type instanceof Class) {
      target = (Class) type;
    } else if (type instanceof ParameterizedType) {
      Type rawType = ((ParameterizedType) type).getRawType();
      if (rawType instanceof Class) {
        target = (Class) rawType;
      }
    }

    if (target == null) {
      throw new JsonException("Cannot determine base class");
    }
    return target;
  }

  private class TypeAndWriter {
    public Type type;
    public BiConsumer<Object, Object> writer;
  }

}
