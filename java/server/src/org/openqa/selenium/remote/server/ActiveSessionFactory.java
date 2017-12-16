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

import static org.openqa.selenium.remote.BrowserType.CHROME;
import static org.openqa.selenium.remote.BrowserType.EDGE;
import static org.openqa.selenium.remote.BrowserType.FIREFOX;
import static org.openqa.selenium.remote.BrowserType.HTMLUNIT;
import static org.openqa.selenium.remote.BrowserType.IE;
import static org.openqa.selenium.remote.BrowserType.OPERA;
import static org.openqa.selenium.remote.BrowserType.OPERA_BLINK;
import static org.openqa.selenium.remote.BrowserType.PHANTOMJS;
import static org.openqa.selenium.remote.BrowserType.SAFARI;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Dialect;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.StreamSupport;

/**
 * Used to create new {@link ActiveSession} instances as required.
 */
public class ActiveSessionFactory implements SessionFactory {

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

    ImmutableMap.<Predicate<Capabilities>, String>builder()
        .put(caps -> {
               Object marionette = caps.getCapability("marionette");

               return marionette instanceof Boolean && !(Boolean) marionette;
             },
             "org.openqa.selenium.firefox.XpiDriverService")
        .put(browserName(CHROME), "org.openqa.selenium.chrome.ChromeDriverService")
        .put(containsKey("chromeOptions"), "org.openqa.selenium.chrome.ChromeDriverService")
        .put(browserName(EDGE), "org.openqa.selenium.edge.EdgeDriverService")
        .put(containsKey("edgeOptions"), "org.openqa.selenium.edge.EdgeDriverService")
        .put(browserName(FIREFOX), "org.openqa.selenium.firefox.GeckoDriverService")
        .put(containsKey(Pattern.compile("^moz:.*")), "org.openqa.selenium.firefox.GeckoDriverService")
        .put(browserName(IE), "org.openqa.selenium.ie.InternetExplorerDriverService")
        .put(containsKey("se:ieOptions"), "org.openqa.selenium.ie.InternetExplorerDriverService")
        .put(browserName(OPERA), "org.openqa.selenium.opera.OperaDriverService")
        .put(browserName(OPERA_BLINK), "org.openqa.selenium.ie.OperaDriverService")
        .put(browserName(PHANTOMJS), "org.openqa.selenium.phantomjs.PhantomJSDriverService")
        .put(browserName(SAFARI), "org.openqa.selenium.safari.SafariDriverService")
        .put(containsKey(Pattern.compile("^safari\\..*")), "org.openqa.selenium.safari.SafariDriverService")
        .build()
        .entrySet().stream()
        .filter(e -> CLASS_EXISTS.apply(e.getValue()) != null)
        .forEach(e -> builder.put(e.getKey(), new ServicedSession.Factory(e.getValue())));

    // Attempt to bind the htmlunitdriver if it's present.
    bind(builder, "org.openqa.selenium.htmlunit.HtmlUnitDriver", browserName(HTMLUNIT),
         new ImmutableCapabilities(BROWSER_NAME, HTMLUNIT));

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

  private static Predicate<Capabilities> browserName(String browserName) {
    Objects.requireNonNull(browserName, "Browser name must be set");
    return toCompare -> browserName.equals(toCompare.getBrowserName());
  }

  private static Predicate<Capabilities> containsKey(String keyName) {
    Objects.requireNonNull(keyName, "Key name must be set");
    return toCompare -> toCompare.getCapability(keyName) != null;
  }

  private static Predicate<Capabilities> containsKey(Pattern pattern) {
    return toCompare -> toCompare.asMap().keySet().stream().anyMatch(pattern.asPredicate());
  }

  @Override
  public Optional<ActiveSession> apply(Set<Dialect> downstreamDialects, Capabilities caps) {
    LOG.info("Capabilities are: " + caps);
    return factories.entrySet().stream()
        .filter(e -> e.getKey().test(caps))
        .peek(e -> LOG.info(String.format("%s matched %s", caps, e.getValue())))
        .map(Map.Entry::getValue)
        .map(factory -> factory.apply(downstreamDialects, caps))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }
}
