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

package org.openqa.selenium.testing.drivers;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.Duration;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

public class WebDriverBuilder implements Supplier<WebDriver> {

  private static final Logger LOG = Logger.getLogger(WebDriverBuilder.class.getName());
  private static final int SAFARI_PAIRING_RETRIES = 5;
  private static final Duration SAFARI_PAIRING_INTERVAL = Duration.ofSeconds(1);

  private static final LinkedList<Runnable> shutdownActions = new LinkedList<>();
  private static final Set<WebDriver> managedDrivers = new HashSet<>();

  static {
    shutdownActions.add(() -> managedDrivers.forEach(WebDriver::quit));
    Runtime.getRuntime().addShutdownHook(new Thread(() -> shutdownActions.forEach(Runnable::run)));
  }

  private final Browser toBuild;

  public WebDriverBuilder() {
    this(Browser.detect());
  }

  public WebDriverBuilder(Browser toBuild) {
    this.toBuild = Optional.ofNullable(toBuild).orElse(Browser.CHROME);
  }

  static void addShutdownAction(Runnable action) {
    shutdownActions.add(action);
  }

  @Override
  public WebDriver get() {
    return get(new ImmutableCapabilities());
  }

  public WebDriver get(Capabilities desiredCapabilities) {
    Objects.requireNonNull(desiredCapabilities, "Capabilities to use must be set");
    Capabilities desiredCaps =
        Objects.requireNonNull(Browser.detect()).getCapabilities().merge(desiredCapabilities);

    WebDriver driver =
        retryWhileSafariIsPaired(() ->
            Stream.of(
                    new ExternalDriverSupplier(desiredCaps),
                    new GridSupplier(desiredCaps),
                    new RemoteSupplier(desiredCaps),
                    new TestInternetExplorerSupplier(desiredCaps),
                    new DefaultDriverSupplier(desiredCaps))
                .map(Supplier::get)
                .filter(Objects::nonNull)
                .findFirst()
                .orElseThrow(() ->
                    new RuntimeException(
                        "Cannot instantiate driver instance: " + desiredCapabilities)));

    modifyLogLevel(driver);
    managedDrivers.add(driver);
    return driver;
  }

  // Safari can stay paired with the previous session for a moment after it quits.
  private static WebDriver retryWhileSafariIsPaired(Supplier<WebDriver> createDriver) {
    for (int retry = 1; ; retry++) {
      try {
        return createDriver.get();
      } catch (WebDriverException e) {
        if (retry > SAFARI_PAIRING_RETRIES || !isSafariPairingBusy(e)) {
          throw e;
        }
        LOG.warning(
            String.format("Safari pairing busy; retry %d/%d", retry, SAFARI_PAIRING_RETRIES));
        try {
          Thread.sleep(SAFARI_PAIRING_INTERVAL.toMillis());
        } catch (InterruptedException ie) {
          Thread.currentThread().interrupt();
          throw e;
        }
      }
    }
  }

  private static boolean isSafariPairingBusy(WebDriverException e) {
    return String.valueOf(e.getMessage()).contains("instance is already paired");
  }

  private void modifyLogLevel(WebDriver driver) {
    Class<?>[] args = {Level.class};
    Method setLogLevel;
    try {
      setLogLevel = driver.getClass().getMethod("setLogLevel", args);

      String value = System.getProperty("selenium.browser.log_level", "INFO");
      LogLevel level = LogLevel.valueOf(value);
      setLogLevel.invoke(driver, level.getLevel());
    } catch (NoSuchMethodException e) {
    } catch (IllegalAccessException | InvocationTargetException e) {
      throw new RuntimeException(e);
    }
  }

  private enum LogLevel {
    OFF("OFF", Level.OFF),
    DEBUG("DEBUG", Level.FINE),
    INFO("INFO", Level.INFO),
    WARNING("WARNING", Level.WARNING),
    ERROR("ERROR", Level.SEVERE);

    @SuppressWarnings("unused")
    private final String value;

    private final Level level;

    LogLevel(String value, Level level) {
      this.value = value;
      this.level = level;
    }

    public Level getLevel() {
      return level;
    }
  }
}
