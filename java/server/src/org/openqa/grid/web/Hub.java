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

package org.openqa.grid.web;

import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.shared.Stoppable;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.grid.web.servlet.DriverServlet;
import org.openqa.grid.web.servlet.Grid1HeartbeatServlet;
import org.openqa.grid.web.servlet.HubStatusServlet;
import org.openqa.grid.web.servlet.HubW3CStatusServlet;
import org.openqa.grid.web.servlet.LifecycleServlet;
import org.openqa.grid.web.servlet.NodeSessionsServlet;
import org.openqa.grid.web.servlet.ProxyStatusServlet;
import org.openqa.grid.web.servlet.RegistrationServlet;
import org.openqa.grid.web.servlet.ResourceServlet;
import org.openqa.grid.web.servlet.TestSessionStatusServlet;
import org.openqa.grid.web.servlet.console.ConsoleServlet;
import org.openqa.grid.web.utils.ExtraServletUtil;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.remote.server.jmx.JMXHelper;
import org.openqa.selenium.remote.server.jmx.ManagedAttribute;
import org.openqa.selenium.remote.server.jmx.ManagedService;
import org.seleniumhq.jetty9.security.ConstraintMapping;
import org.seleniumhq.jetty9.security.ConstraintSecurityHandler;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.servlet.ServletHolder;
import org.seleniumhq.jetty9.util.security.Constraint;
import org.seleniumhq.jetty9.util.thread.QueuedThreadPool;

import java.net.BindException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.Servlet;

/**
 * Jetty server. Main entry point for everything about the grid. <p> Except for unit tests, this
 * should be a singleton.
 */
@ManagedService(objectName = "org.seleniumhq.grid:type=Hub", description = "Selenium Grid Hub")
public class Hub implements Stoppable {

  private static final Logger log = Logger.getLogger(Hub.class.getName());

  private final GridHubConfiguration config;
  private final GridRegistry registry;
  private final Map<String, Class<? extends Servlet>> extraServlet = new HashMap<>();

  private Server server;

  private void addServlet(String key, Class<? extends Servlet> s) {
    extraServlet.put(key, s);
  }

  /**
   * get the registry backing up the hub state.
   *
   * @return The registry
   */
  public GridRegistry getRegistry() {
    return registry;
  }

  public Hub(GridHubConfiguration gridHubConfiguration) {
    config = gridHubConfiguration == null ? new GridHubConfiguration() : gridHubConfiguration;

    try {
      registry = (GridRegistry) Class.forName(config.registry).newInstance();
      registry.setHub(this);
      registry.setThrowOnCapabilityNotPresent(config.throwOnCapabilityNotPresent);
    } catch (Throwable e) {
      throw new GridConfigurationException("Error creating class with " + config.registry +
                                           " : " + e.getMessage(), e);
    }

    if (config.host == null) {
      config.host = "0.0.0.0"; //default to all adapters
    }

    if (config.port == null) {
      config.port = 4444;
    }

    if (config.servlets != null) {
      for (String s : config.servlets) {
        Class<? extends Servlet> servletClass = ExtraServletUtil.createServlet(s);
        if (servletClass != null) {
          String path = "/grid/admin/" + servletClass.getSimpleName() + "/*";
          log.info("binding " + servletClass.getCanonicalName() + " to " + path);
          addServlet(path, servletClass);
        }
      }
    }

    // start the registry, now that 'config' is all setup
    registry.start();

    new JMXHelper().register(this);
  }

  private void addDefaultServlets(ServletContextHandler handler) {
    // add mandatory default servlets
    handler.addServlet(RegistrationServlet.class.getName(), "/grid/register/*");

    handler.addServlet(DriverServlet.class.getName(), "/wd/hub/*");
    handler.addServlet(DriverServlet.class.getName(), "/selenium-server/driver/*");

    handler.addServlet(ProxyStatusServlet.class.getName(), "/grid/api/proxy/*");
    handler.addServlet(NodeSessionsServlet.class.getName(), "/grid/api/sessions/*");

    handler.addServlet(HubStatusServlet.class.getName(), "/grid/api/hub/*");

    ServletHolder statusHolder = new ServletHolder(new HubW3CStatusServlet(getRegistry()));
    handler.addServlet(statusHolder, "/status");
    handler.addServlet(statusHolder, "/wd/hub/status");

    handler.addServlet(TestSessionStatusServlet.class.getName(), "/grid/api/testsession/*");

    // add optional default servlets
    if (!config.isWithOutServlet(ResourceServlet.class)) {
      handler.addServlet(ResourceServlet.class.getName(), "/grid/resources/*");
    }

    if (!config.isWithOutServlet(DisplayHelpServlet.class)) {
      handler.addServlet(DisplayHelpServlet.class.getName(), "/*");
      handler.setInitParameter(DisplayHelpServlet.HELPER_TYPE_PARAMETER, config.role);
    }

    if (!config.isWithOutServlet(ConsoleServlet.class)) {
      handler.addServlet(ConsoleServlet.class.getName(), "/grid/console/*");
      handler.setInitParameter(ConsoleServlet.CONSOLE_PATH_PARAMETER, "/grid/console");
    }

    if (!config.isWithOutServlet(LifecycleServlet.class)) {
      handler.addServlet(LifecycleServlet.class.getName(), "/lifecycle-manager/*");
    }

    if (!config.isWithOutServlet(Grid1HeartbeatServlet.class)) {
      handler.addServlet(Grid1HeartbeatServlet.class.getName(), "/heartbeat");
    }
  }

  private void initServer() {
    try {
      if (config.jettyMaxThreads != null && config.jettyMaxThreads > 0) {
        QueuedThreadPool pool = new QueuedThreadPool();
        pool.setMaxThreads(config.jettyMaxThreads);
        server = new Server(pool);
      } else {
        server = new Server();
      }

      HttpConfiguration httpConfig = new HttpConfiguration();
      httpConfig.setSecureScheme("https");
      httpConfig.setSecurePort(config.port);

      ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
      http.setHost(config.host);
      if (config.host.equals("0.0.0.0")) {
        // though we bind to all IPv4 interfaces, we need to advertise that connections
        // should come in on a public (non-loopback) interface
        updateHostToNonLoopBackAddressOfThisMachine();
      }
      http.setPort(config.port);

      server.addConnector(http);

      ServletContextHandler root = new ServletContextHandler(ServletContextHandler.SESSIONS + ServletContextHandler.SECURITY);
      root.setContextPath("/");

      ConstraintSecurityHandler securityHandler = (ConstraintSecurityHandler) root.getSecurityHandler();

      Constraint disableTrace = new Constraint();
      disableTrace.setName("Disable TRACE");
      disableTrace.setAuthenticate(true);
      ConstraintMapping disableTraceMapping = new ConstraintMapping();
      disableTraceMapping.setConstraint(disableTrace);
      disableTraceMapping.setMethod("TRACE");
      disableTraceMapping.setPathSpec("/");
      securityHandler.addConstraintMapping(disableTraceMapping);

      Constraint enableOther = new Constraint();
      enableOther.setName("Enable everything but TRACE");
      ConstraintMapping enableOtherMapping = new ConstraintMapping();
      enableOtherMapping.setConstraint(enableOther);
      enableOtherMapping.setMethodOmissions(new String[] {"TRACE"});
      enableOtherMapping.setPathSpec("/");
      securityHandler.addConstraintMapping(enableOtherMapping);

      server.setHandler(root);

      root.setAttribute(GridRegistry.KEY, registry);

      addDefaultServlets(root);

      // Load any additional servlets provided by the user.
      for (Map.Entry<String, Class<? extends Servlet>> entry : extraServlet.entrySet()) {
        root.addServlet(entry.getValue().getName(), entry.getKey());
      }

    } catch (Throwable e) {
      throw new RuntimeException("Error initializing the hub " + e.getMessage(), e);
    }
  }

  public GridHubConfiguration getConfiguration() {
    return config;
  }

  @ManagedAttribute(name = "Configuration")
  public Map<?,?> getConfigurationForJMX() {
    Json json = new Json();
    return json.toType(json.toJson(config.toJson()), Map.class);
  }

  public void start() throws Exception {
    initServer();

    try {
      server.start();
    } catch (Exception e) {
      try {
        stop();
      } catch (Exception ignore) {
      }
      if (e instanceof BindException) {
        log.severe(String.format(
            "Port %s is busy, please choose a free port for the hub and specify it using -port option", config.port));
        return;
      } else {
        throw new RuntimeException(e);
      }
    }

    log.info("Selenium Grid hub is up and running");
    log.info(String.format("Nodes should register to %s", getRegistrationURL()));
    log.info(String.format("Clients should connect to %s", getWebDriverHubRequestURL()));
  }

  public void stop() {
    registry.stop();
    try {
      server.stop();
    } catch (Exception ignore) {
    }
  }

  @ManagedAttribute(name= "URL")
  public URL getUrl() {
    return getUrl("");
  }

  public URL getUrl(String path) {
    try {
      return new URL("http://" + config.host + ":" + config.port + path);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e.getMessage());
    }
  }

  public URL getRegistrationURL() {
    return getUrl("/grid/register/");
  }

  /**
   * @return URL one would use to request a new WebDriver session on this hub.
   */
  public URL getWebDriverHubRequestURL() {
    return getUrl("/wd/hub");
  }

  public URL getConsoleURL() {
    return getUrl("/grid/console");
  }

  @ManagedAttribute(name = "NewSessionRequestCount")
  public int getNewSessionRequestCount() {
    return getRegistry().getNewSessionRequestCount();
  }

  private void updateHostToNonLoopBackAddressOfThisMachine() {
    NetworkUtils utils = new NetworkUtils();
    config.host = utils.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
  }

}
