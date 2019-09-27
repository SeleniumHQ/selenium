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

import org.openqa.selenium.remote.SessionId;

import java.lang.reflect.Type;
import java.util.Map;
import java.util.function.BiFunction;

class SessionIdCoercer extends TypeCoercer<SessionId> {

  @Override
  public boolean test(Class<?> aClass) {
    return SessionId.class.isAssignableFrom(aClass);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, SessionId> apply(Type type) {
    // Stupid heuristic to tell if we are dealing with a selenium 2 or 3 session id.
    return (jsonInput, setting) -> {
      switch (jsonInput.peek()) {
        case NAME:
          return new SessionId(jsonInput.nextName());

        case STRING:
          return new SessionId(jsonInput.nextString());

        case START_MAP:
          Map<String, Object> map = jsonInput.read(MAP_TYPE);
          if (map.containsKey("value")) {
            return new SessionId(String.valueOf(map.get("value")));
          }
          // Fall through to end of statement
          break;
     }
    throw new JsonException("Unable to convert json to session id");
    };
  }
}
