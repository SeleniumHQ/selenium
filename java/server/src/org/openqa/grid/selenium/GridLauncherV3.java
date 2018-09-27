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
import org.openqa.grid.internal.cli.GridHubCliOptions;
import org.openqa.grid.internal.cli.GridNodeCliOptions;
import org.openqa.grid.internal.cli.StandaloneCliOptions;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.internal.utils.configuration.StandaloneConfiguration;
import org.openqa.grid.shared.Stoppable;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.net.PortProber;
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
import java.util.function.BiConsumer;
import java.util.function.Consumer;
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

  @FunctionalInterface
  private interface GridItemLauncher {
    Optional<Stoppable> launch(PrintStream out) throws Exception;
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

    try {
      return launcher.launch(out);
    } catch (Exception e) {
      throw new RuntimeException(e);
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

  private static void configureLogging(String log, boolean debug) {
    Level logLevel = debug ? Level.FINE : LoggingOptions.getDefaultLogLevel();
    if (logLevel == null) {
      logLevel = Level.INFO;
    }
    Logger.getLogger("").setLevel(logLevel);

    String logFilename = log != null ? log : LoggingOptions.getDefaultLogOutFile();
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
    BiConsumer<JCommander, PrintStream> usage = (commander, out) -> {
      StringBuilder toPrint = new StringBuilder();
      commander.usage(toPrint);
      out.append(toPrint);
    };

    Consumer<PrintStream> version = out -> {
      out.println(String.format(
          "Selenium server version: %s, revision: %s",
          buildInfo.getReleaseLabel(),
          buildInfo.getBuildRevision()));
    };

    ImmutableMap.Builder<String, Function<String[], GridItemLauncher>> launchers =
      ImmutableMap.<String, Function<String[], GridItemLauncher>>builder()
        .put(GridRole.NOT_GRID.toString(), (args) -> new GridItemLauncher() {
          @Override
          public Optional<Stoppable> launch(PrintStream out) {
            StandaloneCliOptions options = new StandaloneCliOptions();
            JCommander commander = options.parse(args);

            if (options.getVersion()) {
              version.accept(out);
              return Optional.empty();
            }

            if (options.getHelp()) {
              usage.accept(commander, out);
              return Optional.empty();
            }

            configureLogging(options.getLog(), options.getDebug());

            log.info(String.format(
                "Selenium build info: version: '%s', revision: '%s'",
                buildInfo.getReleaseLabel(),
                buildInfo.getBuildRevision()));

            StandaloneConfiguration configuration = new StandaloneConfiguration(options);
            log.info(String.format(
                "Launching a standalone Selenium Server on port %s", configuration.port));
            SeleniumServer server = new SeleniumServer(configuration);
            Map<String, Class<? extends Servlet >> servlets = new HashMap<>();
            servlets.put("/*", DisplayHelpServlet.class);
            server.setExtraServlets(servlets);
            server.boot();
            return Optional.of(server);
          }
        })
        .put(GridRole.HUB.toString(), (args) -> new GridItemLauncher() {

          @Override
          public Optional<Stoppable> launch(PrintStream out) throws Exception {
            GridHubCliOptions options = new GridHubCliOptions();
            JCommander commander = options.parse(args);

            if (options.getVersion()) {
              version.accept(out);
              return Optional.empty();
            }

            if (options.getHelp()) {
              usage.accept(commander, out);
              return Optional.empty();
            }

            configureLogging(options.getLog(), options.getDebug());

            log.info(String.format(
                "Selenium build info: version: '%s', revision: '%s'",
                buildInfo.getReleaseLabel(),
                buildInfo.getBuildRevision()));

            GridHubConfiguration configuration = new GridHubConfiguration(options);
            log.info(String.format(
                "Launching Selenium Grid hub on port %s", configuration.port));
            Hub hub = new Hub(configuration);
            hub.start();
            return Optional.of(hub);
          }
        })
        .put(GridRole.NODE.toString(), (args) -> new GridItemLauncher() {

          @Override
          public Optional<Stoppable> launch(PrintStream out) throws Exception {
            GridNodeCliOptions options = new GridNodeCliOptions();
            JCommander commander = options.parse(args);

            if (options.getVersion()) {
              version.accept(out);
              return Optional.empty();
            }

            if (options.getHelp()) {
              usage.accept(commander, out);
              return Optional.empty();
            }

            configureLogging(options.getLog(), options.getDebug());

            log.info(String.format(
                "Selenium build info: version: '%s', revision: '%s'",
                buildInfo.getReleaseLabel(),
                buildInfo.getBuildRevision()));

            GridNodeConfiguration configuration = new GridNodeConfiguration(options);
            if (configuration.port == null || configuration.port == -1) {
              configuration.port = PortProber.findFreePort();
            }
            log.info(String.format(
                "Launching a Selenium Grid node on port %s", configuration.port));
            SelfRegisteringRemote remote = new SelfRegisteringRemote(configuration);
            SeleniumServer server = new SeleniumServer(remote.getConfiguration());
            remote.setRemoteServer(server);
            if (remote.startRemoteServer()) {
              log.info("Selenium Grid node is up and ready to register to the hub");
              remote.startRegistrationProcess();
            }
            return Optional.of(server);
          }
        });

    return launchers.build();
  }
}
