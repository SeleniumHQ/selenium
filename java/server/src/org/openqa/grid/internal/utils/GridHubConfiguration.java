package org.openqa.grid.internal.utils;
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
import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.grid.common.CommandLineOptionHelper;
import org.openqa.grid.common.JSONConfigurationUtils;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.yaml.snakeyaml.Yaml;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import static org.openqa.grid.internal.utils.ServerJsonValues.*;

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
   * list of extra serlvets this hub will display. Allows to present custom view of the hub for
   * monitoring and management purpose
   */
  private List<String> servlets = new ArrayList<String>();

  /**
   * name <-> browser mapping from grid1
   */
  private Map<String, String> grid1Mapping = new HashMap<String, String>();

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
   * The filename to use for logging. Default value is <code>null</code> and indicates logging to
   * STDOUT.
   */
  private String logFilename;

  /**
   * to specify that logging level should be set to Level.DEBUG
   */
  private boolean isDebug = false;

  private Map<String, Object> allParams = new HashMap<String, Object>();

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
   * @param args
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
    if (helper.isParamPresent("-cleanUpCycle")) {
      cleanupCycle = Integer.parseInt(helper.getParamValue("-cleanUpCycle"));
    }
    if (helper.isParamPresent(CLIENT_TIMEOUT.getAsParam())) {
      setTimeout(Integer.parseInt(helper.getParamValue(CLIENT_TIMEOUT.getAsParam())) * 1000);
    }
    if (helper.isParamPresent(BROWSER_TIMEOUT.getAsParam())) {
      setBrowserTimeout(Integer.parseInt(helper.getParamValue(BROWSER_TIMEOUT.getAsParam())) * 1000);
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
    if (helper.isParamPresent("-debug")) {
      isDebug = true;
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
      JSONObject o = JSONConfigurationUtils.loadJSON(resource);

      // handling the core config.
      if (o.has(RegistrationRequest.HOST) && !o.isNull(RegistrationRequest.HOST)) {
        host = o.getString(RegistrationRequest.HOST);
      }
      if (o.has(RegistrationRequest.PORT) && !o.isNull(RegistrationRequest.PORT)) {
        port = o.getInt(RegistrationRequest.PORT);
      }
      if (o.has(RegistrationRequest.CLEAN_UP_CYCLE) &&
          !o.isNull(RegistrationRequest.CLEAN_UP_CYCLE)) {
        cleanupCycle = o.getInt(RegistrationRequest.CLEAN_UP_CYCLE);
      }
      if (o.has(RegistrationRequest.TIME_OUT) && !o.isNull(RegistrationRequest.TIME_OUT)) {
        setTimeout(o.getInt(RegistrationRequest.TIME_OUT));
      }
      if (o.has(RegistrationRequest.BROWSER_TIME_OUT) && !o.isNull(RegistrationRequest.BROWSER_TIME_OUT)) {
        setBrowserTimeout(o.getInt(RegistrationRequest.BROWSER_TIME_OUT));
      }
      if (o.has("newSessionWaitTimeout") && !o.isNull("newSessionWaitTimeout")) {
        newSessionWaitTimeout = o.getInt("newSessionWaitTimeout");
      }
      if (o.has(RegistrationRequest.SERVLETS) && !o.isNull(RegistrationRequest.SERVLETS)) {
        JSONArray jsservlets = o.getJSONArray(RegistrationRequest.SERVLETS);
        for (int i = 0; i < jsservlets.length(); i++) {
          servlets.add(jsservlets.getString(i));
        }
      }
      if (o.has("prioritizer") && !o.isNull("prioritizer")) {
        String prioritizerClass = o.getString("prioritizer");
        setPrioritizer(prioritizerClass);
      }
      if (o.has("capabilityMatcher") && !o.isNull("capabilityMatcher")) {
        String capabilityMatcherClass = o.getString("capabilityMatcher");
        setCapabilityMatcher(capabilityMatcherClass);
      }
      if (o.has("throwOnCapabilityNotPresent") && !o.isNull("throwOnCapabilityNotPresent")) {
        throwOnCapabilityNotPresent = o.getBoolean("throwOnCapabilityNotPresent");
      }

      // store them all.
      for (Iterator iterator = o.keys(); iterator.hasNext();) {
        String key = (String) iterator.next();
        Object value = o.get(key);
        if (value instanceof JSONArray) {
          JSONArray a = (JSONArray) value;
          List<String> as = new ArrayList<String>();
          for (int i = 0; i < a.length(); i++) {
            as.add(a.getString(i));
          }
          allParams.put(key, as);
        } else {
          allParams.put(key, o.get(key));
        }
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
    return getIntWith0Default(CLIENT_TIMEOUT);
  }

  public int getBrowserTimeout() {
    return getIntWith0Default(BROWSER_TIMEOUT);
  }

  public void setBrowserTimeout(int browserTimeout) {
      put(BROWSER_TIMEOUT, browserTimeout);
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

  public boolean isDebug() {
    return isDebug;
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
  }

  public void setTimeout(int timeout) {
    put(CLIENT_TIMEOUT, timeout);
  }

  private void put(JsonKey key, Object value){
    allParams.put(key.getKey(), value);
  }

  private <T> T get(JsonKey jsonKey) {
    //noinspection unchecked
    return (T) allParams.get(jsonKey.getKey());
  }

  private Integer getIntWith0Default(JsonKey jsonKey) {
    //noinspection unchecked
    final Object o = allParams.get(jsonKey.getKey());
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
    List<String> keys = new ArrayList<String>();
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

}
