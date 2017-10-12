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

import static org.openqa.selenium.remote.DesiredCapabilities.chrome;
import static org.openqa.selenium.remote.DesiredCapabilities.edge;
import static org.openqa.selenium.remote.DesiredCapabilities.firefox;
import static org.openqa.selenium.remote.DesiredCapabilities.htmlUnit;
import static org.openqa.selenium.remote.DesiredCapabilities.internetExplorer;
import static org.openqa.selenium.remote.DesiredCapabilities.opera;
import static org.openqa.selenium.remote.DesiredCapabilities.operaBlink;
import static org.openqa.selenium.remote.DesiredCapabilities.phantomjs;
import static org.openqa.selenium.remote.DesiredCapabilities.safari;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.ServiceLoader;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

/**
 * Used to create new {@link ActiveSession} instances as required.
 */
public class ActiveSessionFactory {

  private final static Logger LOG = Logger.getLogger(ActiveSessionFactory.class.getName());

  private final static Function<String, Class<?>> CLASS_EXISTS = name -> {
    try {
      return Class.forName(name);
    } catch (ClassNotFoundException cnfe) {
      return null;
    }
  };

  private volatile Map<Predicate<Capabilities>, SessionFactory> factories;

  public ActiveSessionFactory() {
    // Insertion order matters. The first matching predicate is always used for matching.
    Map<Predicate<Capabilities>, SessionFactory> builder = new LinkedHashMap<>();

    // Allow user-defined factories to override default ones.
    StreamSupport.stream(loadDriverProviders().spliterator(), false)
        .forEach(p -> builder.put(p::canCreateDriverInstanceFor, new InMemorySession.Factory(p)));

    bind(
        builder,
        "org.openqa.selenium.firefox.FirefoxDriver",
        caps -> {
          Object marionette = caps.getCapability("marionette");

          return marionette instanceof Boolean && !(Boolean) marionette;
        },
        firefox());

    ImmutableMap.<Predicate<Capabilities>, String>builder()
        .put(browserName(chrome()), "org.openqa.selenium.chrome.ChromeDriverService")
        .put(containsKey("chromeOptions"), "org.openqa.selenium.chrome.ChromeDriverService")
        .put(browserName(edge()), "org.openqa.selenium.edge.EdgeDriverService")
        .put(containsKey("edgeOptions"), "org.openqa.selenium.edge.EdgeDriverService")
        .put(browserName(firefox()), "org.openqa.selenium.firefox.GeckoDriverService")
        .put(containsKey(Pattern.compile("^moz:.*")), "org.openqa.selenium.firefox.GeckoDriverService")
        .put(browserName(internetExplorer()), "org.openqa.selenium.ie.InternetExplorerDriverService")
        .put(containsKey("se:ieOptions"), "org.openqa.selenium.ie.InternetExplorerDriverService")
        .put(browserName(opera()), "org.openqa.selenium.opera.OperaDriverService")
        .put(browserName(operaBlink()), "org.openqa.selenium.ie.OperaDriverService")
        .put(browserName(phantomjs()), "org.openqa.selenium.phantomjs.PhantomJSDriverService")
        .put(browserName(safari()), "org.openqa.selenium.safari.SafariDriverService")
        .put(containsKey(Pattern.compile("^safari\\..*")), "org.openqa.selenium.safari.SafariDriverService")
        .build()
        .entrySet().stream()
        .filter(e -> CLASS_EXISTS.apply(e.getValue()) != null)
        .forEach(e -> builder.put(e.getKey(), new ServicedSession.Factory(e.getValue())));

    // Attempt to bind the htmlunitdriver if it's present.
    bind(builder, "org.openqa.selenium.htmlunit.HtmlUnitDriver", browserName(htmlUnit()), htmlUnit());

    // Finally, add a default factory.
    Stream.of(
        "org.openqa.selenium.chrome.ChromeDriverService",
        "org.openqa.selenium.firefox.GeckoDriverService",
        "org.openqa.selenium.edge.EdgeDriverService",
        "org.openqa.selenium.ie.InternetExplorerDriverService",
        "org.openqa.selenium.safari.SafariDriverService")
        .filter(name -> CLASS_EXISTS.apply(name) != null)
        .findFirst()
        .ifPresent(
            serviceName -> {
              LOG.info("Binding default provider to: " + serviceName);
              builder.put(ignored -> true, new ServicedSession.Factory(serviceName));
            });

    this.factories = ImmutableMap.copyOf(builder);
  }

  public synchronized ActiveSessionFactory bind(
      Predicate<Capabilities> onThis,
      SessionFactory useThis) {
    Objects.requireNonNull(onThis, "Predicated needed.");
    Objects.requireNonNull(useThis, "SessionFactory is required");

    LOG.info(String.format("Binding %s to respond to %s", useThis, onThis));

    LinkedHashMap<Predicate<Capabilities>, SessionFactory> newMap = new LinkedHashMap<>();
    newMap.put(onThis, useThis);
    newMap.putAll(factories);

    factories = newMap;

    return this;
  }

  @VisibleForTesting
  protected Iterable<DriverProvider> loadDriverProviders() {
    return () -> ServiceLoader.load(DriverProvider.class).iterator();
  }

  private void bind(
      Map<Predicate<Capabilities>, SessionFactory> builder,
      String className,
      Predicate<Capabilities> predicate,
      Capabilities capabilities) {
    try {
      Class<?> clazz = CLASS_EXISTS.apply(className);
      if (clazz == null) {
        return;
      }

      Class<? extends WebDriver> driverClass = clazz.asSubclass(WebDriver.class);
      builder.put(
          predicate,
          new InMemorySession.Factory(new DefaultDriverProvider(capabilities, driverClass)));
    } catch (ClassCastException ignored) {
      // Just carry on. Everything is fine.
    }
  }

  private static Predicate<Capabilities> browserName(Capabilities caps) {
    return toCompare -> caps.getBrowserName().equals(toCompare.getBrowserName());
  }

  private static Predicate<Capabilities> containsKey(String keyName) {
    Objects.requireNonNull(keyName, "Key name must be set");
    return toCompare -> toCompare.getCapability(keyName) != null;
  }

  private static Predicate<Capabilities> containsKey(Pattern pattern) {
    return toCompare -> toCompare.asMap().keySet().stream().anyMatch(pattern.asPredicate());
  }

  public ActiveSession createSession(NewSessionPayload newSessionPayload) throws IOException {
    return newSessionPayload.stream()
        .peek(caps -> LOG.info("Capabilities are: " + caps))
        // Grab any factories that claim to be able to build each capability
        .flatMap(caps -> factories.entrySet().stream()
            .filter(e -> e.getKey().test(caps))
            .peek(e -> LOG.info(String.format("%s matched %s", caps, e.getValue())))
            .map(Map.Entry::getValue))
        .findFirst()
        .map(factory -> factory.apply(newSessionPayload))
        .orElseThrow(() -> new SessionNotCreatedException(
            "Unable to create a new session because of no configuration."));
  }
}
