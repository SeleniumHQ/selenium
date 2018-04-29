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
import java.util.Objects;
import java.util.function.BiFunction;

public class StaticInitializerCoercer extends TypeCoercer<Object> {

  private static final Json JSON = new Json();
  private static final String FACTORY_METHOD_NAME = "fromJson";

  @Override
  public boolean test(Class<?> aClass) {
    Method fromJson = getStaticMethod(FACTORY_METHOD_NAME, aClass);
    if (fromJson == null) {
      return false;
    }

    return Arrays.equals(new Object[] { String.class},  fromJson.getParameterTypes());
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Object> apply(Type type) {
    Class<?> aClass = narrow(type);
    Method fromJson = Objects.requireNonNull(getStaticMethod("fromJson", aClass));

    return (jsonInput, setting) -> {
      // Well, this is nasty. We need to convert the value back to a json string. Ugh.
      Object obj = jsonInput.read(Object.class);
      String json = JSON.toJson(obj);

      try {
        return fromJson.invoke(null, json);
      } catch (ReflectiveOperationException e) {
        throw new JsonException("Unable to create instance of " + type, e);
      }
    };
  }

  private Method getStaticMethod(String name, Class<?> aClass) {
    try {
      Method method = aClass.getMethod(name, String.class);
      if (!Modifier.isStatic(method.getModifiers())) {
        return null;
      }

      method.setAccessible(true);
      return method;
    } catch (ReflectiveOperationException e) {
      return null;
    }
  }
}
