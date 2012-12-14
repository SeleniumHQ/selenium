/*
Copyright 2012 Software Freedom Conservancy
Copyright 2012 Selenium committers

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

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.junit.Assert.assertThat;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import org.junit.Test;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

@Ignore(value = {HTMLUNIT, OPERA, OPERA_MOBILE, SAFARI, ANDROID, IPHONE, SELENESE},
        reason = "HtmlUnit: Getting coordinates requires rendering, "
               + "Opera: Not implemented, others: not tested")
public class CoordinatesTest extends JUnit4TestBase {

  @Test
  public void testShouldGetCoordinatesOfAnElementInViewPort() {
    driver.get(appServer.whereIs("coordinates_tests/simple_page.html"));
    assertThat(getLocationOnScreen(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  @Ignore(IE)
  public void testShouldGetCoordinatesOfAnEmptyElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_empty_element.html"));
    assertThat(getLocationOnScreen(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  public void testShouldGetCoordinatesOfATransparentElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_transparent_element.html"));
    assertThat(getLocationOnScreen(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  @Ignore(IE)
  public void testShouldGetCoordinatesOfAHiddenElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_hidden_element.html"));
    assertThat(getLocationOnScreen(By.id("box")), is(new Point(10, 10)));
  }

  @Test
  @Ignore(IE)
  public void testShouldGetCoordinatesOfAnInvisibleElement() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_invisible_element.html"));
    assertThat(getLocationOnScreen(By.id("box")), is(new Point(0, 0)));
  }

  @Test
  public void testShouldScrollPageAndGetCoordinatesOfAnElementThatIsOutOfViewPort() {
    driver.get(appServer.whereIs("coordinates_tests/page_with_element_out_of_view.html"));
    int windowHeight = driver.manage().window().getSize().getHeight();
    Point location = getLocationOnScreen(By.id("box"));
    assertThat(location.getX(), is(10));
    assertThat(location.getY(), greaterThanOrEqualTo(0));
    assertThat(location.getY(), lessThanOrEqualTo(windowHeight - 100));
  }

  private Point getLocationOnScreen(By locator) {
    WebElement element = driver.findElement(locator);
    return ((Locatable) element).getCoordinates().getLocationOnScreen();
  }
}