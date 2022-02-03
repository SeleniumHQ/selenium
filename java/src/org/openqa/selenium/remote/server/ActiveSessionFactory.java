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

import static org.openqa.selenium.remote.Browser.CHROME;
import static org.openqa.selenium.remote.Browser.EDGE;
import static org.openqa.selenium.remote.Browser.FIREFOX;
import static org.openqa.selenium.remote.Browser.HTMLUNIT;
import static org.openqa.selenium.remote.Browser.IE;
import static org.openqa.selenium.remote.Browser.OPERA;
import static org.openqa.selenium.remote.Browser.SAFARI;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.grid.session.SessionFactory;
import org.openqa.selenium.grid.session.remote.ServicedSession;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.List;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.StreamSupport;

/**
 * Used to create new {@link ActiveSession} instances as required.
 */
public class ActiveSessionFactory implements SessionFactory {

  private static final Logger LOG = Logger.getLogger(ActiveSessionFactory.class.getName());

  private static final Function<String, Class<?>> CLASS_EXISTS = name -> {
    try {
      return Class.forName(name);
    } catch (ClassNotFoundException | NoClassDefFoundError e) {
      return null;
    }
  };

  private List<SessionFactory> factories;

  public ActiveSessionFactory(Tracer tracer) {
    // Insertion order matters. The first matching predicate is always used for matching.
    ImmutableList.Builder<SessionFactory> builder = ImmutableList.builder();

    // Allow user-defined factories to override default ones.
    StreamSupport.stream(loadDriverProviders().spliterator(), false)
        .forEach(p -> builder.add(new InMemorySession.Factory(p)));

    ImmutableMap.<Predicate<Capabilities>, String>builder()
        .put(browserName(CHROME.browserName()), "org.openqa.selenium.chrome.ChromeDriverService")
        .put(containsKey("chromeOptions"), "org.openqa.selenium.chrome.ChromeDriverService")
        .put(browserName(EDGE.browserName()), "org.openqa.selenium.edge.ChromiumEdgeDriverService")
        .put(containsKey("edgeOptions"), "org.openqa.selenium.edge.ChromiumEdgeDriverService")
        .put(browserName(FIREFOX.browserName()), "org.openqa.selenium.firefox.GeckoDriverService")
        .put(containsKey(Pattern.compile("^moz:.*")), "org.openqa.selenium.firefox.GeckoDriverService")
        .put(browserName(IE.browserName()), "org.openqa.selenium.ie.InternetExplorerDriverService")
        .put(containsKey("se:ieOptions"), "org.openqa.selenium.ie.InternetExplorerDriverService")
        .put(browserName(OPERA.browserName()), "org.openqa.selenium.opera.OperaDriverService")
        .put(browserName(SAFARI.browserName()), "org.openqa.selenium.safari.SafariDriverService")
        .put(containsKey(Pattern.compile("^safari\\..*")), "org.openqa.selenium.safari.SafariDriverService")
        .build()
        .entrySet().stream()
        .filter(e -> CLASS_EXISTS.apply(e.getValue()) != null)
        .forEach(e -> builder.add(new ServicedSession.Factory(tracer, e.getKey(), e.getValue())));

    // Attempt to bind the htmlunitdriver if it's present.
    bind(builder, "org.openqa.selenium.htmlunit.HtmlUnitDriver", browserName(HTMLUNIT.browserName()),
         new ImmutableCapabilities(BROWSER_NAME, HTMLUNIT.browserName()));

    this.factories = builder.build();
  }

  private static Predicate<Capabilities> browserName(String browserName) {
    Require.nonNull("Browser name", browserName);
    return toCompare -> browserName.equals(toCompare.getBrowserName());
  }

  private static Predicate<Capabilities> containsKey(String keyName) {
    Require.nonNull("Key name", keyName);
    return toCompare -> toCompare.getCapability(keyName) != null;
  }

  private static Predicate<Capabilities> containsKey(Pattern pattern) {
    return toCompare -> toCompare.asMap().keySet().stream().anyMatch(pattern.asPredicate());
  }

  public synchronized ActiveSessionFactory bind(
      Predicate<Capabilities> onThis,
      SessionFactory useThis) {
    Require.nonNull("Predicate", onThis);
    Require.nonNull("SessionFactory", useThis);

    LOG.info(String.format("Binding %s to respond to %s", useThis, onThis));

    ImmutableList.Builder<SessionFactory> builder = ImmutableList.builder();
    builder.add(useThis);
    builder.addAll(factories);

    factories = builder.build();

    return this;
  }

  @VisibleForTesting
  protected Iterable<DriverProvider> loadDriverProviders() {
    return () -> ServiceLoader.load(DriverProvider.class).iterator();
  }

  private void bind(
      ImmutableList.Builder<SessionFactory> builder,
      String className,
      Predicate<Capabilities> predicate,
      Capabilities capabilities) {
    try {
      Class<?> clazz = CLASS_EXISTS.apply(className);
      if (clazz == null) {
        return;
      }

      Class<? extends WebDriver> driverClass = clazz.asSubclass(WebDriver.class);
      builder.add(new InMemorySession.Factory(new DefaultDriverProvider(capabilities, driverClass)));
    } catch (ClassCastException ignored) {
      // Just carry on. Everything is fine.
    }
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return factories.stream()
        .map(factory -> factory.test(capabilities))
        .reduce(Boolean::logicalOr)
        .orElse(false);
  }

  @Override
  public Optional<ActiveSession> apply(CreateSessionRequest sessionRequest) {
    LOG.finest("Capabilities are: " + new Json().toJson(sessionRequest.getDesiredCapabilities()));
    return factories.stream()
        .filter(factory -> factory.test(sessionRequest.getDesiredCapabilities()))
        .peek(factory -> LOG.finest(String.format("Matched factory %s", factory)))
        .map(factory -> factory.apply(sessionRequest))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }
}
