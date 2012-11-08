/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.common;

import com.google.common.collect.Maps;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.common.exception.GridException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.cli.RemoteControlLauncher;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * helper to register to the grid. Using JSON to exchange the object between the node and grid.
 */
public class RegistrationRequest {

  private String id;
  private String name;
  private String description;

  private GridRole role;
  private List<DesiredCapabilities> capabilities = new ArrayList<DesiredCapabilities>();
  private Map<String, Object> configuration = new HashMap<String, Object>();

  private String[] args;

  private static final Logger log = Logger.getLogger(RegistrationRequest.class.getName());

  // some special param for capability
  public static final String APP = "applicationName";
  public static final String MAX_INSTANCES = "maxInstances";
  // see enum SeleniumProtocol
  public static final String SELENIUM_PROTOCOL = "seleniumProtocol";
  public static final String PATH = "path";
  public static final String BROWSER = CapabilityType.BROWSER_NAME;
  public static final String PLATFORM = CapabilityType.PLATFORM;
  public static final String VERSION = CapabilityType.VERSION;

  // some special param for config
  public static final String REGISTER_CYCLE = "registerCycle";
  public static final String PROXY_CLASS = CapabilityType.PROXY;
  public static final String CLEAN_UP_CYCLE = "cleanUpCycle";
  // Client timeout
  public static final String TIME_OUT = "timeout";
  public static final String BROWSER_TIME_OUT = "browserTimeout";

  // TODO delete to keep only HUB_HOST and HUB_PORT
  public static final String REMOTE_HOST = "remoteHost";

  public static final String MAX_SESSION = "maxSession";
  public static final String AUTO_REGISTER = "register";
  public static final String NODE_POLLING = "nodePolling";
  public static final String UNREGISTER_IF_STILL_DOWN_AFTER = "unregisterIfStillDownAfter";

  public static final String MAX_TESTS_BEFORE_CLEAN = "maxTestBeforeClean";
  public static final String CLEAN_SNAPSHOT = "cleanSnapshot";

  public static final String HOST = "host";
  public static final String PORT = "port";

  public static final String HUB_HOST = "hubHost";
  public static final String HUB_PORT = "hubPort";

  public static final String SERVLETS = "servlets";
  public static final String ID = "id";

  public RegistrationRequest() {
    args = new String[0];
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
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

  public Map<String, Object> getConfiguration() {
    return configuration;
  }

  public void setConfiguration(Map<String, Object> configuration) {
    this.configuration = configuration;
  }

  public String toJSON() {
    JSONObject res = getAssociatedJSON();
    return res.toString();
  }

  public JSONObject getAssociatedJSON() {

    JSONObject res = new JSONObject();
    try {
      res.put("class", getClass().getCanonicalName());
      res.put("id", id);
      res.put("name", name);
      res.put("description", description);
      res.put("configuration", configuration);
      JSONArray caps = new JSONArray();
      for (DesiredCapabilities c : capabilities) {
        caps.put(c.asMap());
      }
      res.put("capabilities", caps);
    } catch (JSONException e) {
      throw new RuntimeException("Error encoding to JSON " + e.getMessage(), e);
    }

    return res;
  }

  public String getConfigAsString(String param) {
    Object res = configuration.get(param);
    return res == null ? null : res.toString();

  }

  public int getConfigAsInt(String param, int defaultValue) {
    Object o = configuration.get(param);
    if (o == null) {
      return defaultValue;
    }
    if (o instanceof Integer) {
      return (Integer) o;
    }
    try {
      return Integer.parseInt(o.toString());
    } catch (Throwable t) {
      log.warning("Error." + name + " is supposed to be an int. Keeping default of " + defaultValue);
      return defaultValue;
    }

  }


  /**
  * fixing a backward compatibility issue causing #2738 After 2.9 release, the remoteProxy for a
  * node changed for 2 type of nodes to single node answering both sel1 and webdriver protocol.
  * <p>
  * That means the hub now need to handle registration request containing
  * "url":"http://ip:port/selenium-server/driver" ( < v2.9 , RC ),"url":"http://ip:port/wd/hub"
  * (< v2.9, wb)
  * <p>
  * and "remoteHost":"http://ip:port" ( > v2.9 ).
  *
  * The pre 2.9 registration requests need to be updated and take the "url" config param and
  * generate the "remoteHost" out of it.
  */
  private void ensureBackwardCompatibility() {
    // new param after 2.9
    String url = (String) configuration.get(REMOTE_HOST);

    if (url != null) {
      return;
    } else {
      // could be a pre 2.9 node
      url = (String) configuration.get("url");
      if (url == null) {
        return;
      } else {
        // was a legacy RC node. Needs to set that on the capabilities, as webdriver is the default.
        if (url.contains("selenium-server/driver")) {
          for (DesiredCapabilities capability : capabilities) {
            capability.setCapability(SELENIUM_PROTOCOL, SeleniumProtocol.Selenium.toString());
          }
        }
        URL tmp;
        try {
          tmp = new URL(url);
        } catch (MalformedURLException e) {
          throw new GridException("specified URL for the node isn't valid :" + url);
        }
        configuration.put(REMOTE_HOST, "http://" + tmp.getHost() + ":" + tmp.getPort());
      }
    }
  }


  /**
   * Create an object from a registration request formatted as a json string.
   * 
   * @param json
   * @return create a request from the JSON request received.
   */
  @SuppressWarnings("unchecked")
  // JSON lib
  public static RegistrationRequest getNewInstance(String json) {
    RegistrationRequest request = new RegistrationRequest();
    try {
      JSONObject o = new JSONObject(json);

      if (o.has("id")) request.setId(o.getString("id"));
      if (o.has("name")) request.setName(o.getString("name"));
      if (o.has("description")) request.setDescription(o.getString("description"));
      JSONObject config = o.getJSONObject("configuration");

      Map<String, Object> configuration = Maps.newHashMap();
      for (Iterator<String> iterator = config.keys(); iterator.hasNext();) {
        String key = iterator.next();
        configuration.put(key, config.get(key));
      }
      request.setConfiguration(configuration);

      JSONArray capabilities = o.getJSONArray("capabilities");

      for (int i = 0; i < capabilities.length(); i++) {
        JSONObject capability = capabilities.getJSONObject(i);
        DesiredCapabilities cap = new DesiredCapabilities();
        for (Iterator<String> iterator = capability.keys(); iterator.hasNext();) {
          String key = iterator.next();
          cap.setCapability(key, capability.get(key));
        }
        request.capabilities.add(cap);
      }
      request.ensureBackwardCompatibility();
      return request;
    } catch (JSONException e) {
      // Check if it was a Selenium Grid 1.0 request.
      return parseGrid1Request(json);
    }
  }

  /**
   * if a PROXY_CLASS is specified in the request, the proxy created following this request will be
   * of that type. If nothing is specified, it will use RemoteProxy
   * 
   * @return null if no class was specified.
   */
  public String getRemoteProxyClass() {
    Object o = getConfiguration().get(PROXY_CLASS);
    return o == null ? null : o.toString();
  }

  private static RegistrationRequest parseGrid1Request(String clientRequest) {
    // Check if it's a Selenium Grid 1.0 node connecting.
    // If so, the string will be of the format:
    // host=localhost&port=5000&environment=linux_firefox_3_6
    Map<String, String> registrationInfo = Maps.newHashMap();

    // Attempt to parse the client request string.
    String parts[] = clientRequest.split("&");
    for (String part : parts) {
      String configItem[] = part.split("=");

      // Do some basic taint checking so we can exit early if it's not
      // really a key=value pair.
      if (configItem.length != 2) {
        throw new InvalidParameterException();
      }

      try {
        registrationInfo.put(URLDecoder.decode(configItem[0], "UTF-8"),
            URLDecoder.decode(configItem[1], "UTF-8"));
      } catch (UnsupportedEncodingException e) {
        log.warning(String.format("Unable to decode registration request portion: %s", part));
      }
    }

    // Now validate the query string.
    if ((registrationInfo.get("port") != null) && (registrationInfo.get("environment") != null)) {
      RegistrationRequest request = new RegistrationRequest();

      Map<String, Object> configuration = Maps.newHashMap();
      configuration.put(SELENIUM_PROTOCOL, SeleniumProtocol.Selenium.toString());
      configuration
          .put(
              REMOTE_HOST,
              String.format("http://%s:%s", registrationInfo.get("host"),
                  registrationInfo.get("port")));
      request.setConfiguration(configuration);

      DesiredCapabilities cap = new DesiredCapabilities();
      // cap.put(CapabilityType.PLATFORM, "LINUX");
      // TODO freynaud envt or browser ?
      cap.setCapability(BROWSER, registrationInfo.get("environment"));
      cap.setCapability("environment", registrationInfo.get("environment"));
      request.capabilities.add(cap);

      return request;
    } else {
      throw new InvalidParameterException();
    }
  }

  // TODO freynaud : this is only used in tests. Move the method ?
  public static RegistrationRequest localWebdriverNoCapabilities() {
    RegistrationRequest res = build("-role", "webdriver","-host","localhost");
    res.capabilities.clear();
    return res;
  }

  public static RegistrationRequest build(String... args) {
    RegistrationRequest res = new RegistrationRequest();
    res.args = args;

    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);

    res.role = GridRole.find(args);


    String defaultConfig = "defaults/DefaultNode.json";
    String nodeType = helper.getParamValue("-role");
    if (GridRole.RCAliases().contains(nodeType)) {
      defaultConfig = "defaults/DefaultNodeSelenium.json";
    }
    if (GridRole.WDAliases().contains(nodeType)) {
      defaultConfig = "defaults/DefaultNodeWebDriver.json";
    }

   
    res.loadFromJSON(defaultConfig);

    // -file *.json ?
    if (helper.isParamPresent("-nodeConfig")) {
      String value = helper.getParamValue("-nodeConfig");
      res.loadFromJSON(value);
    }

    // from command line
    res.loadFromCommandLine(args);

    res.configuration.put(HOST, guessHost((String) res.configuration.get(HOST)));
    res.configuration.put(HUB_HOST, guessHost((String) res.configuration.get(HUB_HOST)));

    // some values can be calculated.
    if (res.configuration.get(REMOTE_HOST) == null) {
      String url = "http://" + res.configuration.get(HOST) + ":" + res.configuration.get(PORT);
      res.configuration.put(REMOTE_HOST, url);
    }

    // The hub in < v2.9 expects a "url" param, not "remoteHost".  While the configuration option was updated to
    // reflect its new intent, they're logically equivalent for the purposes of setting the proxy ID.  I.e., the old hub
    // used the "url" value for the proxy ID, while the new one uses "remoteHost".  So, just set "url" to be "remoteHost"
    // to make things work fine with older hubs.
    res.configuration.put("url", res.configuration.get(REMOTE_HOST));

    String u = (String) res.configuration.get("hub");
    if (u != null) {
      try {
        URL ur = new URL(u);
        res.configuration.put(HUB_HOST, ur.getHost());
        res.configuration.put(HUB_PORT, ur.getPort());
      } catch (MalformedURLException e) {
        throw new GridConfigurationException("the specified hub is not valid : -hub " + u);
      }
    }

    return res;
  }

  private static String guessHost(String host) {
    if ("ip".equalsIgnoreCase(host)) {
      NetworkUtils util = new NetworkUtils();
      return util.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
    } else if ("host".equalsIgnoreCase(host)) {
      NetworkUtils util = new NetworkUtils();
      return util.getIp4NonLoopbackAddressOfThisMachine().getHostName();
    } else {
      return host;
    }
  }

  private void loadFromCommandLine(String[] args) {
    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);

    // storing them all.
    List<String> params = helper.getKeys();
    for (String param : params) {
      String value = helper.getParamValue(param);
      try {
        int i = Integer.parseInt(value);
        configuration.put(param.replaceFirst("-", ""), i);
      } catch (NumberFormatException e) {
        configuration.put(param.replaceFirst("-", ""), value);
      }
    }
    // handle the core config, do a bit of casting.
    // handle the core config, do a bit of casting.
    if (helper.isParamPresent("-hubHost")) {
      configuration.put(HUB_HOST, helper.getParamValue("-hubHost"));
    }
    if (helper.isParamPresent("-" + HUB_PORT)) {
      configuration.put(HUB_PORT, Integer.parseInt(helper.getParamValue("-" + HUB_PORT)));
    }
    if (helper.isParamPresent("-host")) {
      configuration.put(HOST, helper.getParamValue("-host"));
    }
    if (helper.isParamPresent("-port")) {
      configuration.put(PORT, Integer.parseInt(helper.getParamValue("-port")));
    }
    if (helper.isParamPresent("-cleanUpCycle")) {
      configuration.put(CLEAN_UP_CYCLE, Integer.parseInt(helper.getParamValue("-cleanUpCycle")));
    }
    if (helper.isParamPresent("-timeout")) {
      configuration.put(TIME_OUT, Integer.parseInt(helper.getParamValue("-timeout")));
    }
    if (helper.isParamPresent("-browserTimeout")) {
      configuration.put(BROWSER_TIME_OUT, Integer.parseInt(helper.getParamValue("-browserTimeout")));
    }
    if (helper.isParamPresent("-maxSession")) {
      configuration.put(MAX_SESSION, Integer.parseInt(helper.getParamValue("-maxSession")));
    }
    if (helper.isParamPresent("-" + AUTO_REGISTER)) {
      configuration.put(AUTO_REGISTER,
          Boolean.parseBoolean(helper.getParamValue("-" + AUTO_REGISTER)));
    }

    if (helper.isParamPresent("-servlets")) {
      configuration.put(SERVLETS, helper.getParamValue("-servlets"));
    }

    // capabilities parsing.
    List<String> l = helper.getAll("-browser");

    if (!l.isEmpty()) {
      capabilities.clear();
      for (String s : l) {
        DesiredCapabilities c = addCapabilityFromString(s);
        capabilities.add(c);
      }
    }

    addPlatformInfoToCapabilities();
  }

  private DesiredCapabilities addCapabilityFromString(String capability) {
    System.out.println("adding " + capability);
    String[] s = capability.split(",");
    if (s.length == 0) {
      throw new GridConfigurationException("-browser must be followed by a browser description");
    }
    DesiredCapabilities res = new DesiredCapabilities();
    for (String capabilityPair : s) {
      if (capabilityPair.split("=").length != 2) {
        throw new GridConfigurationException("-browser format is key1=value1,key2=value2 "
            + capabilityPair + " deosn't follow that format.");
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

  private void addPlatformInfoToCapabilities() {
    Platform current = Platform.getCurrent();
    for (DesiredCapabilities cap : capabilities) {
      if (cap.getPlatform() == null) {
        cap.setPlatform(current);
      }
    }
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
  public void loadFromJSON(String resource) {
    try {
      JSONObject base = JSONConfigurationUtils.loadJSON(resource);

      if (base.has("capabilities")) {
        capabilities = new ArrayList<DesiredCapabilities>();
        JSONArray a = base.getJSONArray("capabilities");
        for (int i = 0; i < a.length(); i++) {
          JSONObject cap = a.getJSONObject(i);
          DesiredCapabilities c = new DesiredCapabilities();
          for (Iterator<?> iterator = cap.keys(); iterator.hasNext();) {
            String name = (String) iterator.next();
            Object value = cap.get(name);
            c.setCapability(name, value);
          }
          capabilities.add(c);
        }
        addPlatformInfoToCapabilities();
      }

      JSONObject o = base.getJSONObject("configuration");
      for (Iterator<?> iterator = o.keys(); iterator.hasNext();) {
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
    List<String> params = new ArrayList<String>();
    for (String key : configuration.keySet()) {
      params.add("-" + key);

      if (!configuration.get(key).toString().trim().isEmpty()) {
        params.add("" + configuration.get(key));
      }
    }
    return RemoteControlLauncher.parseLauncherOptions(params.toArray(new String[params.size()]));
  }

  public String[] getArgs() {
    return args;
  }

  /**
   * Validate the current setting and throw a config exception is an invalid setup is detected.
   * 
   * @throws GridConfigurationException
   */
  public void validate() throws GridConfigurationException {
    String hub = (String) configuration.get(HUB_HOST);
    Integer port = (Integer) configuration.get(HUB_PORT);
    if (hub == null || port == null) {
      throw new GridConfigurationException("You need to specify a hub to register to using -"
          + HUB_HOST + " X -" + HUB_PORT + " 5555. The specified config was -" + HUB_HOST + " "
          + hub + " -" + HUB_PORT + " " + port);
    }
  }
  
 

}
