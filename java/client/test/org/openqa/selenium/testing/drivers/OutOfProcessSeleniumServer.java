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

import org.openqa.selenium.build.BazelBuild;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.build.InProject;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Logger;

public class OutOfProcessSeleniumServer {

  private static final Logger log = Logger.getLogger(OutOfProcessSeleniumServer.class.getName());

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
    log.info("Got a request to start a new selenium server");
    if (command != null) {
      log.info("Server already started");
      throw new RuntimeException("Server already started");
    }

    String serverJar = buildServerAndClasspath();

    int port = PortProber.findFreePort();
    String localAddress = new NetworkUtils().getPrivateLocalAddress();
    baseUrl = String.format("http://%s:%d", localAddress, port);

    List<String> cmdLine = new LinkedList<>();
    cmdLine.add("java");
    cmdLine.add("-jar");
    cmdLine.add(serverJar);
    cmdLine.add(mode);
    cmdLine.add("--port");
    cmdLine.add(String.valueOf(port));
    cmdLine.addAll(Arrays.asList(extraFlags));
    command = new CommandLine(cmdLine.toArray(new String[0]));

    if (Boolean.getBoolean("webdriver.development")) {
      command.copyOutputTo(System.err);
    }
    command.setWorkingDirectory(
      InProject.locate("Rakefile").getParent().toAbsolutePath().toString());
    log.info("Starting selenium server: " + command.toString());
    command.executeAsync();

    try {
      URL url = new URL(baseUrl + "/status");
      log.info("Waiting for server status on URL " + url);
      new UrlChecker().waitUntilAvailable(30, SECONDS, url);
      log.info("Server is ready");
    } catch (UrlChecker.TimeoutException e) {
      log.severe("Server failed to start: " + e.getMessage());
      command.destroy();
      log.severe(command.getStdOut());
      command = null;
      throw new RuntimeException(e);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }

    WebDriverBuilder.addShutdownAction(this::stop);

    return this;
  }

  public void stop() {
    if (command == null) {
      return;
    }
    log.info("Stopping selenium server");
    command.destroy();
    log.info("Selenium server stopped");
    command = null;
  }

  private String buildServerAndClasspath() {
    new BazelBuild().build("//java/server/src/org/openqa/selenium/grid:selenium_server_deploy.jar");
    return InProject.locate("bazel-bin")
        .resolve("java/server/src/org/openqa/selenium/grid/selenium_server_deploy.jar")
        .toAbsolutePath().toString();
  }

  public URL getWebDriverUrl() {
    try {
      return new URL(baseUrl);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }
}
