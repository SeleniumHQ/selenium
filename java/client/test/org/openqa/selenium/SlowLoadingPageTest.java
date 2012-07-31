/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

@Ignore(OPERA_MOBILE)
public class SlowLoadingPageTest extends JUnit4TestBase {

  private static final long LOAD_TIME_IN_SECONDS = 3;

  @Ignore(value = {IPHONE}, reason = "Untested browsers")
  @Test
  public void testShouldBlockUntilPageLoads() throws Exception {
    long start = System.currentTimeMillis();
    driver.get(pages.sleepingPage + "?time=" + LOAD_TIME_IN_SECONDS);
    long now = System.currentTimeMillis();
    assertElapsed(LOAD_TIME_IN_SECONDS * 1000, now - start);
  }

  @Ignore(SELENESE)
  @Test
  public void testShouldBlockUntilIFramesAreLoaded() throws Exception {
    long start = System.currentTimeMillis();
    driver.get(pages.slowIframes);
    long now = System.currentTimeMillis();
    assertElapsed(LOAD_TIME_IN_SECONDS * 1000, now - start);
  }

  @Ignore(value = {IE, IPHONE, SELENESE, OPERA},
      reason = "Selenium: refresh is unsupported;" +
               "IE: fails in IE 6,7,8, works in IE 9;" +
               "Others: untested")
  @Test
  public void testRefreshShouldBlockUntilPageLoads() {
    long start = System.currentTimeMillis();
    driver.get(pages.sleepingPage + "?time=" + LOAD_TIME_IN_SECONDS);
    assertElapsed(LOAD_TIME_IN_SECONDS * 1000, System.currentTimeMillis() - start);
    long refreshed = System.currentTimeMillis();
    driver.navigate().refresh();
    assertElapsed(LOAD_TIME_IN_SECONDS * 1000, System.currentTimeMillis() - refreshed);
  }

  private static void assertElapsed(long expected, long actual) {
    assertTrue(expected + "ms should have elapsed, but was: " + actual, expected <= actual);
  }
}
