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

package org.openqa.selenium.remote.session;

import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class ChromeFilter implements CapabilitiesFilter {
  @Override
  public Map<String, Object> apply(Map<String, Object> unmodifiedCaps) {
    Map<String, Object> caps = unmodifiedCaps.entrySet().parallelStream()
        .filter(
            entry ->
                ("browserName".equals(entry.getKey()) && "chrome".equals(entry.getValue())) ||
                entry.getKey().startsWith("goog:") ||
                "chromeOptions".equals(entry.getKey()))
        .filter(entry -> Objects.nonNull(entry.getValue()))
        .distinct()
        .collect(Collectors.toMap(
            Map.Entry::getKey,
            Map.Entry::getValue,
            (l, r) -> r,
            TreeMap::new));

    // We may need to map the chromeoptions to the new form
    if (caps.containsKey("chromeOptions") && !caps.containsKey("goog:chromeOptions")) {
      caps.put("goog:chromeOptions", caps.get("chromeOptions"));
    }

    return caps.isEmpty() ? null : caps;
  }

}
