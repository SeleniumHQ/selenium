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
import org.openqa.selenium.TestWaiter;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.concurrent.Callable;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;

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

    TestWaiter.waitFor(new Callable<Boolean>() {
      public Boolean call() throws Exception {
        return !networkAwareDriver.isOnline();
      }
    });
    assertFalse("Failed to set browser offline.", networkAwareDriver.isOnline());
    networkAwareDriver.setOnline(true);

    TestWaiter.waitFor(new Callable<Boolean>() {
      public Boolean call() throws Exception {
        return networkAwareDriver.isOnline();
      }
    });
        
    assertTrue("Failed to set browser online.",
        networkAwareDriver.isOnline());
  }

}
