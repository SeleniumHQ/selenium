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

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeTrue;

public class AppCacheTest extends JUnit4TestBase {

  @Before
  public void checkIsApplicationCache() {
    assumeTrue(driver instanceof ApplicationCache);
  }

  @Test
  public void testAppCacheStatus() {
    driver.get(pages.html5Page);
    driver.manage().timeouts().implicitlyWait(2000, MILLISECONDS);

    AppCacheStatus status = ((ApplicationCache) driver).getStatus();
    while (status == AppCacheStatus.DOWNLOADING) {
      status = ((ApplicationCache) driver).getStatus();
    }
    assertEquals(AppCacheStatus.UNCACHED, status);
    // Check if resources are retrieved from browser's cache.
    ((BrowserConnection) driver).setOnline(false);
    driver.get(pages.html5OfflinePage);
    AppCacheStatus new_status = ((ApplicationCache) driver).getStatus();
    String new_title = driver.getTitle();
    ((BrowserConnection) driver).setOnline(true);
    
    assertEquals("The offline page should report uncached status.",
        AppCacheStatus.UNCACHED, new_status);
    assertEquals("Should be directed to the offline page", "Offline", new_title);
  }

  @Test
  public void testBrowserLoadsFromCacheWhenOffline() {
    driver.get(pages.html5Page);
    driver.get(pages.formPage);

    ((BrowserConnection) driver).setOnline(false);
    driver.get(pages.html5Page);
    String title = driver.getTitle();
    ((BrowserConnection) driver).setOnline(true);
    assertEquals("HTML5", title);
  }
}
