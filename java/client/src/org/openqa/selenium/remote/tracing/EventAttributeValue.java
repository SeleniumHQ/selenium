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

package org.openqa.selenium.remote.tracing;

public class EventAttributeValue {

  private final Type type;
  private String stringValue;
  private Number numberValue;
  private Boolean booleanValue;
  private String[] stringArrayValue;
  private Long[] longArrayValue;
  private Double[] doubleArrayValue;
  private Boolean[] booleanArrayValue;

  public EventAttributeValue(String value) {
    this.stringValue = value;
    this.type = Type.STRING;
  }

  public EventAttributeValue(long value) {
    this.numberValue = value;
    this.type = Type.LONG;
  }

  public EventAttributeValue(double value) {
    this.numberValue = value;
    this.type = Type.DOUBLE;
  }

  public EventAttributeValue(boolean value) {
    this.booleanValue = value;
    this.type = Type.BOOLEAN;
  }

  public EventAttributeValue(String[] value) {
    this.stringArrayValue = value;
    this.type = Type.STRING_ARRAY;
  }

  public EventAttributeValue(Long[] value) {
    this.longArrayValue = value;
    this.type = Type.LONG_ARRAY;
  }

  public EventAttributeValue(Double[] value) {
    this.doubleArrayValue = value;
    this.type = Type.DOUBLE_ARRAY;
  }

  public EventAttributeValue(Boolean[] value) {
    this.booleanArrayValue = value;
    this.type = Type.BOOLEAN_ARRAY;
  }

  public String getStringValue() {
    return stringValue;
  }

  public Number getNumberValue() {
    return numberValue;
  }

  public Boolean getBooleanValue() {
    return booleanValue;
  }

  public String[] getStringArrayValue() { return stringArrayValue; }

  public Long[] getLongArrayValue() { return longArrayValue; }

  public Double[] getDoubleArrayValue() { return doubleArrayValue; }

  public Boolean[] getBooleanArrayValue() { return booleanArrayValue; }

  public Type getAttributeType() {
    return type;
  }

  public enum Type {
    BOOLEAN,
    BOOLEAN_ARRAY,
    DOUBLE,
    DOUBLE_ARRAY,
    LONG,
    LONG_ARRAY,
    STRING,
    STRING_ARRAY
  }

}
