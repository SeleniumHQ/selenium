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

package com.thoughtworks.selenium.webdriven;


import static java.util.concurrent.TimeUnit.MINUTES;
import static org.junit.Assert.assertTrue;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Pages;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.server.ActiveSessions;
import org.openqa.selenium.remote.server.WebDriverServlet;
import org.seleniumhq.jetty9.server.Connector;
import org.seleniumhq.jetty9.server.HttpConfiguration;
import org.seleniumhq.jetty9.server.HttpConnectionFactory;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;

public class WebDriverBackedSeleniumServletTest {

  private Server server;
  private int port;
  private AppServer appServer;
  private Pages pages;

  @Before
  public void setUpServer() throws Exception {
    server = new Server();

    // Register the emulator
    ServletContextHandler handler = new ServletContextHandler();

    ActiveSessions sessions = new ActiveSessions(3, MINUTES);
    handler.setAttribute(WebDriverServlet.ACTIVE_SESSIONS_KEY, sessions);
    handler.setContextPath("/");
    handler.addServlet(WebDriverBackedSeleniumServlet.class, "/selenium-server/driver/");
    server.setHandler(handler);

    // And bind a port
    port = PortProber.findFreePort();
    HttpConfiguration httpConfig = new HttpConfiguration();
    ServerConnector http = new ServerConnector(server, new HttpConnectionFactory(httpConfig));
    http.setPort(port);
    server.setConnectors(new Connector[]{http});

    // Wait until the server is actually started.
    server.start();
    PortProber.pollPort(port);
  }

  @Before
  public void prepTheEnvironment() {
    TestEnvironment environment = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    appServer = environment.getAppServer();

    pages = new Pages(appServer);
  }

  @After
  public void stopServer() throws Exception {
    if (server != null) {
      server.stop();
    }
  }

  @Test
  public void searchGoogle() {
    Selenium selenium = new DefaultSelenium("localhost", port, "*chrome", appServer.whereIs("/"));
    selenium.start();

    selenium.open(pages.simpleTestPage);
    String text = selenium.getBodyText();

    selenium.stop();
    assertTrue(text.contains("More than one line of text"));
  }
}
