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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assume.assumeTrue;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

public class LocationContextTest  extends JUnit4TestBase {

  @Before
  public void hasLocationContext() {
    assumeTrue(driver instanceof LocationContext);
  }

  @Test
  public void testShouldSetAndGetLocation() {
    driver.get(pages.html5Page);

    ((LocationContext) driver).setLocation(
        new Location(40.714353, -74.005973, 0.056747));
    Location location = ((LocationContext) driver).location();
    assertNotNull(location);
    assertEquals(40.714353, location.getLatitude(), 0.000001);
    assertEquals(-74.005973, location.getLongitude(), 0.000001);
    assertEquals(0.056747, location.getAltitude(), 0.000001);
  }
}
