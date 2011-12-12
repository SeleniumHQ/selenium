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

import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.testing.Ignore;

public class BrowserConnectionTest extends AbstractDriverTestCase {

  @Ignore(ANDROID)
  public void testShouldSetBrowserOffline() {
    if (!(driver instanceof BrowserConnection)) {
      return;
    }
    driver.get(pages.html5Page);
    assertTrue("Browser is offline.", ((BrowserConnection) driver).isOnline());
    ((BrowserConnection) driver).setOnline(false);
    assertFalse("Failed to set browser offline.",
        ((BrowserConnection) driver).isOnline());
    ((BrowserConnection) driver).setOnline(true);
    assertTrue("Failed to set browser online.",
        ((BrowserConnection) driver).isOnline());
  }

}
