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

package org.openqa.selenium;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.Platform.ANDROID;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;

import org.junit.Test;
import org.openqa.selenium.interactions.internal.Locatable;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.SwitchToTopAfterTest;
import org.openqa.selenium.testing.TestUtilities;

@Ignore(value = HTMLUNIT,
          reason = "Getting coordinates requires rendering, others: not tested")
public class PositionAndSizeTest extends JUnit4TestBase {

  @Test
  public void testShouldBeAbleToDetermineTheLocationOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.id("username"));
    Point location = element.getLocation();

    assertThat(location.getX() > 0, is(true));
    assertThat(location.getY() > 0, is(true));
  }

  @Test
  public void testShouldGetCoordinatesOfAnElement() {
    driver.get(appServer.whereIs("coordinates_tests/simple_page.html"));
    assertThat(getLocationInViewPort(By.id("box")), is(new Point(10, 10)));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  public void testShouldGetCoordinatesOfAnEmptyElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_empty_element.html"));
    assertThat(getLocationInViewPort(By.id("box")), is(new Point(10, 10)));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  public void testShouldGetCoordinatesOfATransparentElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_transparent_element.html"));
    assertThat(getLocationInViewPort(By.id("box")), is(new Point(10, 10)));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  public void testShouldGetCoordinatesOfAHiddenElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_hidden_element.html"));
    assertThat(getLocationInViewPort(By.id("box")), is(new Point(10, 10)));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  @Ignore(SAFARI)
  public void testShouldGetCoordinatesOfAnInvisibleElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_invisible_element.html"));
    assertThat(getLocationInViewPort(By.id("box")), is(new Point(0, 0)));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(0, 0)));
  }

  @Test
  @Ignore(SAFARI)
  public void testShouldScrollPageAndGetCoordinatesOfAnElementThatIsOutOfViewPort() {
    assumeFalse(
        "window().getSize() is not implemented for Chrome for Android. "
        + "https://code.google.com/p/chromedriver/issues/detail?id=1005",
        TestUtilities.isChrome(driver) && TestUtilities.getEffectivePlatform(driver).is(ANDROID));
    driver.get(appServer.whereIs("coordinates_tests/page_with_element_out_of_view.html"));
    int windowHeight = driver.manage().window().getSize().getHeight();
    Point location = getLocationInViewPort(By.id("box"));
    assertThat(location.getX(), is(10));
    assertThat(location.getY(), greaterThanOrEqualTo(0));
    assertThat(location.getY(), lessThanOrEqualTo(windowHeight - 100));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(10, 5010)));
  }

  @SwitchToTopAfterTest
  @Test
  public void testShouldGetCoordinatesOfAnElementInAFrame() {
    driver.get(appServer.whereIs("coordinates_tests/element_in_frame.html"));
    driver.switchTo().frame("ifr");
    WebElement box = driver.findElement(By.id("box"));
    assertThat(box.getLocation(), is(new Point(10, 10)));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(10, 10)));
  }

  @SwitchToTopAfterTest
  @Test
  @Ignore(SAFARI)
  @Ignore(MARIONETTE)
  public void testShouldGetCoordinatesInViewPortOfAnElementInAFrame() {
    driver.get(appServer.whereIs("coordinates_tests/element_in_frame.html"));
    driver.switchTo().frame("ifr");
    assertThat(getLocationInViewPort(By.id("box")), is(new Point(25, 25)));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(10, 10)));
  }

  @SwitchToTopAfterTest
  @Test
  @Ignore(SAFARI)
  @Ignore(MARIONETTE)
  public void testShouldGetCoordinatesInViewPortOfAnElementInANestedFrame() {
    driver.get(appServer.whereIs("coordinates_tests/element_in_nested_frame.html"));
    driver.switchTo().frame("ifr");
    driver.switchTo().frame("ifr");
    assertThat(getLocationInViewPort(By.id("box")), is(new Point(40, 40)));
    assertThat(getLocationOnPage(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  @Ignore(FIREFOX)
  @Ignore(SAFARI)
  public void testShouldGetCoordinatesOfAnElementWithFixedPosition() {
    assumeFalse("Ignoring fixed-position elements in IE6", TestUtilities.isIe6(driver));
    driver.get(appServer.whereIs("coordinates_tests/page_with_fixed_element.html"));
    assertThat(getLocationInViewPort(By.id("fixed")).getY(), is(0));
    assertThat(getLocationOnPage(By.id("fixed")).getY(), is(0));

    driver.findElement(By.id("bottom")).click();
    assertThat(getLocationInViewPort(By.id("fixed")).getY(), is(0));
    assertThat(getLocationOnPage(By.id("fixed")).getY(), greaterThan(0));
  }

  @Test
  public void testShouldCorrectlyIdentifyThatAnElementHasWidthAndHeight() {
    driver.get(pages.xhtmlTestPage);

    WebElement shrinko = driver.findElement(By.id("linkId"));
    Dimension size = shrinko.getSize();
    assertTrue("Width expected to be greater than 0", size.width > 0);
    assertTrue("Height expected to be greater than 0", size.height > 0);
  }

  // TODO: This test's value seems dubious at best. The CSS spec does not define how browsers
  // should handle sub-pixel rendering, and every browser seems to be different anyhow:
  // http://ejohn.org/blog/sub-pixel-problems-in-css/
  @Test
  @Ignore(IE)
  @Ignore(value = CHROME, reason = "WebKit bug 28804")
  @Ignore(SAFARI)
  @Ignore(PHANTOMJS)
  @Ignore(MARIONETTE)
  public void testShouldHandleNonIntegerPositionAndSize() {
    driver.get(pages.rectanglesPage);

    WebElement r2 = driver.findElement(By.id("r2"));
    String left = r2.getCssValue("left");
    assertTrue("left (\"" + left + "\") should start with \"10.9\".", left.startsWith("10.9"));
    String top = r2.getCssValue("top");
    assertTrue("top (\"" + top + "\") should start with \"10.1\".", top.startsWith("10.1"));
    assertEquals(new Point(11, 10), r2.getLocation());
    String width = r2.getCssValue("width");
    assertTrue("width (\"" + left + "\") should start with \"48.6\".", width.startsWith("48.6"));
    String height = r2.getCssValue("height");
    assertTrue("height (\"" + left + "\") should start with \"49.3\".", height.startsWith("49.3"));
    assertEquals(r2.getSize(), new Dimension(49, 49));
  }

  private Point getLocationInViewPort(By locator) {
    WebElement element = driver.findElement(locator);
    return ((Locatable) element).getCoordinates().inViewPort();
  }

  private Point getLocationOnPage(By locator) {
    WebElement element = driver.findElement(locator);
    return ((Locatable) element).getCoordinates().onPage();
  }
}
