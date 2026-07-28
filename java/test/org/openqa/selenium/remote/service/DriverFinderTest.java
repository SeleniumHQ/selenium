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

package org.openqa.selenium.remote.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.Proxy.ProxyType;
import org.openqa.selenium.chrome.ElectronOptions;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;
import uk.org.webcompere.systemstubs.environment.EnvironmentVariables;
import uk.org.webcompere.systemstubs.jupiter.SystemStub;
import uk.org.webcompere.systemstubs.jupiter.SystemStubsExtension;

@Tag("UnitTests")
@ExtendWith(SystemStubsExtension.class)
class DriverFinderTest {
  private final DriverService service = mock(DriverService.class);
  private final SeleniumManager seleniumManager = mock(SeleniumManager.class);
  Path driverFile;
  Path browserFile;

  @SystemStub private EnvironmentVariables environment;

  @BeforeEach
  void createMocks() {
    driverFile = createExecutableFile("testDriver");
    browserFile = createExecutableFile("testBrowser");
    when(service.getDriverName()).thenReturn("driverName");
  }

  /**
   * The shared {@code org.openqa.selenium} logger that {@code Debug.configureLogger()} manages --
   * deliberately not this test class's own logger, because the assertion is about the shared
   * category's state.
   */
  private static Logger seleniumLogger() {
    return Logger.getLogger("org.openqa.selenium");
  }

  private String oldDebugProperty;
  private Level oldLoggerLevel;

  @BeforeEach
  void storeDebugState() {
    oldDebugProperty = System.getProperty("selenium.debug");
    oldLoggerLevel = seleniumLogger().getLevel();
    System.clearProperty("selenium.debug");
  }

  @AfterEach
  void restoreDebugState() {
    if (oldDebugProperty != null) {
      System.setProperty("selenium.debug", oldDebugProperty);
    } else {
      System.clearProperty("selenium.debug");
    }
    Debug.configureLogger();
    seleniumLogger().setLevel(oldLoggerLevel);
  }

  @Test
  void secondDiscoveryPicksUpADebugPropertyChangedAfterTheFirst() throws IOException {
    // A small in-memory DriverService (no mocking framework): this test makes no verify()/
    // interaction assertions on the service, only on the shared org.openqa.selenium logger's
    // level, so it doesn't need Mockito's machinery -- matching the pattern already applied
    // elsewhere on this PR (e.g. RemoteWebDriverInitializationTest, commit 31ea2ca102).
    DriverService inMemoryService = new InMemoryDriverService(driverFile);
    Capabilities capabilities = new ImmutableCapabilities("browserName", "chrome");

    // First discovery while debugging is off -- nothing for configureLogger to react to.
    new DriverFinder(inMemoryService, capabilities).getDriverPath();

    System.setProperty("selenium.debug", "true");

    // Second discovery after the property changed. No RemoteWebDriver constructor is involved
    // (this is also the only coverage InternetExplorerDriver's discovery path gets), so only
    // getBinaryPaths' own Debug.configureLogger() call can pick this up.
    new DriverFinder(inMemoryService, capabilities).getDriverPath();

    assertThat(seleniumLogger().getLevel()).isEqualTo(Level.FINE);
  }

  /**
   * Minimal real {@link DriverService}: {@link #getExecutable()} answers straight from the
   * constructor-set path (inherited, not overridden), {@link #getDriverName()} returns a fixed
   * name, and the two abstract accessors throw since {@code getBinaryPaths()} never reaches them
   * once {@link #getExecutable()} already resolves a path.
   */
  private static class InMemoryDriverService extends DriverService {
    InMemoryDriverService(Path driverFile) throws IOException {
      super(driverFile.toFile(), 0, DEFAULT_TIMEOUT, null, null);
    }

    @Override
    protected String getDriverName() {
      return "driverName";
    }

    @Override
    public String getDriverProperty() {
      throw new UnsupportedOperationException("getDriverProperty");
    }

    @Override
    protected String getDriverEnvironmentVariable() {
      throw new UnsupportedOperationException("getDriverEnvironmentVariable");
    }
  }

  @Test
  void serviceValueIgnoresSeleniumManager() {
    when(service.getExecutable()).thenReturn(driverFile.toString());

    Capabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
    DriverFinder finder = new DriverFinder(service, capabilities);

    assertThat(finder.getDriverPath()).isEqualTo(driverFile.toString());
    assertThat(finder.getBrowserPath()).isNull();
    verify(service, times(1)).getDriverName();
    verify(service, times(1)).getExecutable();
    verify(service, never()).getDriverProperty();
  }

  @Test
  void systemPropertyIgnoresSeleniumManager() throws IOException {
    when(service.getExecutable()).thenReturn(null);
    when(service.getDriverProperty()).thenReturn("property.ignores.selenium.manager");
    when(service.getDriverEnvironmentVariable())
        .thenReturn("ENVIRONMENT_VARIABLE_IGNORES_SELENIUM_MANAGER");
    System.setProperty("property.ignores.selenium.manager", driverFile.toString());

    Capabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
    DriverFinder finder = new DriverFinder(service, capabilities);

    assertThat(finder.getDriverPath()).isEqualTo(driverFile.toString());
    assertThat(finder.getBrowserPath()).isNull();
    verify(service, times(1)).getExecutable();
    verify(service, times(1)).getDriverName();
    verify(service, times(1)).getDriverProperty();
  }

  @Test
  void environmentVariableIgnoresSeleniumManager() throws IOException {
    environment.set("ENVIRONMENT_VARIABLE_DRIVER_PATH", driverFile.toString());
    when(service.getExecutable()).thenReturn(null);
    when(service.getDriverProperty()).thenReturn("property.ignores.selenium.manager");
    when(service.getDriverEnvironmentVariable()).thenReturn("ENVIRONMENT_VARIABLE_DRIVER_PATH");

    Capabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
    DriverFinder finder = new DriverFinder(service, capabilities);

    assertThat(finder.getDriverPath()).isEqualTo(driverFile.toString());
    assertThat(finder.getBrowserPath()).isNull();
    verify(service, times(1)).getExecutable();
    verify(service, times(1)).getDriverName();
    verify(service, times(1)).getDriverEnvironmentVariable();
  }

  @Test
  void environmentVariableTakePriorityOverSystemProperty() throws IOException {
    environment.set("ENVIRONMENT_VARIABLE_DRIVER_PATH", driverFile.toString());
    when(service.getExecutable()).thenReturn(null);
    when(service.getDriverProperty()).thenReturn("property.ignores.selenium.manager");
    when(service.getDriverEnvironmentVariable()).thenReturn("ENVIRONMENT_VARIABLE_DRIVER_PATH");

    System.setProperty("property.ignores.selenium.manager", "path");

    Capabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
    DriverFinder finder = new DriverFinder(service, capabilities);

    assertThat(finder.getDriverPath()).isEqualTo(driverFile.toString());
    assertThat(finder.getBrowserPath()).isNull();
    verify(service, times(1)).getExecutable();
    verify(service, times(1)).getDriverName();
    verify(service, times(1)).getDriverEnvironmentVariable();
  }

  @Test
  void systemPropertyIsUsedIfEnvironmentVariableIsNotSet() throws IOException {
    when(service.getExecutable()).thenReturn(null);
    when(service.getDriverProperty()).thenReturn("property.ignores.selenium.manager");
    when(service.getDriverEnvironmentVariable())
        .thenReturn("ENVIRONMENT_VARIABLE_IGNORES_SELENIUM_MANAGER");

    System.setProperty("property.ignores.selenium.manager", driverFile.toString());

    Capabilities capabilities = new ImmutableCapabilities("browserName", "chrome");
    DriverFinder finder = new DriverFinder(service, capabilities);

    assertThat(finder.getDriverPath()).isEqualTo(driverFile.toString());
    assertThat(finder.getBrowserPath()).isNull();
    verify(service, times(1)).getExecutable();
    verify(service, times(1)).getDriverName();
    verify(service, times(1)).getDriverEnvironmentVariable();
    verify(service, times(1)).getDriverProperty();
  }

  @Test
  void createsArgumentsForSeleniumManager() throws IOException {
    when(service.getExecutable()).thenReturn(null);
    when(service.getDriverProperty()).thenReturn("property.selenium.manager.empty");
    when(service.getDriverEnvironmentVariable())
        .thenReturn("ENVIRONMENT_VARIABLE_IGNORES_SELENIUM_MANAGER");

    Proxy proxy = new Proxy().setHttpProxy("https://localhost:1234");
    Capabilities capabilities =
        new ImmutableCapabilities(
            "browserName",
            "chrome",
            "browserVersion",
            "beta",
            "proxy",
            proxy,
            "goog:chromeOptions",
            Map.of("binary", browserFile.toString()));
    DriverFinder finder = new DriverFinder(service, capabilities, seleniumManager);

    List<String> arguments = new ArrayList<>();
    arguments.add("--browser");
    arguments.add("chrome");
    arguments.add("--browser-version");
    arguments.add("beta");
    arguments.add("--browser-path");
    arguments.add(browserFile.toString());
    arguments.add("--proxy");
    arguments.add("https://localhost:1234");
    Result result = new Result(0, "", driverFile.toString(), browserFile.toString());
    doReturn(result).when(seleniumManager).getBinaryPaths(arguments);

    assertThat(finder.getDriverPath()).isEqualTo(driverFile.toString());
    assertThat(finder.getBrowserPath()).isEqualTo(browserFile.toString());
    verify(service, times(1)).getExecutable();
    verify(service, times(1)).getDriverName();
    verify(service, times(1)).getDriverProperty();
    verify(service, times(1)).getDriverEnvironmentVariable();
    verifyNoMoreInteractions(service);
    verify(seleniumManager, times(1)).getBinaryPaths(arguments);
    verifyNoMoreInteractions(seleniumManager);
  }

  @Test
  void createsArgumentsForSeleniumManagerWithSystemProxySettings() throws IOException {
    createsArgumentsForSeleniumManagerWithProxySettings(ProxyType.SYSTEM);
  }

  @Test
  void createsArgumentsForSeleniumManagerWithAutodetectProxySettings() throws IOException {
    createsArgumentsForSeleniumManagerWithProxySettings(ProxyType.AUTODETECT);
  }

  @Test
  void createsArgumentsForSeleniumManagerWithDirectProxySettings() throws IOException {
    createsArgumentsForSeleniumManagerWithProxySettings(ProxyType.DIRECT);
  }

  void createsArgumentsForSeleniumManagerWithProxySettings(ProxyType proxyType) throws IOException {
    when(service.getExecutable()).thenReturn(null);
    when(service.getDriverProperty()).thenReturn("property.selenium.manager.empty");
    when(service.getDriverEnvironmentVariable())
        .thenReturn("ENVIRONMENT_VARIABLE_IGNORES_SELENIUM_MANAGER");

    Proxy proxy = new Proxy().setProxyType(proxyType);
    Capabilities capabilities =
        new ImmutableCapabilities(
            "browserName",
            "chrome",
            "browserVersion",
            "beta",
            "proxy",
            proxy,
            "goog:chromeOptions",
            Map.of("binary", browserFile.toString()));
    DriverFinder finder = new DriverFinder(service, capabilities, seleniumManager);

    List<String> arguments = new ArrayList<>();
    arguments.add("--browser");
    arguments.add("chrome");
    arguments.add("--browser-version");
    arguments.add("beta");
    arguments.add("--browser-path");
    arguments.add(browserFile.toString());
    Result result = new Result(0, "", driverFile.toString(), browserFile.toString());
    doReturn(result).when(seleniumManager).getBinaryPaths(arguments);

    assertThat(finder.getDriverPath()).isEqualTo(driverFile.toString());
    assertThat(finder.getBrowserPath()).isEqualTo(browserFile.toString());
    verify(service, times(1)).getExecutable();
    verify(service, times(1)).getDriverName();
    verify(service, times(1)).getDriverProperty();
    verify(service, times(1)).getDriverEnvironmentVariable();
    verifyNoMoreInteractions(service);
    verify(seleniumManager, times(1)).getBinaryPaths(arguments);
    verifyNoMoreInteractions(seleniumManager);
  }

  @SuppressWarnings("unchecked")
  void electronOptionsPassesElectronBrowserNameToSeleniumManager() throws IOException {
    when(service.getExecutable()).thenReturn(null);
    when(service.getDriverProperty()).thenReturn("property.selenium.manager.empty");
    when(service.getDriverEnvironmentVariable())
        .thenReturn("ENVIRONMENT_VARIABLE_IGNORES_SELENIUM_MANAGER");

    ElectronOptions options = new ElectronOptions(browserFile.toFile());

    Result result = new Result(0, "", driverFile.toString(), browserFile.toString());
    doReturn(result).when(seleniumManager).getBinaryPaths(any());

    new DriverFinder(service, options, seleniumManager).getDriverPath();

    org.mockito.ArgumentCaptor<List<String>> captor =
        org.mockito.ArgumentCaptor.forClass(List.class);
    verify(seleniumManager).getBinaryPaths(captor.capture());
    assertThat(captor.getValue()).containsSequence("--browser", "electron");
    assertThat(options.getBrowserName()).isEqualTo("chrome");
    assertThat(options.getCapability("se:browserName")).isEqualTo("electron");
  }

  private Path createExecutableFile(String prefix) {
    Path driverFile = null;
    try {
      driverFile = Files.createTempFile(prefix, ".tmp");
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    driverFile.toFile().setExecutable(true);
    return driverFile;
  }
}
