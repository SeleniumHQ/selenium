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
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.logging.SessionLogHandler;
import org.openqa.selenium.logging.SessionLogs;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.OutOfProcessSeleniumServer;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.IOException;
import java.net.URL;
import java.util.Map;
import java.util.Set;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(CHROME)
@Ignore(CHROMIUMEDGE)
@Ignore(SAFARI)
public class SessionLogsTest extends JUnit4TestBase {

  private static OutOfProcessSeleniumServer server;
  private RemoteWebDriver localDriver;

  @BeforeClass
  public static void startUpServer() throws IOException {
    server = new OutOfProcessSeleniumServer();
    server.enableLogCapture();
    server.start("standalone");
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
    Capabilities caps = WebDriverBuilder.getStandardCapabilitiesFor(Browser.detect());
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

  private static Map<String, Object> getValueForPostRequest(URL serverUrl) throws Exception {
    String url = serverUrl + "/logs";
    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    HttpClient client = factory.createClient(new URL(url));
    HttpResponse response = client.execute(new HttpRequest(HttpMethod.POST, url));
    Map<String, Object> map = new Json().toType(string(response), MAP_TYPE);
    return (Map<String, Object>) map.get("value");
  }
}
