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

import com.google.common.collect.Maps;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.grid.web.servlet.DriverServlet;
import org.openqa.grid.web.servlet.Grid1HeartbeatServlet;
import org.openqa.grid.web.servlet.HubStatusServlet;
import org.openqa.grid.web.servlet.LifecycleServlet;
import org.openqa.grid.web.servlet.ProxyStatusServlet;
import org.openqa.grid.web.servlet.RegistrationServlet;
import org.openqa.grid.web.servlet.ResourceServlet;
import org.openqa.grid.web.servlet.TestSessionStatusServlet;
import org.openqa.grid.web.servlet.beta.ConsoleServlet;
import org.openqa.grid.web.utils.ExtraServletUtil;
import org.openqa.selenium.net.NetworkUtils;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.util.thread.QueuedThreadPool;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.Servlet;

/**
 * Jetty server. Main entry point for everything about the grid. <p> Except for unit tests, this
 * should be a singleton.
 */
public class Hub {

  private static final Logger log = Logger.getLogger(Hub.class.getName());

  private GridHubConfiguration config;
  private final boolean isHostRestricted;
  private final Registry registry;
  private final Map<String, Class<? extends Servlet>> extraServlet = Maps.newHashMap();

  private Server server;

  private void addServlet(String key, Class<? extends Servlet> s) {
    extraServlet.put(key, s);
  }

  /**
   * get the registry backing up the hub state.
   *
   * @return The registry
   */
  public Registry getRegistry() {
    return registry;
  }

  public Hub(GridHubConfiguration gridHubConfiguration) {
    registry = Registry.newInstance(this, gridHubConfiguration);

    config = gridHubConfiguration;
    if (config.host != null) {
      isHostRestricted = true;
    } else {
      NetworkUtils utils = new NetworkUtils();
      config.host = utils.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
      isHostRestricted = false;
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
  }

  private void initServer() {
    try {
      if (config.jettyMaxThreads>0) {
        QueuedThreadPool pool = new QueuedThreadPool();
        pool.setMaxThreads(config.jettyMaxThreads);
        server = new Server(pool);
      } else {
        server = new Server();
      }

      HttpConfiguration httpConfig = new HttpConfiguration();
      httpConfig.setSecureScheme("https");
      httpConfig.setSecurePort(config.port);

      log.info("Will listen on " + config.port);

      ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
      http.setPort(config.port);

      server.addConnector(http);
//      if (isHostRestricted) {
////        httpConfig.
//      }
//      httpConfig.setL


//      SocketConnector socketListener = new SocketConnector();
//      socketListener.setMaxIdleTime(60000);
//      if (isHostRestricted) {
//        socketListener.setHost(host);
//      }
//      socketListener.setPort(port);
//      socketListener.setLowResourcesMaxIdleTime(6000);
//      server.addConnector(socketListener);

      ServletContextHandler root = new ServletContextHandler(ServletContextHandler.SESSIONS);
      root.setContextPath("/");
      server.setHandler(root);

      root.setAttribute(Registry.KEY, registry);

      root.addServlet(DisplayHelpServlet.class.getName(), "/*");

      root.addServlet(ConsoleServlet.class.getName(), "/grid/console/*");

      root.addServlet(RegistrationServlet.class.getName(), "/grid/register/*");

      root.addServlet(DriverServlet.class.getName(), "/wd/hub/*");
      root.addServlet(DriverServlet.class.getName(), "/selenium-server/driver/*");

      root.addServlet(ResourceServlet.class.getName(), "/grid/resources/*");

      root.addServlet(ProxyStatusServlet.class.getName(), "/grid/api/proxy/*");

      root.addServlet(HubStatusServlet.class.getName(), "/grid/api/hub/*");

      root.addServlet(TestSessionStatusServlet.class.getName(), "/grid/api/testsession/*");

      root.addServlet(LifecycleServlet.class.getName(), "/lifecycle-manager/*");

      root.addServlet(Grid1HeartbeatServlet.class.getName(), "/heartbeat");

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

  public void start() throws Exception {
    initServer();
    server.start();
  }

  public void stop() throws Exception {
    server.stop();
  }

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

}
