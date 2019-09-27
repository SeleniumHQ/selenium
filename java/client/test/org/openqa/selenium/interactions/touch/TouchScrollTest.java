// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.interactions.touch;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.testing.NeedsFreshDriver;

/**
 * Tests the basic scroll operations on touch enabled devices..
 */
public class TouchScrollTest extends TouchTestBase {
  private TouchActions getBuilder(WebDriver driver) {
    return new TouchActions(driver);
  }

  @NeedsFreshDriver
  @Test
  public void testCanScrollVerticallyFromWebElement() {
    driver.get(pages.longContentPage);

    WebElement link = driver.findElement(By.id("link3"));
    int y = link.getLocation().y;
    // The element is located at the right of the page,
    // so it is not initially visible on the screen.
    assertThat(y).isGreaterThan(4200);

    WebElement toScroll = driver.findElement(By.id("imagestart"));
    Action scroll = getBuilder(driver).scroll(toScroll, 0, -800).build();
    scroll.perform();

    y = link.getLocation().y;
    // After scrolling, the location of the element should change accordingly.
    assertThat(y).isLessThan(3500);
  }

  @NeedsFreshDriver
  @Test
  public void testCanScrollHorizontallyFromWebElement() {
    driver.get(pages.longContentPage);

    WebElement link = driver.findElement(By.id("link1"));
    int x = link.getLocation().x;
    // The element is located at the right of the page,
    // so it is not initially visible on the screen.
    assertThat(x).isGreaterThan(1500);

    WebElement toScroll = driver.findElement(By.id("imagestart"));
    Action scroll = getBuilder(driver).scroll(toScroll, -1000, 0).build();
    scroll.perform();

    x = link.getLocation().x;
    // After scrolling, the location of the element should change accordingly.
    assertThat(x).isLessThan(1500);
  }

  @NeedsFreshDriver
  @Test
  public void testCanScrollVertically() {
    driver.get(pages.longContentPage);

    WebElement link = driver.findElement(By.id("link3"));
    int y = link.getLocation().y;
    // The element is located at the right of the page,
    // so it is not initially visible on the screen.
    assertThat(y).isGreaterThan(4200);

    Action scrollDown = getBuilder(driver).scroll(0, 800).build();
    scrollDown.perform();

    y = link.getLocation().y;
    // After scrolling, the location of the element should change accordingly.
    assertThat(y).isLessThan(3500);
  }

  @NeedsFreshDriver
  @Test
  public void testCanScrollHorizontally() {
    driver.get(pages.longContentPage);

    WebElement link = driver.findElement(By.id("link1"));
    int x = link.getLocation().x;
    // The element is located at the right of the page,
    // so it is not initially visible on the screen.
    assertThat(x).isGreaterThan(1500);

    Action scrollDown = getBuilder(driver).scroll(400, 0).build();
    scrollDown.perform();

    x = link.getLocation().y;
    // After scrolling, the location of the element should change accordingly.
    assertThat(x).isLessThan(1500);
  }
}
