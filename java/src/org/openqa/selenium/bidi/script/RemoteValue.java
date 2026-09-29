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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonInput;

@Beta
public class RemoteValue {

  public enum Type {
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
      for (Type type : values()) {
        if (type.toString().equalsIgnoreCase(name)) {
          return type;
        }
      }
      throw new IllegalArgumentException("Unsupported value type: " + name);
    }
  }

  private static final Json JSON = new Json();

  private final Type type;
  private final Optional<String> handle;
  private final Optional<String> internalId;
  private final Optional<Object> value;
  private final Optional<String> sharedId;

  public RemoteValue(
      Type type,
      Optional<String> handle,
      Optional<String> internalId,
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
    Optional<String> internalId = Optional.empty();
    Optional<Object> value = Optional.empty();
    Optional<String> sharedId = Optional.empty();

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          String typeString = input.readNonNull(String.class);
          type = Type.findByName(typeString);
          break;

        case "handle":
          handle = Optional.ofNullable(input.read(String.class));
          break;

        case "internalId":
          internalId = Optional.ofNullable(input.read(String.class));
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

    Type valueType = Require.nonNull("type", type);
    if (value.isPresent()) {
      value = Optional.ofNullable(deserializeValue(value.get(), type));
    }

    return new RemoteValue(valueType, handle, internalId, value, sharedId);
  }

  /**
   * Builds a {@code RemoteValue} from an already-parsed JSON object. Nested values are decoded
   * directly from the parsed tree rather than being serialized back to JSON text and re-read, so
   * each node is visited once and decoding is not bounded by {@code JsonOutput}'s maximum depth.
   *
   * <p>Deliberately not named {@code fromJson}: {@code StaticInitializerCoercer} only binds a class
   * that declares exactly one static {@code fromJson} method.
   */
  static RemoteValue fromMap(Object raw) {
    Map<String, Object> map = asMap(raw, "remote value");

    Object typeName = map.get("type");
    if (!(typeName instanceof String)) {
      throw new JsonException(
          "Expected a string \"type\" for remote value but got: " + describe(typeName));
    }
    Type type = Type.findByName((String) typeName);

    Object rawValue = map.get("value");
    Optional<Object> value =
        rawValue == null ? Optional.empty() : Optional.ofNullable(deserializeValue(rawValue, type));

    return new RemoteValue(
        type,
        optionalString(map, "handle"),
        optionalString(map, "internalId"),
        value,
        optionalString(map, "sharedId"));
  }

  @SuppressWarnings("unchecked")
  static Map<String, Object> asMap(Object raw, String what) {
    if (!(raw instanceof Map)) {
      throw new JsonException("Expected a JSON object for " + what + " but got: " + describe(raw));
    }
    return (Map<String, Object>) raw;
  }

  @SuppressWarnings("unchecked")
  static List<Object> asList(Object raw, String what) {
    if (!(raw instanceof List)) {
      throw new JsonException("Expected a JSON array for " + what + " but got: " + describe(raw));
    }
    return (List<Object>) raw;
  }

  static Optional<String> optionalString(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value == null) {
      return Optional.empty();
    }
    if (!(value instanceof String)) {
      throw new JsonException("Expected a string for \"" + key + "\" but got: " + describe(value));
    }
    return Optional.of((String) value);
  }

  // Payloads can be large, so errors name the JSON type rather than echoing the value.
  static String describe(@Nullable Object value) {
    if (value == null) {
      return "null";
    }
    if (value instanceof Map) {
      return "object";
    }
    if (value instanceof List) {
      return "array";
    }
    return value.getClass().getSimpleName();
  }

  public String getType() {
    return type.toString();
  }

  public Optional<String> getHandle() {
    return handle;
  }

  public Optional<String> getInternalId() {
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

  @Nullable
  private static Object deserializeValue(Object value, Type type) {
    Object finalValue;

    // Container values are decoded straight from the parsed tree. Round-tripping each child through
    // JSON text re-serializes its whole subtree once per level above it, and fails outright once a
    // subtree is deeper than JsonOutput's maximum depth. See #18076.
    switch (type) {
      case ARRAY:
      case NODE_LIST:
      case SET:
        List<Object> items = asList(value, type + " value");
        List<RemoteValue> list = new ArrayList<>(items.size());
        for (Object item : items) {
          list.add(fromMap(item));
        }
        finalValue = list;
        break;

      case MAP:
      case OBJECT:
        List<Object> entries = asList(value, type + " value");
        Map<Object, RemoteValue> map = new HashMap<>();

        for (Object rawEntry : entries) {
          List<Object> entry = asList(rawEntry, type + " entry");
          if (entry.size() != 2) {
            throw new JsonException(
                "Expected a [key, value] pair in "
                    + type
                    + " value but got "
                    + entry.size()
                    + " items");
          }
          Object key = entry.get(0);
          if (!(key instanceof String)) {
            key = fromMap(key);
          }
          map.put(key, fromMap(entry.get(1)));
        }
        finalValue = map;
        break;

      case NODE:
        // Not a leaf: children and shadowRoot are remote values themselves.
        finalValue = NodeProperties.fromMap(value);
        break;

      // RegExpValue and WindowProxyProperties are genuine leaves (strings only), so a single
      // round trip through JSON text is bounded and cheap.
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

      default:
        finalValue = value;
    }

    return finalValue;
  }

  @Override
  public String toString() {
    return String.format(
        "%s{type:%s, value:%s}", getClass().getSimpleName(), type, value.orElse(null));
  }
}
