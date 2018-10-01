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

import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.json.JsonInput;

import java.util.List;
import java.util.Objects;

public class NodeJsonConfiguration extends GridJsonConfiguration {

  private NodeJsonConfiguration() {}

  public static NodeJsonConfiguration loadFromJson(JsonInput source) {
    NodeJsonConfiguration config = fromJson(source, NodeJsonConfiguration.class);

    if (config.configuration != null) {
      throw new GridConfigurationException(
          "Deprecated -nodeConfig file encountered. Please update the file to work with Selenium 3. "
          + "See https://github.com/SeleniumHQ/selenium/wiki/Grid2#configuring-the-nodes-by-json for more details.");
    }

    if (config.getRole() != null && !config.getRole().equals("node")) {
      throw new RuntimeException("Unable to load node configuration from " + source +
                                 " because it contains configuration for '" + config.getRole() + "' role");
    }

    return config;
  }

  public static NodeJsonConfiguration loadFromResourceOrFile(String source) {
    NodeJsonConfiguration config = fromResourceOrFile(source, NodeJsonConfiguration.class);

    if (config.configuration != null) {
      throw new GridConfigurationException(
          "Deprecated -nodeConfig file encountered. Please update the file to work with Selenium 3. "
          + "See https://github.com/SeleniumHQ/selenium/wiki/Grid2#configuring-the-nodes-by-json for more details.");
    }

    if (config.getRole() != null && !config.getRole().equals("node")) {
      throw new RuntimeException("Unable to load node configuration from " + source +
                                 " because it contains configuration for '" + config.getRole() + "' role");
    }

    return config;
  }

  private String hubHost;
  private Integer hubPort;
  private String id;
  private List<MutableCapabilities> capabilities;
  public Integer maxSession;
  private Integer downPollingLimit;
  private String hub;
  private Integer nodePolling;
  private Integer nodeStatusCheckTimeout;
  private String proxy;
  private Boolean register = true;
  private Integer registerCycle;
  private Integer unregisterIfStillDownAfter;
  private boolean enablePlatformVerification = true;

  // used to read a Selenium 2.x nodeConfig.json file and throw a friendly exception
  private Object configuration;

  /**
   * The host name or IP of the hub. Defaults to {@code null}.
   */
  public String getHubHost() {
    return hubHost;
  }

  /**
   * The port of the hub. Defaults to {@code null}.
   */
  public Integer getHubPort() {
    return hubPort;
  }

  /**
   * The id tu use for this node. Automatically generated when {@code null}. Defaults to {@code null}.
   */
  public String getId() {
    return id;
  }

  /**
   * The capabilties of this node.
   */
  public List<MutableCapabilities> getCapabilities() {
    return capabilities;
  }

  /**
   * Max "browser" sessions a node can handle. Default determined by configuration type.
   */
  public Integer getMaxSession() {
    return maxSession;
  }

  /**
   * The down polling limit for the node.
   */
  public Integer getDownPollingLimit() {
    return downPollingLimit;
  }

  /**
   * The hub url.
   */
  public String getHub() {
    return hub;
  }

  /**
   * How often to pull the node.
   */
  public Integer getNodePolling() {
    return nodePolling;
  }

  /**
   * When to time out a node status check.
   */
  public Integer getNodeStatusCheckTimeout() {
    return nodeStatusCheckTimeout;
  }

  /**
   * The proxy class name to use.
   */
  public String getProxy() {
    return proxy;
  }

  /**
   * Whether to register this node with the hub. Defaults to {@code true}
   */
  public Boolean getRegister() {
    return register;
  }

  /**
   * How often to re-register this node with the hub.
   */
  public Integer getRegisterCycle() {
    return registerCycle;
  }

  /**
   * How long to wait before marking this node down.
   */
  public Integer getUnregisterIfStillDownAfter() {
    return unregisterIfStillDownAfter;
  }

  /**
   * Whether or not to drop capabilities that does not belong to the current platform family.
   * Defaults to {@code true}
   */
  public boolean isEnablePlatformVerification() {
    return enablePlatformVerification;
  }

}
