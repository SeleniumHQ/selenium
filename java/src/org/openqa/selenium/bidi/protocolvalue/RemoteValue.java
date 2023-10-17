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

package org.openqa.selenium.bidi.protocolvalue;

import static java.util.Collections.unmodifiableMap;

import java.io.StringReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class RemoteValue {

  private static final Json JSON = new Json();

  private final RemoteValueType type;

  private final Optional<String> handle;

  private final Optional<Long> internalId;

  private final Optional<Object> value;

  private final Optional<String> sharedId;

  public RemoteValue(
      RemoteValueType type,
      Optional<String> handle,
      Optional<Long> internalId,
      Optional<Object> value,
      Optional<String> sharedId) {
    this.type = type;
    this.handle = handle;
    this.internalId = internalId;
    this.value = value;
    this.sharedId = sharedId;
  }

  public static RemoteValue fromJson(JsonInput input) {
    RemoteValueType type = null;

    Optional<String> handle = Optional.empty();

    Optional<Long> internalId = Optional.empty();

    Optional<Object> value = Optional.empty();

    Optional<String> sharedId = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          String typeString = input.read(String.class);
          if (PrimitiveType.findByName(typeString) != null) {
            type = PrimitiveType.findByName(typeString);
          } else if (NonPrimitiveType.findByName(typeString) != null) {
            type = NonPrimitiveType.findByName(typeString);
          } else {
            type = RemoteType.findByName(typeString);
          }
          break;

        case "handle":
          handle = Optional.ofNullable(input.read(String.class));
          break;

        case "internalId":
          internalId = Optional.ofNullable(input.read(Long.class));
          break;

        case "value":
          value = Optional.ofNullable(input.read(Object.class));

          break;

        case "sharedId":
          sharedId = Optional.ofNullable(input.read(String.class));
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    if (value.isPresent()) {
      value = Optional.ofNullable(deserializeValue(value.get(), type));
    }

    return new RemoteValue(type, handle, internalId, value, sharedId);
  }

  public String getType() {
    return type.toString();
  }

  public Optional<String> getHandle() {
    return handle;
  }

  public Optional<Long> getInternalId() {
    return internalId;
  }

  public Optional<Object> getValue() {
    return value;
  }

  public Optional<String> getSharedId() {
    return sharedId;
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();

    toReturn.put("type", this.getType());
    handle.ifPresent(handleValue -> toReturn.put("handle", handleValue));
    internalId.ifPresent(id -> toReturn.put("internalId", id));
    value.ifPresent(actualValue -> toReturn.put("value", actualValue));
    sharedId.ifPresent(id -> toReturn.put("sharedId", id));

    return unmodifiableMap(toReturn);
  }

  private static Object deserializeValue(Object value, RemoteValueType type) {

    if (NonPrimitiveType.ARRAY.equals(type) || NonPrimitiveType.SET.equals(type)) {
      try (StringReader reader = new StringReader(JSON.toJson(value));
          JsonInput input = JSON.newInput(reader)) {
        value = input.read(new TypeToken<List<RemoteValue>>() {}.getType());
      }
    } else if (NonPrimitiveType.MAP.equals(type) || NonPrimitiveType.OBJECT.equals(type)) {
      List<List<Object>> result = (List<List<Object>>) value;
      Map<Object, RemoteValue> map = new HashMap<>();

      for (List<Object> list : result) {
        Object key = list.get(0);
        if (!(key instanceof String)) {
          try (StringReader reader = new StringReader(JSON.toJson(key));
              JsonInput keyInput = JSON.newInput(reader)) {
            key = keyInput.read(RemoteValue.class);
          }
        }
        try (StringReader reader = new StringReader(JSON.toJson(list.get(1)));
            JsonInput valueInput = JSON.newInput(reader)) {
          RemoteValue value1 = valueInput.read(RemoteValue.class);
          map.put(key, value1);
        }
      }
      value = map;
    } else if (NonPrimitiveType.REGULAR_EXPRESSION.equals(type)) {
      try (StringReader reader = new StringReader(JSON.toJson(value));
          JsonInput input = JSON.newInput(reader)) {
        value = input.read(RegExpValue.class);
      }
    }

    return value;
  }
}
