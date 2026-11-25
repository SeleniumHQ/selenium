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

package org.openqa.selenium.testing.drivers;

import static java.util.concurrent.TimeUnit.SECONDS;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Platform;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.edge.EdgeDriverService;
import org.openqa.selenium.firefox.GeckoDriverService;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.ExternalProcess;
import org.openqa.selenium.remote.service.DriverService;

class OutOfProcessSeleniumServer {

  private static final Logger LOG = Logger.getLogger(OutOfProcessSeleniumServer.class.getName());
  private static final Set<Browser> GRID_BROWSERS =
      EnumSet.of(Browser.CHROME, Browser.EDGE, Browser.FIREFOX, Browser.SAFARI);

  private @Nullable String baseUrl = null;
  private @Nullable ExternalProcess process = null;

  @SuppressWarnings("unused")
  private boolean captureLogs = false;

  public void enableLogCapture() {
    captureLogs = true;
  }

  /**
   * Creates an out of process server with log capture enabled.
   *
   * @return The new server.
   */
  public OutOfProcessSeleniumServer start(String mode, String... extraFlags) {
    LOG.info("Got a request to start a new selenium server");
    if (process != null) {
      LOG.info("Server already started");
      throw new RuntimeException("Server already started");
    }

    String serverBinary = buildServerAndClasspath();

    int port = PortProber.findFreePort();
    String localAddress = new NetworkUtils().getPrivateLocalAddress();
    baseUrl = String.format("http://%s:%d", localAddress, port);

    // Make sure we inherit system properties.
    Stream<String> javaFlags =
        System.getProperties().entrySet().stream()
            .filter(entry -> {
              String key = String.valueOf(entry.getKey());
              return key.startsWith("selenium") || key.startsWith("webdriver");
            })
            .map(entry -> "--jvm_flag=-D" + entry.getKey() + "=" + entry.getValue());

    boolean driverProvided =
        Stream.of(
                GeckoDriverService.createDefaultService(),
                EdgeDriverService.createDefaultService(),
                ChromeDriverService.createDefaultService())
            .map(DriverService::getDriverProperty)
            .filter(prop -> !prop.isEmpty())
            .map(System::getProperty)
            .anyMatch(Objects::nonNull);

    List<String> startupArgs = new ArrayList<>();
    startupArgs.add(mode);
    startupArgs.add("--host");
    startupArgs.add(localAddress);
    startupArgs.add("--port");
    startupArgs.add(String.valueOf(port));
    if (!driverProvided) {
      startupArgs.addAll(unpinnedDriverArgs(Browser.detect()));
    }

    ExternalProcess.Builder builder =
        ExternalProcess.builder()
            .command(
                serverBinary,
                Stream.concat(
                        javaFlags,
                        Stream.concat(
                            // If the driver is provided, we _don't_ want to use Selenium Manager
                            startupArgs.stream(), Stream.of(extraFlags)))
                    .collect(Collectors.toList()))
            .copyOutputTo(System.err);

    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      File workingDir = findBinRoot(new File(".").getAbsoluteFile());
      builder.directory(workingDir.getAbsolutePath());
    }

    LOG.info("Starting selenium server: " + builder.command());
    process = builder.start();

    try {
      URL url = new URL(baseUrl + "/status");
      LOG.info("Waiting for server status on URL " + url);
      new UrlChecker().waitUntilAvailable(20, SECONDS, url);
      LOG.info("Server is ready");
    } catch (UrlChecker.TimeoutException e) {
      LOG.log(Level.SEVERE, "Server failed to start: " + e.getMessage(), e);
      process.shutdown();
      LOG.severe(process.getOutput());
      process = null;
      throw new RuntimeException(e);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }

    WebDriverBuilder.addShutdownAction(this::stop);

    return this;
  }

  // A slot for only the browser under test, so the node doesn't run Selenium Manager for every
  // browser at startup. A config file, since Java doesn't escape a stereotype's quotes on Windows.
  private static List<String> unpinnedDriverArgs(@Nullable Browser browser) {
    if (browser == null || !GRID_BROWSERS.contains(browser)) {
      return List.of("--selenium-manager", "true");
    }

    String config =
        String.join(
            "\n",
            "[node]",
            "detect-drivers = false",
            "[[node.driver-configuration]]",
            "display-name = \"" + browser.displayName() + "\"",
            "[node.driver-configuration.stereotype]",
            "browserName = \"" + browser.getCapabilities().getBrowserName() + "\"");
    try {
      Path configFile = Files.createTempFile("selenium-node", ".toml");
      configFile.toFile().deleteOnExit();
      Files.writeString(configFile, config);
      return List.of("--config", configFile.toString());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private File findBinRoot(File dir) {
    if ("bin".equals(dir.getName())) {
      return dir;
    } else {
      return findBinRoot(dir.getParentFile());
    }
  }

  public void stop() {
    if (process == null) {
      return;
    }
    LOG.info("Stopping selenium server");
    process.shutdown();
    LOG.info("Selenium server stopped");
    process = null;
  }

  private String buildServerAndClasspath() {
    String server =
        InProject.resolveRunfilesPath(System.getProperty("selenium.browser.remote.path"));
    if (server == null) {
      throw new AssertionError(
          "Please set the sys property selenium.browser.remote.path to point to the out-of-process"
              + " selenium server");
    }
    return server;
  }

  public URL getWebDriverUrl() {
    try {
      return new URL(baseUrl);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }
}
