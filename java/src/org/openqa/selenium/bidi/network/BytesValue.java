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

package org.openqa.selenium.bidi.network;

import java.util.HashMap;
import java.util.Map;
import org.openqa.selenium.json.JsonInput;

public class BytesValue {

  public enum Type {
    STRING("string"),
    BASE64("base64");

    private final String bytesValueType;

    Type(String type) {
      this.bytesValueType = type;
    }

    @Override
    public String toString() {
      return bytesValueType;
    }
  }

  private final Type type;

  private final String value;

  public BytesValue(Type type, String value) {
    this.type = type;
    this.value = value;
  }

  public static BytesValue fromJson(JsonInput input) {
    Type type = null;
    String value = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          String bytesValue = input.read(String.class);
          type = bytesValue.equals(Type.BASE64.toString()) ? Type.BASE64 : Type.STRING;
          break;
        case "value":
          value = input.read(String.class);
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new BytesValue(type, value);
  }

  public Type getType() {
    return type;
  }

  public String getValue() {
    return value;
  }

  public Map<String, String> toMap() {
    Map<String, String> map = new HashMap<>();
    map.put("type", type.toString());
    map.put("value", value);

    return map;
  }
}
