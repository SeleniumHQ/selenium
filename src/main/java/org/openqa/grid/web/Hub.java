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

package org.openqa.grid.web;

import com.google.common.collect.Maps;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.utils.GridHubConfiguration;
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
import org.seleniumhq.jetty7.server.Server;
import org.seleniumhq.jetty7.server.bio.SocketConnector;
import org.seleniumhq.jetty7.servlet.ServletContextHandler;
import org.seleniumhq.jetty7.util.thread.QueuedThreadPool;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.Servlet;

/**
 * Jetty server. Main entry point for everything about the grid. <p/> Except for unit tests, this
 * should be a singleton.
 */
public class Hub {

  private static final Logger log = Logger.getLogger(Hub.class.getName());

  private final int port;
  private final String host;
  private final int maxThread;
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

  public Hub(GridHubConfiguration config) {
    registry = Registry.newInstance(this, config);

    maxThread = config.getJettyMaxThreads();

    if (config.getHost() != null) {
      host = config.getHost();
      isHostRestricted = true;
    } else {
      NetworkUtils utils = new NetworkUtils();
      host = utils.getIp4NonLoopbackAddressOfThisMachine().getHostAddress();
      isHostRestricted = false;
    }
    this.port = config.getPort();

    for (String s : config.getServlets()) {
      Class<? extends Servlet> servletClass = ExtraServletUtil.createServlet(s);
      if (servletClass != null) {
        String path = "/grid/admin/" + servletClass.getSimpleName() + "/*";
        log.info("binding " + servletClass.getCanonicalName() + " to " + path);
        addServlet(path, servletClass);
      }
    }

    initServer();

  }

  private void initServer() {
    try {
      server = new Server();
      SocketConnector socketListener = new SocketConnector();
      socketListener.setMaxIdleTime(60000);
      if (isHostRestricted) {
        socketListener.setHost(host);
      }
      socketListener.setPort(port);
      socketListener.setLowResourcesMaxIdleTime(6000);
      server.addConnector(socketListener);

      ServletContextHandler root = new ServletContextHandler(ServletContextHandler.SESSIONS);
      root.setContextPath("/");
      server.setHandler(root);

      root.setAttribute(Registry.KEY, registry);

      root.addServlet(DisplayHelpServlet.class.getName(), "/*");

      root.addServlet(ConsoleServlet.class.getName(), "/grid/console/*");
      root.addServlet(ConsoleServlet.class.getName(), "/grid/beta/console/*");
      root.addServlet(org.openqa.grid.web.servlet.ConsoleServlet.class.getName(), "/grid/old/console/*");
      root.addServlet(RegistrationServlet.class.getName(), "/grid/register/*");
      // TODO remove at some point. Here for backward compatibility of
      // tests etc.
      root.addServlet(DriverServlet.class.getName(), "/grid/driver/*");
      root.addServlet(DriverServlet.class.getName(), "/wd/hub/*");
      root.addServlet(DriverServlet.class.getName(), "/selenium-server/driver/*");
      root.addServlet(ResourceServlet.class.getName(), "/grid/resources/*");

      root.addServlet(ProxyStatusServlet.class.getName(), "/grid/api/proxy/*");
      root.addServlet(HubStatusServlet.class.getName(), "/grid/api/hub/*");
      root.addServlet(TestSessionStatusServlet.class.getName(), "/grid/api/testsession/*");
      root.addServlet(LifecycleServlet.class.getName(), "/lifecycle-manager/*");

      // Selenium Grid 1.0 compatibility routes for older nodes trying to
      // work with the newer hub.
      root.addServlet(RegistrationServlet.class.getName(), "/registration-manager/register/*");
      root.addServlet(Grid1HeartbeatServlet.class.getName(), "/heartbeat");

      // Load any additional servlets provided by the user.
      for (Map.Entry<String, Class<? extends Servlet>> entry : extraServlet.entrySet()) {
        root.addServlet(entry.getValue().getName(), entry.getKey());
      }

    } catch (Throwable e) {
      throw new RuntimeException("Error initializing the hub" + e.getMessage(), e);
    }
  }

  public int getPort() {
    return port;
  }

  public String getHost() {
    return host;
  }

  public void start() throws Exception {
    initServer();
    if (maxThread>0){
      QueuedThreadPool pool = new QueuedThreadPool();
      pool.setMaxThreads(maxThread);
      server.setThreadPool(pool);
    }
    server.start();
  }

  public void stop() throws Exception {
    server.stop();
  }

  public URL getUrl() {
    try {
      return new URL("http://" + getHost() + ":" + getPort());
    } catch (MalformedURLException e) {
      throw new RuntimeException(e.getMessage());
    }
  }

  public URL getRegistrationURL() {
    String uri = "http://" + getHost() + ":" + getPort() + "/grid/register/";
    try {
      return new URL(uri);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

}
