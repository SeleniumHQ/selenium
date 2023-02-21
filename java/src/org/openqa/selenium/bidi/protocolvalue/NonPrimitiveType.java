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

public enum NonPrimitiveType implements LocalValueType, RemoteValueType {
  ARRAY("array"),
  DATE("date"),
  MAP("map"),
  OBJECT("object"),
  REGULAR_EXPRESSION("regexp"),
  SET("set");

  private final String type;

  NonPrimitiveType(String type) {
    this.type = type;
  }

  @Override
  public String toString() {
    return type;
  }

  public static NonPrimitiveType findByName(String name) {
    NonPrimitiveType result = null;
    for (NonPrimitiveType type : values()) {
      if (type.toString().equalsIgnoreCase(name)) {
        result = type;
        break;
      }
    }
    return result;
  }
}
