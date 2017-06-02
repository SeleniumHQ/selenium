package org.openqa.selenium.remote.server;

import static org.openqa.selenium.remote.BrowserType.CHROME;
import static org.openqa.selenium.remote.BrowserType.EDGE;
import static org.openqa.selenium.remote.BrowserType.FIREFOX;
import static org.openqa.selenium.remote.BrowserType.IE;
import static org.openqa.selenium.remote.BrowserType.SAFARI;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;
import static org.openqa.selenium.remote.DesiredCapabilities.chrome;
import static org.openqa.selenium.remote.DesiredCapabilities.firefox;
import static org.openqa.selenium.remote.DesiredCapabilities.htmlUnit;

import com.google.common.collect.ImmutableMap;
import java.util.Map;
import java.util.Optional;
import org.openqa.selenium.Capabilities;

/** A SessionFactories that creates default drivers. */
public class DefaultSessionFactories implements SessionFactories {

  private final Map<String, SessionFactory> factories;

  public DefaultSessionFactories(DriverSessions legacySessions) {
    this.factories =
        ImmutableMap.of(
            chrome().getBrowserName(),
                new ServicedSession.Factory("org.openqa.selenium.chrome.ChromeDriverService"),
            firefox().getBrowserName(),
                new ServicedSession.Factory("org.openqa.selenium.firefox.GeckoDriverService"),
            htmlUnit().getBrowserName(), new InMemorySession.Factory(legacySessions));
  }

  @Override
  public Optional<SessionFactory> getFactoryFor(Capabilities caps) {
    return caps.asMap()
        .entrySet()
        .stream()
        .map(entry -> guessBrowserName(entry.getKey(), entry.getValue()))
        .filter(factories.keySet()::contains)
        .map(factories::get)
        .findFirst();
  }

  private String guessBrowserName(String capabilityKey, Object value) {
    if (BROWSER_NAME.equals(capabilityKey)) {
      return (String) value;
    }
    if ("chromeOptions".equals(capabilityKey)) {
      return CHROME;
    }
    if ("edgeOptions".equals(capabilityKey)) {
      return EDGE;
    }
    if (capabilityKey.startsWith("moz:")) {
      return FIREFOX;
    }
    if (capabilityKey.startsWith("safari.")) {
      return SAFARI;
    }
    if ("se:ieOptions".equals(capabilityKey)) {
      return IE;
    }
    return null;
  }
}
