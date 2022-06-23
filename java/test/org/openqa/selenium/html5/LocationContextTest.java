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

package org.openqa.selenium.html5;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.byLessThan;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

public class LocationContextTest extends JupiterTestBase {

  @BeforeEach
  public void hasLocationContext() {
    assumeTrue(driver instanceof LocationContext);
  }

  @Test
  public void testShouldSetAndGetLatitude() {
    driver.get(pages.html5Page);

    ((LocationContext) driver).setLocation(new Location(40.714353, -74.005973, 0.056747));
    Location location = ((LocationContext) driver).location();
    assertThat(location).isNotNull();
    assertThat(location.getLatitude()).isCloseTo(40.714353, byLessThan(0.000001));
  }

  @Test
  public void testShouldSetAndGetLongitude() {
    driver.get(pages.html5Page);

    ((LocationContext) driver).setLocation(new Location(40.714353, -74.005973, 0.056747));
    Location location = ((LocationContext) driver).location();
    assertThat(location).isNotNull();
    assertThat(location.getLongitude()).isCloseTo(-74.005973, byLessThan(0.000001));
  }

  @Test
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  public void testShouldSetAndGetAltitude() {
    driver.get(pages.html5Page);

    ((LocationContext) driver).setLocation(new Location(40.714353, -74.005973, 0.056747));
    Location location = ((LocationContext) driver).location();
    assertThat(location).isNotNull();
    assertThat(location.getAltitude()).isCloseTo(0.056747, byLessThan(0.000001));
  }
}
