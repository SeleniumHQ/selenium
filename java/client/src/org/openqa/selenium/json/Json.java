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

import com.google.common.io.CharStreams;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

public class Json {
  static final Gson GSON = new GsonBuilder()
      .setLenient()
      .serializeNulls()
      .disableHtmlEscaping()
      .create();

  public static final Type LIST_OF_MAPS_TYPE = new TypeToken<List<Map<String, Object>>>() {}.getType();
  public static final Type MAP_TYPE = new TypeToken<Map<String, Object>>() {}.getType();
  public static final Type OBJECT_TYPE = new TypeToken<Object>() {}.getType();

  private final JsonTypeCoercer fromJson = new JsonTypeCoercer();
  private final BeanToJsonConverter toJson = new BeanToJsonConverter();

  public String toJson(Object toConvert) {
    return toJson.convert(toConvert);
  }

  public <T> T toType(String source, Type typeOfT) {
    return toType(source, typeOfT, PropertySetting.BY_NAME);
  }

  public <T> T toType(String source, Type typeOfT, PropertySetting setter) {
    if (setter == null) {
      throw new JsonException("Mechanism for setting properties must be set");
    }

    try (StringReader reader = new StringReader(source);
         JsonInput json = newInput(reader)) {
      return fromJson.coerce(json, typeOfT, setter);
    }
  }

  public JsonInput newInput(Reader from) throws UncheckedIOException {
    return new JsonInput(GSON.newJsonReader(from), fromJson);
  }

  public JsonOutput newOutput(Appendable to) throws UncheckedIOException {
    try {
      return new JsonOutput(toJson, GSON.newJsonWriter(CharStreams.asWriter(to)));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
