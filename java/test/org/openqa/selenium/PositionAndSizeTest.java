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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

@Ignore(value = HTMLUNIT, reason = "Getting coordinates requires rendering, others: not tested")
class PositionAndSizeTest extends JupiterTestBase {

  @Test
  void testShouldBeAbleToDetermineTheLocationOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    WebElement element = driver.findElement(By.id("username"));
    Point location = element.getLocation();

    assertThat(location.getX()).isPositive();
    assertThat(location.getY()).isPositive();
  }

  @Test
  void testShouldGetCoordinatesOfAnElement() {
    driver.get(appServer.whereIs("coordinates_tests/simple_page.html"));
    assertThat(getLocationInViewPort(By.id("box"))).isEqualTo(new Point(10, 10));
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(10, 10));
  }

  @Test
  void testShouldGetCoordinatesOfAnEmptyElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_empty_element.html"));
    assertThat(getLocationInViewPort(By.id("box"))).isEqualTo(new Point(10, 10));
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(10, 10));
  }

  @Test
  void testShouldGetCoordinatesOfATransparentElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_transparent_element.html"));
    assertThat(getLocationInViewPort(By.id("box"))).isEqualTo(new Point(10, 10));
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(10, 10));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldGetCoordinatesOfAHiddenElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_hidden_element.html"));
    assertThat(getLocationInViewPort(By.id("box"))).isEqualTo(new Point(10, 10));
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(10, 10));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldGetCoordinatesOfAnInvisibleElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_invisible_element.html"));
    assertThat(getLocationInViewPort(By.id("box"))).isEqualTo(new Point(0, 0));
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(0, 0));
  }

  @Test
  void testShouldScrollPageAndGetCoordinatesOfAnElementThatIsOutOfViewPort() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_element_out_of_view.html"));
    int windowHeight = driver.manage().window().getSize().getHeight();
    Point location = getLocationInViewPort(By.id("box"));
    assertThat(location.getX()).isEqualTo(10);
    assertThat(location.getY()).isGreaterThanOrEqualTo(0);
    assertThat(location.getY()).isLessThanOrEqualTo(windowHeight - 100);
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(10, 5010));
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldGetCoordinatesOfAnElementInAFrame() {
    driver.get(appServer.whereIs("coordinates_tests/element_in_frame.html"));
    driver.switchTo().frame("ifr");
    WebElement box = driver.findElement(By.id("box"));
    assertThat(box.getLocation()).isEqualTo(new Point(10, 10));
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(10, 10));
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(IE)
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  public void testShouldGetCoordinatesInViewPortOfAnElementInAFrame() {
    driver.get(appServer.whereIs("coordinates_tests/element_in_frame.html"));
    driver.switchTo().frame("ifr");
    assertThat(getLocationInViewPort(By.id("box"))).isEqualTo(new Point(25, 25));
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(10, 10));
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(IE)
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  public void testShouldGetCoordinatesInViewPortOfAnElementInANestedFrame() {
    driver.get(appServer.whereIs("coordinates_tests/element_in_nested_frame.html"));
    driver.switchTo().frame("ifr");
    driver.switchTo().frame("ifr");
    assertThat(getLocationInViewPort(By.id("box"))).isEqualTo(new Point(40, 40));
    assertThat(getLocationOnPage(By.id("box"))).isEqualTo(new Point(10, 10));
  }

  @Test
  void testShouldGetCoordinatesOfAnElementWithFixedPosition() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_fixed_element.html"));
    assertThat(getLocationInViewPort(By.id("fixed")).getY()).isZero();
    assertThat(getLocationOnPage(By.id("fixed")).getY()).isZero();

    driver.findElement(By.id("bottom")).click();
    assertThat(getLocationInViewPort(By.id("fixed")).getY()).isZero();
    assertThat(getLocationOnPage(By.id("fixed")).getY()).isPositive();
  }

  @Test
  void testShouldCorrectlyIdentifyThatAnElementHasWidthAndHeight() {
    driver.get(pages.xhtmlTestPage);

    WebElement shrinko = driver.findElement(By.id("linkId"));
    Dimension size = shrinko.getSize();
    assertThat(size.width).isPositive();
    assertThat(size.height).isPositive();
  }

  // TODO: This test's value seems dubious at best. The CSS spec does not define how browsers
  // should handle sub-pixel rendering, and every browser seems to be different anyhow:
  // http://ejohn.org/blog/sub-pixel-problems-in-css/
  @Test
  @Ignore(IE)
  @NotYetImplemented(value = CHROME, reason = "WebKit bug 28804")
  @NotYetImplemented(value = EDGE, reason = "WebKit bug 28804")
  @NotYetImplemented(SAFARI)
  @Ignore(FIREFOX)
  public void testShouldHandleNonIntegerPositionAndSize() {
    driver.get(pages.rectanglesPage);

    WebElement r2 = driver.findElement(By.id("r2"));
    String left = r2.getCssValue("left");
    assertThat(left).startsWith("10.9");
    String top = r2.getCssValue("top");
    assertThat(top).startsWith("10.1");
    assertThat(r2.getLocation()).isEqualTo(new Point(11, 10));
    String width = r2.getCssValue("width");
    assertThat(width).startsWith("48.6");
    String height = r2.getCssValue("height");
    assertThat(height).startsWith("49.3");
    assertThat(r2.getSize()).isEqualTo(new Dimension(49, 49));
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
