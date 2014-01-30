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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.JUnit4TestBase;

public class BrowserConnectionTest extends JUnit4TestBase {

  @Before
  public void checkHasBrowserConnection() {
    assumeTrue(driver instanceof BrowserConnection);
  }

  @Test
  public void testShouldSetBrowserOffline() {
    driver.get(pages.html5Page);
    final BrowserConnection networkAwareDriver = (BrowserConnection) driver;
    
    networkAwareDriver.setOnline(false);

    wait.until(new ExpectedCondition<Boolean>() {
      @Override public Boolean apply(WebDriver ignored) {
        return !networkAwareDriver.isOnline();
      }
    });
    assertFalse("Failed to set browser offline.", networkAwareDriver.isOnline());
    networkAwareDriver.setOnline(true);

    wait.until(new ExpectedCondition<Boolean>() {
      @Override public Boolean apply(WebDriver ignored) {
        return networkAwareDriver.isOnline();
      }
    });

    assertTrue("Failed to set browser online.",
        networkAwareDriver.isOnline());
  }

}
