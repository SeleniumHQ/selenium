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

package org.openqa.grid.internal.utils;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import org.openqa.grid.common.CommandLineOptionHelper;
import org.openqa.grid.common.JSONConfigurationUtils;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.yaml.snakeyaml.Yaml;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GridHubConfiguration {

    /**
   * The hub needs to know its hostname in order to write the proper Location header for the request
   * being forwarded. Usually this can be guessed correctly, but in case it cannot it can be passed
   * via this config param.
   */
  private String host = null;

  /**
   * port for the hub.
   */
  private int port;

  /**
   * how often in ms each proxy will detect that a session has timed out. All new proxy registering
   * will have that value if they don't specifically mention the parameter.
   */
  private int cleanupCycle;

  /**
   * how long a new session request can stay in the queue without being assigned before being
   * rejected. -1 = forever.
   */
  private int newSessionWaitTimeout;

  /**
   * list of extra servlets this hub will display. Allows to present custom view of the hub for
   * monitoring and management purpose
   */
  private List<String> servlets = new ArrayList<>();

  /**
   * name <-> browser mapping from grid1
   */
  private Map<String, String> grid1Mapping = new HashMap<>();

  /**
   * to specify the order in which the new session request will be handled.
   */
  private Prioritizer prioritizer = null;

  /**
   * to specify how new request and nodes will be matched.
   */
  private CapabilityMatcher matcher = new DefaultCapabilityMatcher();

  /**
   * true by default.If true, the hub will throw exception as soon as a request not supported by the
   * grid is received. If set to false, the request will be queued, hoping that a node will be
   * registered at some point, supporting that capability.
   */
  private boolean throwOnCapabilityNotPresent = true;

  /**
   * The filename to use for logging. Default value is <code>null</code> and indicates logging to STDOUT.
   */
  private String logFilename;

  /**
   * max number of thread for Jetty. Default is normally 255.
   */
  private int jettyMaxThreads = -1;

  private Map<String, Object> allParams = new HashMap<>();

  /**
   * original command line param, useful for debugging
   */
  private String[] args = {};
  private String grid1Yml = null;
  private String grid2JSON = null;


  public GridHubConfiguration() {
    loadDefault();
  }

  /**
   * builds a grid configuration from the parameters passed command line.
   *
   * @param args command line arguments
   * @return A GridHubConfiguration object with options from the grid1 and/or
   *         grid2 config file(s), plus any command line option overrides.
   */
  public static GridHubConfiguration build(String[] args) {
    GridHubConfiguration res = new GridHubConfiguration();
    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);
    res.args = args;

    // is there a grid1 config file to load ?
    if (helper.isParamPresent("-grid1Yml")) {
      String value = helper.getParamValue("-grid1Yml");
      res.grid1Yml = value;
      res.loadFromGridYml(value);
    }

    // is there a grid2 config file ?
    if (helper.isParamPresent("-hubConfig")) {
      String value = helper.getParamValue("-hubConfig");
      res.grid2JSON = value;
      res.loadFromJSON(value);
    }

    // are there some command line param to overwrite the config file ?
    res.loadFromCommandLine(args);

    return res;

  }

  public String getGrid1Yml() {
    return grid1Yml;
  }

  public String getGrid2JSON() {
    return grid2JSON;
  }

  public void loadDefault() {
    loadFromJSON("defaults/DefaultHub.json");
  }

  public void loadFromCommandLine(String[] args) {
    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);


    // storing them all.
    List<String> params = helper.getKeys();
    for (String param : params) {
      String cleanParam = param.replaceFirst("-", "");
      String value = helper.getParamValue(param);
      allParams.put(cleanParam, value);
    }
    // handle the core config.
    if (helper.isParamPresent("-host")) {
      host = helper.getParamValue("-host");
    }
    if (helper.isParamPresent("-port")) {
      port = Integer.parseInt(helper.getParamValue("-port"));
    }
    if (helper.isParamPresent("-jettyMaxThreads")) {
      jettyMaxThreads = Integer.parseInt(helper.getParamValue("-jettyMaxThreads"));
    }
    if (helper.isParamPresent("-cleanUpCycle")) {
      cleanupCycle = Integer.parseInt(helper.getParamValue("-cleanUpCycle"));
    }
    if (helper.isParamPresent("-timeout")) {
      setTimeout(Integer.parseInt(helper.getParamValue("-timeout")) * 1000);
    }
    if (helper.isParamPresent("-browserTimeout")) {
      setBrowserTimeout(Integer.parseInt(helper.getParamValue("-browserTimeout")) * 1000);
    }
    if (helper.isParamPresent("-newSessionWaitTimeout")) {
      newSessionWaitTimeout = Integer.parseInt(helper.getParamValue("-newSessionWaitTimeout"));
    }
    if (helper.isParamPresent("-throwOnCapabilityNotPresent")) {
      throwOnCapabilityNotPresent =
          Boolean.parseBoolean(helper.getParamValue("-throwOnCapabilityNotPresent"));
    }
    if (helper.isParamPresent("-prioritizer")) {
      setPrioritizer(helper.getParamValue("-prioritizer"));
    }
    if (helper.isParamPresent("-capabilityMatcher")) {
      setCapabilityMatcher(helper.getParamValue("-capabilityMatcher"));
    }
    if (helper.isParamPresent("-servlets")) {
      servlets = helper.getParamValues("-servlets");
    }
    if (helper.isParamPresent("-log")) {
      logFilename = helper.getParamValue("-log");
    }
  }

  /**
   * @param resource /grid_configuration.yml for instance
   */
  public void loadFromGridYml(String resource) {
    InputStream in = Thread.currentThread().getContextClassLoader().getResourceAsStream(resource);

    if (in == null) {
      try {
        in = new FileInputStream(resource);
      } catch (FileNotFoundException e) {
        // ignore
      }
    }
    if (in == null) {
      throw new InvalidParameterException(resource + " is not a valid resource.");
    }

    Yaml yaml = new Yaml();
    Map<String, Object> config = (Map<String, Object>) yaml.load(in);
    Map<String, Object> hub = (Map<String, Object>) config.get("hub");
    List<Map<String, String>> environments = (List<Map<String, String>>) hub.get("environments");

    // Now pull out each of the grid config values.
    Integer p = (Integer) hub.get("port");
    if (p != null) {
      this.port = p;
    }

    // Store a copy of the environment names => browser strings
    for (Map<String, String> environment : environments) {
      getGrid1Mapping().put(environment.get("name"), environment.get("browser"));
    }

    // Now pull out each of the grid config values.
    Integer poll = (Integer) hub.get("remoteControlPollingIntervalInSeconds");
    if (poll != null) {
      allParams.put(RegistrationRequest.NODE_POLLING, poll.intValue() * 1000);
      cleanupCycle = poll.intValue() * 1000;
    }

    Integer timeout = (Integer) hub.get("sessionMaxIdleTimeInSeconds");
    if (timeout != null) {
      setTimeout(timeout.intValue() * 1000);
    }

    Integer port = (Integer) hub.get(RegistrationRequest.PORT);
    if (port != null) {
      setPort(port.intValue());
    }

    Integer newSessionWait = (Integer) hub.get("newSessionMaxWaitTimeInSeconds");
    if (newSessionWait != null) {
      setNewSessionWaitTimeout(newSessionWait.intValue() * 1000);
    }

    allParams.put(RegistrationRequest.MAX_SESSION, 1);
  }

  /**
   * @param resource default/DefaultHub.json for instance
   */
  public void loadFromJSON(String resource) {

    try {
      JsonObject o = JSONConfigurationUtils.loadJSON(resource);

      // handling the core config.
      if (o.has(RegistrationRequest.HOST) && !o.get(RegistrationRequest.HOST).isJsonNull()) {
        host = o.get(RegistrationRequest.HOST).getAsString();
      }
      if (o.has(RegistrationRequest.PORT) && !o.get(RegistrationRequest.PORT).isJsonNull()) {
        port = o.get(RegistrationRequest.PORT).getAsInt();
      }
      if (o.has(RegistrationRequest.CLEAN_UP_CYCLE) &&
          !o.get(RegistrationRequest.CLEAN_UP_CYCLE).isJsonNull()) {
        cleanupCycle = o.get(RegistrationRequest.CLEAN_UP_CYCLE).getAsInt();
      }
      if (o.has(RegistrationRequest.TIME_OUT) && !o.get(RegistrationRequest.TIME_OUT).isJsonNull()) {
        setTimeout(o.get(RegistrationRequest.TIME_OUT).getAsInt());
      }
      if (o.has(RegistrationRequest.BROWSER_TIME_OUT)
          && !o.get(RegistrationRequest.BROWSER_TIME_OUT).isJsonNull()) {
        setBrowserTimeout(o.get(RegistrationRequest.BROWSER_TIME_OUT).getAsInt());
      }
      if (o.has("newSessionWaitTimeout") && !o.get("newSessionWaitTimeout").isJsonNull()) {
        newSessionWaitTimeout = o.get("newSessionWaitTimeout").getAsInt();
      }
      if (o.has(RegistrationRequest.SERVLETS) && !o.get(RegistrationRequest.SERVLETS).isJsonNull()) {
        JsonArray jsservlets = o.get(RegistrationRequest.SERVLETS).getAsJsonArray();
        for (int i = 0; i < jsservlets.size(); i++) {
          servlets.add(jsservlets.get(i).getAsString());
        }
      }
      if (o.has("jettyMaxThreads") && !o.get("jettyMaxThreads").isJsonNull()) {
        jettyMaxThreads = o.get("jettyMaxThreads").getAsInt();
      }
      if (o.has("prioritizer") && !o.get("prioritizer").isJsonNull()) {
        setPrioritizer(o.get("prioritizer").getAsString());
      }
      if (o.has("capabilityMatcher") && !o.get("capabilityMatcher").isJsonNull()) {
        setCapabilityMatcher(o.get("capabilityMatcher").getAsString());
      }
      if (o.has("throwOnCapabilityNotPresent") && !o.get("throwOnCapabilityNotPresent").isJsonNull()) {
        throwOnCapabilityNotPresent = o.get("throwOnCapabilityNotPresent").getAsBoolean();
      }

      // store them all.
      for (Map.Entry<String, JsonElement> entry : o.entrySet()) {
        Object value = new JsonToBeanConverter().convert(Object.class, entry.getValue());
        // For backward compatibility numbers should be converted to integers
        if (value instanceof Long) {
          value = ((Long) value).intValue();
        }
        allParams.put(entry.getKey(), value);
      }

    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(),
          e);
    }
  }

  public String getHost() {
    return host;
  }

  public int getPort() {
    return port;
  }

  public int getCleanupCycle() {
    return cleanupCycle;
  }

  public int getTimeout() {
    return getIntWith0Default(RegistrationRequest.TIME_OUT);
  }

  public int getBrowserTimeout() {
    return getIntWith0Default(RegistrationRequest.BROWSER_TIME_OUT);
  }

  public void setBrowserTimeout(int browserTimeout) {
      put(RegistrationRequest.BROWSER_TIME_OUT, browserTimeout);
  }

  public int getNewSessionWaitTimeout() {
    return newSessionWaitTimeout;
  }

  public List<String> getServlets() {
    return servlets;
  }

  public String getLogFilename() {
    return logFilename;
  }

  public Map<String, String> getGrid1Mapping() {
    return grid1Mapping;
  }

  public Prioritizer getPrioritizer() {
    return prioritizer;
  }

  public CapabilityMatcher getCapabilityMatcher() {
    return matcher;
  }

  public boolean isThrowOnCapabilityNotPresent() {
    return throwOnCapabilityNotPresent;
  }

  public void setHost(String host) {
    this.host = host;
  }

  public void setPort(int port) {
    this.port = port;
  }

  public void setCleanupCycle(int cleanupCycle) {
    this.cleanupCycle = cleanupCycle;
    put(RegistrationRequest.CLEAN_UP_CYCLE, cleanupCycle);
  }

  public void setTimeout(int timeout) {
    put(RegistrationRequest.TIME_OUT, timeout);
  }

  private void put(String key, Object value){
    allParams.put(key, value);
  }

  private Integer getIntWith0Default(String jsonKey) {
    //noinspection unchecked
    final Object o = allParams.get(jsonKey);
    if (o instanceof  String){
      return Integer.parseInt((String) o);
    }
    return o != null ? (Integer) o : 0;
  }

  public void setNewSessionWaitTimeout(int newSessionWaitTimeout) {
    this.newSessionWaitTimeout = newSessionWaitTimeout;
  }

  public void setServlets(List<String> servlets) {
    this.servlets = servlets;
  }

  public void setPrioritizer(String prioritizerClass) {
    try {
      Class<Prioritizer> p = (Class<Prioritizer>) Class.forName(prioritizerClass);
      Class<?>[] argsClass = new Class[] {};
      Constructor<?> c = p.getConstructor(argsClass);
      Object[] args = new Object[] {};
      prioritizer = (Prioritizer) c.newInstance(args);
    } catch (Throwable e) {
      throw new GridConfigurationException("Error creating the prioritize from class " +
          prioritizerClass + " : " + e.getMessage(), e);
    }
  }

  public void setPrioritizer(Prioritizer prioritizer) {
    this.prioritizer = prioritizer;
  }

  public void setCapabilityMatcher(String matcherClass) {
    try {
      Class<CapabilityMatcher> p = (Class<CapabilityMatcher>) Class.forName(matcherClass);
      Class<?>[] argsClass = new Class[] {};
      Constructor<?> c = p.getConstructor(argsClass);
      Object[] args = new Object[] {};
      matcher = (CapabilityMatcher) c.newInstance(args);
    } catch (Throwable e) {
      throw new GridConfigurationException("Error creating the capability matcher from class " +
          matcherClass + " : " + e.getMessage(), e);
    }
  }

  public void setCapabilityMatcher(CapabilityMatcher matcher) {
    this.matcher = matcher;
  }

  public void setThrowOnCapabilityNotPresent(boolean throwOnCapabilityNotPresent) {
    this.throwOnCapabilityNotPresent = throwOnCapabilityNotPresent;
  }

  public String[] getArgs() {
    return args;
  }

  public String prettyPrint() {
    StringBuilder b = new StringBuilder();
    b.append("host: ").append(host).append("\n");
    b.append("port: ").append(port).append("\n");
    b.append("cleanupCycle: ").append(cleanupCycle).append("\n");
    b.append("timeout: ").append(getTimeout()).append("\n");
    b.append("browserTimeout: ").append(getBrowserTimeout()).append("\n");

    b.append("newSessionWaitTimeout: ").append(newSessionWaitTimeout).append("\n");
    b.append("grid1Mapping: ").append(grid1Mapping).append("\n");
    b.append("throwOnCapabilityNotPresent: ").append(throwOnCapabilityNotPresent).append("\n");

    b.append("capabilityMatcher: ")
        .append(matcher == null ? "null" : matcher.getClass().getCanonicalName()).append("\n");
    b.append("prioritizer: ")
        .append(prioritizer == null ? "null" : prioritizer.getClass().getCanonicalName())
        .append("\n");
    b.append("servlets: ");
    for (String s : servlets) {
      b.append(s.getClass().getCanonicalName()).append(",");
    }
    b.append("\n\n");
    b.append("all params :\n");
    List<String> keys = new ArrayList<>();
    keys.addAll(allParams.keySet());
    Collections.sort(keys);
    for (String s : keys) {
      b.append(s.replaceFirst("-", "")).append(":").append(allParams.get(s)).append("\n");
    }
    return b.toString();
  }

  public Map<String, Object> getAllParams() {
    return allParams;
  }

  public int getJettyMaxThreads() {
    return jettyMaxThreads;
  }
}
