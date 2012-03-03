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

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.List;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.junit.Assert.assertEquals;

public class AppCacheTest extends JUnit4TestBase {
  @Test
  public void testAppCacheStatus() {
    if (!(driver instanceof ApplicationCache)) {
      return;
    }
    driver.get(pages.html5Page);
    driver.manage().timeouts().implicitlyWait(2000, MILLISECONDS);

    AppCacheStatus status = ((ApplicationCache) driver).getStatus();
    assertEquals(AppCacheStatus.UNCACHED, status);
    // Check if resources are retrieved from browser's cache.
    ((BrowserConnection) driver).setOnline(false);
    driver.get(pages.html5Page);
    AppCacheStatus status1 = ((ApplicationCache) driver).getStatus();
    status1 = ((ApplicationCache) driver).getStatus();
    assertEquals("Resources should be retrieved from browser's cache.",
        AppCacheStatus.IDLE, status1);
  }

  @Test
  public void testBrowserLoadsFromCacheWhenOffline() {
    if (!(driver instanceof ApplicationCache)) {
      return;
    }
    driver.get(pages.html5Page);
    driver.get(pages.formPage);

    ((BrowserConnection) driver).setOnline(false);
    driver.get(pages.html5Page);
    assertEquals("HTML5", driver.getTitle());
  }

  @Test
  public void testGetAppCache() {
    if (!(driver instanceof ApplicationCache)) {
      return;
    }
    driver.get(pages.html5Page);

    ((BrowserConnection) driver).setOnline(false);

    List<AppCacheEntry> caches = ((ApplicationCache) driver).getAppCache();
    for (AppCacheEntry cache : caches) {
      assertEquals("image/jpeg", cache.getMimeType());
      if (cache.getUrl().contains("red.jpg")) {
        assertEquals(
            "Resources that were listed in cache's manifest isn't MASTER.",
            AppCacheType.MASTER, cache.getType().value());
      } else if (cache.getUrl().contains("yellow.jpg")) {
        assertEquals(
            "Resources that were listed in cache's manifest isn't EXPLICIT",
            AppCacheType.EXPLICIT, cache.getType().value());
      }
    }
  }
}
