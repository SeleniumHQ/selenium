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

import java.math.BigInteger;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.openqa.selenium.json.Json;

public abstract class LocalValue {

  private static Json JSON = new Json();

  enum SpecialNumberType {
    NAN("NaN"),
    MINUS_ZERO("-0"),
    INFINITY("Infinity"),
    MINUS_INFINITY("-Infinity");

    private final String type;

    SpecialNumberType(String type) {
      this.type = type;
    }

    @Override
    public String toString() {
      return type;
    }
  }

  public abstract Map<String, Object> toJson();

  public static LocalValue stringValue(String value) {
    return new PrimitiveProtocolValue(PrimitiveType.STRING, value);
  }

  public static LocalValue numberValue(long value) {
    return new PrimitiveProtocolValue(PrimitiveType.NUMBER, value);
  }

  public static LocalValue numberValue(double value) {
    return new PrimitiveProtocolValue(PrimitiveType.NUMBER, value);
  }

  public static LocalValue numberValue(PrimitiveProtocolValue.SpecialNumberType specialNumber) {
    return new PrimitiveProtocolValue(PrimitiveType.SPECIAL_NUMBER, specialNumber.toString());
  }

  public static LocalValue undefinedValue() {
    return new PrimitiveProtocolValue(PrimitiveType.UNDEFINED);
  }

  public static LocalValue nullValue() {
    return new PrimitiveProtocolValue(PrimitiveType.NULL);
  }

  public static LocalValue booleanValue(boolean value) {
    return new PrimitiveProtocolValue(PrimitiveType.BOOLEAN, value);
  }

  public static LocalValue bigIntValue(String value) {
    return new PrimitiveProtocolValue(PrimitiveType.BIGINT, value);
  }

  public static LocalValue arrayValue(List<LocalValue> value) {
    return new ArrayLocalValue(value);
  }

  public static LocalValue dateValue(String value) {
    return new DateLocalValue(value);
  }

  public static LocalValue mapValue(Map<Object, LocalValue> value) {
    return new MapLocalValue(value);
  }

  public static LocalValue objectValue(Map<Object, LocalValue> value) {
    return new ObjectLocalValue(value);
  }

  public static LocalValue regExpValue(String pattern) {
    return new RegExpValue(pattern);
  }

  public static LocalValue regExpValue(String pattern, String flags) {
    return new RegExpValue(pattern, flags);
  }

  public static LocalValue setValue(Set<LocalValue> value) {
    return new SetLocalValue(value);
  }

  public static LocalValue channelValue(String channelId) {
    return new ChannelValue(channelId);
  }

  public static LocalValue channelValue(String channelId, SerializationOptions options) {
    return new ChannelValue(channelId, options);
  }

  public static LocalValue channelValue(
      String channelId, SerializationOptions options, ResultOwnership resultOwnership) {
    return new ChannelValue(channelId, options, resultOwnership);
  }

  public static LocalValue remoteReference(String handle, String sharedId) {
    return new RemoteReference(handle, sharedId);
  }

  public static LocalValue remoteReference(RemoteReference.Type type, String id) {
    return new RemoteReference(type, id);
  }

  public static LocalValue getArgument(Object arg) {
    LocalValue localValue = null;

    if (arg instanceof String) {
      switch ((String) arg) {
        case "undefined":
          localValue = undefinedValue();
          break;
        case "null":
          localValue = nullValue();
          break;
        case "-Infinity":
          localValue = numberValue(SpecialNumberType.MINUS_INFINITY);
          break;
        case "Infinity":
          localValue = numberValue(SpecialNumberType.INFINITY);
          break;
        case "NaN":
          localValue = numberValue(SpecialNumberType.NAN);
          break;
        case "-0":
          localValue = numberValue(SpecialNumberType.MINUS_ZERO);
          break;
        default:
          localValue = stringValue((String) arg);
          break;
      }
    } else if (arg instanceof Number) {
      if (arg instanceof Integer || arg instanceof Long) {
        localValue = numberValue(((Number) arg).longValue());
      } else if (arg instanceof Double || arg instanceof Float) {
        localValue = numberValue(((Number) arg).doubleValue());
      } else if (arg instanceof BigInteger) {
        localValue = bigIntValue(arg.toString());
      }
    } else if (arg instanceof Boolean) {
      localValue = booleanValue((Boolean) arg);
    } else if (arg instanceof Instant) {
      localValue = dateValue(((Instant) arg).toString());
    } else if (arg instanceof Map) {
      Map<Object, LocalValue> map = new HashMap<>();
      for (Map.Entry<Object, Object> entry : ((Map<Object, Object>) arg).entrySet()) {
        Object key =
            (entry.getKey() instanceof String) ? entry.getKey() : getArgument(entry.getKey());
        map.put(key, getArgument(entry.getValue()));
      }
      localValue = mapValue(map);
    } else if (arg instanceof List) {
      List<LocalValue> values = new ArrayList<>();
      ((List<Object>) arg).forEach(value -> values.add(getArgument(value)));
      localValue = arrayValue(values);
    } else if (arg instanceof Set) {
      Set<LocalValue> values = new HashSet<>();
      ((Set<Object>) arg).forEach(value -> values.add(getArgument(value)));
      localValue = setValue(values);
    } else if (arg instanceof RegExpValue) {
      localValue = (RegExpValue) arg;
    } else {
      String json = JSON.toJson(arg);
      Map<Object, Object> objectMap = JSON.toType(json, Map.class);

      Map<Object, LocalValue> map = new HashMap<>();

      for (Map.Entry<Object, Object> entry : objectMap.entrySet()) {
        Object key =
            (entry.getKey() instanceof String) ? entry.getKey() : getArgument(entry.getKey());
        map.put(key, getArgument(entry.getValue()));
      }
      localValue = objectValue(map);

      return localValue;
    }

    return localValue;
  }
}
