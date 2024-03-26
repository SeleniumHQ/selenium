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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MapLocalValue extends LocalValue {

  private final Map<Object, LocalValue> map;

  MapLocalValue(Map<Object, LocalValue> map) {
    this.map = map;
  }

  @Override
  public Map<String, Object> toJson() {
    List<List<Object>> value = new ArrayList<>();

    map.forEach(
        (k, v) -> {
          List<Object> entry = new ArrayList<>();
          entry.add(k);
          entry.add(v);
          value.add(entry);
        });

    return Map.of("type", "map", "value", value);
  }
}
