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
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Status;
import org.openqa.selenium.testing.drivers.Browser;

import java.io.StringReader;

class RemoteWebDriverStatusTest {

  @Test
  void shouldBeAbleToGetRemoteEndStatus() {
    Browser browser = Browser.FIREFOX;

    Deployment deployment = DeploymentTypes.STANDALONE.start(
      browser.getCapabilities(),
      new TomlConfig(new StringReader(
        "[node]\n" +
        "driver-implementation = " + browser.displayName())));

    Status status = RemoteWebDriver.status(deployment.getServer().getUrl());
    assertThat(status.isReady()).isTrue();
    assertThat(status.getMessage()).isEqualTo("Selenium Grid ready.");
  }
}
