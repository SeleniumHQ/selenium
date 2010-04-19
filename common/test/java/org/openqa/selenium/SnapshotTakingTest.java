/*
Copyright 2009 WebDriver committers
Copyright 2009 Google Inc.

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

import java.io.File;
import java.lang.reflect.Method;

import static org.junit.Assert.assertTrue;

public class SnapshotTakingTest extends AbstractDriverTestCase {

  public void testShouldTakeSnapshotsOfThePage() throws Exception {
    if (!isAbleToTakeSnapshots(driver)) {
      return;
    }

    driver.get(pages.simpleTestPage);

    File temp = File.createTempFile("snapshot", "png");
    temp.deleteOnExit();
    takeSnapshot(driver, temp);

    assertTrue(temp.length() > 0);
  }

  private void takeSnapshot(WebDriver driver, File temp) throws Exception {
    Method method = getSnapshotMethod(driver);
    method.invoke(driver, temp);
  }

  private boolean isAbleToTakeSnapshots(WebDriver driver) throws Exception {
    try {
      getSnapshotMethod(driver);
      return true;
    } catch (NoSuchMethodException e) {
      return false;
    }
  }

  private Method getSnapshotMethod(WebDriver driver) throws NoSuchMethodException {
    return driver.getClass().getMethod("saveScreenshot", File.class);
  }
}
