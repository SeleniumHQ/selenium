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

package org.openqa.grid.e2e.misc;

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.startsWith;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

import com.google.common.base.Function;

import org.junit.Test;
import org.openqa.grid.selenium.GridLauncherV3;
import org.openqa.grid.shared.Stoppable;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.FluentWait;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Ensure that launching the hub / node in most common ways simulating command line args works
 */
public class GridViaCommandLineTest {

  @Test
  public void unrecognizedRole() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-role", "hamlet"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString(),
               startsWith("Error: the role 'hamlet' does not match a recognized server role"));
  }

  @Test
  public void canPrintVersion() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-version"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString(), startsWith("Selenium server version: "));
  }

  @Test
  public void canPrintGeneralHelp() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-help"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString(), startsWith("Usage: <main class> [options]"));
    assertThat(outSpy.toString(), containsString("-role"));
  }

  @Test
  public void canPrintHubHelp() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-role", "hub", "-help"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString(), startsWith("Usage: <main class> [options]"));
    assertThat(outSpy.toString(), containsString("-hubConfig"));
  }

  @Test
  public void canPrintNodeHelp() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-role", "node", "-help"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString(), startsWith("Usage: <main class> [options]"));
    assertThat(outSpy.toString(), containsString("-nodeConfig"));
  }

  @Test
  public void canRedirectLogToFile() throws Exception {
    Integer port = PortProber.findFreePort();
    Path tempLog = Files.createTempFile("test", ".log");
    String[] args = {"-log", tempLog.toString(), "-port", port.toString()};
    Optional<Stoppable> server = new GridLauncherV3(args).launch();
    assertTrue(server.isPresent());
    String log = String.join("", Files.readAllLines(tempLog));
    assertThat(log, containsString("Selenium Server is up and running on port " + port));
    server.get().stop();
  }

  @Test
  public void canStartHtmlSuite() {
    ByteArrayOutputStream outSpy = new ByteArrayOutputStream();
    String[] args = {"-htmlSuite", "*quantum", "http://base.url", "suite.html", "report.html"};
    new GridLauncherV3(new PrintStream(outSpy), args).launch();
    assertThat(outSpy.toString(), containsString("Download the Selenium HTML Runner"));
  }

  @Test
  public void testRegisterNodeToHub() throws Exception {
    Integer hubPort = PortProber.findFreePort();
    String[] hubArgs = {"-role", "hub", "-port", hubPort.toString()};
    Optional<Stoppable> hub = new GridLauncherV3(hubArgs).launch();
    UrlChecker urlChecker = new UrlChecker();
    urlChecker.waitUntilAvailable(10, TimeUnit.SECONDS, new URL(
        String.format("http://localhost:%d/grid/console", hubPort)));

    Integer nodePort = PortProber.findFreePort();

    String[] nodeArgs = {"-role", "node", "-hub", "http://localhost:" + hubPort,
                         "-browser", "browserName=htmlunit,maxInstances=1", "-port", nodePort.toString()};
    Optional<Stoppable> node = new GridLauncherV3(nodeArgs).launch();
    urlChecker.waitUntilAvailable(100, TimeUnit.SECONDS, new URL(
        String.format("http://localhost:%d/wd/hub/status", nodePort)));

    new FluentWait<>(new URL(String.format("http://localhost:%d/grid/console", hubPort)))
      .withTimeout(5, TimeUnit.SECONDS).pollingEvery(50, TimeUnit.MILLISECONDS)
      .until((Function<URL, Boolean>) u -> {
        try (InputStream is = u.openConnection().getInputStream();
             InputStreamReader isr = new InputStreamReader(is, StandardCharsets.UTF_8);
             BufferedReader reader = new BufferedReader(isr)) {
          return reader.lines().anyMatch(l -> l.contains("htmlunit"));
        } catch (IOException ioe) {
          return false;
        }
      });

    WebDriver driver = new RemoteWebDriver(new URL(String.format("http://localhost:%d/wd/hub", hubPort)),
                                                   DesiredCapabilities.htmlUnit());

    try {
      driver.get(String.format("http://localhost:%d/grid/console", hubPort));
      assertEquals("Should only have one htmlunit registered to the hub",
                   1, driver.findElements(By.cssSelector("img[src$='htmlunit.png']")).size());
    } finally {
      try {
        driver.quit();
      } catch (Exception ignore) {}
    }

    node.ifPresent(Stoppable::stop);
    hub.ifPresent(Stoppable::stop);
  }
}
