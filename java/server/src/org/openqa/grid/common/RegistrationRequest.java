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

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;

import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.Platform;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * helper to register to the grid. Using JSON to exchange the object between the node and grid.
 */
public class RegistrationRequest {

  private String name;
  private String description;

  private GridRole role;
  private List<DesiredCapabilities> capabilities = new ArrayList<>();
  private GridNodeConfiguration configuration = new GridNodeConfiguration();

  // some special param for capability
  public static final String MAX_INSTANCES = "maxInstances";
  // see enum SeleniumProtocol
  public static final String SELENIUM_PROTOCOL = "seleniumProtocol";
  public static final String PATH = "path";

  public RegistrationRequest() {
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<DesiredCapabilities> getCapabilities() {
    return capabilities;
  }

  public void addDesiredCapability(DesiredCapabilities c) {
    this.capabilities.add(c);
  }

  public void addDesiredCapability(Map<String, Object> c) {
    this.capabilities.add(new DesiredCapabilities(c));
  }

  public void setCapabilities(List<DesiredCapabilities> capabilities) {
    this.capabilities = capabilities;
  }

  public GridNodeConfiguration getConfiguration() {
    return configuration;
  }

  public void setConfiguration(GridNodeConfiguration configuration) {
    this.configuration = configuration;
  }

  public String toJSON() {
    return new Gson().toJson(getAssociatedJSON());
  }

  public JsonObject getAssociatedJSON() {
    JsonObject res = new JsonObject();

    res.addProperty("class", getClass().getCanonicalName());
    res.addProperty("id", configuration.id);
    res.addProperty("name", name);
    res.addProperty("description", description);
    res.add("configuration", configuration.toJson());
    JsonArray caps = new JsonArray();
    for (DesiredCapabilities c : capabilities) {
      caps.add(new Gson().toJsonTree(c.asMap()));
    }
    res.add("capabilities", caps);

    return res;
  }


  /**
   * Create an object from a registration request formatted as a json string.
   *
   * @param json JSON
   * @return create a request from the JSON request received.
   */
  @SuppressWarnings("unchecked")
  // JSON lib
  public static RegistrationRequest getNewInstance(String json) throws JsonSyntaxException {
    RegistrationRequest request = new RegistrationRequest();
    JsonObject o = new JsonParser().parse(json).getAsJsonObject();

    if (o.has("name")) {
      request.setName(o.get("name").getAsString());
    }
    if (o.has("description")) {
      request.setDescription(o.get("description").getAsString());
    }

    JsonObject config = o.get("configuration").getAsJsonObject();
    GridNodeConfiguration configuration = GridNodeConfiguration.loadFromJSON(config);
    request.setConfiguration(configuration);

    if (o.has("id")) {
      request.configuration.id = o.get("id").getAsString();
    }

    JsonArray capabilities = o.get("capabilities").getAsJsonArray();

    for (int i = 0; i < capabilities.size(); i++) {
      DesiredCapabilities cap = new JsonToBeanConverter()
        .convert(DesiredCapabilities.class, capabilities.get(i));
      request.capabilities.add(cap);
    }
    return request;
  }

  /**
   * if a PROXY_CLASS is specified in the request, the proxy created following this request will be
   * of that type. If nothing is specified, it will use RemoteProxy
   *
   * @return null if no class was specified.
   */
  public String getRemoteProxyClass() {
    return configuration.proxy;
  }

  public static RegistrationRequest build(GridNodeConfiguration configuration) {
    RegistrationRequest res = newFromJSON("defaults/DefaultNodeWebDriver.json");

    if (configuration.nodeConfigFile != null) {
      res.loadFromJSON(configuration.nodeConfigFile);
    }

    res.configuration.merge(configuration);
    if (configuration.host != null) {
      res.configuration.host = configuration.host;
    }
    res.configuration.host = guessHost(res.configuration.host);
    if (configuration.port != null) {
      res.configuration.port = configuration.port;
    }

    res.role = GridRole.get(configuration.role);
    res.addPlatformInfoToCapabilities();

    if (configuration.browser.size() > 0) {
      res.capabilities = configuration.browser;
    }

    for (DesiredCapabilities cap : res.capabilities) {
      if (cap.getCapability(SELENIUM_PROTOCOL) == null) {
        cap.setCapability(SELENIUM_PROTOCOL, SeleniumProtocol.WebDriver.toString());
      }
    }

    return res;
  }

  private void addPlatformInfoToCapabilities() {
    Platform current = Platform.getCurrent();
    for (DesiredCapabilities cap : capabilities) {
      if (cap.getPlatform() == null) {
        cap.setPlatform(current);
      }
    }
  }

  private static String guessHost(String host) {
    if (host == null || "ip".equalsIgnoreCase(host)) {
      NetworkUtils util = new NetworkUtils();
      return util.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
    } else if ("host".equalsIgnoreCase(host)) {
      NetworkUtils util = new NetworkUtils();
      return util.getIp4NonLoopbackAddressOfThisMachine().getHostName();
    } else {
      return host;
    }
  }

  /**
   * add config, but overwrite capabilities.
   *
   * @param resource resource
   */
  public void loadFromJSON(String resource) {
    try {
      JsonObject base = JSONConfigurationUtils.loadJSON(resource);

      if (base.has("capabilities")) {
        capabilities = new ArrayList<>();
        JsonArray a = base.get("capabilities").getAsJsonArray();
        for (int i = 0; i < a.size(); i++) {
          DesiredCapabilities c = new JsonToBeanConverter()
              .convert(DesiredCapabilities.class, a.get(i));
          capabilities.add(c);
        }
        addPlatformInfoToCapabilities();
      }

      GridNodeConfiguration loadedConfiguration = new Gson().fromJson(base.get("configuration"), GridNodeConfiguration.class);
      configuration.merge(loadedConfiguration);
      if (loadedConfiguration.host != null) {
        configuration.host = loadedConfiguration.host;
      }
      if (loadedConfiguration.port != null) {
        configuration.port = loadedConfiguration.port;
      }


    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(),
          e);
    }
  }

  public static RegistrationRequest newFromJSON(String resource) {
    RegistrationRequest req = new RegistrationRequest();
    req.loadFromJSON(resource);
    return req;
  }

  public GridRole getRole() {
    return role;
  }

  public void setRole(GridRole role) {
    this.role = role;
  }

  /**
   * Validate the current setting and throw a config exception is an invalid setup is detected.
   *
   * @throws GridConfigurationException grid configuration
   */
  public void validate() throws GridConfigurationException {
    String hub = configuration.getHubHost();
    Integer port = configuration.getHubPort();
    if (hub == null || port == null) {
      throw new GridConfigurationException("You need to specify a hub to register to using -hubHost X -hubPort 5555."
          + "The specified config was -hubHost" + hub + " -hubPort " + port);
    }
  }

}
