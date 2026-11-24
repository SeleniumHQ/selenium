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

package org.openqa.selenium.grid.router;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.StringReader;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.drivers.Browser;

class SeleniumManagerNodeTest {

  private final Browser browser = Browser.detect();
  private Deployment deployment;

  @AfterEach
  void stopGrid() {
    Safely.safelyCall(deployment);
  }

  @Test
  void startsASessionWithTheDriverSeleniumManagerDetects() {
    startGrid(
        "[node]",
        "selenium-manager = true",
        "driver-implementation = \"" + browser.displayName() + "\"");

    assertSessionStarts();
  }

  @Test
  void startsASessionFromADriverConfigurationWithoutAnExecutable() {
    startGrid(
        "[node]",
        "detect-drivers = false",
        "[[node.driver-configuration]]",
        "display-name = \"" + browser.displayName() + "\"",
        "[node.driver-configuration.stereotype]",
        "browserName = \"" + browser.getCapabilities().getBrowserName() + "\"");

    assertSessionStarts();
  }

  private void startGrid(String... config) {
    deployment =
        DeploymentTypes.STANDALONE.start(
            browser.getCapabilities(), new TomlConfig(new StringReader(String.join("\n", config))));
  }

  private void assertSessionStarts() {
    RemoteWebDriver driver =
        new RemoteWebDriver(deployment.getServer().getUrl(), browser.getCapabilities());
    try {
      assertThat(driver.getSessionId()).isNotNull();
    } finally {
      driver.quit();
    }
  }
}
