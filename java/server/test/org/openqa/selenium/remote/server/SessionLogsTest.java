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

import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.SAFARI;

import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.logging.SessionLogHandler;
import org.openqa.selenium.logging.SessionLogs;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.BrowserToCapabilities;
import org.openqa.selenium.testing.drivers.OutOfProcessSeleniumServer;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.Map;
import java.util.Set;

@Ignore({CHROME, HTMLUNIT, IE, SAFARI})
public class SessionLogsTest extends JUnit4TestBase {

  private static OutOfProcessSeleniumServer server;
  private RemoteWebDriver localDriver;

  @BeforeClass
  public static void startUpServer() throws IOException {
    server = new OutOfProcessSeleniumServer();
    server.enableLogCapture();
    server.start();
  }

  @AfterClass
  public static void stopServer() {
    server.stop();
  }

  @After
  public void stopDriver() {
    if (localDriver != null) {
      localDriver.quit();
      localDriver = null;
    }
  }

  private void startDriver() {
    DesiredCapabilities caps = BrowserToCapabilities.of(Browser.detect());
    if (caps == null) {
      caps = new DesiredCapabilities();
    }
    localDriver = new RemoteWebDriver(server.getWebDriverUrl(), caps);
    localDriver.setFileDetector(new LocalFileDetector());
  }

  @Test
  public void sessionLogsShouldContainAllAvailableLogTypes() throws Exception {
    startDriver();
    Set<String> logTypes = localDriver.manage().logs().getAvailableLogTypes();
    stopDriver();
    Map<String, SessionLogs> sessionMap =
        SessionLogHandler.getSessionLogs(getValueForPostRequest(server.getWebDriverUrl()));
    for (SessionLogs sessionLogs : sessionMap.values()) {
      for (String logType : logTypes) {
        assertTrue(String.format("Session logs should include available log type %s", logType),
          sessionLogs.getLogTypes().contains(logType));
      }
    }
  }

  private static JsonObject getValueForPostRequest(URL serverUrl) throws Exception {
    String postRequest = serverUrl + "/logs";
    HttpClient client = HttpClientBuilder.create().build();
    HttpPost postCmd = new HttpPost(postRequest);
    HttpResponse response = client.execute(postCmd);
    HttpEntity entity = response.getEntity();
    InputStreamReader reader = new InputStreamReader(entity.getContent(), Charsets.UTF_8);
    try {
      String str = CharStreams.toString(reader);
      return new JsonParser().parse(str).getAsJsonObject()
          .get("value").getAsJsonObject();
    } finally {
      EntityUtils.consume(entity);
      reader.close();
    }
  }
}
