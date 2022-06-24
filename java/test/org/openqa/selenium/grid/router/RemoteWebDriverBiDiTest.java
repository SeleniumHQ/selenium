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

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.BiDiSessionStatus;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.drivers.Browser;

import java.io.StringReader;
import java.util.Collections;

class RemoteWebDriverBiDiTest {

  @Test
  void ensureBiDiSessionCreation() {
    Browser browser = Browser.FIREFOX;

    Deployment deployment = DeploymentTypes.STANDALONE.start(
      browser.getCapabilities(),
      new TomlConfig(new StringReader(
        "[node]\n" +
        "driver-implementation = " + browser.displayName())));

    FirefoxOptions options = new FirefoxOptions();
    // Enable BiDi
    options.setCapability("webSocketUrl", true);

    WebDriver driver = new RemoteWebDriver(deployment.getServer().getUrl(), options);
    driver = new Augmenter().augment(driver);

    try (BiDi biDi = ((HasBiDi) driver).getBiDi()) {
      BiDiSessionStatus status =
        biDi.send(new Command<>("session.status", Collections.emptyMap(), BiDiSessionStatus.class));
      assertThat(status).isNotNull();
      assertThat(status.getMessage()).isEqualTo("Session already started");
    }
  }
}
