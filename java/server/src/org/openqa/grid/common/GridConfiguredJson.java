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

package org.openqa.grid.common;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.PropertySetting;
import org.openqa.selenium.json.TypeCoercer;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.util.function.BiFunction;

public class GridConfiguredJson {

  private final static Json JSON = new Json();

  private GridConfiguredJson() {
    // Utility class
  }

  public static <T> T toType(String json, Type typeOfT) {
    try (Reader reader = new StringReader(json);
        JsonInput jsonInput = JSON.newInput(reader)) {
      return toType(jsonInput, typeOfT);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static <T> T toType(JsonInput jsonInput, Type typeOfT) {
    PropertySetting previous = jsonInput.propertySetting(PropertySetting.BY_FIELD);
    T value = jsonInput
        .addCoercers(new CapabilityMatcherCoercer(), new PrioritizerCoercer())
        .read(typeOfT);
    jsonInput.propertySetting(previous);
    return value;
  }

  private static class SimpleClassNameCoercer<T> extends TypeCoercer<T> {

    private final Class<?> stereotype;

    protected SimpleClassNameCoercer(Class<?> stereotype) {
      this.stereotype = stereotype;
    }

    @Override
    public boolean test(Class<?> aClass) {
      return stereotype.isAssignableFrom(aClass);
    }

    @Override
    public BiFunction<JsonInput, PropertySetting, T> apply(Type type) {
      return (jsonInput, setting) -> {
        String clazz = jsonInput.nextString();
        try {
          return (T) Class.forName(clazz).asSubclass(stereotype).newInstance();
        } catch (ReflectiveOperationException e) {
          throw new JsonException(String.format("%s could not be coerced to instance", clazz));
        }
      };
    }
  }

  private static class CapabilityMatcherCoercer extends SimpleClassNameCoercer<CapabilityMatcher> {
    protected CapabilityMatcherCoercer() {
      super(CapabilityMatcher.class);
    }
  }

  private static class PrioritizerCoercer extends SimpleClassNameCoercer<Prioritizer> {
    protected PrioritizerCoercer() {
      super(Prioritizer.class);
    }
  }


}
