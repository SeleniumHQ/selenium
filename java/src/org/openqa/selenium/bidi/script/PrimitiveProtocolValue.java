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
// under the License
package org.openqa.selenium.bidi.script;

import static java.util.Collections.unmodifiableMap;

import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.internal.Require;

public class PrimitiveProtocolValue extends LocalValue {

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

  private final PrimitiveType type;
  private Object value;

  private PrimitiveProtocolValue(PrimitiveType type, Object value) {
    this.type = type;
    this.value = value;
  }

  private PrimitiveProtocolValue(PrimitiveType type) {
    Require.precondition(
        type.equals(PrimitiveType.UNDEFINED) || type.equals(PrimitiveType.NULL),
        "Only null and defined do not require values. "
            + "Rest all type require a corresponding value.");
    this.type = type;
  }

  public static LocalValue stringValue(String value) {
    return new PrimitiveProtocolValue(PrimitiveType.STRING, value);
  }

  public static LocalValue numberValue(long value) {
    return new PrimitiveProtocolValue(PrimitiveType.NUMBER, value);
  }

  public static LocalValue numberValue(double value) {
    return new PrimitiveProtocolValue(PrimitiveType.NUMBER, value);
  }

  public static LocalValue numberValue(SpecialNumberType specialNumber) {
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

  @Override
  public Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("type", this.type.toString());

    if (!(this.type.equals(PrimitiveType.NULL) || this.type.equals(PrimitiveType.UNDEFINED))) {
      toReturn.put("value", this.value);
    }

    return unmodifiableMap(toReturn);
  }
}
