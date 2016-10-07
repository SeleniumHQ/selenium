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

import com.google.common.reflect.TypeToken;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.google.gson.annotations.Expose;

import com.beust.jcommander.Parameter;

import org.openqa.grid.common.JSONConfigurationUtils;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.configuration.converters.BrowserDesiredCapabilityConverter;
import org.openqa.grid.internal.utils.configuration.converters.NoOpParameterSplitter;
import org.openqa.grid.internal.utils.configuration.validators.FileExistsValueValidator;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;

import java.lang.reflect.Type;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class GridNodeConfiguration extends GridConfiguration {
  public static final String DEFAULT_NODE_CONFIG_FILE = "defaults/DefaultNodeWebDriver.json";

  /*
   * config parameters which do not serialize or de-serialize
   */

  @Parameter(
    names = "-nodeConfig",
    description = "<String> filename : JSON configuration file for the node. Overrides default values",
    validateValueWith = FileExistsValueValidator.class
  )
  public String nodeConfigFile;

  /*
   * config parameters which do not serialize to json
   */

  // remoteHost is a generated value based on host / port specified, or read from JSON.
  @Expose( serialize = false )
  String remoteHost;

  // used to read a Selenium 2.x nodeConfig.json file and throw a friendly exception
  @Expose( serialize = false )
  @Deprecated
  private Object configuration;

  /*
   * config parameters which serialize and deserialize to/from json
   */

  @Expose
  @Parameter(
    names = "-hubHost",
    description = "<String> IP or hostname : the host address of the hub we're attempting to register with. If \"role\" is set to [hub], this option will be ignored. Default is localhost"
  )
  String hubHost;

  @Expose
  @Parameter(
    names = "-hubPort",
    description = "<Integer> : the port of the hub we're attempting to register with. If \"role\" is set to [hub], this option will be ignored. Default to 4444"
  )
  Integer hubPort;

  @Expose
  @Parameter(
    names = "-id",
    description = "<String> : optional unique identifier for the node. Defaults to the url of the remoteHost"
  )
  public String id;

  @Expose
  @Parameter(
    names = { "-capabilities", "-browser" },
    description = "<String> : comma separated Capability values. Example: -capabilities browserName=firefox,platform=linux -capabilities browserName=chrome,platform=linux",
    listConverter = BrowserDesiredCapabilityConverter.class,
    converter = BrowserDesiredCapabilityConverter.class,
    splitter = NoOpParameterSplitter.class
  )
  public List<DesiredCapabilities> capabilities = new ArrayList<>();

  @Expose
  @Parameter(
    names = "-downPollingLimit",
    description = "<Integer> : node is marked as \"down\" if the node hasn't responded after the number of checks specified in [downPollingLimit]. Default is 2"
  )
  public Integer downPollingLimit;

  @Expose
  @Parameter(
    names = "-hub",
    description = "<String> (e.g. http://localhost:4444/grid/register) : the url that will be used to post the registration request. This option takes precedence over -hubHost and -hubPort options"
  )
  public String hub;

  @Expose
  @Parameter(
    names = "-nodePolling",
    description = "<Integer> in ms : specifies how often the hub will poll to see if the node is still responding"
  )
  public Integer nodePolling;

  @Expose
  @Parameter(
    names = "-nodeStatusCheckTimeout",
    description = "<Integer> in ms : connection/socket timeout, used for node \"nodePolling\" check"
  )
  public Integer nodeStatusCheckTimeout = 5000;

  @Expose
  @Parameter(
    names = "-proxy",
    description = "<String> : the class used to represent the node proxy. Default is [org.openqa.grid.selenium.proxy.DefaultRemoteProxy]"
  )
  public String proxy;

  @Expose
  @Parameter(
    names = "-register",
    description = "if specified, node will attempt to re-register itself automatically with its known grid hub if the hub becomes unavailable. Default is disabled"
  )
  public Boolean register;

  @Expose
  @Parameter(
    names = "-registerCycle",
    description = "<Integer> in ms : specifies how often the node will try to register itself again. Allows administrator to restart the hub without restarting (or risk orphaning) registered nodes. Must be specified with the \"-register\" option"
  )
  public Integer registerCycle = 5000;

  @Expose
  @Parameter(
    names = "-unregisterIfStillDownAfter",
    description = "<Integer> in ms : if the node remains down for more than [unregisterIfStillDownAfter] ms, it will stop attempting to re-register from the hub. Default is 6000 (1 minute)"
  )
  public Integer unregisterIfStillDownAfter;

  /**
   * Init with built-in defaults
   */
  public GridNodeConfiguration() {
    role = "node";
  }

  public String getHubHost() {
    if (hubHost == null) {
      if (hub == null) {
        throw new RuntimeException("You must specify either a hubHost or hub parameter");
      }
      parseHubUrl();
    }
    return hubHost;
  }

  public Integer getHubPort() {
    if (hubPort == null) {
      if (hub == null) {
        throw new RuntimeException("You must specify either a hubPort or hub parameter");
      }
      parseHubUrl();
    }
    return hubPort;
  }

  public String getRemoteHost() {
    if (remoteHost == null) {
      if (host == null) {
        host = "localhost";
      }
      if (port == null) {
        port = 5555;
      }
      remoteHost = "http://" + host + ":" + port;
    }
    return remoteHost;
  }

  private void parseHubUrl() {
    try {
      URL u = new URL(hub);
      hubHost = u.getHost();
      hubPort = u.getPort();
    } catch (MalformedURLException mURLe) {
      throw new RuntimeException("-hub must be a valid url: " + hub, mURLe);
    }
  }

  public void merge(GridNodeConfiguration other) {
    super.merge(other);
    if (isMergeAble(other.capabilities, capabilities)) {
      capabilities = other.capabilities;
    }
    if (isMergeAble(other.downPollingLimit, downPollingLimit)) {
      downPollingLimit = other.downPollingLimit;
    }
    if (isMergeAble(other.hub, hub)) {
      hub = other.hub;
    }
    if (isMergeAble(other.hubHost, hubHost)) {
      hubHost = other.hubHost;
    }
    if (isMergeAble(other.hubPort, hubPort)) {
      hubPort = other.hubPort;
    }
    if (isMergeAble(other.id, id)) {
      id = other.id;
    }
    if (isMergeAble(other.nodePolling, nodePolling)) {
      nodePolling = other.nodePolling;
    }
    if (isMergeAble(other.nodeStatusCheckTimeout, nodeStatusCheckTimeout)) {
      nodeStatusCheckTimeout = other.nodeStatusCheckTimeout;
    }
    if (isMergeAble(other.proxy, proxy)) {
      proxy = other.proxy;
    }
    if (isMergeAble(other.register, register)) {
      register = other.register;
    }
    if (isMergeAble(other.registerCycle, registerCycle)) {
      registerCycle = other.registerCycle;
    }
    if (isMergeAble(other.remoteHost, remoteHost)) {
      remoteHost = other.remoteHost;
    }
    if (isMergeAble(other.unregisterIfStillDownAfter, unregisterIfStillDownAfter)) {
      unregisterIfStillDownAfter = other.unregisterIfStillDownAfter;
    }

    // never merge configuration. it should always be null.
  }

  @Override
  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(super.toString(format));
    sb.append(toString(format, "capabilities", capabilities));
    sb.append(toString(format, "downPollingLimit", downPollingLimit));
    sb.append(toString(format, "hub", hub));
    sb.append(toString(format, "id", id));
    sb.append(toString(format, "hubHost", hubHost));
    sb.append(toString(format, "hubPort", hubPort));
    sb.append(toString(format, "nodeConfigFile", nodeConfigFile));
    sb.append(toString(format, "nodePolling", nodePolling));
    sb.append(toString(format, "nodeStatusCheckTimeout", nodeStatusCheckTimeout));
    sb.append(toString(format, "proxy", proxy));
    sb.append(toString(format, "register", register));
    sb.append(toString(format, "registerCycle", registerCycle));
    sb.append(toString(format, "remoteHost", remoteHost));
    sb.append(toString(format, "unregisterIfStillDownAfter", unregisterIfStillDownAfter));
    return sb.toString();
  }

  /**
   * @param filePath node config json file to load configuration from
   */
  public static GridNodeConfiguration loadFromJSON(String filePath) {
    return loadFromJSON(JSONConfigurationUtils.loadJSON(filePath));
  }

  /**
   * @param json JsonObject to load configuration from
   */
  public static GridNodeConfiguration loadFromJSON(JsonObject json) {

    try {
      GsonBuilder builder = new GsonBuilder();
      GridNodeConfiguration.staticAddJsonTypeAdapter(builder);
      GridNodeConfiguration config =
        builder.excludeFieldsWithoutExposeAnnotation().create().fromJson(json, GridNodeConfiguration.class);

      if (config.configuration != null) {
        // caught below
        throw new GridConfigurationException("Deprecated -nodeConfig file encountered. Please update"
                                             + " the file to work with Selenium 3. See https://github.com"
                                             + "/SeleniumHQ/selenium/wiki/Grid2#configuring-the-nodes-by-json"
                                             + " for more details.");
}

      return config;
    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(),
                                           e);
    }
  }

  @Override
  protected void addJsonTypeAdapter(GsonBuilder builder) {
    super.addJsonTypeAdapter(builder);
    GridNodeConfiguration.staticAddJsonTypeAdapter(builder);
  }

  protected static void staticAddJsonTypeAdapter(GsonBuilder builder) {
    builder.registerTypeAdapter(new TypeToken<List<DesiredCapabilities>>(){}.getType(),
                                new CollectionOfDesiredCapabilitiesSerializer());
    builder.registerTypeAdapter(new TypeToken<List<DesiredCapabilities>>(){}.getType(),
                                new CollectionOfDesiredCapabilitiesDeSerializer());
  }

  public static class CollectionOfDesiredCapabilitiesSerializer
    implements JsonSerializer<List<DesiredCapabilities>> {

    @Override
    public JsonElement serialize(List<DesiredCapabilities> desiredCapabilities, Type type,
                                 JsonSerializationContext jsonSerializationContext) {

      JsonArray capabilities = new JsonArray();
      BeanToJsonConverter converter = new BeanToJsonConverter();
      for (DesiredCapabilities dc : desiredCapabilities) {
        capabilities.add(converter.convertObject(dc));
      }
      return capabilities;
    }
  }

  public  static class CollectionOfDesiredCapabilitiesDeSerializer
    implements JsonDeserializer<List<DesiredCapabilities>> {

    @Override
    public List<DesiredCapabilities> deserialize(JsonElement jsonElement, Type type,
                                                 JsonDeserializationContext jsonDeserializationContext)
      throws JsonParseException {

      if (jsonElement.isJsonArray()) {
        List<DesiredCapabilities> desiredCapabilities = new ArrayList<>();
        JsonToBeanConverter converter = new JsonToBeanConverter();
        for (JsonElement arrayElement : jsonElement.getAsJsonArray()) {
          desiredCapabilities.add(converter.convert(DesiredCapabilities.class, arrayElement));
        }
        return desiredCapabilities;
      }
      throw new JsonParseException("capabilities should be expressed as an array of objects.");
    }
  }
}
