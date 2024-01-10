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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;

@Tag("UnitTests")
class DriverFinderTest {
  private final DriverService service = mock(DriverService.class);
  private final SeleniumManager seleniumManager = mock(SeleniumManager.class);
  Path driverFile;
  Path browserFile;

  @BeforeEach
  void createMocks() {
    driverFile = createExecutableFile("testDriver");
    browserFile = createExecutableFile("testBrowser");
    when(service.getDriverName()).thenReturn("driverName");
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
  void createsArgumentsForSeleniumManager() throws IOException {
    when(service.getExecutable()).thenReturn(null);
    when(service.getDriverProperty()).thenReturn("property.selenium.manager.empty");

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
    verifyNoMoreInteractions(service);
    verify(seleniumManager, times(1)).getBinaryPaths(arguments);
    verifyNoMoreInteractions(seleniumManager);
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
