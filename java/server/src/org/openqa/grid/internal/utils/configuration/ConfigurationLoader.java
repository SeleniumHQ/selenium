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

import static org.openqa.grid.internal.utils.ServerJsonValues.BROWSER_TIMEOUT;
import static org.openqa.grid.internal.utils.ServerJsonValues.CLIENT_TIMEOUT;

import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.grid.common.CommandLineOptionHelper;
import org.openqa.grid.common.JSONConfigurationUtils;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.yaml.snakeyaml.Yaml;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class ConfigurationLoader {

  public static void loadFromCommandLine(String[] args, GridHubConfiguration config) {
    CommandLineOptionHelper helper = new CommandLineOptionHelper(args);


    // storing them all.
    //I Honestly don't see the point of doing this yet, suggesting to remove it
    List<String> params = helper.getKeys();
    for (String param : params) {
      String cleanParam = param.replaceFirst("-", "");
      String value = helper.getParamValue(param);
      config.put(cleanParam, value);
    }
    // handle the core config.

    if (helper.isParamPresent("-host")) {
      config.setHost(helper.getParamValue("-host"));
    }
    if (helper.isParamPresent("-port")) {
      config.setPort(Integer.parseInt(helper.getParamValue("-port")));
    }
    if (helper.isParamPresent("-cleanUpCycle")) {
      config.setCleanupCycle(Integer.parseInt(helper.getParamValue("-cleanUpCycle")));
    }
    if (helper.isParamPresent(CLIENT_TIMEOUT.getAsParam())) {
      config.setTimeout(Integer.parseInt(helper.getParamValue(CLIENT_TIMEOUT.getAsParam())) * 1000);
    }
    if (helper.isParamPresent(BROWSER_TIMEOUT.getAsParam())) {
      config.setBrowserTimeout(
          Integer.parseInt(helper.getParamValue(BROWSER_TIMEOUT.getAsParam())) * 1000);
    }
    if (helper.isParamPresent("-newSessionWaitTimeout")) {
      config.setNewSessionWaitTimeout(
          Integer.parseInt(helper.getParamValue("-newSessionWaitTimeout")));
    }
    if (helper.isParamPresent("-throwOnCapabilityNotPresent")) {
      config.setThrowOnCapabilityNotPresent(
          Boolean.parseBoolean(helper.getParamValue("-throwOnCapabilityNotPresent")));
    }
    if (helper.isParamPresent("-prioritizer")) {
      config.setPrioritizer(helper.getParamValue("-prioritizer"));
    }
    if (helper.isParamPresent("-capabilityMatcher")) {
      config.setCapabilityMatcher(helper.getParamValue("-capabilityMatcher"));
    }
    if (helper.isParamPresent("-servlets")) {
      config.setServlets(helper.getParamValues("-servlets"));
    }
    if (helper.isParamPresent("-log")) {
      config.setLogFilename(helper.getParamValue("-log"));
    }
    if (helper.isParamPresent("-debug")) {
      config.setIsDebug(true);
    }
  }

  public static void loadFromYAMLFile(String resource, GridHubConfiguration configObject){
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
      configObject.setPort(p);
    }

    // Store a copy of the environment names => browser strings
    for (Map<String, String> environment : environments) {
      configObject.getGrid1Mapping().put(environment.get("name"), environment.get("browser"));
    }

    // Now pull out each of the grid config values.
    Integer poll = (Integer) hub.get("remoteControlPollingIntervalInSeconds");
    if (poll != null) {
      configObject.setNodePolling(poll.intValue() * 1000);
      configObject.setCleanupCycle(poll.intValue() * 1000);
    }

    Integer timeout = (Integer) hub.get("sessionMaxIdleTimeInSeconds");
    if (timeout != null) {
      configObject.setTimeout(timeout.intValue() * 1000);
    }

    Integer port = (Integer) hub.get(RegistrationRequest.PORT);
    if (port != null) {
      configObject.setPort(port.intValue());
    }

    Integer newSessionWait = (Integer) hub.get("newSessionMaxWaitTimeInSeconds");
    if (newSessionWait != null) {
      configObject.setNewSessionWaitTimeout(newSessionWait.intValue() * 1000);
    }

    configObject.setMaxSessions(1);
  }

  public static void loadFromJsonFile(String resource, GridHubConfiguration configObject){
    try {
      JSONObject o = JSONConfigurationUtils.loadJSON(resource);

      // handling the core config.
      if (o.has(RegistrationRequest.HOST) && !o.isNull(RegistrationRequest.HOST)) {
        configObject.setHost(o.getString(RegistrationRequest.HOST));
      }
      if (o.has(RegistrationRequest.PORT) && !o.isNull(RegistrationRequest.PORT)) {
        configObject.setPort(o.getInt(RegistrationRequest.PORT));
      }
      if (o.has(RegistrationRequest.CLEAN_UP_CYCLE) &&
          !o.isNull(RegistrationRequest.CLEAN_UP_CYCLE)) {
        configObject.setCleanupCycle(o.getInt(RegistrationRequest.CLEAN_UP_CYCLE));
      }
      if (o.has(RegistrationRequest.TIME_OUT) && !o.isNull(RegistrationRequest.TIME_OUT)) {
        configObject.setTimeout(o.getInt(RegistrationRequest.TIME_OUT));
      }
      if (o.has(RegistrationRequest.BROWSER_TIME_OUT) && !o
          .isNull(RegistrationRequest.BROWSER_TIME_OUT)) {
        configObject.setBrowserTimeout(o.getInt(RegistrationRequest.BROWSER_TIME_OUT));
      }
      if (o.has("newSessionWaitTimeout") && !o.isNull("newSessionWaitTimeout")) {
        configObject.setNewSessionWaitTimeout(o.getInt("newSessionWaitTimeout"));
      }
      if (o.has(RegistrationRequest.SERVLETS) && !o.isNull(RegistrationRequest.SERVLETS)) {
        JSONArray jsservlets = o.getJSONArray(RegistrationRequest.SERVLETS);
        for (int i = 0; i < jsservlets.length(); i++) {
          configObject.addServlets(jsservlets.getString(i));
        }
      }
      if (o.has("prioritizer") && !o.isNull("prioritizer")) {
        String prioritizerClass = o.getString("prioritizer");
        configObject.setPrioritizer(prioritizerClass);
      }
      if (o.has("capabilityMatcher") && !o.isNull("capabilityMatcher")) {
        String capabilityMatcherClass = o.getString("capabilityMatcher");
        configObject.setCapabilityMatcher(capabilityMatcherClass);
      }
      if (o.has("throwOnCapabilityNotPresent") && !o.isNull("throwOnCapabilityNotPresent")) {
        configObject.setThrowOnCapabilityNotPresent(o.getBoolean("throwOnCapabilityNotPresent"));
      }

      // store them all.
      //I Honestly don't see the point of doing this yet, suggesting to remove it
      for (Iterator iterator = o.keys(); iterator.hasNext(); ) {
        String key = (String) iterator.next();
        Object value = o.get(key);
        if (value instanceof JSONArray) {
          JSONArray a = (JSONArray) value;
          List<String> as = new ArrayList<String>();
          for (int i = 0; i < a.length(); i++) {
            as.add(a.getString(i));
          }
          configObject.put(key, as);
        } else {
          configObject.put(key, o.get(key));
        }
      }

    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(),
                                           e);
    }
  }

}
