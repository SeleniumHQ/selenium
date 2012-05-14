/*
Copyright 2012 Selenium committers
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

package org.openqa.selenium.server.browserlaunchers;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Throwables;

import com.thoughtworks.selenium.CommandProcessor;
import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverCommandProcessor;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.util.logging.Level;
import java.util.logging.Logger;

public class DrivenSeleniumLauncher implements BrowserLauncher {
  private static final Logger log = Logger.getLogger(DrivenSeleniumLauncher.class.getName());

  private final SessionId webdriverSessionId;
  private int port;
  private String seleniumSessionId;
  private DriverSessions sessions;
  private ServerHttpChannel channel;
  private Thread serverThread;

  public DrivenSeleniumLauncher(Capabilities capabilities, RemoteControlConfiguration rcConfig,
      String sessionId, String browserStartPath) {

    String raw = null;

    if (null != browserStartPath && !browserStartPath.equals("")) {
      raw = browserStartPath;
    }

    Object value = capabilities.getCapability("webdriver.remote.sessionid");
    if (value != null && raw == null) {
      raw = String.valueOf(value);
    }

    if (null == raw) {
      throw new SeleniumException("No webdriver session id given");
    }

    webdriverSessionId = new SessionId(raw);
    port = rcConfig.getPortDriversShouldContact();
    seleniumSessionId = sessionId;
  }

  public void setDriverSessions(DriverSessions sessions) {
    this.sessions = sessions;
  }

  public void launchRemoteSession(String url) {
    Session session = sessions.get(webdriverSessionId);

    if (session == null) {
      throw new SeleniumException(
          "Unable to locate webdriver session: " + webdriverSessionId);
    }

    WebDriver driver = session.getDriver();
    CommandProcessor processor = new WebDriverCommandProcessor(url, driver);

    channel = new ServerHttpChannel(seleniumSessionId, port, processor);
    serverThread = new Thread(channel);
    serverThread.setName("WebDriver-backed Selenium for " + seleniumSessionId);

    serverThread.start();
  }

  public void launchHTMLSuite(String suiteUrl, String baseUrl) {
    throw new UnsupportedOperationException("launchHTMLSuite");
  }

  public void close() {
    Session session = sessions.get(webdriverSessionId);
    if (session == null) {
      return;
    }

    WebDriver driver = session.getDriver();
    if (driver != null) {
      try {
        driver.quit();
      } catch (WebDriverException e) {
        log.log(Level.WARNING, "Cannot quit session", e);
      }
    }

    session.close();
    sessions.deleteSession(webdriverSessionId);
    channel.kill();
    try {
      serverThread.join();
    } catch (InterruptedException e) {
      Throwables.propagate(e);
    }
  }

  @VisibleForTesting
  protected String getSessionId() {
    return webdriverSessionId.toString();
  }
}
