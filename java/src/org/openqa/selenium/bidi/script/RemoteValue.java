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

package org.openqa.selenium.bidi.script;

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

  private enum Type {
    UNDEFINED("undefined"),
    NULL("null"),
    STRING("string"),
    NUMBER("number"),
    SPECIAL_NUMBER("number"),
    BOOLEAN("boolean"),
    BIGINT("bigint"),
    ARRAY("array"),
    DATE("date"),
    MAP("map"),
    OBJECT("object"),
    REGULAR_EXPRESSION("regexp"),
    SET("set"),
    SYMBOL("symbol"),
    FUNCTION("function"),
    WEAK_MAP("weakmap"),
    WEAK_SET("weakset"),
    ITERATOR("iterator"),
    GENERATOR("generator"),
    ERROR("error"),
    PROXY("proxy"),
    PROMISE("promise"),
    TYPED_ARRAY("typedarray"),
    ARRAY_BUFFER("arraybuffer"),
    NODE_LIST("nodelist"),
    HTML_COLLECTION("htmlcollection"),
    NODE("node"),
    WINDOW("window");

    private final String type;

    Type(String type) {
      this.type = type;
    }

    @Override
    public String toString() {
      return type;
    }

    public static Type findByName(String name) {
      Type result = null;
      for (Type type : values()) {
        if (type.toString().equalsIgnoreCase(name)) {
          result = type;
          break;
        }
      }
      return result;
    }
  }

  private static final Json JSON = new Json();

  private final Type type;

  private final Optional<String> handle;

  private final Optional<Long> internalId;

  private final Optional<Object> value;

  private final Optional<String> sharedId;

  public RemoteValue(
      Type type,
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
    Type type = null;

    Optional<String> handle = Optional.empty();

    Optional<Long> internalId = Optional.empty();

    Optional<Object> value = Optional.empty();

    Optional<String> sharedId = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          String typeString = input.read(String.class);
          type = Type.findByName(typeString);
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

  private static Object deserializeValue(Object value, Type type) {
    Object finalValue;

    switch (type) {
      case ARRAY:
      case NODE_LIST:
      case SET:
        try (StringReader reader = new StringReader(JSON.toJson(value));
            JsonInput input = JSON.newInput(reader)) {
          finalValue = input.read(new TypeToken<List<RemoteValue>>() {}.getType());
        }
        break;

      case MAP:
      case OBJECT:
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
        finalValue = map;
        break;

      case REGULAR_EXPRESSION:
        try (StringReader reader = new StringReader(JSON.toJson(value));
            JsonInput input = JSON.newInput(reader)) {
          finalValue = input.read(RegExpValue.class);
        }
        break;

      case WINDOW:
        try (StringReader reader = new StringReader(JSON.toJson(value));
            JsonInput input = JSON.newInput(reader)) {
          finalValue = input.read(WindowProxyProperties.class);
        }
        break;

      case NODE:
        try (StringReader reader = new StringReader(JSON.toJson(value));
            JsonInput input = JSON.newInput(reader)) {
          finalValue = input.read(NodeProperties.class);
        }
        break;

      default:
        finalValue = value;
    }

    return finalValue;
  }
}
