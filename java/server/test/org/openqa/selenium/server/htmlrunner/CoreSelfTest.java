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
import static org.junit.Assert.assertTrue;

import com.google.common.collect.ImmutableSortedSet;

import com.thoughtworks.selenium.testing.SeleniumAppServer;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.openqa.selenium.Platform;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.os.CommandLine;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

@RunWith(Parameterized.class)
public class CoreSelfTest {

  private final String browser;
  private static AppServer server;

  public CoreSelfTest(String browser) {
    this.browser = browser;
  }

  @BeforeClass
  public static void startTestServer() {
    server = new SeleniumAppServer();
    server.start();
  }

  @AfterClass
  public static void stopTestServer() {
    server.stop();
  }

  @Test
  public void executeTests() throws IOException {
    String testBase = server.whereIs("/selenium-server/tests");
    File outputFile = File.createTempFile("core-test-suite", browser.replace('*', '-') + ".html");
    assertTrue(outputFile.delete());

    String result = new HTMLLauncher()
      .runHTMLSuite(
        browser,
        // We need to do this because the path relativizing code in java.net.URL is
        // clearly having a bad day. "/selenium-server/tests" appended to "../tests/"
        // ends up as "/tests" rather than "/selenium-server/tests" as you'd expect.
        testBase + "/TestSuite.html",
        testBase + "/TestSuite.html",
        outputFile,
        TimeUnit.MINUTES.toMillis(5),
        true);

    assertEquals("PASSED", result);
  }

  @Parameterized.Parameters
  public static Iterable<String> parameters() {
    ImmutableSortedSet.Builder<String> browsers = ImmutableSortedSet.naturalOrder();

    if (CommandLine.find("chromedriver") != null) {
      browsers.add("*googlechrome");
    }

    if (CommandLine.find("wires") != null) {
//      browsers.add("*firefox");
    }

    switch (Platform.getCurrent().family()) {
      case MAC:
        //        browsers.add("*safari");
        break;

      case WINDOWS:
        browsers.add("*iexplore");
        break;
    }

    return browsers.build();
  }
}
