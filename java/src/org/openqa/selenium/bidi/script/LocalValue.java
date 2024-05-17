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

import java.util.List;
import java.util.Map;
import java.util.Set;

public abstract class LocalValue {

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
}
