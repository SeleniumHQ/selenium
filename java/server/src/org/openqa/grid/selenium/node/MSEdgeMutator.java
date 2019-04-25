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

import static org.openqa.selenium.msedge.MSEdgeOptions.CAPABILITY;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

public class MSEdgeMutator implements Function<Capabilities, Capabilities> {

  private static final String CONFIG_UUID_CAPABILITY = "server:CONFIG_UUID";

  private final Capabilities config;

  public MSEdgeMutator(Capabilities config) {
    this.config = "msedge".equals(config.getBrowserName()) ? config : null;
  }

  @Override
  public Capabilities apply(Capabilities capabilities) {
    if (config == null || !"msedge".equals(capabilities.getBrowserName())) {
      return capabilities;
    }
    if (!Objects.equals(config.getCapability(CONFIG_UUID_CAPABILITY),
                        capabilities.getCapability(CONFIG_UUID_CAPABILITY))) {
      return capabilities;
    }

    Map<String, Object> toReturn = new HashMap<>(capabilities.asMap());

    Map<String, Object> options = new HashMap<>();
    if (capabilities.getCapability(CAPABILITY) instanceof Map) {
      @SuppressWarnings("unchecked")
      Map<String, Object> asMap = (Map<String, Object>) capabilities.getCapability(CAPABILITY);
      options.putAll(asMap);
    }

    if (options.get("binary") == null && config.getCapability("chrome_binary") != null) {
      options.put("binary", config.getCapability("chrome_binary"));
    }

    toReturn.put(CAPABILITY, options);

    return new ImmutableCapabilities(toReturn);
  }
}
