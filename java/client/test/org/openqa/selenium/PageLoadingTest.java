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

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.pageTitleToBe;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.SauceDriver;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.concurrent.TimeUnit;

public class PageLoadingTest extends AbstractDriverTestCase {

  public void testShouldWaitForDocumentToBeLoaded() {
    driver.get(pages.simpleTestPage);

    assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
  }

  public void testShouldFollowRedirectsSentInTheHttpResponseHeaders() {
    driver.get(pages.redirectPage);

    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Ignore(ANDROID)
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

  @Ignore({IPHONE, SELENESE, ANDROID})
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
  public void testShouldDoNothingIfThereIsNothingToGoBackTo() {
    if (SauceDriver.shouldUseSauce() && TestUtilities.isInternetExplorer(driver)) {
      // Sauce opens about:blank after the browser loads, which IE doesn't include in history
      // Navigate back past it, so when we do the next navigation back, there is nothing to go
      // back to, rather than skipping past about:blank (whose title we will get as originalTitle)
      // to whatever as before (the WebDriver placeholder page).
      driver.navigate().back();
    }

    String originalTitle = driver.getTitle();
    driver.get(pages.formPage);

    driver.navigate().back();
    // We may have returned to the browser's home page
    assertThat(driver.getTitle(), anyOf(equalTo(originalTitle), equalTo("We Leave From Here")));
  }

  @Ignore({SELENESE, ANDROID})
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

  @Ignore({SELENESE, ANDROID})
  public void testShouldBeAbleToNavigateForwardsInTheBrowserHistory() {
    driver.get(pages.formPage);

    driver.findElement(By.id("imageButton")).submit();
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));

    driver.navigate().back();
    waitFor(pageTitleToBe(driver, "We Leave From Here"));
    assertThat(driver.getTitle(), equalTo("We Leave From Here"));

    driver.navigate().forward();
    waitFor(pageTitleToBe(driver, "We Arrive Here"));
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Ignore({IE, CHROME, SELENESE, IPHONE, OPERA, ANDROID})
  public void testShouldBeAbleToAccessPagesWithAnInsecureSslCertificate() {
    // TODO(user): Set the SSL capability to true.
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
   * @see <a href="http://code.google.com/p/selenium/issues/detail?id=208"> Issue 208</a>
   * 
   * This test often causes the subsequent test to fail, in Firefox, on Linux, so we need
   * a new driver after it.
   * @see <a href="http://code.google.com/p/selenium/issues/detail?id=2282">Issue 2282</a>
   */
  @Ignore(value = {IE, SELENESE, IPHONE, OPERA, ANDROID}, reason = "Untested user-agents")
  @NoDriverAfterTest
  @JavascriptEnabled
  public void testShouldNotHangIfDocumentOpenCallIsNeverFollowedByDocumentCloseCall()
      throws Exception {
    driver.get(pages.documentWrite);

    // If this command succeeds, then all is well.
    WebElement body = driver.findElement(By.tagName("body"));
    waitFor(WaitingConditions.elementTextToContain(body, "world"));
  }

  @Ignore
  public void testShouldNotWaitIndefinitelyIfAnExternalResourceFailsToLoad() {
    String slowPage = appServer.whereIs("slowLoadingResourcePage.html");

    Capabilities current = ((HasCapabilities) driver).getCapabilities();
    DesiredCapabilities caps = new DesiredCapabilities(current);
    caps.setCapability("webdriver.loading.strategy", "unstable");
    WebDriver testDriver = new WebDriverBuilder().setCapabilities(caps).get();

    long start = System.currentTimeMillis();
    testDriver.get(slowPage);
    // We discard the element, but want a check to make sure the GET actually
    // completed.
    testDriver.findElement(By.id("peas"));

    long end = System.currentTimeMillis();
    // The slow loading resource on that page takes 6 seconds to return. If we
    // waited for it, our load time should be over 6 seconds.
    long duration = end - start;

    testDriver.quit(); // Clean up before making assertions

    assertTrue("Took too long to load page: " + duration, duration < 5*1000);
  }

  @Ignore(value = {ANDROID, CHROME, HTMLUNIT, IE, IPHONE, OPERA}, reason = "Not implemented")
  @NeedsLocalEnvironment
  public void testShouldTimeoutIfAPageTakesTooLongToLoad() {
    driver.manage().timeouts().pageLoadTimeout(2, SECONDS);

    try {
      // Get the sleeping servlet with a pause of 5 seconds
      String slowPage = appServer.whereIs("sleep?time=5");
      
      driver.get(slowPage);
      
      fail("I should have timed out");
    } catch (TimeoutException expected) {
    } finally {
      driver.manage().timeouts().pageLoadTimeout(-1, SECONDS);
    }
  }
}
