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

import com.beust.jcommander.JCommander;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.internal.cli.StandaloneCliOptions;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.internal.utils.configuration.StandaloneConfiguration;
import org.openqa.grid.selenium.node.ChromeMutator;
import org.openqa.grid.selenium.node.FirefoxMutator;
import org.openqa.grid.shared.GridNodeServer;
import org.openqa.grid.web.servlet.DisplayHelpHandler;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.grid.config.AnnotatedConfig;
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.server.BaseServer;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.server.jmx.JMXHelper;
import org.openqa.selenium.remote.server.jmx.ManagedService;

import javax.management.ObjectName;
import javax.servlet.Servlet;
import java.io.UncheckedIOException;
import java.lang.reflect.Constructor;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.remote.http.Route.combine;
import static org.openqa.selenium.remote.http.Route.matching;


/**
 * Provides a server that can launch and manage selenium sessions.
 */
@ManagedService(objectName = "org.seleniumhq.server:type=SeleniumServer")
public class SeleniumServer extends BaseServer implements GridNodeServer {

  private final static Logger LOG = Logger.getLogger(SeleniumServer.class.getName());

  private final StandaloneConfiguration configuration;
  private Map<String, Class<? extends Servlet>> extraServlets;

  private ObjectName objectName;
  private ActiveSessions allSessions;

  public SeleniumServer(StandaloneConfiguration configuration) {
    super(new BaseServerOptions(new AnnotatedConfig(configuration)));
    this.configuration = configuration;

    objectName = new JMXHelper().register(this).getObjectName();
  }

  @Override
  public int getRealPort() {
    if (isStarted()) {
      return getUrl().getPort();
    }
    return configuration.port;
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

  private void addExtraServlets() {
    if (extraServlets != null && extraServlets.size() > 0) {
      for (String path : extraServlets.keySet()) {
        // This ugly hack allows people to keep adding the display help servlet.
        if ("/*".equals(path) && DisplayHelpServlet.class.equals(extraServlets.get(path))) {
          continue;
        }

        addServlet(extraServlets.get(path), path);
      }
    }
  }

  @Override
  public void setExtraServlets(Map<String, Class<? extends Servlet>> extraServlets) {
    this.extraServlets = extraServlets;
  }

  @Override
  public boolean boot() {
    long inactiveSessionTimeoutSeconds = configuration.timeout == null ?
                                         Long.MAX_VALUE / 1000 : configuration.timeout;

    NewSessionPipeline pipeline = createPipeline(configuration);

    allSessions = new ActiveSessions(inactiveSessionTimeoutSeconds, SECONDS);
    Servlet driverServlet = new WebDriverServlet(allSessions, pipeline);

    addServlet(driverServlet, "/wd/hub/*");
    addServlet(driverServlet, "/webdriver/*");

    Route route = matching(req -> true).to(() -> new DisplayHelpHandler(
      new Json(),
      GridRole.get(configuration.role),
      "/wd/hub"));
    Routable rcHandler = getRcHandler(allSessions);
    if (rcHandler != null) {
      route = combine(route, rcHandler);
    }
    setHandler(route);

    addExtraServlets();

    start();

    LOG.info(String.format("Selenium Server is up and running on port %s", configuration.port));
    return true;
  }

  private NewSessionPipeline createPipeline(StandaloneConfiguration configuration) {
    NewSessionPipeline.Builder builder = DefaultPipeline.createDefaultPipeline();

    if (configuration instanceof GridNodeConfiguration) {
      ((GridNodeConfiguration) configuration).capabilities.forEach(
          caps -> {
            builder.addCapabilitiesMutator(new ChromeMutator(caps));
            builder.addCapabilitiesMutator(new FirefoxMutator(caps));
            builder.addCapabilitiesMutator(
                c -> new ImmutableCapabilities(
                    c.asMap().entrySet().stream()
                        .filter(e -> !e.getKey().startsWith("server:"))
                        .filter(e -> e.getValue() != null)
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))));
          }
      );
    }

    return builder.create();
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
    StandaloneCliOptions options = new StandaloneCliOptions();
    JCommander.newBuilder().addObject(options).build().parse(args);

    if (options.getCommonOptions().getHelp()) {
      StringBuilder message = new StringBuilder();
      new JCommander(options).usage(message);
      System.err.println(message.toString());
      return;
    }

    SeleniumServer server = new SeleniumServer(new StandaloneConfiguration(options));
    server.boot();
  }
}
