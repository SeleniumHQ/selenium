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

package org.openqa.selenium.grid.node.config;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

public class SessionCapabilitiesMutator implements Function<Capabilities, Capabilities> {

  private static final ImmutableMap<String, String> BROWSER_OPTIONS = ImmutableMap.of(
    "chrome", "goog:chromeOptions",
    "firefox", "moz:firefoxOptions",
    "microsoftedge", "ms:edgeOptions");
  private static final String SE_VNC_ENABLED = "se:vncEnabled";
  private final Capabilities slotStereotype;


  public SessionCapabilitiesMutator(Capabilities slotStereotype) {
    this.slotStereotype = slotStereotype;
  }

  @Override
  public Capabilities apply(Capabilities capabilities) {
    if (slotStereotype.getCapability(SE_VNC_ENABLED) != null) {
      capabilities = new PersistentCapabilities(capabilities)
        .setCapability(SE_VNC_ENABLED, slotStereotype.getCapability(SE_VNC_ENABLED));
    }

    if (!Objects.equals(slotStereotype.getBrowserName(), capabilities.getBrowserName())) {
      return capabilities;
    }

    String browserName = capabilities.getBrowserName().toLowerCase();
    if (!BROWSER_OPTIONS.containsKey(browserName)) {
      return capabilities;
    }

    String options = BROWSER_OPTIONS.get(browserName);
    if (!slotStereotype.asMap().containsKey(options)) {
      return capabilities;
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> stereotypeOptions = (Map<String, Object>) slotStereotype.asMap().get(options);

    Map<String, Object> toReturn = new HashMap<>(capabilities.asMap());

    if (!toReturn.containsKey(options)) {
      toReturn.put(options, stereotypeOptions);
      return new ImmutableCapabilities(toReturn);
    }

    @SuppressWarnings("unchecked")
    Map<String, Object> capsOptions = (Map<String, Object>) toReturn.get(options);
    stereotypeOptions.forEach((key, value) -> {
      if (!capsOptions.containsKey(key)) {
        capsOptions.put(key, value);
      }
    });

    return new ImmutableCapabilities(toReturn);
  }
}
