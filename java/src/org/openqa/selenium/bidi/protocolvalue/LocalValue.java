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

import org.openqa.selenium.internal.Require;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class LocalValue {
  private static final String TYPE_CONSTANT = "type";
  private static final String VALUE_CONSTANT = "value";
  private final LocalValueType type;
  private Object value;

  public LocalValue(LocalValueType type, Object value) {
    this.type = type;
    this.value = value;
  }

  private LocalValue(PrimitiveType type) {
    Require.precondition(
      type.equals(PrimitiveType.UNDEFINED) || type.equals(PrimitiveType.NULL),
      "Only null and defined do not require values. "
      + "Rest all type require a corresponding value.");
    this.type = type;
  }

  public static LocalValue createStringValue(String value) {
    return new LocalValue(PrimitiveType.STRING, value);
  }

  public static LocalValue createNumberValue(long value) {
    return new LocalValue(PrimitiveType.NUMBER, value);
  }

  public static LocalValue createNumberValue(double value) {
    return new LocalValue(PrimitiveType.NUMBER, value);
  }

  public static LocalValue createNumberValue(SpecialNumberType specialNumber) {
    return new LocalValue(PrimitiveType.SPECIAL_NUMBER, specialNumber.toString());
  }

  public static LocalValue createUndefinedValue() {
    return new LocalValue(PrimitiveType.UNDEFINED);
  }

  public static LocalValue createNullValue() {
    return new LocalValue(PrimitiveType.NULL);
  }

  public static LocalValue createBooleanValue(boolean value) {
    return new LocalValue(PrimitiveType.BOOLEAN, value);
  }

  public static LocalValue createBigIntValue(String value) {
    return new LocalValue(PrimitiveType.BIGINT, value);
  }

  public static LocalValue createArrayValue(List<LocalValue> value) {
    return new LocalValue(NonPrimitiveType.ARRAY, value);
  }

  public static LocalValue createDateValue(String value) {
    return new LocalValue(NonPrimitiveType.DATE, value);
  }

  public static LocalValue createMapValue(Map<Object, LocalValue> map) {
    List<List<Object>> value = new ArrayList<>();

    map.forEach((k, v) -> {
      List<Object> entry = new ArrayList<>();
      entry.add(k);
      entry.add(v);
      value.add(entry);
    });

    return new LocalValue(NonPrimitiveType.MAP, value);
  }

  public static LocalValue createObjectValue(Map<Object, LocalValue> map) {
    List<List<Object>> value = new ArrayList<>();

    map.forEach((k, v) -> {
      List<Object> entry = new ArrayList<>();
      entry.add(k);
      entry.add(v);
      value.add(entry);
    });

    return new LocalValue(NonPrimitiveType.OBJECT, value);
  }

  public static LocalValue createRegularExpressionValue(RegExpValue value) {
    return new LocalValue(NonPrimitiveType.REGULAR_EXPRESSION, value);
  }

  public static LocalValue createSetValue(Set<LocalValue> value) {
    return new LocalValue(NonPrimitiveType.SET, value);
  }

  public String getType() {
    return type.toString();
  }

  public Object getValue() {
    return value;
  }

  public Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put(TYPE_CONSTANT, this.type.toString());

    if (!(this.type.equals(PrimitiveType.NULL) ||
          this.type.equals(PrimitiveType.UNDEFINED))) {
      toReturn.put(VALUE_CONSTANT, this.value);
    }

    return unmodifiableMap(toReturn);
  }

}
