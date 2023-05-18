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

import java.util.Arrays;
import org.openqa.selenium.internal.Require;

public class EventAttributeValue {

  private final Type type;
  private String stringValue;
  private Number numberValue;
  private boolean booleanValue;
  private String[] stringArrayValue;
  private long[] longArrayValue;
  private double[] doubleArrayValue;
  private boolean[] booleanArrayValue;

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
    Require.nonNull("Value", value);
    this.stringArrayValue = Arrays.copyOf(value, value.length);
    this.type = Type.STRING_ARRAY;
  }

  public EventAttributeValue(long[] value) {
    Require.nonNull("Value", value);
    this.longArrayValue = Arrays.copyOf(value, value.length);
    this.type = Type.LONG_ARRAY;
  }

  public EventAttributeValue(double[] value) {
    Require.nonNull("Value", value);
    this.doubleArrayValue = Arrays.copyOf(value, value.length);
    this.type = Type.DOUBLE_ARRAY;
  }

  public EventAttributeValue(boolean[] value) {
    Require.nonNull("Value", value);
    this.booleanArrayValue = Arrays.copyOf(value, value.length);
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

  public String[] getStringArrayValue() {
    return Arrays.copyOf(stringArrayValue, stringArrayValue.length);
  }

  public long[] getLongArrayValue() {
    return Arrays.copyOf(longArrayValue, longArrayValue.length);
  }

  public double[] getDoubleArrayValue() {
    return Arrays.copyOf(doubleArrayValue, doubleArrayValue.length);
  }

  public boolean[] getBooleanArrayValue() {
    return Arrays.copyOf(booleanArrayValue, booleanArrayValue.length);
  }

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
