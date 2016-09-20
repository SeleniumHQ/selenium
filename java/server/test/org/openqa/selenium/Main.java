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

package org.openqa.selenium;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import com.thoughtworks.selenium.webdriven.WebDriverBackedSeleniumServlet;

import org.openqa.selenium.remote.server.DefaultDriverSessions;
import org.openqa.selenium.remote.server.DriverServlet;
import org.openqa.selenium.remote.server.DriverSessions;
import org.seleniumhq.jetty9.server.Connector;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.server.ServerConnector;
import org.seleniumhq.jetty9.server.handler.ContextHandler;
import org.seleniumhq.jetty9.server.handler.HandlerList;
import org.seleniumhq.jetty9.server.handler.ResourceHandler;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.util.resource.Resource;

import javax.servlet.Servlet;

public class Main {

  public static void main(String[] args) throws Exception {
    Flags flags = new Flags();
    new JCommander(flags, args);

    Server server = new Server();
    ServerConnector connector = new ServerConnector(server);
    connector.setPort(flags.port);
    server.setConnectors(new Connector[] {connector });

    HandlerList handlers = new HandlerList();

    ContextHandler context = new ContextHandler();
    context.setContextPath("/tests");
    ResourceHandler testHandler = new ResourceHandler();
    testHandler.setBaseResource(Resource.newClassPathResource("/tests"));
    testHandler.setDirectoriesListed(true);
    context.setHandler(testHandler);
    handlers.addHandler(context);

    ContextHandler coreContext = new ContextHandler();
    coreContext.setContextPath("/core");
    ResourceHandler coreHandler = new ResourceHandler();
    coreHandler.setBaseResource(Resource.newClassPathResource("/core"));
    coreContext.setHandler(coreHandler);
    handlers.addHandler(coreContext);

    ServletContextHandler driverContext = new ServletContextHandler();
    DriverSessions driverSessions = new DefaultDriverSessions();
    driverContext.setAttribute(DriverServlet.SESSIONS_KEY, driverSessions);
    driverContext.setContextPath("/");
    driverContext.addServlet(DriverServlet.class, "/wd/hub/*");
    driverContext.addServlet(WebDriverBackedSeleniumServlet.class, "/selenium-server/driver/");
    handlers.addHandler(driverContext);

    server.setHandler(handlers);
    server.start();
  }

  static class Flags {
    @Parameter(
      names = {"-port"},
      description = "The port number the selenium server should use. Default's to 8989.")
    public Integer port = 8989;
  }
}
