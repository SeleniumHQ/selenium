/*
Copyright 2011 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.html5;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.logging.Logger;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeTrue;

public class LocationContextTest  extends JUnit4TestBase {
  private static final Logger logger = Logger.getLogger(LocationContextTest.class.getName());

  @Before
  public void hasLocationContext() {
    assumeTrue(driver instanceof LocationContext);
  }

  @Test
  public void testShouldSetAndGetLocation() {
    driver.get(pages.html5Page);

    ((LocationContext) driver).setLocation(
        new Location(40.714353, -74.005973, 0.056747));

    driver.manage().timeouts().implicitlyWait(2000, MILLISECONDS);

    Location location = ((LocationContext) driver).location();
    assertEquals(40.714353, location.getLatitude(), 4);
    assertEquals(-74.005973, location.getLongitude(), 4);
    assertEquals(1.056747, location.getAltitude(), 4);
  }
}
