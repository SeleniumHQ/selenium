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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.shared.GridNodeServer;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.grid.web.servlet.NodeW3CStatusServlet;
import org.openqa.grid.web.servlet.ResourceServlet;
import org.openqa.grid.web.utils.ExtraServletUtil;
import org.openqa.selenium.Platform;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.log.LoggingManager;

import java.io.Reader;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.Servlet;

public class SelfRegisteringRemote {

  private static final Logger LOG = Logger.getLogger(SelfRegisteringRemote.class.getName());

  private final RegistrationRequest registrationRequest;

  private final HttpClient.Factory httpClientFactory;

  private final Map<String, Class<? extends Servlet>> nodeServlets;

  private boolean hasId;

  private boolean timeoutFetchedFromHub;

  private boolean browserTimeoutFetchedFromHub;

  public SelfRegisteringRemote(GridNodeConfiguration configuration) {
    this(RegistrationRequest.build(configuration, null, null));
  }

  public SelfRegisteringRemote(RegistrationRequest request) {
    this.registrationRequest = request;
    this.httpClientFactory = HttpClient.Factory.createDefault();
    this.nodeServlets = new HashMap<>();

    registrationRequest.validate();

    // add the status servlet
    nodeServlets.put("/status", NodeW3CStatusServlet.class);
    nodeServlets.put("/wd/hub/status", NodeW3CStatusServlet.class);

    // add the resource servlet for nodes
    if (!registrationRequest.getConfiguration().isWithOutServlet(ResourceServlet.class)) {
      nodeServlets.put("/resources/*", ResourceServlet.class);
    }

    // add the display help servlet for nodes
    if (!registrationRequest.getConfiguration().isWithOutServlet(DisplayHelpServlet.class)) {
      nodeServlets.put("/*", DisplayHelpServlet.class);
    }

    // add the user supplied servlet(s) for nodes
    addExtraServlets(registrationRequest.getConfiguration().servlets);
  }


  public URL getRemoteURL() {
    String host = registrationRequest.getConfiguration().host;
    Integer port = registrationRequest.getConfiguration().port;
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

  public boolean startRemoteServer() throws Exception {
    if (server == null) {
      throw new GridConfigurationException("no server set to register to the hub");
    }
    server.setExtraServlets(nodeServlets);
    return server.boot();
  }

  public void stopRemoteServer() {
    if (server != null) {
      server.stop();
    }
  }

  public void deleteAllBrowsers() {
    registrationRequest.getConfiguration().capabilities.clear();
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
    registrationRequest.getConfiguration().capabilities.add(cap);
    registrationRequest.getConfiguration().fixUpCapabilities();
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
    // don't advertise that the remote (node) is bound to all IPv4 interfaces (default behavior)
    if (registrationRequest.getConfiguration().host.equals("0.0.0.0")) {
      // remove the value and call fixUpHost to determine the address of a public (non-loopback) IPv4 interface
      registrationRequest.getConfiguration().host = null;
      registrationRequest.getConfiguration().fixUpHost();
    }
    fixUpId();
    LOG.fine("Using the json request : " + new Json().toJson(registrationRequest));

    Boolean register = registrationRequest.getConfiguration().register;
    if (register == null) {
      register = false;
    }

    if (!register) {
      LOG.info("No registration sent ( register = false )");
    } else {
      final int registerCycleInterval = registrationRequest.getConfiguration().registerCycle != null ?
                                        registrationRequest.getConfiguration().registerCycle : 0;
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
    registrationRequest.getConfiguration().timeout = timeout;
    registrationRequest.getConfiguration().cleanUpCycle = cycle;
  }

  public void setMaxConcurrent(int max) {
    registrationRequest.getConfiguration().maxSession = max;
  }

  public GridNodeConfiguration getConfiguration() {
    return registrationRequest.getConfiguration();
  }

  /**
   * @return the {@link GridNodeServer} for this remote
   */
  protected GridNodeServer getServer() {
    return server;
  }

  /**
   * @return the list of {@link Servlet}s that this remote will bind
   */
  protected Map<String, Class <? extends Servlet>> getNodeServlets() {
    return nodeServlets;
  }

  private void registerToHub(boolean checkPresenceFirst) {
    if (!checkPresenceFirst || !isAlreadyRegistered(registrationRequest)) {
      String tmp =
        "http://" + registrationRequest.getConfiguration().getHubHost() + ":"
        + registrationRequest.getConfiguration().getHubPort() + "/grid/register";

      // browserTimeout and timeout are always fetched from the hub. Nodes don't have default values.
      // If a node has browserTimeout or timeout configured, those will have precedence over the hub.
      LOG.fine("Fetching browserTimeout and timeout values from the hub before sending registration request");
      try {
        GridHubConfiguration hubConfiguration = getHubConfiguration();
        LOG.fine("Hub configuration: " + new Json().toJson(hubConfiguration));
        if (hubConfiguration.timeout == null || hubConfiguration.browserTimeout == null) {
          throw new GridException("Hub browserTimeout or timeout (or both) are null");
        }
        if (registrationRequest.getConfiguration().timeout == null) {
          registrationRequest.getConfiguration().timeout = hubConfiguration.timeout;
          timeoutFetchedFromHub = true;
        }
        if (registrationRequest.getConfiguration().browserTimeout == null) {
          registrationRequest.getConfiguration().browserTimeout = hubConfiguration.browserTimeout;
          browserTimeoutFetchedFromHub = true;
        }

        // The hub restarts and changes its configuration, the node fetches and updates its own again.
        // Only if it was previously fetched from the hub.
        if (timeoutFetchedFromHub) {
          registrationRequest.getConfiguration().timeout = hubConfiguration.timeout;
        }
        if (browserTimeoutFetchedFromHub) {
          registrationRequest.getConfiguration().browserTimeout = hubConfiguration.browserTimeout;
        }

        LOG.fine("Updated node configuration: " + new Json().toJson(registrationRequest.getConfiguration()));
      } catch (Exception e) {
        LOG.warning(
            "Error getting the parameters from the hub. The node may end up with wrong timeouts." +
            e.getMessage());
      }

      try {
        URL registration = new URL(tmp);
        LOG.info("Registering the node to the hub: " + registration);

        HttpRequest request = new HttpRequest(POST, registration.toExternalForm());
        updateConfigWithRealPort();
        String json = new Json().toJson(registrationRequest);
        request.setContent(json.getBytes(UTF_8));

        HttpClient client = httpClientFactory.createClient(registration);
        HttpResponse response = client.execute(request);
        if (response.getStatus() != 200) {
          throw new GridException(String.format("The hub responded with %s", response.getStatus()));
        }

        LOG.info("The node is registered to the hub and ready to use");
      } catch (Exception e) {
        throw new GridException("Error sending the registration request: " + e.getMessage());
      }
    }

  }

  private void addExtraServlets(List<String> servlets) {
    if (servlets == null || servlets.size() == 0) {
      return;
    }

    for (String s : servlets) {
      Class<? extends Servlet> servletClass = ExtraServletUtil.createServlet(s);
      if (servletClass != null) {
        String path = "/extra/" + servletClass.getSimpleName() + "/*";
        LOG.info("binding " + servletClass.getCanonicalName() + " to " + path);
        nodeServlets.put(path, servletClass);
      }
    }
  }

  private void fixUpId() {
    if (hasId) {
      return;
    }

    // make sure 'id' has a value.
    if (registrationRequest.getConfiguration().id == null || registrationRequest
      .getConfiguration().id.isEmpty()) {
      registrationRequest.getConfiguration().id =
        registrationRequest.getConfiguration().getRemoteHost();
    }

    hasId = true;
  }

  void updateConfigWithRealPort() {
    if (registrationRequest.getConfiguration().port != 0) {
      return;
    }
    registrationRequest.getConfiguration().port = server.getRealPort();
  }

  /**
   * uses the hub API to get some of its configuration.
   * @return json object of the current hub configuration
   */
  private GridHubConfiguration getHubConfiguration() throws Exception {
    String hubApi =
      "http://" + registrationRequest.getConfiguration().getHubHost() + ":"
      + registrationRequest.getConfiguration().getHubPort() + "/grid/api/hub";

    URL api = new URL(hubApi);
    HttpClient client = httpClientFactory.createClient(api);
    String url = api.toExternalForm();
    HttpRequest request = new HttpRequest(GET, url);

    HttpResponse response = client.execute(request);
    try (Reader reader = new StringReader(response.getContentString());
        JsonInput jsonInput = new Json().newInput(reader)) {
      return GridHubConfiguration.loadFromJSON(jsonInput);
    }
  }

  private boolean isAlreadyRegistered(RegistrationRequest node) {
    try {
      String tmp =
          "http://" + node.getConfiguration().getHubHost() + ":"
              + node.getConfiguration().getHubPort() + "/grid/api/proxy";
      URL api = new URL(tmp);
      HttpClient client = httpClientFactory.createClient(api);

      String id = node.getConfiguration().id;
      if (id == null) {
        id = node.getConfiguration().getRemoteHost();
      }
      HttpRequest request = new HttpRequest(GET, api.toExternalForm() + "?id=" + id);

      HttpResponse response = client.execute(request);
      if (response.getStatus() != 200) {
        throw new GridException(String.format("The hub responded with %s", response.getStatus()));
      }
      Map<String, Object> o = extractObject(response);
      return (Boolean) o.get("success");
    } catch (Exception e) {
      throw new GridException("The hub is down or not responding: " + e.getMessage());
    }
  }

  private static Map<String, Object> extractObject(HttpResponse resp) {
    return new Json().toType(resp.getContentString(), MAP_TYPE);
  }
}
