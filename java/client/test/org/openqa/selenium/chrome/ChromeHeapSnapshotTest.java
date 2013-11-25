/*
 Copyright 2013 Selenium committers
 Copyright 2013 Software Freedom Conservancy

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

package org.openqa.selenium.chrome;

import org.junit.Test;
import org.openqa.selenium.HeapSnapshot;
import org.openqa.selenium.TakesHeapSnapshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

import static org.junit.Assert.assertFalse;

/**
 * Functional tests for {@link TakesHeapSnapshot}.
 */
public class ChromeHeapSnapshotTest extends JUnit4TestBase {

  private void testHeapSnapshot(WebDriver driver) {
    WebDriver toUse = null;
    if (driver instanceof TakesHeapSnapshot)
      toUse = driver;
    else
      toUse = new Augmenter().augment(driver);
    toUse.get(pages.simpleTestPage);
    HeapSnapshot heapSnapshot = ((TakesHeapSnapshot) toUse).takeHeapSnapshot();
    assertFalse(heapSnapshot.getNodeData().isEmpty());
  }

  @Test
  public void canTakeHeapSnapshotWithArgumentedRemoteWebDriver() {
    if (!(driver instanceof RemoteWebDriver)) {
      System.out.println("Skipping test: driver is not a remote webdriver");
      return;
    }
    testHeapSnapshot(driver);
  }

  @NeedsLocalEnvironment
  @Test
  public void canTakeHeapSnapshotWithChromeDriver() {
    ChromeDriver driver = null;
    try {
      driver = new ChromeDriver();
      testHeapSnapshot(driver);
    } finally {
      if (driver != null)
        driver.quit();
    }
  }
}
