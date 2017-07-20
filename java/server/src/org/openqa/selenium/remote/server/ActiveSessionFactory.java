package org.openqa.selenium.remote.server;

import static org.openqa.selenium.remote.BrowserType.CHROME;
import static org.openqa.selenium.remote.BrowserType.EDGE;
import static org.openqa.selenium.remote.BrowserType.FIREFOX;
import static org.openqa.selenium.remote.BrowserType.IE;
import static org.openqa.selenium.remote.BrowserType.SAFARI;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;
import static org.openqa.selenium.remote.DesiredCapabilities.chrome;
import static org.openqa.selenium.remote.DesiredCapabilities.edge;
import static org.openqa.selenium.remote.DesiredCapabilities.firefox;
import static org.openqa.selenium.remote.DesiredCapabilities.htmlUnit;
import static org.openqa.selenium.remote.DesiredCapabilities.internetExplorer;
import static org.openqa.selenium.remote.DesiredCapabilities.opera;
import static org.openqa.selenium.remote.DesiredCapabilities.operaBlink;
import static org.openqa.selenium.remote.DesiredCapabilities.phantomjs;
import static org.openqa.selenium.remote.DesiredCapabilities.safari;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.ServiceLoader;
import java.util.logging.Logger;
import java.util.stream.StreamSupport;

/**
 * Used to create new {@link ActiveSession} instances as required.
 */
public class ActiveSessionFactory {

  private final static Logger LOG = Logger.getLogger(ActiveSessionFactory.class.getName());

  private final Map<String, SessionFactory> factories;

  public ActiveSessionFactory() {
    Map<String, SessionFactory> builder = new LinkedHashMap<>();

    ImmutableMap.<String, String>builder()
        .put(chrome().getBrowserName(), "org.openqa.selenium.chrome.ChromeDriverService")
        .put(edge().getBrowserName(), "org.openqa.selenium.edge.EdgeDriverService")
        .put(firefox().getBrowserName(), "org.openqa.selenium.firefox.GeckoDriverService")
        .put(internetExplorer().getBrowserName(), "org.openqa.selenium.ie.InternetExplorerDriverService")
        .put(opera().getBrowserName(), "org.openqa.selenium.opera.OperaDriverService")
        .put(operaBlink().getBrowserName(), "org.openqa.selenium.ie.OperaDriverService")
        .put(phantomjs().getBrowserName(), "org.openqa.selenium.phantomjs.PhantomJSDriverService")
        .put(safari().getBrowserName(), "org.openqa.selenium.safari.SafariDriverService")
        .build()
        .entrySet().stream()
        .filter(e -> {
          try {
            Class.forName(e.getValue());
            return true;
          } catch (ClassNotFoundException cnfe) {
            return false;
          }
        })
        .forEach(e -> builder.put(e.getKey(), new ServicedSession.Factory(e.getValue())));

    // Attempt to bind the htmlunitdriver if it's present.
    try {
      Class<? extends WebDriver> clazz = Class.forName("org.openqa.selenium.htmlunit.HtmlUnitDriver")
              .asSubclass(WebDriver.class);
      builder.put(
          htmlUnit().getBrowserName(),
          new InMemorySession.Factory(new DefaultDriverProvider(htmlUnit(), clazz)));
    } catch (ReflectiveOperationException ignored) {
      // Just carry on. Everything is fine.
    }

    // Allow user-defined factories to override default ones
    StreamSupport.stream(ServiceLoader.load(DriverProvider.class).spliterator(), false)
        .forEach(p -> builder.put(p.getProvidedCapabilities().getBrowserName(), new InMemorySession.Factory(p)));

    this.factories = ImmutableMap.copyOf(builder);
  }

  public ActiveSession createSession(NewSessionPayload newSessionPayload) throws IOException {
    return newSessionPayload.stream()
        .map(this::determineBrowser)
        .filter(Objects::nonNull)
        .map(factory -> factory.apply(newSessionPayload))
        .filter(Objects::nonNull)
        .findFirst()
        .orElseThrow(() -> new SessionNotCreatedException(
            "Unable to create a new session because of no configuration."));
  }

  private SessionFactory determineBrowser(Capabilities caps) {
      return caps.asMap().entrySet().stream()
          .map(entry -> guessBrowserName(entry.getKey(), entry.getValue()))
          .filter(factories.keySet()::contains)
          .map(factories::get)
          .findFirst()
          .orElse(null);
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
