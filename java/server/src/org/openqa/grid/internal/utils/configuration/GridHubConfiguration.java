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

package org.openqa.grid.internal.utils.configuration;

import static java.util.Optional.ofNullable;

import com.google.common.annotations.VisibleForTesting;

import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.cli.GridHubCliOptions;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.configuration.json.HubJsonConfiguration;
import org.openqa.selenium.json.JsonInput;

import java.util.Map;

public class GridHubConfiguration extends GridConfiguration {
  public static final String DEFAULT_HUB_CONFIG_FILE = "org/openqa/grid/common/defaults/DefaultHub.json";

  private static HubJsonConfiguration DEFAULT_CONFIG_FROM_JSON
      = HubJsonConfiguration.loadFromResourceOrFile(DEFAULT_HUB_CONFIG_FILE);

  @VisibleForTesting
  static final String ROLE = "hub";

  /*
   * config parameters which do not serialize or de-serialize
   */

  /**
   * Hub specific json config file to use. Defaults to {@code null}.
   */
  public String hubConfig;

  /*
   * config parameters which serialize and deserialize to/from json
   */

  /**
   * Capability matcher to use. Defaults to {@link DefaultCapabilityMatcher}
   */
  public CapabilityMatcher capabilityMatcher;

  /**
   * Timeout for new session requests. Defaults to unlimited.
   */
  public Integer newSessionWaitTimeout;

  /**
   * Prioritizer for new honoring session requests based on some priority. Defaults to {@code null}.
   */
  public Prioritizer prioritizer;

  /**
   * Whether to throw an Exception when there are no capabilities available that match the request. Defaults to {@code true}.
   */
  public Boolean throwOnCapabilityNotPresent;

  public String registry;

  private GridHubCliOptions cliConfig;

  /**
   * Creates a new configuration using the default values.
   */
  public GridHubConfiguration() {
    this(DEFAULT_CONFIG_FROM_JSON);
  }

  public GridHubConfiguration(HubJsonConfiguration jsonConfig) {
    super(jsonConfig);
    role = ROLE;
    cleanUpCycle = ofNullable(jsonConfig.getCleanUpCycle())
        .orElse(DEFAULT_CONFIG_FROM_JSON.getCleanUpCycle());
    newSessionWaitTimeout = ofNullable(jsonConfig.getNewSessionWaitTimeout())
        .orElse(DEFAULT_CONFIG_FROM_JSON.getNewSessionWaitTimeout());
    throwOnCapabilityNotPresent = ofNullable(jsonConfig.getThrowOnCapabilityNotPresent())
        .orElse(DEFAULT_CONFIG_FROM_JSON.getThrowOnCapabilityNotPresent());
    registry = ofNullable(jsonConfig.getRegistry())
        .orElse(DEFAULT_CONFIG_FROM_JSON.getRegistry());
    capabilityMatcher = ofNullable(jsonConfig.getCapabilityMatcher())
        .orElse(DEFAULT_CONFIG_FROM_JSON.getCapabilityMatcher());
    prioritizer = ofNullable(jsonConfig.getPrioritizer())
        .orElse(DEFAULT_CONFIG_FROM_JSON.getPrioritizer());
  }

  public GridHubConfiguration(GridHubCliOptions cliConfig) {
    this(ofNullable(cliConfig.getConfigFile()).map(HubJsonConfiguration::loadFromResourceOrFile)
             .orElse(DEFAULT_CONFIG_FROM_JSON));
    this.cliConfig = cliConfig;
    super.merge(cliConfig);
    ofNullable(cliConfig.getNewSessionWaitTimeout()).ifPresent(v -> newSessionWaitTimeout = v);
    ofNullable(cliConfig.getThrowOnCapabilityNotPresent()).ifPresent(v -> throwOnCapabilityNotPresent = v);
    ofNullable(cliConfig.getRegistry()).ifPresent(v -> registry = v);
    ofNullable(cliConfig.getCapabilityMatcher()).ifPresent(v -> capabilityMatcher = v);
    ofNullable(cliConfig.getPrioritizer()).ifPresent(v -> prioritizer = v);
  }

  /**
   * @param filePath hub config json file to load configuration from
   */
  public static GridHubConfiguration loadFromJSON(String filePath) {
    return loadFromJSON(StandaloneConfiguration.loadJsonFromResourceOrFile(filePath));
  }

  public static GridHubConfiguration loadFromJSON(JsonInput jsonInput) {
    try {
      GridHubConfiguration fromJson = new GridHubConfiguration(HubJsonConfiguration.loadFromJson(jsonInput));
      GridHubConfiguration result = new GridHubConfiguration(); // defaults
      result.merge(fromJson);
      // copy non-mergeable fields
      if (fromJson.host != null) {
        result.host = fromJson.host;
      }
      if (fromJson.port != null) {
        result.port = fromJson.port;
      }
      return result;
    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(), e);
    }
  }

  /**
   * Merge this configuration with the specified {@link GridNodeConfiguration}
   * @param other
   *
   * @deprecated There is no use case to merge a node configuration to a hub configuration
   */
  @Deprecated
  public void merge(GridNodeConfiguration other) {
    super.merge(other);
  }

  /**
   * Merge this configuration with the specified {@link GridHubConfiguration}
   * @param other
   */
  public void merge(GridHubConfiguration other) {
    if (other == null) {
      return;
    }
    super.merge(other);

    if (isMergeAble(CapabilityMatcher.class, other.capabilityMatcher, capabilityMatcher)) {
      capabilityMatcher = other.capabilityMatcher;
    }
    if (isMergeAble(Integer.class, other.newSessionWaitTimeout, newSessionWaitTimeout)) {
      newSessionWaitTimeout = other.newSessionWaitTimeout;
    }
    if (isMergeAble(Prioritizer.class, other.prioritizer, prioritizer)) {
      prioritizer = other.prioritizer;
    }
    if (isMergeAble(Boolean.class, other.throwOnCapabilityNotPresent, throwOnCapabilityNotPresent)) {
      throwOnCapabilityNotPresent = other.throwOnCapabilityNotPresent;
    }
    if (isMergeAble(String.class, other.registry, registry)) {
      registry = other.registry;
    }
  }

  @Override
  protected void serializeFields(Map<String, Object> appendTo) {
    super.serializeFields(appendTo);

    appendTo.put("capabilityMatcher", capabilityMatcher.getClass().getName());
    appendTo.put("newSessionWaitTimeout", newSessionWaitTimeout);
    appendTo.put("prioritizer", prioritizer == null ?  null : prioritizer.getClass().getName());
    appendTo.put("throwOnCapabilityNotPresent", throwOnCapabilityNotPresent);
    appendTo.put("registry", registry);
  }

  @Override
  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(super.toString(format));
    sb.append(toString(format, "hubConfig", hubConfig));
    sb.append(toString(format, "capabilityMatcher", capabilityMatcher.getClass().getCanonicalName()));
    sb.append(toString(format, "newSessionWaitTimeout", newSessionWaitTimeout));
    sb.append(toString(format, "prioritizer", prioritizer != null ? prioritizer.getClass().getCanonicalName(): null));
    sb.append(toString(format, "throwOnCapabilityNotPresent", throwOnCapabilityNotPresent));
    sb.append(toString(format, "registry", registry));

    return sb.toString();
  }

  public GridHubCliOptions getCliConfig() {
    return cliConfig;
  }
}
