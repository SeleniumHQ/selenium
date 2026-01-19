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
import java.util.Collection;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;
import org.openqa.selenium.internal.Require;

class CollectionCoercer<T extends Collection, I extends T> extends TypeCoercer<T> {

  private final Class<T> stereotype;
  private final JsonTypeCoercer coercer;
  private final Supplier<I> supplier;
  private final Function<I, Consumer<Object>> consumerFactory;

  public CollectionCoercer(
      Class<T> stereotype,
      JsonTypeCoercer coercer,
      Supplier<I> supplier,
      Function<I, Consumer<Object>> consumerFactory) {
    this.stereotype = Require.nonNull("Stereotype", stereotype);
    this.coercer = Require.nonNull("Coercer", coercer);
    this.supplier = Require.nonNull("Supplier", supplier);
    this.consumerFactory = Require.nonNull("Consumer factory", consumerFactory);
  }

  @Override
  public boolean test(Class<?> aClass) {
    return stereotype.isAssignableFrom(aClass);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, T> apply(Type type) {
    Type valueType;

    if (type instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) type;
      valueType = pt.getActualTypeArguments()[0];
    } else if (type instanceof Class) {
      valueType = Object.class;
    } else {
      throw new IllegalArgumentException("Unhandled type: " + type.getClass());
    }

    return (jsonInput, setting) -> {
      jsonInput.beginArray();
      I toReturn = supplier.get();
      Consumer<Object> consumer = consumerFactory.apply(toReturn);
      while (jsonInput.hasNext()) {
        consumer.accept(coercer.coerce(jsonInput, valueType, setting));
      }
      jsonInput.endArray();

      return toReturn;
    };
  }
}
