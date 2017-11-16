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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Test;

import java.io.IOException;
import java.io.StringReader;
import java.util.Map;

public class JsonTest {

  @Test
  public void canRoundTripNumbers() {
    Map<String, Object> original = ImmutableMap.of(
        "options", ImmutableMap.of("args", ImmutableList.of(1L, "hello")));

    Json json = new Json();
    String converted = json.toJson(original);
    Object remade = json.toType(converted, MAP_TYPE);

    assertEquals(original, remade);
  }

  @Test
  public void roundTripAFirefoxOptions() throws IOException {
    Map<String, Object> caps = ImmutableMap.of(
        "moz:firefoxOptions", ImmutableMap.of(
            "prefs", ImmutableMap.of("foo.bar", 1)));
    String json = new Json().toJson(caps);
    assertFalse(json, json.contains("1.0"));

    try (JsonInput input = new Json().newInput(new StringReader(json))) {
      json = new Json().toJson(input.read(Json.MAP_TYPE));
      assertFalse(json, json.contains("1.0"));
    }
  }
}
