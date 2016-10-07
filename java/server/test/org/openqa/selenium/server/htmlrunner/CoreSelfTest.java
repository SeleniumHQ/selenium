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

package org.openqa.selenium.server.htmlrunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeNotNull;

import com.google.common.base.StandardSystemProperty;

import com.thoughtworks.selenium.testing.SeleniumAppServer;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.os.CommandLine;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

public class CoreSelfTest {

  private String browser;
  private AppServer server;

  @Before
  public void detectBrowser() {
    browser = System.getProperty("selenium.browser", "*googlechrome");

    switch (browser) {
      case "*firefox":
        assumeNotNull(CommandLine.find("geckodriver"));
        break;

      case "*googlechrome":
        assumeNotNull(CommandLine.find("chromedriver"));
        break;

      default:
        assumeFalse("No known driver able to be found", false);
    }
  }

  @Before
  public void startTestServer() {
    server = new SeleniumAppServer();
    server.start();
  }

  @After
  public void stopTestServer() {
    server.stop();
  }

  @Test
  public void executeTests() throws IOException {
    String testBase = server.whereIs("/selenium-server/tests");
    Path outputFile = Paths.get(StandardSystemProperty.JAVA_IO_TMPDIR.value())
      .resolve("core-test-suite" + browser.replace('*', '-') + ".html");
    if (Files.exists(outputFile)) {
      Files.delete(outputFile);
    }
    Files.createDirectories(outputFile.getParent());

    String result = new HTMLLauncher()
      .runHTMLSuite(
        browser,
        // We need to do this because the path relativizing code in java.net.URL is
        // clearly having a bad day. "/selenium-server/tests" appended to "../tests/"
        // ends up as "/tests" rather than "/selenium-server/tests" as you'd expect.
        testBase + "/TestSuite.html",
        testBase + "/TestSuite.html",
        outputFile.toFile(),
        TimeUnit.MINUTES.toSeconds(5),
        null);

    assertEquals("PASSED", result);
  }
}
