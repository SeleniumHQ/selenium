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

package org.openqa.selenium.mobile;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;

public class NetworkConnectionTest extends JupiterTestBase {

  private NetworkConnection networkConnectionDriver;

  @BeforeEach
  public void setUp() {
    WebDriver augmented = new Augmenter().augment(driver);
    assumeTrue(augmented instanceof NetworkConnection);
    networkConnectionDriver = (NetworkConnection) augmented;
  }

  @Test
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  public void testToggleAirplaneMode() {
    NetworkConnection.ConnectionType current = networkConnectionDriver.getNetworkConnection();
    NetworkConnection.ConnectionType modified;
    if (current.isAirplaneMode()) {
      modified = networkConnectionDriver.setNetworkConnection(NetworkConnection.ConnectionType.ALL);
    } else {
      modified =
        networkConnectionDriver
          .setNetworkConnection(NetworkConnection.ConnectionType.AIRPLANE_MODE);
    }
    assertThat(modified.isAirplaneMode())
      .describedAs("airplane mode should have been toggled")
      .isNotEqualTo(current.isAirplaneMode());
  }

}
