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

import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;

@Beta
public class PrimitiveProtocolValue extends LocalValue {

  private final PrimitiveType type;
  private final @Nullable Object value;

  PrimitiveProtocolValue(PrimitiveType type, Object value) {
    this.type = type;
    this.value = value;
  }

  PrimitiveProtocolValue(PrimitiveType type) {
    this.type = type;
    this.value = null;

    Require.precondition(
        nullsAllowed(),
        "Only null and defined do not require values. "
            + "Other types require a corresponding value.");
  }

  private boolean nullsAllowed() {
    return type.equals(PrimitiveType.UNDEFINED) || type.equals(PrimitiveType.NULL);
  }

  @Override
  public Map<String, Object> toJson() {
    return value == null
        ? Map.of("type", type.toString())
        : Map.of("type", type.toString(), "value", value);
  }

  @Override
  public String toString() {
    return String.format("%s{type:%s, value:%s}", getClass().getSimpleName(), type, value);
  }
}
