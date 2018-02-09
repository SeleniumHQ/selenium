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

package org.openqa.grid.selenium;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableMap;

import com.beust.jcommander.JCommander;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.internal.utils.configuration.StandaloneConfiguration;
import org.openqa.grid.shared.Stoppable;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.remote.server.SeleniumServer;
import org.openqa.selenium.remote.server.log.LoggingOptions;
import org.openqa.selenium.remote.server.log.TerseFormatter;

import java.io.File;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Servlet;

public class GridLauncherV3 {

  private static final Logger log = Logger.getLogger(GridLauncherV3.class.getName());
  private static final BuildInfo buildInfo = new BuildInfo();

  private PrintStream out;
  private String[] args;

  private interface GridItemLauncher {
    StandaloneConfiguration getConfiguration();
    Stoppable launch() throws Exception;
    default void printUsage(PrintStream out) {
      StringBuilder sb = new StringBuilder();
      new JCommander(getConfiguration()).usage(sb);
      out.print(sb);
    }
  }

  private static Map<String, Function<String[], GridItemLauncher>> LAUNCHERS = buildLaunchers();

  public static void main(String[] args) {
    new GridLauncherV3(args).launch();
  }

  public GridLauncherV3(String[] args) {
    this(System.out, args);
  }

  @VisibleForTesting
  public GridLauncherV3(PrintStream out, String[] args) {
    this.out = out;
    this.args = args;

    System.setProperty("org.seleniumhq.jetty9.LEVEL", "WARN");
  }

  public Optional<Stoppable> launch() {
    GridItemLauncher launcher = buildLauncher(args);

    if (launcher == null) {
      return Optional.empty();
    }

    if (launcher.getConfiguration().help) {
      launcher.printUsage(out);
      return Optional.empty();
    }

    if (launcher.getConfiguration().version) {
      out.println(String.format("Selenium server version: %s, revision: %s",
                                buildInfo.getReleaseLabel(), buildInfo.getBuildRevision()));
      return Optional.empty();
    }

    configureLogging(launcher.getConfiguration());

    log.info(String.format(
        "Selenium build info: version: '%s', revision: '%s'",
        buildInfo.getReleaseLabel(),
        buildInfo.getBuildRevision()));
    try {
      return Optional.of(launcher.launch());
    } catch (Exception e) {
      launcher.printUsage(out);
      e.printStackTrace();
      return Optional.empty();
    }
  }

  /**
   * From the {@code args}, builds a new {@link GridItemLauncher} and populates it properly.
   *
   * @return null if no role is found, or a properly populated {@link GridItemLauncher}.
   */
  private GridItemLauncher buildLauncher(String[] args) {
    if (Arrays.stream(args).anyMatch("-htmlSuite"::equals)) {
      out.println(Joiner.on("\n").join(
          "Download the Selenium HTML Runner from http://www.seleniumhq.org/download/ and",
          "use that to run your HTML suite."));
      return null;
    }

    String role = "standalone";

    for (int i = 0; i < args.length; i++) {
      if (args[i].startsWith("-role=")) {
        role = args[i].substring("-role=".length());
      } else if (args[i].equals("-role")) {
        i++;  // Increment, because we're going to need this.
        if (i < args.length) {
          role = args[i];
        } else {
          role = null;  // Will cause us to print the usage information.
        }
      }
    }

    GridRole gridRole = GridRole.get(role);
    if (gridRole == null || LAUNCHERS.get(gridRole.toString()) == null) {
      printInfoAboutRoles(role);
      return null;
    }

    return LAUNCHERS.get(gridRole.toString()).apply(args);
  }

  private void printInfoAboutRoles(String roleCommandLineArg) {
    if (roleCommandLineArg != null) {
      printWrappedLine(
        "",
        "Error: the role '" + roleCommandLineArg + "' does not match a recognized server role: node/hub/standalone\n");
    } else {
      printWrappedLine(
        "",
        "Error: -role option needs to be followed by the value that defines role of this component in the grid\n");
    }
    out.println(
      "Selenium server can run in one of the following roles:\n" +
      "  hub         as a hub of a Selenium grid\n" +
      "  node        as a node of a Selenium grid\n" +
      "  standalone  as a standalone server not being a part of a grid\n" +
      "\n" +
      "If -role option is omitted the server runs standalone\n");
    printWrappedLine(
      "",
      "To get help on the options available for a specific role run the server"
      + " with -help option and the corresponding -role option value");
  }

  private void printWrappedLine(String prefix, String msg) {
    printWrappedLine(out, prefix, msg, true);
  }

  private void printWrappedLine(PrintStream output, String prefix, String msg, boolean first) {
    output.print(prefix);
    if (!first) {
      output.print("  ");
    }
    int defaultWrap = 70;
    int wrap = defaultWrap - prefix.length();
    if (wrap > msg.length()) {
      output.println(msg);
      return;
    }
    String lineRaw = msg.substring(0, wrap);
    int spaceIndex = lineRaw.lastIndexOf(' ');
    if (spaceIndex == -1) {
      spaceIndex = lineRaw.length();
    }
    String line = lineRaw.substring(0, spaceIndex);
    output.println(line);
    printWrappedLine(output, prefix, msg.substring(spaceIndex + 1), false);
  }

  private static void configureLogging(StandaloneConfiguration configuration) {
    Level logLevel =
        configuration.debug
        ? Level.FINE
        : LoggingOptions.getDefaultLogLevel();
    if (logLevel == null) {
      logLevel = Level.INFO;
    }
    Logger.getLogger("").setLevel(logLevel);
    Logger.getLogger("org.openqa.jetty").setLevel(Level.WARNING);

    String logFilename =
        configuration.log != null
        ? configuration.log
        : LoggingOptions.getDefaultLogOutFile();
    if (logFilename != null) {
      for (Handler handler : Logger.getLogger("").getHandlers()) {
        if (handler instanceof ConsoleHandler) {
          Logger.getLogger("").removeHandler(handler);
        }
      }
      try {
        Handler logFile = new FileHandler(new File(logFilename).getAbsolutePath(), true);
        logFile.setFormatter(new TerseFormatter());
        logFile.setLevel(logLevel);
        Logger.getLogger("").addHandler(logFile);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    } else {
      for (Handler handler : Logger.getLogger("").getHandlers()) {
        if (handler instanceof ConsoleHandler) {
          handler.setLevel(logLevel);
          handler.setFormatter(new TerseFormatter());
        }
      }
    }
  }

  private static Map<String, Function<String[], GridItemLauncher>> buildLaunchers() {
    ImmutableMap.Builder<String, Function<String[], GridItemLauncher>> launchers =
      ImmutableMap.<String, Function<String[], GridItemLauncher>>builder()
        .put(GridRole.NOT_GRID.toString(), (args) -> new GridItemLauncher() {
          StandaloneConfiguration configuration = new StandaloneConfiguration();
          {
            JCommander.newBuilder().addObject(configuration).build().parse(args);
          }

          public StandaloneConfiguration getConfiguration() {
            return configuration;
          }

          public Stoppable launch() {
            log.info(String.format(
                "Launching a standalone Selenium Server on port %s", configuration.port));
            SeleniumServer server = new SeleniumServer(configuration);
            Map<String, Class<? extends Servlet >> servlets = new HashMap<>();
            servlets.put("/*", DisplayHelpServlet.class);
            server.setExtraServlets(servlets);
            server.boot();
            return server;
          }
        })
        .put(GridRole.HUB.toString(), (args) -> new GridItemLauncher() {
          GridHubConfiguration configuration;
          {
            GridHubConfiguration pending = new GridHubConfiguration();
            JCommander.newBuilder().addObject(pending).build().parse(args);
            configuration = pending;
            //re-parse the args using any -hubConfig specified to init
            if (pending.hubConfig != null) {
              configuration = GridHubConfiguration.loadFromJSON(pending.hubConfig);
              //args take precedence
              JCommander.newBuilder().addObject(configuration).build().parse(args);
            }
          }

          public StandaloneConfiguration getConfiguration() {
            return configuration;
          }

          public Stoppable launch() throws Exception {
            log.info(String.format(
                "Launching Selenium Grid hub on port %s", configuration.port));
            Hub hub = new Hub(configuration);
            hub.start();
            return hub;
          }
        })
        .put(GridRole.NODE.toString(), (args) -> new GridItemLauncher() {
          GridNodeConfiguration configuration;
          {
            GridNodeConfiguration pending = new GridNodeConfiguration();
            JCommander.newBuilder().addObject(pending).build().parse(args);
            configuration = pending;
            //re-parse the args using any -nodeConfig specified to init
            if (pending.nodeConfigFile != null) {
              configuration = GridNodeConfiguration.loadFromJSON(pending.nodeConfigFile);
              //args take precedence
              JCommander.newBuilder().addObject(configuration).build().parse(args);
            }
            if (configuration.port == null) {
              configuration.port = 5555;
            }
          }

          public StandaloneConfiguration getConfiguration() {
            return configuration;
          }

          public Stoppable launch() throws Exception {
            log.info(String.format(
                "Launching a Selenium Grid node on port %s", configuration.port));
            SelfRegisteringRemote remote = new SelfRegisteringRemote(configuration);
            SeleniumServer server = new SeleniumServer(remote.getConfiguration());
            remote.setRemoteServer(server);
            if (remote.startRemoteServer()) {
              log.info("Selenium Grid node is up and ready to register to the hub");
              remote.startRegistrationProcess();
            }
            return server;
          }
        });

    return launchers.build();
  }
}
