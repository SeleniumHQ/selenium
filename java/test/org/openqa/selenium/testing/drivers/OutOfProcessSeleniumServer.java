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
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.openqa.selenium.Platform;
import org.openqa.selenium.build.BazelBuild;
import org.openqa.selenium.build.DevMode;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.edge.EdgeDriverService;
import org.openqa.selenium.firefox.GeckoDriverService;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.remote.service.DriverService;

class OutOfProcessSeleniumServer {

  private static final Logger LOG = Logger.getLogger(OutOfProcessSeleniumServer.class.getName());

  private String baseUrl;
  private CommandLine command;

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
    if (command != null) {
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
            .filter(
                entry -> {
                  String key = String.valueOf(entry.getKey());
                  return key.startsWith("selenium") || key.startsWith("webdriver");
                })
            .map(entry -> "--jvm_flag=-D" + entry.getKey() + "=" + entry.getValue());

    // Only use Selenium Manager if we're not running with pinned browsers.
    boolean driverProvided =
        Stream.of(
                GeckoDriverService.createDefaultService(),
                EdgeDriverService.createDefaultService(),
                ChromeDriverService.createDefaultService())
            .map(DriverService::getDriverProperty)
            .filter(Objects::nonNull)
            .map(System::getProperty)
            .anyMatch(Objects::nonNull);

    List<String> startupArgs = new ArrayList<>();
    startupArgs.add(mode);
    startupArgs.add("--host");
    startupArgs.add(localAddress);
    startupArgs.add("--port");
    startupArgs.add(String.valueOf(port));
    if (!driverProvided) {
      startupArgs.add("--selenium-manager");
      startupArgs.add("true");
    }

    command =
        new CommandLine(
            serverBinary,
            Stream.concat(
                    javaFlags,
                    Stream.concat(
                        // If the driver is provided, we _don't_ want to use Selenium Manager
                        startupArgs.stream(), Stream.of(extraFlags)))
                .toArray(String[]::new));
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      File workingDir = findBinRoot(new File(".").getAbsoluteFile());
      command.setWorkingDirectory(workingDir.getAbsolutePath());
    }

    command.copyOutputTo(System.err);
    LOG.info("Starting selenium server: " + command.toString());
    command.executeAsync();

    try {
      URL url = new URL(baseUrl + "/status");
      LOG.info("Waiting for server status on URL " + url);
      new UrlChecker().waitUntilAvailable(10, SECONDS, url);
      LOG.info("Server is ready");
    } catch (UrlChecker.TimeoutException e) {
      LOG.severe("Server failed to start: " + e.getMessage());
      command.destroy();
      LOG.severe(command.getStdOut());
      command = null;
      throw new RuntimeException(e);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }

    WebDriverBuilder.addShutdownAction(this::stop);

    return this;
  }

  private File findBinRoot(File dir) {
    if ("bin".equals(dir.getName())) {
      return dir;
    } else {
      return findBinRoot(dir.getParentFile());
    }
  }

  public void stop() {
    if (command == null) {
      return;
    }
    LOG.info("Stopping selenium server");
    command.destroy();
    LOG.info("Selenium server stopped");
    command = null;
  }

  private String buildServerAndClasspath() {
    if (DevMode.isInDevMode()) {
      Path serverJar =
          InProject.locate("bazel-bin/java/src/org/openqa/selenium/grid/selenium_server");
      if (serverJar == null) {
        new BazelBuild().build("grid");
        serverJar = InProject.locate("bazel-bin/java/src/org/openqa/selenium/grid/selenium_server");
      }
      if (serverJar != null) {
        return serverJar.toAbsolutePath().toString();
      }
    }

    if (System.getProperty("selenium.browser.remote.path") != null) {
      return System.getProperty("selenium.browser.remote.path");
    }
    throw new AssertionError(
        "Please set the sys property selenium.browser.remote.path to point to the out-of-process"
            + " selenium server");
  }

  public URL getWebDriverUrl() {
    try {
      return new URL(baseUrl);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }
}
