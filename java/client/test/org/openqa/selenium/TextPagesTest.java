/*
Copyright 2007-2012 Selenium committers
Copyright 2007-2012 Software Freedom Conservancy

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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

public class TextPagesTest extends JUnit4TestBase {

  private String textPage;

  @Before
  public void setUp() throws Exception {
    textPage = GlobalTestEnvironment.get().getAppServer().whereIs("plain.txt");
  }

  @Ignore(value = {IE, FIREFOX, SELENESE, CHROME, IPHONE, OPERA, ANDROID, SAFARI, OPERA_MOBILE},
      reason = "Android: WebView adds HTML tags to the page.")
  @Test
  public void testShouldBeAbleToLoadASimplePageOfText() {
    driver.get(textPage);

    String source = driver.getPageSource();
    assertEquals("Test", source);
  }

  @Test
  public void testFindingAnElementOnAPlainTextPageWillNeverWork() {
    driver.get(textPage);

    try {
      driver.findElement(By.id("foo"));
      fail("This shouldn't work");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Ignore(value = {CHROME, IE, IPHONE, SELENESE, OPERA, ANDROID, SAFARI, OPERA_MOBILE}, reason =
      "Opera, Safari: creates DOM for displaying text pages")
  @Test
  public void testShouldThrowExceptionWhenAddingCookieToAPageThatIsNotHtml() {
    driver.get(textPage);

    Cookie cookie = new Cookie.Builder("hello", "goodbye").build();
    try {
      driver.manage().addCookie(cookie);
      fail("Should throw exception when adding cookie to non existing domain");
    } catch (WebDriverException e) {
      // This is expected
    }
  }
}
