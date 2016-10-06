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

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableMap;

import com.beust.jcommander.JCommander;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.internal.utils.configuration.CoreRunnerConfiguration;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.internal.utils.configuration.StandaloneConfiguration;
import org.openqa.grid.shared.CliUtils;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.DisplayHelpServlet;
import org.openqa.selenium.internal.BuildInfo;
import org.openqa.selenium.remote.server.SeleniumServer;
import org.openqa.selenium.remote.server.log.LoggingOptions;
import org.openqa.selenium.remote.server.log.TerseFormatter;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;
import java.util.logging.ConsoleHandler;
import java.util.logging.FileHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Servlet;

public class GridLauncherV3 {

  private static final Logger log = Logger.getLogger(GridLauncherV3.class.getName());
  private static final String CORE_RUNNER_CLASS =
    "org.openqa.selenium.server.htmlrunner.HTMLLauncher";

  private static abstract class GridItemLauncher {
    protected StandaloneConfiguration configuration;
    protected boolean helpRequested;
    abstract void setConfiguration(String[] args);
    abstract void launch() throws Exception;
    void printUsage() {
      new JCommander(configuration).usage();
    }
  }

  private static ImmutableMap<String, Supplier<GridItemLauncher>> LAUNCHERS = buildLaunchers();

  public static void main(String[] args) throws Exception {
    GridItemLauncher launcher = buildLauncher(args);
    if (launcher == null) {
      return;
    }

    if (launcher.helpRequested) {
      launcher.printUsage();
      return;
    }

    configureLogging(launcher.configuration);

    BuildInfo buildInfo = new BuildInfo();
    log.info(String.format(
      "Selenium build info: version: '%s', revision: '%s'",
      buildInfo.getReleaseLabel(),
      buildInfo.getBuildRevision()));
    try {
      launcher.launch();
    } catch (Exception e) {
      launcher.printUsage();
      e.printStackTrace();
    }
  }

  /**
   * From the {@code args}, builds a new {@link GridItemLauncher} and populates it properly.
   *
   * @return null if no role is found, or a properly populated {@link GridItemLauncher}.
   */
  private static GridItemLauncher buildLauncher(String[] args) {
    String role = "standalone";

    for (int i = 0; i < args.length; i++) {
      if (args[i].equals("-htmlSuite")) {
        Supplier<GridItemLauncher> launcherSupplier = LAUNCHERS.get("corerunner");
        if (launcherSupplier == null) {
          System.err.println(Joiner.on("\n").join(
            "Unable to find the HTML runner. This is normally because you have not downloaded",
            "or made available the 'selenium-leg-rc' jar on the CLASSPATH. Your test will",
            "not be run.",
            "Download the Selenium HTML Runner from http://www.seleniumhq.org/download/ and",
            "use that in place of the selenium-server-standalone.jar for the simplest way of",
            "running your HTML suite."));
          return null;
        }
        GridItemLauncher launcher = launcherSupplier.get();
        launcher.setConfiguration(args);
        return launcher;
      }
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
    if (gridRole == null) {
      printInfoAboutRoles(role);
      return null;
    }

    Supplier<GridItemLauncher> supplier = LAUNCHERS.get(gridRole.toString());
    if (supplier == null) {
      System.err.println("Unknown role: " + gridRole);
      return null;
    }
    GridItemLauncher toReturn = supplier.get();
    toReturn.setConfiguration(args);
    return toReturn;
  }

  private static void printInfoAboutRoles(String roleCommandLineArg) {
    if (roleCommandLineArg != null) {
      CliUtils.printWrappedLine(
        "",
        "Error: the role '" + roleCommandLineArg + "' does not match a recognized server role: node/hub/standalone\n");
    } else {
      CliUtils.printWrappedLine(
        "",
        "Error: -role option needs to be followed by the value that defines role of this component in the grid\n");
    }
    System.out.println(
      "Selenium server can run in one of the following roles:\n" +
      "  hub         as a hub of a Selenium grid\n" +
      "  node        as a node of a Selenium grid\n" +
      "  standalone  as a standalone server not being a part of a grid\n" +
      "\n" +
      "If -role option is omitted the server runs standalone\n");
    CliUtils.printWrappedLine(
      "",
      "To get help on the options available for a specific role run the server"
      + " with -help option and the corresponding -role option value");
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

  private static ImmutableMap<String, Supplier<GridItemLauncher>> buildLaunchers() {
    ImmutableMap.Builder<String, Supplier<GridItemLauncher>> launchers =
      ImmutableMap.<String, Supplier<GridItemLauncher>>builder()
        .put(GridRole.NOT_GRID.toString(), () -> new GridItemLauncher() {
          public void setConfiguration(String[] args) {
            configuration = new StandaloneConfiguration();
            new JCommander(configuration, args);
            helpRequested = configuration.help;
          }

          public void launch() throws Exception {
            log.info("Launching a standalone Selenium Server");
            SeleniumServer server = new SeleniumServer(configuration);
            Map<String, Class<? extends Servlet >> servlets = new HashMap<>();
            servlets.put("/*", DisplayHelpServlet.class);
            server.setExtraServlets(servlets);
            server.boot();
            log.info("Selenium Server is up and running");
          }
        })
        .put(GridRole.HUB.toString(), () -> new GridItemLauncher() {
          public void setConfiguration(String[] args) {
            GridHubConfiguration pending = new GridHubConfiguration();
            new JCommander(pending, args);
            configuration = pending;
            //re-parse the args using any -hubConfig specified to init
            if (pending.hubConfig != null) {
              configuration = GridHubConfiguration.loadFromJSON(pending.hubConfig);
              new JCommander(configuration, args); //args take precedence
            }
            helpRequested = configuration.help;
          }

          public void launch() throws Exception {
            log.info("Launching Selenium Grid hub");
            Hub h = new Hub((GridHubConfiguration) configuration);
            h.start();
            log.info("Nodes should register to " + h.getRegistrationURL());
            log.info("Selenium Grid hub is up and running");
          }
        })
        .put(GridRole.NODE.toString(), () -> new GridItemLauncher() {
          public void setConfiguration(String[] args) {
            GridNodeConfiguration pending = new GridNodeConfiguration();
            new JCommander(pending, args);
            configuration = pending;
            //re-parse the args using any -nodeConfig specified to init
            if (pending.nodeConfigFile != null) {
              configuration = GridNodeConfiguration.loadFromJSON(pending.nodeConfigFile);
              new JCommander(configuration, args); //args take precedence
            }
            helpRequested = configuration.help;
            if (configuration.port == null) {
              configuration.port = 5555;
            }
          }

          public void launch() throws Exception {
            log.info("Launching a Selenium Grid node");
            RegistrationRequest
              c =
              RegistrationRequest.build((GridNodeConfiguration) configuration);
            SelfRegisteringRemote remote = new SelfRegisteringRemote(c);
            remote.setRemoteServer(new SeleniumServer(configuration));
            remote.startRemoteServer();
            log.info("Selenium Grid node is up and ready to register to the hub");
            remote.startRegistrationProcess();
          }
        });

    try {
      Class.forName(CORE_RUNNER_CLASS, false, GridLauncherV3.class.getClassLoader());

      launchers.put("corerunner", () -> new GridItemLauncher() {
        @Override
        void setConfiguration(String[] args) {
          configuration = new CoreRunnerConfiguration();
          new JCommander(configuration, args);
          helpRequested = configuration.help;
        }

        @Override
        void launch() throws Exception {
          Class<?> coreRunnerClass = Class.forName(CORE_RUNNER_CLASS);
          Object coreRunner = coreRunnerClass.newInstance();
          Method mainInt = coreRunnerClass.getMethod("mainInt", String[].class);

          CoreRunnerConfiguration runnerConfig = (CoreRunnerConfiguration) this.configuration;
          String[] args = new String[] {
            /* Results file */ runnerConfig.htmlSuite.get(3),
            /* suite */ runnerConfig.htmlSuite.get(2),
            /* start url */ runnerConfig.htmlSuite.get(1),
            /* multi window */ "true",
            /* browser string */ runnerConfig.htmlSuite.get(0),
          };
          Integer result = (Integer) mainInt.invoke(coreRunner, (Object) args);
          System.exit(result);
        }
      });
    } catch (ReflectiveOperationException e) {
      // Do nothing. It's fine.
    }

    return launchers.build();
  }
}
