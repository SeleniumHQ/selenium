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

package org.openqa.selenium.firefox;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.openqa.selenium.firefox.FirefoxAssumptions.assumeDefaultBrowserLocationUsed;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;

class FirefoxDriverBuilderTest extends JupiterTestBase {

  private FirefoxOptions getDefaultOptions() {
    return (FirefoxOptions) FIREFOX.getCapabilities();
  }

  @Test
  @NoDriverBeforeTest
  public void builderGeneratesDefaultFirefoxOptions() {
    assumeDefaultBrowserLocationUsed();

    localDriver = FirefoxDriver.builder().build();
    FirefoxDriver firefoxDriver = (FirefoxDriver) localDriver;
    Capabilities capabilities = firefoxDriver.getCapabilities();

    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ZERO);
    assertTrue((Boolean) capabilities.getCapability("acceptInsecureCerts"));
    assertThat(capabilities.getCapability("browserName")).isEqualTo("firefox");
  }

  @Test
  @NoDriverBeforeTest
  public void builderOverridesDefaultFirefoxOptions() {
    FirefoxOptions options = getDefaultOptions().setImplicitWaitTimeout(Duration.ofMillis(1));

    localDriver = FirefoxDriver.builder().oneOf(options).build();
    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout())
        .isEqualTo(Duration.ofMillis(1));
  }

  @Test
  void builderWithClientConfigThrowsException() {
    ClientConfig clientConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(1));
    RemoteWebDriverBuilder builder =
        FirefoxDriver.builder().oneOf(getDefaultOptions()).config(clientConfig);

    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(builder::build)
        .withMessage("ClientConfig instances do not work for Local Drivers");
  }
}
