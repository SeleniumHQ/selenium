/*
 * Copyright 2008 Google Inc.  All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.util.HashSet;
import java.util.Set;

public class WindowSwitchingTest extends AbstractDriverTestCase {

  @Ignore("ie, remote, safari")
  public void testShouldSwitchFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations() {
    driver.get(xhtmlTestPage);

    driver.findElement(By.linkText("Open new window")).click();
    assertThat(driver.getTitle(), equalTo("XHTML Test Page"));

    driver.switchTo().window("result");
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));

    driver.get(iframePage);
    driver.findElement(By.id("iframe_page_heading"));
  }

  @Ignore("ie, remote, safari")
  public void testShouldThrowNoSuchWindowException() {
    driver.get(xhtmlTestPage);

    try {
      driver.switchTo().window("invalid name");
      fail("NoSuchWindowException expected");
    } catch (NoSuchWindowException e) {
      // Expected.
    }
  }


  @NeedsFreshDriver
  @NoDriverAfterTest
  @Ignore("ie, remote, safari")
  public void testShouldBeAbleToIterateOverAllOpenWindows() throws Exception {
    driver.get(xhtmlTestPage);
    driver.findElement(By.name("windowOne")).click();
    driver.findElement(By.name("windowTwo")).click();

    Set<String> allWindowHandles = driver.getWindowHandles();

    // There should be three windows. We should also see each of the window titles at least once.
    assertEquals(3, allWindowHandles.size());

    Set<String> seenHandles = new HashSet<String>();
    for (String handle : allWindowHandles) {
      assertFalse(seenHandles.contains(handle));
      driver.switchTo().window(handle);
      seenHandles.add(handle);
    }
  }


  public void testRemovingDriversFromTheWindowIteratorShouldCloseTheUnderlyingWindow() {
    // Not implemented yet
  }
}
