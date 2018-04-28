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

import com.google.gson.annotations.Expose;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;

public class GridHubConfiguration extends GridConfiguration {
  public static final String DEFAULT_HUB_CONFIG_FILE = "org/openqa/grid/common/defaults/DefaultHub.json";

  /*
   * IMPORTANT - Keep these constant values in sync with the ones specified in
   * 'defaults/DefaultHub.json'  -- if for no other reasons documentation & consistency.
   */

  /**
   * Default hub role
   */
  static final String DEFAULT_ROLE = "hub";

  /**
   * Default hub port
   */
  static final Integer DEFAULT_PORT = 4444;

  /**
   * Default hub cleanup cycle
   */
  static final Integer DEFAULT_CLEANUP_CYCLE = 5000;

  /**
   * Default hub new session wait timeout
   */
  static final Integer DEFAULT_NEW_SESSION_WAIT_TIMEOUT = -1;

  /**
   * Default hub throw on capability not present toggle
   */
  static final Boolean DEFAULT_THROW_ON_CAPABILITY_NOT_PRESENT_TOGGLE = true;

  /**
   * Default hub GridRegistry implementation to use
   */
  static final String DEFAULT_HUB_REGISTRY_CLASS = "org.openqa.grid.internal.DefaultGridRegistry";

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
  @Expose
  public CapabilityMatcher capabilityMatcher = new DefaultCapabilityMatcher();

  /**
   * Timeout for new session requests. Defaults to unlimited.
   */
  @Expose
  public Integer newSessionWaitTimeout = DEFAULT_NEW_SESSION_WAIT_TIMEOUT;

  /**
   * Prioritizer for new honoring session requests based on some priority. Defaults to {@code null}.
   */
  @Expose
  public Prioritizer prioritizer;

  /**
   * Whether to throw an Exception when there are no capabilities available that match the request. Defaults to {@code true}.
   */
  @Expose
  public Boolean throwOnCapabilityNotPresent = DEFAULT_THROW_ON_CAPABILITY_NOT_PRESENT_TOGGLE;

  @Expose
  public String registry = DEFAULT_HUB_REGISTRY_CLASS;

  /**
   * Creates a new configuration using the default values.
   */
  public GridHubConfiguration() {
    // overrides values set by base classes
    role = DEFAULT_ROLE;
    port = DEFAULT_PORT;
    cleanUpCycle = DEFAULT_CLEANUP_CYCLE;
  }

  /**
   * @param filePath hub config json file to load configuration from
   */
  public static GridHubConfiguration loadFromJSON(String filePath) {
    return StandaloneConfiguration.loadFromJson(filePath, GridHubConfiguration.class);
  }

  /**
   * Merge this configuration with the specified {@link GridNodeConfiguration}
   * @param other
   */
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

    if (isMergeAble(other.capabilityMatcher, capabilityMatcher)) {
      capabilityMatcher = other.capabilityMatcher;
    }
    if (isMergeAble(other.newSessionWaitTimeout, newSessionWaitTimeout)) {
      newSessionWaitTimeout = other.newSessionWaitTimeout;
    }
    if (isMergeAble(other.prioritizer, prioritizer)) {
      prioritizer = other.prioritizer;
    }
    if (isMergeAble(other.throwOnCapabilityNotPresent, throwOnCapabilityNotPresent)) {
      throwOnCapabilityNotPresent = other.throwOnCapabilityNotPresent;
    }
    if (isMergeAble(other.registry, registry)) {
      registry = other.registry;
    }
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
}
