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

import static org.openqa.selenium.json.Json.MAP_TYPE;

import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.SessionId;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.function.BiFunction;

class CommandCoercer extends TypeCoercer<Command> {

  @Override
  public boolean test(Class<?> aClass) {
    return Command.class.isAssignableFrom(aClass);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Command> apply(Type type) {
    return (jsonInput, setting) -> {
      Map<String, Object> json = jsonInput.read(MAP_TYPE);

      SessionId sessionId = createSessionId(json.get("sessionId"));

      String name = (String) json.get("name");

      Map<String, Object> parameters = new HashMap<>();

      if (json.get("parameters") instanceof Map) {
        ((Map<?, ?>) json.get("parameters"))
            .forEach((key, value) -> parameters.put(String.valueOf(key), value));
      }

      return new Command(sessionId, name, parameters);
    };
  }

  private SessionId createSessionId(Object value) {
    if (value instanceof String) {
      return new SessionId((String) value);
    }

    if (value instanceof Map) {
      return createSessionId(((Map<?, ?>) value).get("value"));
    }

    return null;
  }
}
