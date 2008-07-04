package org.openqa.selenium.remote.server;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.OperatingSystem;
import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.SessionId;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class DriverSessions {

  private static Map<SessionId, Session> sessionIdToDriver =
      new ConcurrentHashMap<SessionId, Session>();

  public SessionId newSession(Capabilities capabilities) throws Exception {
    SessionId sessionId = new SessionId(String.valueOf(System.currentTimeMillis()));

    WebDriver driver = createNewDriverMatching(capabilities);
    boolean isRendered = isRenderingDriver(capabilities);

    sessionIdToDriver.put(sessionId, new Session(driver, capabilities, isRendered));
    return sessionId;
  }

  private boolean isRenderingDriver(Capabilities capabilities) {
    String browser = capabilities.getBrowserName();

    return browser != null && !"".equals(browser) && !"htmlunit".equals(browser);
  }

  private WebDriver createNewDriverMatching(Capabilities capabilities) throws Exception {
    OperatingSystem os = capabilities.getOperatingSystem();
    if (os != null && !OperatingSystem.ANY.equals(os) && !OperatingSystem.getCurrentPlatform()
        .equals(os)) {
      throw new RuntimeException("Desired operating system does not match current OS");
    }

    String browser = capabilities.getBrowserName();
    if (browser != null) {
      return createNewInstanceOf(browser);
    }

    if (capabilities.isJavascriptEnabled()) {
      return (WebDriver) Class.forName("org.openqa.selenium.firefox.FirefoxDriver")
          .newInstance();
    }

    return (WebDriver) Class.forName("org.openqa.selenium.htmlunit.HtmlUnitDriver")
        .newInstance();
  }

  private WebDriver createNewInstanceOf(String browser) throws Exception {
    if ("htmlunit".equals(browser)) {
      return (WebDriver) Class.forName("org.openqa.selenium.htmlunit.HtmlUnitDriver")
          .newInstance();
    } else if ("firefox".equals(browser)) {
      return (WebDriver) Class.forName("org.openqa.selenium.firefox.FirefoxDriver")
          .newInstance();
    } else if ("internet explorer".equals(browser)) {
      return (WebDriver) Class.forName("org.openqa.selenium.ie.InternetExplorerDriver")
          .newInstance();
    } else if ("safari".equals(browser)) {
      return (WebDriver) Class.forName("org.openqa.selenium.safari.SafariDriver")
          .newInstance();
    }

    throw new RuntimeException("Unable to match browser: " + browser);
  }

  public Session get(SessionId sessionId) {
    return sessionIdToDriver.get(sessionId);
  }

  public void deleteSession(SessionId sessionId) {
    sessionIdToDriver.remove(sessionId);
  }
}
