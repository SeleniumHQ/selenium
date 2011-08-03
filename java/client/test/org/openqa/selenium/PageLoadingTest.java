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

package org.openqa.selenium;

import org.openqa.selenium.environment.GlobalTestEnvironment;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.pageTitleToBe;

public class PageLoadingTest extends AbstractDriverTestCase {

  public void testShouldWaitForDocumentToBeLoaded() {
    driver.get(pages.simpleTestPage);

    assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
  }

  public void testShouldFollowRedirectsSentInTheHttpResponseHeaders() {
    driver.get(pages.redirectPage);

    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  public void testShouldFollowMetaRedirects() throws Exception {
    driver.get(pages.metaRedirectPage);
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Ignore(SELENESE)
  public void testShouldBeAbleToGetAFragmentOnTheCurrentPage() {
    driver.get(pages.xhtmlTestPage);
    driver.get(pages.xhtmlTestPage + "#text");
    driver.findElement(By.id("id1"));
  }

  @Ignore(SELENESE)
  public void testShouldReturnWhenGettingAUrlThatDoesNotResolve() {
    try {
      // Of course, we're up the creek if this ever does get registered
      driver.get("http://www.thisurldoesnotexist.comx/");
    } catch (IllegalStateException e) {
      if (!isIeDriverTimedOutException(e)) {
        throw e;
      }
    }
  }

  @Ignore({IPHONE, SELENESE})
  public void testShouldReturnWhenGettingAUrlThatDoesNotConnect() {
    // Here's hoping that there's nothing here. There shouldn't be
    driver.get("http://localhost:3001");
  }

  @Ignore({IE, IPHONE, SELENESE})
  public void testShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded() {
    driver.get(pages.framesetPage);

    driver.switchTo().frame(0);
    WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
    assertThat(pageNumber.getText().trim(), equalTo("1"));

    driver.switchTo().defaultContent().switchTo().frame(1);
    pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
    assertThat(pageNumber.getText().trim(), equalTo("2"));
  }

  @Ignore({IPHONE, SELENESE})
  @NeedsFreshDriver
  public void testSouldDoNothingIfThereIsNothingToGoBackTo() {
    String originalTitle = driver.getTitle();
    driver.get(pages.formPage);

    driver.navigate().back();
    // We may have returned to the browser's home page
    assertThat(driver.getTitle(), anyOf(equalTo(originalTitle), equalTo("We Leave From Here")));
  }

  @Ignore(SELENESE)
  public void testShouldBeAbleToNavigateBackInTheBrowserHistory() {
    driver.get(pages.formPage);

    driver.findElement(By.id("imageButton")).submit();
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));

    driver.navigate().back();
    assertThat(driver.getTitle(), equalTo("We Leave From Here"));
  }

  @Ignore(SELENESE)
  public void testShouldBeAbleToNavigateBackInTheBrowserHistoryInPresenceOfIframes() {
    driver.get(pages.xhtmlTestPage);

    driver.findElement(By.name("sameWindow")).click();

    waitFor(pageTitleToBe(driver, "This page has iframes"));

    assertThat(driver.getTitle(), equalTo("This page has iframes"));

    driver.navigate().back();
    assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
  }

  @Ignore(SELENESE)
  public void testShouldBeAbleToNavigateForwardsInTheBrowserHistory() {
    driver.get(pages.formPage);

    driver.findElement(By.id("imageButton")).submit();
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));

    driver.navigate().back();
    assertThat(driver.getTitle(), equalTo("We Leave From Here"));

    driver.navigate().forward();
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Ignore({IE, CHROME, SELENESE, IPHONE, OPERA})
  public void testShouldBeAbleToAccessPagesWithAnInsecureSslCertificate() {
    String url = GlobalTestEnvironment.get().getAppServer().whereIsSecure("simpleTest.html");
    driver.get(url);

    assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
  }

  @Ignore(SELENESE)
  public void testShouldBeAbleToRefreshAPage() {
    driver.get(pages.xhtmlTestPage);

    driver.navigate().refresh();

    assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
  }

  /**
   * @throws Exception If the test fails.
   * @see <a href="http://code.google.com/p/selenium/issues/detail?id=208">
   *     Issue 208</a>
   */
  @Ignore(value = {IE, SELENESE, IPHONE, OPERA}, reason = "Untested user-agents")
  @JavascriptEnabled
  public void testShouldNotHangIfDocumentOpenCallIsNeverFollowedByDocumentCloseCall()
      throws Exception {
    driver.get(pages.documentWrite);

    // If this command succeeds, then all is well.
    driver.findElement(By.xpath("//body"));
  }
}
