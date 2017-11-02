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

package org.openqa.grid.selenium.node;

import static org.openqa.selenium.firefox.FirefoxDriver.BINARY;
import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;
import static org.openqa.selenium.firefox.FirefoxOptions.FIREFOX_OPTIONS;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import org.openqa.selenium.ImmutableCapabilities;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class FirefoxMutator implements Function<ImmutableCapabilities, ImmutableCapabilities> {

  private final Object binary;
  private final Object marionette;

  public FirefoxMutator(Map<String, Object> config) {
    if ("firefox".equals(config.get(BROWSER_NAME))) {
      this.binary = config.get(BINARY);
      this.marionette = config.get(MARIONETTE);
    } else {
      this.binary = null;
      this.marionette = null;
    }
  }

  @Override
  public ImmutableCapabilities apply(ImmutableCapabilities capabilities) {
    if ((binary == null && marionette == null) ||
        !"firefox".equals(capabilities.getBrowserName())) {
      return capabilities;
    }

    Map<String, Object> options = new HashMap<>();
    if (capabilities.getCapability(FIREFOX_OPTIONS) instanceof Map) {
      //noinspection unchecked
      Map<String, Object> originalOptions =
          (Map<String, Object>) capabilities.getCapability(FIREFOX_OPTIONS);
      options.putAll(originalOptions);
    }

    Map<String, Object> toReturn = new HashMap<>();
    toReturn.putAll(capabilities.asMap());

    if (binary != null) {
      if (!(capabilities.getCapability(BINARY) instanceof String)) {
        toReturn.put(BINARY, binary);
      }
      if (!(options.get("binary") instanceof String)) {
        options.put("binary", binary);
      }
    }

    if (marionette != null) {
      toReturn.put(MARIONETTE, marionette);
    }

    if (!options.isEmpty()) {
      toReturn.put(FIREFOX_OPTIONS, options);
    }

    return new ImmutableCapabilities(toReturn);
  }
}
