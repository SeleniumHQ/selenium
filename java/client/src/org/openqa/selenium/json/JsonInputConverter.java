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

package org.openqa.selenium.json;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public class JsonInputConverter {

  public static Double extractDouble(JsonInput input){
    Number number = input.nextNumber();
    return (null != number) ? number.doubleValue() : null;
  }

  public static Long extractLong(JsonInput input) {
    Number number = input.nextNumber();
    return (null != number) ? number.longValue() : null;
  }

  public static Integer extractInt(JsonInput input){
    Number number = input.nextNumber();
    return (null != number) ? number.intValue() : null;
  }

  public static Map<String,Object> extractMap(JsonInput input){
    input.beginObject();
    Map map = new HashMap<>();
    while (input.hasNext()) {
      map.put(input.nextName(), input.nextString());
    }
    input.endObject();
    return map;
  }

  public static Instant extractInstant(JsonInput input) {
    Long instant = extractLong(input);
    return (null != instant) ? Instant.ofEpochMilli(instant) : null;
  }
}
