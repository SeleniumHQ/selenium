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

package org.openqa.selenium.grid.data;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.json.JsonInput;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collector;

import static java.util.Collections.unmodifiableMap;
import static java.util.stream.Collector.Characteristics.UNORDERED;

public class CapabilityCount {

  private final Map<Capabilities, Integer> counts;

  public CapabilityCount(Map<Capabilities, Integer> counts) {
    this.counts = unmodifiableMap(new HashMap<>(counts));
  }

  public Map<Capabilities, Integer> getCounts() {
    return counts;
  }

  private Object toJson() {
    return counts.entrySet().stream()
      .map(entry -> {
        Map<Object, Object> toReturn = new HashMap<>();
        toReturn.put("capabilities", entry.getKey());
        toReturn.put("count", entry.getValue());
        return toReturn;
      })
      .collect(Collector.of(
        ArrayList::new,
        ArrayList::add,
        (l, r) -> { l.addAll(r); return l; },
        Collections::unmodifiableList,
        UNORDERED));
  }

  private static CapabilityCount fromJson(JsonInput input) {
    Map<Capabilities, Integer> toReturn = new HashMap<>();

    input.beginArray();
    while (input.hasNext()) {
      Capabilities caps = null;
      int count = 0;
      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "capabilities":
            caps = input.read(Capabilities.class);
            break;

          case "count":
            count = input.nextNumber().intValue();
            break;

          default:
            input.skipValue();
            break;
        }
      }
      input.endObject();

      toReturn.put(caps, count);
    }
    input.endArray();

    return new CapabilityCount(toReturn);
  }

}
