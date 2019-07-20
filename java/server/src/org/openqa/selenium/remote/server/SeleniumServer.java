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

package org.openqa.selenium.remote.server;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.Route.combine;

import com.beust.jcommander.JCommander;

import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.server.BaseServer;
import org.openqa.selenium.grid.server.BaseServerFlags;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.HelpFlags;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.server.jmx.JMXHelper;
import org.openqa.selenium.remote.server.jmx.ManagedService;

import java.io.UncheckedIOException;
import java.lang.reflect.Constructor;
import java.util.Map;
import java.util.logging.Logger;

import javax.management.ObjectName;
import javax.servlet.Servlet;


/**
 * Provides a server that can launch and manage selenium sessions.
 */
@ManagedService(objectName = "org.seleniumhq.server:type=SeleniumServer")
public class SeleniumServer extends BaseServer {

  private final static Logger LOG = Logger.getLogger(SeleniumServer.class.getName());

  private final BaseServerOptions configuration;
  private Map<String, Class<? extends Servlet>> extraServlets;

  private ObjectName objectName;
  private ActiveSessions allSessions;

  public SeleniumServer(BaseServerOptions configuration) {
    super(configuration);
    this.configuration = configuration;

    objectName = new JMXHelper().register(this).getObjectName();
  }

  private Routable getRcHandler(ActiveSessions sessions) {
    try {
      Class<? extends Routable> rcHandler = Class.forName(
        "com.thoughtworks.selenium.webdriven.WebDriverBackedSeleniumHandler",
          false,
          getClass().getClassLoader())
          .asSubclass(Routable.class);
      Constructor<? extends Routable> constructor = rcHandler.getConstructor(ActiveSessions.class);
      LOG.info("Bound legacy RC support");
      return constructor.newInstance(sessions);
    } catch (ReflectiveOperationException e) {
      // Do nothing.
    }

    return new Routable() {
      @Override
      public boolean matches(HttpRequest req) {
        return false;
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        return null;
      }
    };
  }

  @Override
  public BaseServer start() {
    long inactiveSessionTimeoutSeconds = Long.MAX_VALUE / 1000;

    NewSessionPipeline pipeline = DefaultPipeline.createDefaultPipeline().create();

    allSessions = new ActiveSessions(inactiveSessionTimeoutSeconds, SECONDS);
    Servlet driverServlet = new WebDriverServlet(allSessions, pipeline);

    addServlet(driverServlet, "/wd/hub/*");
    addServlet(driverServlet, "/webdriver/*");

    Route route = Route.matching(req -> true)
        .to(() -> req -> new HttpResponse()
            .setStatus(HTTP_NOT_FOUND)
            .setContent(utf8String("Not handler found for " + req)));
    Routable rcHandler = getRcHandler(allSessions);
    if (rcHandler != null) {
      route = combine(route, rcHandler);
    }
    setHandler(route);

    super.start();

    LOG.info(String.format("Selenium Server is up and running on port %s", configuration.getPort()));
    return this;
  }

  /**
   * Stops the Jetty server
   */
  @Override
  public void stop() {
    try {
      super.stop();
    } finally {
      new JMXHelper().unregister(objectName);
      stopAllBrowsers();
    }
  }

  private void stopAllBrowsers() {
    if (allSessions == null) {
      return;
    }

    allSessions.getAllSessions().parallelStream()
        .forEach(session -> {
          try {
            session.stop();
          } catch (Exception ignored) {
            // Ignored
          }
        });
  }

  public static void main(String[] args) {
    HelpFlags helpFlags = new HelpFlags();
    BaseServerFlags flags = new BaseServerFlags(4444);

    JCommander commands = JCommander.newBuilder().addObject(flags).addObject(helpFlags).build();
    commands.parse(args);

    if (helpFlags.displayHelp(commands, System.err)) {
      return;
    }

    SeleniumServer server = new SeleniumServer(new BaseServerOptions(new AnnotatedConfig(flags)));
    server.start();
  }
}
