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

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.function.BiConsumer;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Supplier;

class MapCoercer<T, I extends T> extends TypeCoercer<T> {

  private final Class<T> stereotype;
  private final JsonTypeCoercer coercer;
  private final Supplier<I> supplier;
  private final Function<I, BiConsumer<Object, Object>> consumerFactory;

  public MapCoercer(
      Class<T> stereotype,
      JsonTypeCoercer coercer,
      Supplier<I> supplier,
      Function<I, BiConsumer<Object, Object>> consumerFactory) {
    this.stereotype = stereotype;
    this.coercer = coercer;
    this.supplier = supplier;
    this.consumerFactory = consumerFactory;
  }

  @Override
  public boolean test(Class<?> type) {
    return stereotype.isAssignableFrom(type);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, T> apply(Type type) {
    Type keyType;
    Type valueType;

    if (type instanceof ParameterizedType) {
      Type[] typeArguments = ((ParameterizedType) type).getActualTypeArguments();
      keyType = typeArguments[0];
      valueType = typeArguments[1];
    } else if (type instanceof Class) {
      keyType = Object.class;
      valueType = Object.class;
    } else {
      throw new IllegalArgumentException("Unhandled type: " + type.getClass());
    }

    return (jsonInput, setting) -> {
      jsonInput.beginObject();
      I toReturn = supplier.get();
      BiConsumer<Object, Object> consumer = consumerFactory.apply(toReturn);
      // JSON should always have a string key, so we can take the fastpath
      boolean stringKey = String.class.equals(keyType);

      while (jsonInput.hasNext()) {
        Object key;

        if (stringKey) {
          key = jsonInput.nextName();
        } else {
          key = coercer.coerce(jsonInput, keyType, setting);
        }
        Object value = coercer.coerce(jsonInput, valueType, setting);

        consumer.accept(key, value);
      }
      jsonInput.endObject();

      return toReturn;
    };
  }
}
