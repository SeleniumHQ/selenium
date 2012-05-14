/*
 * Copyright 2007-2011 Selenium committers
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package org.openqa.grid.internal.utils;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.entity.StringEntity;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicHttpRequest;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.common.exception.GridException;
import org.openqa.selenium.remote.internal.HttpClientFactory;
import org.openqa.grid.web.servlet.ResourceServlet;
import org.openqa.grid.web.utils.ExtraServletUtil;
import org.openqa.jetty.http.HttpContext;
import org.openqa.jetty.jetty.Server;
import org.openqa.jetty.jetty.servlet.ServletHandler;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;
import org.openqa.selenium.server.log.LoggingManager;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.Servlet;

import static org.openqa.grid.common.RegistrationRequest.AUTO_REGISTER;

public class SelfRegisteringRemote {

  private static final Logger log = Logger.getLogger(SelfRegisteringRemote.class.getName());

  private RegistrationRequest nodeConfig;

  private final HttpClientFactory httpClientFactory;

  public SelfRegisteringRemote(RegistrationRequest config) {
    this.nodeConfig = config;
    this.httpClientFactory = new HttpClientFactory();
  }

  public URL getRemoteURL() {
    String host = (String) nodeConfig.getConfiguration().get(RegistrationRequest.HOST);
    String port = (String) nodeConfig.getConfiguration().get(RegistrationRequest.PORT);
    String url = "http://" + host + ":" + port;

    try {
      return new URL(url);
    } catch (MalformedURLException e) {
      throw new GridConfigurationException("error building the node url " + e.getMessage(), e);
    }
  }

  private SeleniumServer server;

  public void startRemoteServer() throws Exception {
    
    System.setProperty("org.openqa.jetty.http.HttpRequest.maxFormContentSize", "0");


    nodeConfig.validate();
    RemoteControlConfiguration remoteControlConfiguration = nodeConfig.getRemoteControlConfiguration();

    try {
      final String CLIENT_TIMEOUT = "timeout";
      final String BROWSER_TIMEOUT = "browserTimeout";
      JSONObject hubParameters = getHubConfiguration(CLIENT_TIMEOUT, BROWSER_TIMEOUT);
      if (hubParameters.has(CLIENT_TIMEOUT)){
        int timeout = hubParameters.getInt(CLIENT_TIMEOUT) / 1000;
        remoteControlConfiguration.setTimeoutInSeconds(timeout);
      }
      if (hubParameters.has(BROWSER_TIMEOUT)) {
        int browserTimeout = hubParameters.getInt(BROWSER_TIMEOUT);
        remoteControlConfiguration.setBrowserTimeoutInMs(browserTimeout);
      }
    }catch (Exception e) {
      log.warning("error getting the parameters from the hub. The node may end up with wrong timeouts."+e.getMessage());
    }

    server = new SeleniumServer(remoteControlConfiguration);

    Server jetty = server.getServer();

    String servletsStr = (String) nodeConfig.getConfiguration().get(GridNodeConfiguration.SERVLETS);
    if (servletsStr != null) {
      List<String> servlets = Arrays.asList(servletsStr.split(","));
      if (servlets != null) {
        HttpContext extra = new HttpContext();

        extra.setContextPath("/extra");
        ServletHandler handler = new ServletHandler();
        handler.addServlet("/resources/*", ResourceServlet.class.getName());

        for (String s : servlets) {
          Class<? extends Servlet> servletClass = ExtraServletUtil.createServlet(s);
          if (servletClass != null) {
            String path = "/" + servletClass.getSimpleName() + "/*";
            String clazz = servletClass.getCanonicalName();
            handler.addServlet(path, clazz);
            log.info("started extra node servlet visible at : http://xxx:"
                + nodeConfig.getConfiguration().get(RegistrationRequest.PORT) + "/extra" + path);
          }
        }
        extra.addHandler(handler);
        jetty.addContext(extra);
      }
    }

    server.boot();
  }

  public void stopRemoteServer() {
    if (server != null) {
      server.stop();
    }
  }

  public void deleteAllBrowsers() {
    nodeConfig.getCapabilities().clear();
  }

  // TODO freynaud keep specified platfrom if specified. At least for unit test purpose.
  /**
   * Adding the browser described by the capability, automatically finding out what platform the
   * node is launched from ( and overriding it if it was specified )
   * 
   * @param cap describing the browser
   * @param instances number of times this browser can be started on the node.
   */
  public void addBrowser(DesiredCapabilities cap, int instances) {
    String s = cap.getBrowserName();
    if (s == null || "".equals(s)) {
      throw new InvalidParameterException(cap + " does seems to be a valid browser.");
    }
    cap.setPlatform(Platform.getCurrent());
    cap.setCapability(RegistrationRequest.MAX_INSTANCES, instances);
    nodeConfig.getCapabilities().add(cap);
  }

  /**
   * sends 1 registration request, bypassing the retry logic and the proxy already registered check.
   * Use only for testing.
   */
  public void sendRegistrationRequest() {

    registerToHub(false);
  }

  /**
   * register the hub following the configuration :
   * <p/>
   * - check if the proxy is already registered before sending a reg request.
   * <p/>
   * - register again every X ms is specified in the config of the node.
   */
  public void startRegistrationProcess() {
    log.info("using the json request : " + nodeConfig.toJSON());

    Boolean register = (Boolean) nodeConfig.getConfiguration().get(AUTO_REGISTER);

    if (!register) {
      log.info("no registration sent ( " + AUTO_REGISTER + " = false )");
    } else {
      final Integer o =
          (Integer) nodeConfig.getConfiguration().get(RegistrationRequest.REGISTER_CYCLE);
      if (o != null && o.intValue() > 0) {
        new Thread(new Runnable() { // Thread safety reviewed

              public void run() {
                boolean first = true;
                log.info("starting auto register thread. Will try to register every " + o + " ms.");
                while (true) {
                  try {
                    boolean checkForPresence = true;
                    if (first) {
                      first = false;
                      checkForPresence = false;
                    }
                    registerToHub(checkForPresence);
                  } catch (GridException e) {
                    log.info("couldn't register this node : " + e.getMessage());
                  }
                  try {
                    Thread.sleep(o.intValue());
                  } catch (InterruptedException e) {
                    e.printStackTrace();
                  }
                  // While we wait for someone to rewrite server logging.
                  LoggingManager.perSessionLogHandler().clearThreadTempLogs();
                }
              }
            }).start();
      } else {
        registerToHub(false);
      }
    }
    LoggingManager.perSessionLogHandler().clearThreadTempLogs();
  }

  public void setTimeout(int timeout, int cycle) {
    nodeConfig.getConfiguration().put(RegistrationRequest.TIME_OUT, timeout);
    nodeConfig.getConfiguration().put(RegistrationRequest.CLEAN_UP_CYCLE, cycle);
  }

  public void setMaxConcurrent(int max) {
    nodeConfig.getConfiguration().put(RegistrationRequest.MAX_SESSION, max);
  }

  public Map<String, Object> getConfiguration() {
    return nodeConfig.getConfiguration();
  }

  private void registerToHub(boolean checkPresenceFirst) {
    // check for presence :
    boolean ok = checkPresenceFirst == true ? !isAlreadyRegistered(nodeConfig) : true;

    if (ok) {
      String tmp =
          "http://" + nodeConfig.getConfiguration().get(RegistrationRequest.HUB_HOST) + ":"
              + nodeConfig.getConfiguration().get(RegistrationRequest.HUB_PORT) + "/grid/register";

      HttpClient client = httpClientFactory.getHttpClient();
      try {
        URL registration = new URL(tmp);
        log.info("Registering the node to hub :" + registration);

        BasicHttpEntityEnclosingRequest r =
            new BasicHttpEntityEnclosingRequest("POST", registration.toExternalForm());
        String json = nodeConfig.toJSON();
        r.setEntity(new StringEntity(json));

        HttpHost host = new HttpHost(registration.getHost(), registration.getPort());
        HttpResponse response = client.execute(host, r);
        if (response.getStatusLine().getStatusCode() != 200) {
          throw new RuntimeException("Error sending the registration request.");
        }
      } catch (Exception e) {
        throw new GridException("Error sending the registration request.", e);
      }
    } else {
      log.fine("hub is already present on the hub. Skipping registration.");
    }

  }

  /**
   * uses the hub API to get some of its configuration.
   * @param parameters list of the parameter to be retrieved from the hub
   * @return
   * @throws Exception
   */
  private JSONObject getHubConfiguration(String ... parameters) throws Exception{
    String hubApi =
        "http://" + nodeConfig.getConfiguration().get(RegistrationRequest.HUB_HOST) + ":"
            + nodeConfig.getConfiguration().get(RegistrationRequest.HUB_PORT) + "/grid/api/hub";
    
    HttpClient client = httpClientFactory.getHttpClient();
    
    URL api = new URL(hubApi);
    HttpHost host = new HttpHost(api.getHost(), api.getPort());
    String url = api.toExternalForm();
    BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("GET", url);

    JSONObject j = new JSONObject();
    JSONArray keys = new JSONArray();

    j.put("configuration", keys);
    r.setEntity(new StringEntity(j.toString()));

    HttpResponse response = client.execute(host, r);
    JSONObject o = extractObject(response);
    return o;
  }
  
  private boolean isAlreadyRegistered(RegistrationRequest node) {

    HttpClient client = httpClientFactory.getHttpClient();
    try {
      String tmp =
          "http://" + node.getConfiguration().get(RegistrationRequest.HUB_HOST) + ":"
              + node.getConfiguration().get(RegistrationRequest.HUB_PORT) + "/grid/api/proxy";
      URL api = new URL(tmp);
      HttpHost host = new HttpHost(api.getHost(), api.getPort());

      BasicHttpRequest r =
          new BasicHttpRequest("GET", api.toExternalForm() + "?id="
              + node.getConfiguration().get(RegistrationRequest.REMOTE_HOST));

      HttpResponse response = client.execute(host, r);
      if (response.getStatusLine().getStatusCode() != 200) {
        throw new GridException("hub down or not responding.");
      }
      JSONObject o = extractObject(response);
      return (Boolean) o.get("success");
    } catch (Exception e) {
      throw new GridException("hub down or not responding.");
    }
  }

  private static JSONObject extractObject(HttpResponse resp) throws IOException, JSONException {
    BufferedReader rd = new BufferedReader(new InputStreamReader(resp.getEntity().getContent()));
    StringBuilder s = new StringBuilder();
    String line;
    while ((line = rd.readLine()) != null) {
      s.append(line);
    }
    rd.close();
    return new JSONObject(s.toString());
  }

}
