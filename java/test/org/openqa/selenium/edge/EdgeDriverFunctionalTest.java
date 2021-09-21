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

package org.openqa.selenium.edge;

import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chromium.ChromiumNetworkConditions;
import org.openqa.selenium.chromium.HasNetworkConditions;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

public class EdgeDriverFunctionalTest {

  @Test
  public void shouldAllowRemoteWebDriverToAugmentHasNetworkConditions() throws MalformedURLException {
    WebDriver driver = new RemoteWebDriver(new URL("http://localhost:4444/"), new EdgeOptions());
    WebDriver augmentedDriver = new Augmenter().augment(driver);

    ChromiumNetworkConditions networkConditions = new ChromiumNetworkConditions();
    networkConditions.setLatency(Duration.ofMillis(200));

    try {
      ((HasNetworkConditions) augmentedDriver).setNetworkConditions(networkConditions);
      assertThat(((HasNetworkConditions) augmentedDriver).getNetworkConditions().getLatency()).isEqualTo(Duration.ofMillis(200));

      ((HasNetworkConditions) augmentedDriver).deleteNetworkConditions();

      try {
        ((HasNetworkConditions) augmentedDriver).getNetworkConditions();
        fail("If Network Conditions were deleted, should not be able to get Network Conditions");
      } catch (WebDriverException e) {
        if (!e.getMessage().contains("network conditions must be set before it can be retrieved")) {
          throw e;
        }
      }
    } finally {
      driver.quit();
    }
  }
}
