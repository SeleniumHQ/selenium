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

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.entity.StringEntity;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicHttpRequest;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.shared.GridNodeServer;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.internal.HttpClientFactory;
import org.openqa.selenium.remote.server.log.LoggingManager;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.util.logging.Logger;

public class SelfRegisteringRemote {

  private static final Logger LOG = Logger.getLogger(SelfRegisteringRemote.class.getName());

  private RegistrationRequest nodeConfig;

  private final HttpClientFactory httpClientFactory;

  public SelfRegisteringRemote(RegistrationRequest config) {
    this.nodeConfig = config;
    this.httpClientFactory = new HttpClientFactory();

    nodeConfig.validate();

    try {
      GridHubConfiguration hubConfiguration = getHubConfiguration();
      if (hubConfiguration.timeout != null) {
        nodeConfig.getConfiguration().timeout = hubConfiguration.timeout;
      }
      if (hubConfiguration.browserTimeout != null) {
        nodeConfig.getConfiguration().browserTimeout = hubConfiguration.browserTimeout;
      }
    } catch (Exception e) {
      LOG.warning(
        "error getting the parameters from the hub. The node may end up with wrong timeouts." + e
          .getMessage());
    }
  }

  public URL getRemoteURL() {
    String host = nodeConfig.getConfiguration().host;
    Integer port = nodeConfig.getConfiguration().port;
    String url = "http://" + host + ":" + port;

    try {
      return new URL(url);
    } catch (MalformedURLException e) {
      throw new GridConfigurationException("error building the node url " + e.getMessage(), e);
    }
  }

  private GridNodeServer server;

  public void setRemoteServer(GridNodeServer server) {
    this.server = server;
  }

  public void startRemoteServer() throws Exception {
    if (server == null) {
      throw new GridConfigurationException("no server set to register to the hub");
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

  /**
   * Adding the browser described by the capability, automatically finding out what platform the
   * node is launched from
   *
   * @param cap describing the browser
   * @param instances number of times this browser can be started on the node.
   */
  public void addBrowser(DesiredCapabilities cap, int instances) {
    String s = cap.getBrowserName();
    if (s == null || "".equals(s)) {
      throw new InvalidParameterException(cap + " does seems to be a valid browser.");
    }
    if (cap.getPlatform() == null) {
      cap.setPlatform(Platform.getCurrent());
    }
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
   * <p>
   * - check if the proxy is already registered before sending a reg request.
   * <p>
   * - register again every X ms is specified in the config of the node.
   */
  public void startRegistrationProcess() {
    LOG.fine("Using the json request : " + nodeConfig.toJSON());

    Boolean register = nodeConfig.getConfiguration().register;

    if (!register) {
      LOG.info("No registration sent ( register = false )");
    } else {
      final int registerCycleInterval = nodeConfig.getConfiguration().registerCycle;
      if (registerCycleInterval > 0) {
        new Thread(new Runnable() { // Thread safety reviewed

              public void run() {
                boolean first = true;
                LOG.info("Starting auto registration thread. Will try to register every "
                         + registerCycleInterval + " ms.");
                while (true) {
                  try {
                    boolean checkForPresence = true;
                    if (first) {
                      first = false;
                      checkForPresence = false;
                    }
                    registerToHub(checkForPresence);
                  } catch (GridException e) {
                    LOG.info("Couldn't register this node: " + e.getMessage());
                  }
                  try {
                    Thread.sleep(registerCycleInterval);
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
    nodeConfig.getConfiguration().timeout = timeout;
    nodeConfig.getConfiguration().cleanUpCycle = cycle;
  }

  public void setMaxConcurrent(int max) {
    nodeConfig.getConfiguration().maxSession = max;
  }

  public GridNodeConfiguration getConfiguration() {
    return nodeConfig.getConfiguration();
  }

  private void registerToHub(boolean checkPresenceFirst) {
    if (!checkPresenceFirst || !isAlreadyRegistered(nodeConfig)) {
      String tmp =
          "http://" + nodeConfig.getConfiguration().getHubHost() + ":"
              + nodeConfig.getConfiguration().getHubPort() + "/grid/register";

      HttpClient client = httpClientFactory.getHttpClient();
      try {
        URL registration = new URL(tmp);
        LOG.info("Registering the node to the hub: " + registration);

        BasicHttpEntityEnclosingRequest r =
            new BasicHttpEntityEnclosingRequest("POST", registration.toExternalForm());
        updateConfigWithRealPort();
        String json = nodeConfig.toJSON();
        r.setEntity(new StringEntity(json,"UTF-8"));

        HttpHost host = new HttpHost(registration.getHost(), registration.getPort());
        HttpResponse response = client.execute(host, r);
        if (response.getStatusLine().getStatusCode() != 200) {
          throw new GridException(String.format("The hub responded with %s:%s",
                                                response.getStatusLine().getStatusCode(),
                                                response.getStatusLine().getReasonPhrase()));
        }
        LOG.info("The node is registered to the hub and ready to use");
      } catch (Exception e) {
        throw new GridException("Error sending the registration request: " + e.getMessage());
      }
    } else {
      LOG.fine("The node is already present on the hub. Skipping registration.");
    }

  }

  void updateConfigWithRealPort() throws MalformedURLException {
    if (nodeConfig.getConfiguration().port != 0) {
      return;
    }
    nodeConfig.getConfiguration().port = server.getRealPort();
  }

  /**
   * uses the hub API to get some of its configuration.
   * @return json object of the current hub configuration
   * @throws Exception
   */
  private GridHubConfiguration getHubConfiguration() throws Exception {
    String hubApi =
        "http://" + nodeConfig.getConfiguration().getHubHost() + ":"
            + nodeConfig.getConfiguration().getHubPort() + "/grid/api/hub";

    HttpClient client = httpClientFactory.getHttpClient();

    URL api = new URL(hubApi);
    HttpHost host = new HttpHost(api.getHost(), api.getPort());
    String url = api.toExternalForm();
    BasicHttpRequest r = new BasicHttpRequest("GET", url);

    HttpResponse response = client.execute(host, r);
    return GridHubConfiguration.loadFromJSON(extractObject(response));
  }

  private boolean isAlreadyRegistered(RegistrationRequest node) {

    HttpClient client = httpClientFactory.getHttpClient();
    try {
      String tmp =
          "http://" + node.getConfiguration().getHubHost() + ":"
              + node.getConfiguration().getHubPort() + "/grid/api/proxy";
      URL api = new URL(tmp);
      HttpHost host = new HttpHost(api.getHost(), api.getPort());

      String id = node.getConfiguration().id;
      if (id == null) {
        id = node.getConfiguration().getRemoteHost();
      }
      BasicHttpRequest r = new BasicHttpRequest("GET", api.toExternalForm() + "?id=" + id);

      HttpResponse response = client.execute(host, r);
      if (response.getStatusLine().getStatusCode() != 200) {
        throw new GridException(String.format("The hub responded with %s:%s",
                                              response.getStatusLine().getStatusCode(),
                                              response.getStatusLine().getReasonPhrase()));
      }
      JsonObject o = extractObject(response);
      return o.get("success").getAsBoolean();
    } catch (Exception e) {
      throw new GridException("The hub is down or not responding: " + e.getMessage());
    }
  }

  private static JsonObject extractObject(HttpResponse resp) throws IOException {
    BufferedReader rd = new BufferedReader(new InputStreamReader(resp.getEntity().getContent()));
    StringBuilder s = new StringBuilder();
    String line;
    while ((line = rd.readLine()) != null) {
      s.append(line);
    }
    rd.close();
    return new JsonParser().parse(s.toString()).getAsJsonObject();
  }

}
