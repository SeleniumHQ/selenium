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

package org.openqa.selenium.remote;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.WebDriverFixture.echoCapabilities;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.ImmutableCapabilities;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;
import uk.org.webcompere.systemstubs.jupiter.SystemStub;
import uk.org.webcompere.systemstubs.jupiter.SystemStubsExtension;
import uk.org.webcompere.systemstubs.properties.SystemProperties;

/**
 * Checks that {@link RemoteWebDriver} applies the live debug switches on construction.
 *
 * <p>Debug logging is one-way for the life of the JVM, so this class has a single test and runs in
 * its own test target, keeping that state away from other driver tests.
 */
@Tag("UnitTests")
@ExtendWith(SystemStubsExtension.class)
class RemoteWebDriverDebugLoggingTest {

  private static final Logger SELENIUM_LOGGER = Logger.getLogger("org.openqa.selenium");
  private static final CommandExecutor EXECUTOR = echoCapabilities::apply;

  @SystemStub private EnvironmentVariables environment;
  @SystemStub private SystemProperties properties;

  private Level oldLevel;
  private List<Handler> oldHandlers;

  @BeforeEach
  void turnDebugSwitchesOff() {
    environment.set("SE_DEBUG", "false");
    properties.remove("selenium.debug").remove("selenium.webdriver.verbose");
    oldLevel = SELENIUM_LOGGER.getLevel();
    oldHandlers = List.of(SELENIUM_LOGGER.getHandlers());
  }

  @AfterEach
  void restoreLogger() {
    for (Handler handler : SELENIUM_LOGGER.getHandlers()) {
      if (!oldHandlers.contains(handler)) {
        SELENIUM_LOGGER.removeHandler(handler);
      }
    }
    SELENIUM_LOGGER.setLevel(oldLevel);
  }

  private List<Handler> addedHandlers() {
    List<Handler> added = new ArrayList<>(List.of(SELENIUM_LOGGER.getHandlers()));
    added.removeAll(oldHandlers);
    return added;
  }

  @Test
  void constructionAppliesADebugPropertySetAfterTheClassWasLoaded() {
    SELENIUM_LOGGER.setLevel(Level.INFO);

    new RemoteWebDriver(EXECUTOR, new ImmutableCapabilities());

    assertThat(SELENIUM_LOGGER.getLevel()).isEqualTo(Level.INFO);
    assertThat(addedHandlers()).isEmpty();

    properties.set("selenium.debug", "true");
    new RemoteWebDriver(EXECUTOR, new ImmutableCapabilities());

    assertThat(SELENIUM_LOGGER.getLevel()).isEqualTo(Level.FINE);
    assertThat(addedHandlers()).singleElement().extracting(Handler::getLevel).isEqualTo(Level.FINE);
  }
}
