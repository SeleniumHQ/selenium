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

package org.openqa.grid.internal.utils.configuration.json;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

public class HubJsonConfiguration extends GridJsonConfiguration {

  private HubJsonConfiguration() {}

  public static HubJsonConfiguration loadFromJson(JsonInput source) {
    HubJsonConfiguration config = fromJson(source, HubJsonConfiguration.class);

    if (config.getRole() != null && !config.getRole().equals("hub")) {
      throw new RuntimeException("Unable to load hub configuration from " + source +
                                 " because it contains configuration for '" + config.getRole() + "' role");
    }

    return config;
  }

  public static HubJsonConfiguration loadFromResourceOrFile(String source) {
    HubJsonConfiguration config = fromResourceOrFile(source, HubJsonConfiguration.class);

    if (config.getRole() != null && !config.getRole().equals("hub")) {
      throw new RuntimeException("Unable to load hub configuration from " + source +
                                 " because it contains configuration for '" + config.getRole() + "' role");
    }

    return config;
  }

  private CapabilityMatcher capabilityMatcher = new DefaultCapabilityMatcher();
  private Integer newSessionWaitTimeout;
  private Prioritizer prioritizer;
  private Boolean throwOnCapabilityNotPresent;
  private String registry;
  private Integer cleanUpCycle;

  /**
   * Capability matcher to use. Defaults to {@link DefaultCapabilityMatcher}
   */
  public CapabilityMatcher getCapabilityMatcher() {
    return capabilityMatcher;
  }

  /**
   * Timeout for new session requests. Defaults to unlimited.
   */
  public Integer getNewSessionWaitTimeout() {
    return newSessionWaitTimeout;
  }

  /**
   * Prioritizer for new honoring session requests based on some priority. Defaults to {@code null}.
   */
  public Prioritizer getPrioritizer() {
    return prioritizer;
  }

  /**
   * Whether to throw an Exception when there are no capabilities available that match the request. Defaults to {@code true}.
   */
  public Boolean getThrowOnCapabilityNotPresent() {
    return throwOnCapabilityNotPresent;
  }

  public String getRegistry() {
    return registry;
  }

  /**
   * Clean up cycle for remote proxies. Default determined by configuration type.
   */
  public Integer getCleanUpCycle() {
    return cleanUpCycle;
  }
}
