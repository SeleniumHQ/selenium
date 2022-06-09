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

import org.openqa.selenium.remote.CapabilityType;

import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.stream.Collectors;

import static org.openqa.selenium.remote.Browser.FIREFOX;

public class FirefoxFilter implements CapabilitiesFilter {
  // Note: we don't take a dependency on the FirefoxDriver jar as it might not be on the classpath

  @Override
  public Map<String, Object> apply(Map<String, Object> unmodifiedCaps) {
    Map<String, Object> caps = unmodifiedCaps.entrySet().parallelStream()
      .filter(entry ->
                (CapabilityType.BROWSER_NAME.equals(entry.getKey()) && FIREFOX.is(String.valueOf(entry.getValue()))) ||
                entry.getKey().startsWith("firefox_") ||
                entry.getKey().startsWith("moz:"))
      .filter(entry -> Objects.nonNull(entry.getValue()))
      .collect(Collectors.toMap(
        Map.Entry::getKey,
        Map.Entry::getValue,
        (l, r) -> l,
        TreeMap::new));

    // If we only have marionette in the caps, the user is asking for firefox. Make sure we inject
    // the browser name to be sure.
    if (unmodifiedCaps.containsKey("marionette") && !caps.containsKey("browserName")) {
      caps.put("browserName", "firefox");
    }

    // People might have just put the binary and profile in the OSS payload, and not in firefox
    // options.
    @SuppressWarnings("unchecked")
    Map<String, Object> options = (Map<String, Object>) unmodifiedCaps.getOrDefault(
      "moz:firefoxOptions",
      new TreeMap<>());
    options = new TreeMap<>(options);

    if (unmodifiedCaps.containsKey("firefox_binary") && !options.containsKey("binary")) {
      // Here's hoping that the binary is just a string. It should be as FirefoxBinary.toJson just
      // encodes the path.
      options.put("binary", unmodifiedCaps.get("firefox_binary"));
    }
    if (unmodifiedCaps.containsKey("firefox_profile") && !options.containsKey("profile")) {
      options.put("profile", unmodifiedCaps.get("firefox_profile"));
    }
    if (!options.isEmpty()) {
      caps.put("moz:firefoxOptions", options);
    }

    return caps.isEmpty() ? null : caps;
  }
}
