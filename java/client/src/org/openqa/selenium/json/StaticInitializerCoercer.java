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

import static org.openqa.selenium.json.Types.narrow;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.function.BiFunction;
import java.util.stream.Stream;

public class StaticInitializerCoercer extends TypeCoercer<Object> {

  private static final String FACTORY_METHOD_NAME = "fromJson";

  @Override
  public boolean test(Class<?> aClass) {
    return getMethods(aClass).count() == 1;
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Object> apply(Type type) {
    Class<?> aClass = narrow(type);
    // This is safe because we know the test above passed.
    Method fromJson = getMethods(aClass).findFirst().get();
    fromJson.setAccessible(true);

    return (jsonInput, setting) -> {
      Type argType = fromJson.getGenericParameterTypes()[0];
      Object obj;
      if (JsonInput.class.equals(argType)) {
        obj = jsonInput;
      } else {
        obj = jsonInput.read(argType);
      }

      if (obj == null) {
        throw new JsonException("Unable to read value to convert for " + type);
      }

      try {
        return fromJson.invoke(null, obj);
      } catch (ReflectiveOperationException e) {
        throw new JsonException("Unable to create instance of " + type, e);
      }
    };
  }

  private Stream<Method> getMethods(Class<?> aClass) {
    return Arrays.stream(aClass.getDeclaredMethods())
        .filter(method -> Modifier.isStatic(method.getModifiers()))
        .filter(method -> FACTORY_METHOD_NAME.equals(method.getName()))
        .filter(method -> method.getParameterCount() == 1);
  }
}
