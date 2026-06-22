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

import static java.util.stream.Collectors.toMap;

import java.math.BigInteger;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.json.Json;

/**
 * @see <a href="https://www.w3.org/TR/webdriver-bidi/#cddl-type-scriptlocalvalue">BiDi spec</a>
 */
@Beta
public abstract class LocalValue {

  private static final Json JSON = new Json();

  public enum SpecialNumberType {
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

  public static LocalValue bigIntValue(BigInteger value) {
    return bigIntValue(value.toString());
  }

  public static LocalValue bigIntValue(String value) {
    return new PrimitiveProtocolValue(PrimitiveType.BIGINT, value);
  }

  public static LocalValue listToLocalValues(List<Object> rawValues) {
    List<LocalValue> values =
        rawValues.stream().map(value -> getArgument(value)).collect(Collectors.toList());

    return arrayValue(values);
  }

  public static LocalValue arrayValue(List<LocalValue> value) {
    return new ArrayLocalValue(value);
  }

  public static LocalValue dateValue(Instant value) {
    return dateValue(value.toString());
  }

  public static LocalValue dateValue(String value) {
    return new DateLocalValue(value);
  }

  public static LocalValue mapToLocalValues(Map<Object, Object> rawValues) {
    Map<Object, LocalValue> map =
        rawValues.entrySet().stream()
            .collect(
                toMap(
                    entry ->
                        entry.getKey() instanceof String
                            ? entry.getKey()
                            : getArgument(entry.getKey()),
                    entry -> getArgument(entry.getValue())));
    return mapValue(map);
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

  public static LocalValue setToLocalValues(Set<Object> rawValues) {
    Set<LocalValue> values =
        rawValues.stream().map(value -> getArgument(value)).collect(Collectors.toSet());

    return setValue(values);
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

  public static LocalValue getArgument(@Nullable Object arg) {
    if (arg == null) {
      return nullValue();
    }
    if (arg instanceof String) {
      return stringToLocalValue((String) arg);
    } else if (arg instanceof Number) {
      return numberToLocalValue((Number) arg);
    } else if (arg instanceof Boolean) {
      return booleanValue((Boolean) arg);
    } else if (arg instanceof Instant) {
      return dateValue((Instant) arg);
    } else if (arg instanceof Map) {
      return mapToLocalValues((Map<Object, Object>) arg);
    } else if (arg instanceof List) {
      return listToLocalValues((List<Object>) arg);
    } else if (arg instanceof Set) {
      return setToLocalValues((Set<Object>) arg);
    } else if (arg instanceof RegExpValue) {
      return (RegExpValue) arg;
    } else {
      Map<Object, Object> rawValues = JSON.toType(JSON.toJson(arg), Map.class);

      Map<Object, LocalValue> map =
          rawValues.entrySet().stream()
              .collect(
                  toMap(
                      entry ->
                          entry.getKey() instanceof String
                              ? entry.getKey()
                              : getArgument(entry.getKey()),
                      entry -> getArgument(entry.getValue())));
      return objectValue(map);
    }
  }

  private static LocalValue stringToLocalValue(String arg) {
    switch (arg) {
      case "undefined":
        return undefinedValue();
      case "null":
        return nullValue();
      case "-Infinity":
        return numberValue(SpecialNumberType.MINUS_INFINITY);
      case "Infinity":
        return numberValue(SpecialNumberType.INFINITY);
      case "NaN":
        return numberValue(SpecialNumberType.NAN);
      case "-0":
        return numberValue(SpecialNumberType.MINUS_ZERO);
      default:
        return stringValue(arg);
    }
  }

  private static LocalValue numberToLocalValue(Number arg) {
    if (arg instanceof BigInteger) {
      return bigIntValue((BigInteger) arg);
    } else if (arg instanceof Double || arg instanceof Float) {
      return numberValue((arg).doubleValue());
    } else {
      return numberValue((arg).longValue());
    }
  }
}
