/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

import static java.util.concurrent.TimeUnit.MILLISECONDS;

import org.openqa.selenium.AbstractDriverTestCase;

public class LocationContextTest  extends AbstractDriverTestCase {

    public void testShouldSetAndGetLocation() {
    if (!(driver instanceof LocationContext)) {
      return;
    }
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
