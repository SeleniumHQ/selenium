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

package org.openqa.grid.common;

import static org.openqa.selenium.json.Json.MAP_TYPE;

import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;

import java.util.Map;
import java.util.TreeMap;

/**
 * Helper to register to the grid. Using JSON to exchange the object between the node and the hub.
 */
public class RegistrationRequest {

  // some special param for capability
  public static final String MAX_INSTANCES = "maxInstances";
  // see enum SeleniumProtocol
  public static final String SELENIUM_PROTOCOL = "seleniumProtocol";
  public static final String PATH = "path";

  private String name;
  private String description;
  private GridNodeConfiguration configuration;

  /**
   * Create a new registration request using the default values of a
   * {@link GridNodeConfiguration}
   */
  public RegistrationRequest() {
    this(new GridNodeConfiguration());
  }

  /**
   * Create a new registration request using the supplied {@link GridNodeConfiguration}
   *
   * @param configuration the {@link GridNodeConfiguration} to use. Internally calls {@code new
   *                      GridNodeConfiguration()} if a {@code null} value is provided since a
   *                      request without configuration is not valid.
   */
  public RegistrationRequest(GridNodeConfiguration configuration) {
    this(configuration, null, null);
  }

  /**
   * Create a new registration request using the supplied {@link GridNodeConfiguration}, and name
   *
   * @param configuration the {@link GridNodeConfiguration} to use. Internally calls {@code new
   *                      GridNodeConfiguration()} if a {@code null} value is provided since a
   *                      request without configuration is not valid.
   * @param name          the name for the remote
   */
  public RegistrationRequest(GridNodeConfiguration configuration, String name) {
    this(configuration, name, null);
  }

  /**
   * Create a new registration request using the supplied {@link GridNodeConfiguration}, name, and
   * description
   *
   * @param configuration the {@link GridNodeConfiguration} to use. Internally calls {@code new
   *                      GridNodeConfiguration()} if a {@code null} value is provided since a
   *                      request without configuration is not valid.
   * @param name          the name for the remote
   * @param description   the description for the remote host
   */
  public RegistrationRequest(GridNodeConfiguration configuration, String name, String description) {
    this.configuration = (configuration == null) ? new GridNodeConfiguration() : configuration;
    this.name = name;
    this.description = description;

    // make sure we have something that looks like a valid host
    this.configuration.fixUpHost();
    // make sure the capabilities are updated with required fields
    this.configuration.fixUpCapabilities();
  }

  public String getName() {
    return name;
  }

  public String getDescription() {
    return description;
  }

  public GridNodeConfiguration getConfiguration() {
    return configuration;
  }

  public Map<String, Object> toJson() {
    Map<String, Object> json = new TreeMap<>();
    json.put("class", getClass());
    json.put("name", getName());
    json.put("description", getDescription());
    json.put("configuration", getConfiguration());
    return json;
  }

  /**
   * Create an object from a registration request formatted as a json string.
   */
  public static RegistrationRequest fromJson(Map<String, Object> raw) throws JsonException {
    // If we could, we'd just get Json to coerce this for us, but that would lead to endless
    // recursion as the first thing it would do would be to call this very method. *sigh*
    Json json = new Json();
    RegistrationRequest request = new RegistrationRequest();

    if (raw.get("name") instanceof String) {
      request.name = (String) raw.get("name");
    }

    if (raw.get("description") instanceof String) {
      request.description = (String) raw.get("description");
    }

    if (raw.get("configuration") instanceof Map) {
      // This is nasty. Look away now!
      String converted = json.toJson(raw.get("configuration"));
      request.configuration = GridConfiguredJson.toType(converted, GridNodeConfiguration.class);
    }

    return request;
  }

  /**
   * Build a RegistrationRequest.
   */
  public static RegistrationRequest build() {
    return RegistrationRequest.build(new GridNodeConfiguration(), null, null);
  }

  /**
   * Build a RegistrationRequest from the provided {@link GridNodeConfiguration}. This is different
   * than {@code new RegistrationRequest(GridNodeConfiguration)} because it will first load any
   * specified {@link GridNodeConfiguration#nodeConfigFile} and then merge the provided
   * configuration onto it.
   *
   * @param configuration the {@link GridNodeConfiguration} to use. Internally calls {@code new
   *                      GridNodeConfiguration()} if a {@code null} value is provided since a
   *                      request without configuration is not valid.
   */
  public static RegistrationRequest build(GridNodeConfiguration configuration) {
    return RegistrationRequest.build(configuration, null, null);
  }

  /**
   * Build a RegistrationRequest from the provided {@link GridNodeConfiguration}, use the provided
   * name. This is different than {@code new RegistrationRequest(GridNodeConfiguration, String)}
   * because it will first load any specified {@link GridNodeConfiguration#nodeConfigFile} and then
   * merge the provided configuration onto it.
   *
   * @param configuration the {@link GridNodeConfiguration} to use. Internally calls {@code new
   *                      GridNodeConfiguration()} if a {@code null} value is provided since a
   *                      request without configuration is not valid.
   * @param name          the name for the remote
   */
  public static RegistrationRequest build(GridNodeConfiguration configuration, String name) {
    return RegistrationRequest.build(configuration, name, null);
  }

  /**
   * Build a RegistrationRequest from the provided {@link GridNodeConfiguration}, use the provided
   * name and description. This is different than {@code new RegistrationRequest(GridNodeConfiguration,
   * String, String)} because it will first load any specified {@link
   * GridNodeConfiguration#nodeConfigFile} and then merge the provided configuration onto it.
   *
   * @param configuration the {@link GridNodeConfiguration} to use. Internally calls {@code new
   *                      GridNodeConfiguration()} if a {@code null} value is provided since a
   *                      request without configuration is not valid.
   * @param name          the name for the remote
   * @param description   the description for the remote host
   */
  public static RegistrationRequest build(GridNodeConfiguration configuration, String name, String description) {
    RegistrationRequest pendingRequest = new RegistrationRequest(configuration, name, description);
    GridNodeConfiguration pendingConfiguration = pendingRequest.configuration;

    if (pendingConfiguration.nodeConfigFile != null) {
      pendingRequest.configuration = GridNodeConfiguration.loadFromJSON(pendingConfiguration.nodeConfigFile);
    }

    pendingRequest.configuration.merge(pendingConfiguration);
    //update important merge protected values for the pendingRequest we are building.
    if (pendingConfiguration.host != null) {
      pendingRequest.configuration.host = pendingConfiguration.host;
    }
    if (pendingConfiguration.port != null) {
      pendingRequest.configuration.port = pendingConfiguration.port;
    }

    // make sure we have a valid host
    pendingRequest.configuration.fixUpHost();
    // make sure the capabilities are updated with required fields
    pendingRequest.configuration.fixUpCapabilities();
    pendingRequest.configuration.dropCapabilitiesThatDoesNotMatchCurrentPlatform();

    return pendingRequest;
  }

  /**
   * Validate the current setting and throw a config exception is an invalid setup is detected.
   *
   * @throws GridConfigurationException grid configuration
   */
  public void validate() throws GridConfigurationException {
    // validations occur here in the getters called on the configuration.
    try {
      configuration.getHubHost();
      configuration.getHubPort();
    } catch (RuntimeException e) {
      throw new GridConfigurationException(e.getMessage());
    }
  }

}
