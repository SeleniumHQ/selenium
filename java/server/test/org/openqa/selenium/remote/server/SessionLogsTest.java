/*
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.remote.server;

import static org.junit.Assert.assertTrue;

import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;

import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import java.io.InputStreamReader;
import java.net.URL;
import java.util.Map;
import java.util.Set;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
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

@Ignore({ANDROID, CHROME, HTMLUNIT, IE, IPHONE, OPERA, OPERA_MOBILE, SAFARI, SELENESE})
public class SessionLogsTest extends JUnit4TestBase {

  private static OutOfProcessSeleniumServer server;
  private RemoteWebDriver localDriver;
  
  @BeforeClass
  public static void startUpServer() {
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
  
  private static JSONObject getValueForPostRequest(URL serverUrl) throws Exception {
    String postRequest = serverUrl + "/logs";
    HttpClient client = new DefaultHttpClient();
    HttpPost postCmd = new HttpPost(postRequest);
    HttpResponse response = client.execute(postCmd);
    HttpEntity entity = response.getEntity();
    InputStreamReader reader = new InputStreamReader(entity.getContent(), Charsets.UTF_8);
    try {
      String str = CharStreams.toString(reader);
      return new JSONObject(str).getJSONObject("value");
    } finally {
      EntityUtils.consume(entity);
      reader.close();
    }
  }
}
