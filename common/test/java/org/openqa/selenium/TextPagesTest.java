/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import org.openqa.selenium.environment.GlobalTestEnvironment;

public class TextPagesTest extends AbstractDriverTestCase {

  private String textPage;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    textPage = GlobalTestEnvironment.get().getAppServer().whereIs("plain.txt");
  }

  @Ignore({IE, FIREFOX, SELENESE, CHROME, IPHONE})
  public void testShouldBeAbleToLoadASimplePageOfText() {
    driver.get(textPage);

    String source = driver.getPageSource();
    assertEquals("Test", source);
  }

  @Ignore(CHROME)
  public void testFindingAnElementOnAPlainTextPageWillNeverWork() {
    driver.get(textPage);

    try {
      driver.findElement(By.id("foo"));
      fail("This shouldn't work");
    } catch (NoSuchElementException e) {
      // this is expected
    }
  }

  @Ignore({IE, CHROME, IPHONE, SELENESE})
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
