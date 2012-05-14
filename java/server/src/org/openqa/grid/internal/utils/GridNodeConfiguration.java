/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.grid.internal.utils;

import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.cli.RemoteControlLauncher;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.CommandLineOptionHelper;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.JSONConfigurationUtils;
import org.openqa.grid.common.exception.GridConfigurationException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class GridNodeConfiguration {

  private GridRole role;

  private List<DesiredCapabilities> capabilities = new ArrayList<DesiredCapabilities>();
  private Map<String, Object> configuration = new HashMap<String, Object>();

  /**
   * The hub needs to know its hostname in order to write the proper Location header for the request
   * being forwarded. Usually this can be guessed correctly, but in case it cannot it can be passed
   * via this config param.
   */
  public static final String HOST = "host";

  public static final String HUB_HOST = "hubHost";

  /**
   * port for the hub.
   */
  public static final String PORT = "port";

  /**
   * how often in ms each proxy will detect that a session has timed out. All new proxy registering
   * will have that value if they don't specifically mention the parameter.
   */
  public static final String CYCLE = "cleanupCycle";

  /**
   * how long can a session be idle before being considered timed out. Working together with cleanup
   * cycle. Worst case scenario, a session can be idle for timout + cleanup cycle before the timeout
   * is detected
   */
  public static final String TIME_OUT = "timeout";

  public static final String MAX_CONCURRENT = "maxConcurrent";

  public static final String SERVLETS = "servlets";

  /**
   * original command line param, useful for debugging
   */
  private String[] args;

  // the config file path.
  private String nodeJSON;

  public static GridNodeConfiguration build(String[] args) {
    GridNodeConfiguration res = new GridNodeConfiguration();
    res.args = args;

    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);

    res.role = GridRole.find(args);
    // default
    String defaultConfig = "defaults/WebDriverDefaultNode.json";
    res.loadFromJSON(defaultConfig);

    // -file *.json ?
    if (helper.isParamPresent("-nodeConfig")) {
      String value = helper.getParamValue("-nodeConfig");
      res.nodeJSON = value;
      res.loadFromJSON(value);
    }

    // from command line
    res.loadFromCommandLine(args);

    return res;
  }

  private void loadFromCommandLine(String[] args) {
    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);
    // handle the core config.
    if (helper.isParamPresent("-host")) {
      configuration.put(HOST, helper.getParamValue("-host"));
    }
    if (helper.isParamPresent("-port")) {
      configuration.put(PORT, Integer.parseInt(helper.getParamValue("-port")));
    }
    if (helper.isParamPresent("-cleanUpCycle")) {
      configuration.put(CYCLE, Integer.parseInt(helper.getParamValue("-cleanUpCycle")));
    }
    if (helper.isParamPresent("-timeout")) {
      configuration.put(TIME_OUT, Integer.parseInt(helper.getParamValue("-timeout")));
    }
    if (helper.isParamPresent("-maxSession")) {
      configuration.put(MAX_CONCURRENT, Integer.parseInt(helper.getParamValue("-maxSession")));
    }

    if (helper.isParamPresent("-servlets")) {
      configuration.put(SERVLETS, helper.getParamValue("-servlets"));
    }

    // capabilities parsing.
    List<String> l = helper.getParamValues("-browser");

    if (!l.isEmpty()) {
      for (String s : l) {
        DesiredCapabilities c = addCapabilityFromString(s);
        capabilities.add(c);
      }
    }

  }

  private DesiredCapabilities addCapabilityFromString(String capability) {
    String[] s = capability.split(",");
    if (s.length == 0) {
      throw new GridConfigurationException("-browser must be followed by a browser description");
    }
    DesiredCapabilities res = new DesiredCapabilities();
    for (String capabilityPair : s) {
      if (capabilityPair.split("=").length != 2) {
        throw new GridConfigurationException("-browser format is key1=value1,key2=value2 " +
            capabilityPair + " deosn't follow that format.");
      }
      String key = capabilityPair.split("=")[0];
      String value = capabilityPair.split("=")[1];
      res.setCapability(key, value);
    }

    if (res.getBrowserName() == null) {
      throw new GridConfigurationException(
          "You need to specify a browserName using browserName=XXX");
    }
    return res;

  }

  public JSONObject getRegistrationRequest() {
    try {
      JSONObject res = new JSONObject();
      JSONArray a = new JSONArray();
      for (DesiredCapabilities cap : capabilities) {
        JSONObject capa = new JSONObject(cap.asMap());
        a.put(capa);
      }

      res.put("configuration", new JSONObject(configuration));
      return res;
    } catch (JSONException e) {
      throw new GridConfigurationException("error generating the node config : " + e.getMessage());
    }
  }

  /**
   * add config, but overwrite capabilities.
   * 
   * @param resource
   */
  private void loadFromJSON(String resource) {
    try {
      JSONObject base = JSONConfigurationUtils.loadJSON(resource);

      if (base.has("capabilities")) {
        capabilities = new ArrayList<DesiredCapabilities>();
        JSONArray a = base.getJSONArray("capabilities");
        for (int i = 0; i < a.length(); i++) {
          JSONObject cap = a.getJSONObject(i);
          DesiredCapabilities c = new DesiredCapabilities();
          for (Iterator iterator = cap.keys(); iterator.hasNext();) {
            String name = (String) iterator.next();
            c.setCapability(name, cap.get(name));
          }
        }
      }

      JSONObject o = base.getJSONObject("configuration");
      for (Iterator iterator = o.keys(); iterator.hasNext();) {
        String key = (String) iterator.next();
        Object value = o.get(key);
        if (value instanceof JSONArray) {
          JSONArray a = (JSONArray) value;
          List<String> as = new ArrayList<String>();
          for (int i = 0; i < a.length(); i++) {
            as.add(a.getString(i));
          }
          configuration.put(key, as);
        } else {
          configuration.put(key, o.get(key));
        }
      }

    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(),
          e);
    }
  }

  public GridRole getRole() {
    return role;
  }

  public void setRole(GridRole role) {
    this.role = role;
  }

  public RemoteControlConfiguration getRemoteControlConfiguration() {
    return RemoteControlLauncher.parseLauncherOptions(args);
  }

  public String[] getArgs() {
    return args;
  }

  public List<DesiredCapabilities> getCapabilities() {
    return capabilities;
  }

  public Map<String, Object> getConfiguration() {
    return configuration;
  }

  public String getHost() {
    return (String) configuration.get(HOST);
  }

  public int getPort() {
    return (Integer) configuration.get(PORT);
  }

  public String getHubHost() {
    return (String) configuration.get(HUB_HOST);
  }
}
