package org.openqa.grid.internal.utils.configuration;
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

import org.openqa.grid.common.CommandLineOptionHelper;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.CapabilityMatcher;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.JsonKey;
import org.openqa.grid.internal.utils.configuration.ConfigurationLoader;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.HashMap;
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
   * list of extra servlets this hub will display. Allows to present custom view of the hub for
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
   * @return A GridHubConfiguration object with options from the grid1 and/or grid2 config file(s),
   *         plus any command line option overrides.
   */
  public static GridHubConfiguration build(String[] args) {
    GridHubConfiguration res = new GridHubConfiguration();
    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);
    res.setArgs(args);

    // is there a grid1 config file to load ?
    if (helper.isParamPresent("-grid1Yml")) {
      String value = helper.getParamValue("-grid1Yml");
      res.setGrid1Yaml(value);
      res.loadFromGridYml(value);
    }

    // is there a grid2 config file ?
    if (helper.isParamPresent("-hubConfig")) {
      String value = helper.getParamValue("-hubConfig");
      res.setGrid2JSON(value);
      res.loadFromJSON(value);
    }

    // are there some command line param to overwrite the config file ?
    res.loadFromCommandLine(args);

    return res;

  }

  public void loadDefault() {
    loadFromJSON("defaults/DefaultHub.json");
  }

  public void loadFromCommandLine(String[] args) {
    ConfigurationLoader.loadFromCommandLine(args, this);
  }

  /**
   * @param resource /grid_configuration.yml for instance
   */
  public void loadFromGridYml(String resource) {
    ConfigurationLoader.loadFromYAMLFile(resource, this);
  }

  /**
   * @param resource default/DefaultHub.json for instance
   */
  public void loadFromJSON(String resource) {
   ConfigurationLoader.loadFromJsonFile(resource, this);
  }


  public String getGrid1Yml() {
    return grid1Yml;
  }

  public String getGrid2JSON() {
    return grid2JSON;
  }

  protected void setGrid1Yaml(String yaml) {
    this.grid1Yml = yaml;
  }

  protected void setGrid2JSON(String json) {
    this.grid2JSON = json;
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

  public void addServlets(String servlet) {
    this.servlets.add(servlet);
  }

  public String getLogFilename() {
    return logFilename;
  }

  public boolean isDebug() {
    return isDebug;
  }

  public void setIsDebug(boolean debug) {
    this.isDebug = debug;
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
    return this.throwOnCapabilityNotPresent;
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

  public void put(JsonKey key, Object value) {
    getAllParams().put(key.getKey(), value);
  }

  public void put(String key, Object value) {
    getAllParams().put(key, value);
  }

  public void setLogFilename(String filename) {
    this.logFilename = filename;
  }


  private <T> T get(JsonKey jsonKey) {
    //noinspection unchecked
    return (T) getAllParams().get(jsonKey.getKey());
  }

  private Integer getIntWith0Default(JsonKey jsonKey) {
    //noinspection unchecked
    final Object o = getAllParams().get(jsonKey.getKey());
    if (o instanceof String) {
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
      Class<?>[] argsClass = new Class[]{};
      Constructor<?> c = p.getConstructor(argsClass);
      Object[] args = new Object[]{};
      setPrioritizer((Prioritizer) c.newInstance(args));
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
      Class<?>[] argsClass = new Class[]{};
      Constructor<?> c = p.getConstructor(argsClass);
      Object[] args = new Object[]{};

      setCapabilityMatcher((CapabilityMatcher) c.newInstance(args));
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

  protected void setArgs(String[] args) {
    this.args = args;
  }

  public Map<String, Object> getAllParams() {
    return this.allParams;
  }

  public void setNodePolling(int pollingInterval) {
    this.put(RegistrationRequest.NODE_POLLING, pollingInterval);
  }

  public void setMaxSessions(int sessionsCount) {
    this.put(RegistrationRequest.MAX_SESSION, sessionsCount);
  }


}
