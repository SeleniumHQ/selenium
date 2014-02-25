/*
Copyright 2007-2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.lessThan;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.WaitingConditions.elementTextToContain;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.newWindowIsOpened;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_SSL_CERTS;
import static org.openqa.selenium.support.ui.ExpectedConditions.not;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.TestUtilities.isLocal;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.drivers.SauceDriver;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.Set;

public class PageLoadingTest extends JUnit4TestBase {

  private WebDriver localDriver;

  private void initLocalDriver(String strategy) {
    if (localDriver != null) {
      localDriver.quit();
    }
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.PAGE_LOADING_STRATEGY, strategy);
    localDriver = new WebDriverBuilder().setDesiredCapabilities(caps).get();
  }

  @Ignore(value = {CHROME, IE, OPERA, SAFARI, MARIONETTE, PHANTOMJS, HTMLUNIT})
  @NeedsLocalEnvironment
  @Test
  public void testNoneStrategyShouldNotWaitForPageToLoad() {
    initLocalDriver("none");

    String slowPage = appServer.whereIs("sleep?time=5");

    long start = System.currentTimeMillis();
    localDriver.get(slowPage);
    long end = System.currentTimeMillis();

    long duration = end - start;
    // The slow loading resource on that page takes 6 seconds to return,
    // but with 'none' page loading strategy 'get' operation should not wait.
    assertTrue("Took too long to load page: " + duration, duration < 1000);
  }

  @Ignore(value = {CHROME, IE, OPERA, SAFARI, MARIONETTE, PHANTOMJS, HTMLUNIT})
  @NeedsLocalEnvironment
  @Test
  public void testNoneStrategyShouldNotWaitForPageToRefresh() {
    initLocalDriver("none");

    String slowPage = appServer.whereIs("sleep?time=5");

    localDriver.get(slowPage);
    // We discard the element, but want a check to make sure the page is loaded
    new WebDriverWait(localDriver, 10).until(presenceOfElementLocated(By.tagName("body")));

    long start = System.currentTimeMillis();
    localDriver.navigate().refresh();
    long end = System.currentTimeMillis();

    long duration = end - start;
    // The slow loading resource on that page takes 6 seconds to return,
    // but with 'none' page loading strategy 'refresh' operation should not wait.
    assertTrue("Took too long to load page: " + duration, duration < 1000);
  }

  @Ignore(value = {FIREFOX, CHROME, IE, OPERA, SAFARI, MARIONETTE, PHANTOMJS, HTMLUNIT})
  @NeedsLocalEnvironment
  @Test
  public void testEagerStrategyShouldNotWaitForResources() {
    initLocalDriver("eager");

    String slowPage = appServer.whereIs("slowLoadingResourcePage.html");

    long start = System.currentTimeMillis();
    localDriver.get(slowPage);
    // We discard the element, but want a check to make sure the GET actually
    // completed.
    localDriver.findElement(By.id("peas"));
    long end = System.currentTimeMillis();

    // The slow loading resource on that page takes 6 seconds to return. If we
    // waited for it, our load time should be over 6 seconds.
    long duration = end - start;
    assertTrue("Took too long to load page: " + duration, duration < 5 * 1000);
  }

  @Ignore(value = {FIREFOX, CHROME, IE, OPERA, SAFARI, MARIONETTE, PHANTOMJS, HTMLUNIT})
  @NeedsLocalEnvironment
  @Test
  public void testEagerStrategyShouldNotWaitForResourcesOnRefresh() {
    initLocalDriver("eager");

    String slowPage = appServer.whereIs("slowLoadingResourcePage.html");

    localDriver.get(slowPage);
    // We discard the element, but want a check to make sure the GET actually completed.
    localDriver.findElement(By.id("peas"));

    long start = System.currentTimeMillis();
    localDriver.navigate().refresh();
    // We discard the element, but want a check to make sure the refresh actually completed.
    localDriver.findElement(By.id("peas"));
    long end = System.currentTimeMillis();

    // The slow loading resource on that page takes 6 seconds to return. If we
    // waited for it, our load time should be over 6 seconds.
    long duration = end - start;
    assertTrue("Took too long to refresh page: " + duration, duration < 5 * 1000);
  }

  @Test
  public void testEagerStrategyShouldWaitForDocumentToBeLoaded() {
    initLocalDriver("eager");

    String slowPage = appServer.whereIs("sleep?time=3");

    localDriver.get(slowPage);

    // We discard the element, but want a check to make sure the GET actually completed.
    localDriver.findElement(By.tagName("body"));
  }

  @Test
  public void testNormalStrategyShouldWaitForDocumentToBeLoaded() {
    driver.get(pages.simpleTestPage);
    assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
  }

  @Test
  public void testShouldFollowRedirectsSentInTheHttpResponseHeaders() {
    driver.get(pages.redirectPage);
    assertThat(driver.getTitle(), equalTo("We Arrive Here"));
  }

  @Ignore(ANDROID)
  @Test
  public void testShouldFollowMetaRedirects() throws Exception {
    driver.get(pages.metaRedirectPage);
    wait.until(titleIs("We Arrive Here"));
  }

  @Test
  @Ignore(MARIONETTE)
  public void testShouldBeAbleToGetAFragmentOnTheCurrentPage() {
    driver.get(pages.xhtmlTestPage);
    driver.get(pages.xhtmlTestPage + "#text");
    driver.findElement(By.id("id1"));
  }

  @Ignore(value = {SAFARI, MARIONETTE}, issues = {4062})
  @Test
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

  @Ignore(value = {IE, OPERA, SAFARI, MARIONETTE, PHANTOMJS})
  @Test(expected = WebDriverException.class)
  @NeedsFreshDriver
  public void testShouldThrowIfUrlIsMalformed() {
    assumeFalse("Fails in Sauce Cloud", SauceDriver.shouldUseSauce());
    driver.get("www.test.com");
  }

  @Ignore(value = {IPHONE, SAFARI, MARIONETTE}, issues = {4062})
  @Test
  public void testShouldReturnWhenGettingAUrlThatDoesNotConnect() {
    // Here's hoping that there's nothing here. There shouldn't be
    driver.get("http://localhost:3001");
  }

  @Test
  public void testShouldReturnURLOnNotExistedPage() {
    String url = appServer.whereIs("not_existed_page.html");
    driver.get(url);
    assertEquals(url, driver.getCurrentUrl());
  }

  @Ignore({IPHONE, ANDROID, MARIONETTE})
  @Test
  public void testShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded() {
    driver.get(pages.framesetPage);

    driver.switchTo().frame(0);
    WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
    assertThat(pageNumber.getText().trim(), equalTo("1"));

    driver.switchTo().defaultContent().switchTo().frame(1);
    pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
    assertThat(pageNumber.getText().trim(), equalTo("2"));
  }

  @Ignore(value = {IPHONE, SAFARI}, issues = {3771})
  @JavascriptEnabled
  @NeedsFreshDriver
  @NoDriverAfterTest
  @Test
  public void testShouldDoNothingIfThereIsNothingToGoBackTo() {
    Set<String> currentWindowHandles = driver.getWindowHandles();
    ((JavascriptExecutor) driver).executeScript(
        "window.open('" + pages.formPage + "', 'newWindow')");
    wait.until(newWindowIsOpened(currentWindowHandles));
    driver.switchTo().window("newWindow");
    String originalTitle = driver.getTitle();
    driver.get(pages.blankPage);
    wait.until(not(titleIs(originalTitle)));
    driver.navigate().back();
    wait.until(titleIs(originalTitle));
    driver.navigate().back(); // Nothing to go back to, must stay.
    assertThat(driver.getTitle(), equalTo(originalTitle));
  }

  @Ignore(value = {ANDROID, SAFARI, MARIONETTE}, issues = {3771})
  @Test
  public void testShouldBeAbleToNavigateBackInTheBrowserHistory() {
    driver.get(pages.formPage);

    driver.findElement(By.id("imageButton")).submit();
    wait.until(titleIs("We Arrive Here"));

    driver.navigate().back();
    wait.until(titleIs("We Leave From Here"));
  }

  @Ignore(value = {SAFARI}, issues = {3771})
  @Test
  public void testShouldBeAbleToNavigateBackInTheBrowserHistoryInPresenceOfIframes() {
    driver.get(pages.xhtmlTestPage);

    driver.findElement(By.name("sameWindow")).click();
    wait.until(titleIs("This page has iframes"));

    driver.navigate().back();
    wait.until(titleIs("XHTML Test Page"));
  }

  @Ignore(value = {ANDROID, SAFARI, MARIONETTE}, issues = {3771})
  @Test
  public void testShouldBeAbleToNavigateForwardsInTheBrowserHistory() {
    driver.get(pages.formPage);

    driver.findElement(By.id("imageButton")).submit();
    wait.until(titleIs("We Arrive Here"));

    driver.navigate().back();
    wait.until(titleIs("We Leave From Here"));

    driver.navigate().forward();
    wait.until(titleIs("We Arrive Here"));
  }

  @Ignore(value = {IE, IPHONE, OPERA, ANDROID, SAFARI, OPERA_MOBILE, PHANTOMJS},
          reason = "Safari: does not support insecure SSL")
  @Test
  public void testShouldBeAbleToAccessPagesWithAnInsecureSslCertificate() {
    // TODO(user): Set the SSL capability to true.
    driver.get(appServer.whereIsSecure("simpleTest.html"));

    assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
  }

  @Ignore({ANDROID, CHROME, HTMLUNIT, IE, IPHONE, OPERA, OPERA_MOBILE, PHANTOMJS, SAFARI, MARIONETTE})
  @Test
  public void shouldBeAbleToDisableAcceptOfInsecureSslCertsWithRequiredCapability() {
    // TODO: Resolve why this test doesn't work on the remote server
    assumeTrue(isLocal());

    DesiredCapabilities requiredCaps = new DesiredCapabilities();
    requiredCaps.setCapability(ACCEPT_SSL_CERTS, false);
    WebDriverBuilder builder = new WebDriverBuilder().setRequiredCapabilities(requiredCaps);
    localDriver = builder.get();

    String url = appServer.whereIsSecure("simpleTest.html");
    localDriver.get(url);

    assertThat(localDriver.getTitle(), not("Hello WebDriver"));
  }

  @Test
  public void testShouldBeAbleToRefreshAPage() {
    driver.get(pages.xhtmlTestPage);

    driver.navigate().refresh();

    assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
  }

  /**
   * @throws Exception If the test fails.
   * @see <a href="http://code.google.com/p/selenium/issues/detail?id=208"> Issue 208</a>
   *
   *      This test often causes the subsequent test to fail, in Firefox, on Linux, so we need a new
   *      driver after it.
   * @see <a href="http://code.google.com/p/selenium/issues/detail?id=2282">Issue 2282</a>
   */
  @Ignore(value = {IE, IPHONE, OPERA, ANDROID, SAFARI, OPERA_MOBILE, MARIONETTE},
          reason = "Safari: issue 4062; Others: Untested user-agents",
          issues = {4062})
  @NoDriverAfterTest
  @JavascriptEnabled
  @Test
  public void testShouldNotHangIfDocumentOpenCallIsNeverFollowedByDocumentCloseCall()
      throws Exception {
    driver.get(pages.documentWrite);

    // If this command succeeds, then all is well.
    WebElement body = driver.findElement(By.tagName("body"));
    wait.until(elementTextToContain(body, "world"));
  }

  @Ignore(value = {ANDROID, IPHONE, OPERA, SAFARI, OPERA_MOBILE, MARIONETTE},
          reason = "Not implemented; Safari: see issue 687, comment 41",
          issues = {687})
  @NeedsLocalEnvironment
  @Test
  public void testShouldTimeoutIfAPageTakesTooLongToLoad() {
    driver.manage().timeouts().pageLoadTimeout(2, SECONDS);

    // Get the sleeping servlet with a pause of 5 seconds
    String slowPage = appServer.whereIs("sleep?time=5");

    long start = System.currentTimeMillis();
    try {
      driver.get(slowPage);
      fail("I should have timed out");
    } catch (RuntimeException e) {
      long end = System.currentTimeMillis();

      assertThat(e, is(instanceOf(TimeoutException.class)));

      int duration = (int) (end - start);
      assertThat(duration, greaterThan(2000));
      assertThat(duration, lessThan(5000));

      // check that after the exception another page can be loaded

      start = System.currentTimeMillis();
      driver.get(pages.xhtmlTestPage);
      assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
      end = System.currentTimeMillis();
      duration = (int) (end - start);
      assertThat(duration, lessThan(2000));

    } finally {
      driver.manage().timeouts().pageLoadTimeout(-1, SECONDS);
    }
  }

  @Ignore(value = {ANDROID, IPHONE, HTMLUNIT, OPERA, SAFARI, OPERA_MOBILE, MARIONETTE},
          reason = "Not implemented; Safari: see issue 687, comment 41",
          issues = {687})
  @NeedsLocalEnvironment
  @Test
  public void testShouldTimeoutIfAPageTakesTooLongToLoadAfterClick() {
    assumeFalse(isFirefox(driver) && isNativeEventsEnabled(driver));

    driver.manage().timeouts().pageLoadTimeout(2, SECONDS);

    driver.get(appServer.whereIs("page_with_link_to_slow_loading_page.html"));
    WebElement link = driver.findElement(By.id("link-to-slow-loading-page"));

    long start = System.currentTimeMillis();
    try {
      link.click();
      fail("I should have timed out");
    } catch (RuntimeException e) {
      long end = System.currentTimeMillis();

      assertThat(e, is(instanceOf(TimeoutException.class)));

      int duration = (int) (end - start);
      assertThat(duration, greaterThan(2000));
      assertThat(duration, lessThan(5000));

      // check that after the exception another page can be loaded

      start = System.currentTimeMillis();
      driver.get(pages.xhtmlTestPage);
      wait.until(titleIs("XHTML Test Page"));
      end = System.currentTimeMillis();
      duration = (int) (end - start);
      assertThat(duration, lessThan(2000));

    } finally {
      driver.manage().timeouts().pageLoadTimeout(-1, SECONDS);
    }
  }

  @Ignore(value = {ANDROID, IPHONE, OPERA, SAFARI, OPERA_MOBILE, MARIONETTE},
          reason = "Not implemented; Safari: see issue 687, comment 41",
          issues = {687})
  @NeedsLocalEnvironment
  @Test
  public void testShouldTimeoutIfAPageTakesTooLongToRefresh() {
    // Get the sleeping servlet with a pause of 5 seconds
    String slowPage = appServer.whereIs("sleep?time=5");

    driver.get(slowPage);

    driver.manage().timeouts().pageLoadTimeout(2, SECONDS);

    long start = System.currentTimeMillis();
    try {
      driver.navigate().refresh();
      fail("I should have timed out");
    } catch (RuntimeException e) {
      long end = System.currentTimeMillis();

      assertThat(e, is(instanceOf(TimeoutException.class)));

      int duration = (int) (end - start);
      assertThat(duration, greaterThan(2000));
      assertThat(duration, lessThan(5000));

      // check that after the exception another page can be loaded

      start = System.currentTimeMillis();
      driver.get(pages.xhtmlTestPage);
      assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
      end = System.currentTimeMillis();
      duration = (int) (end - start);
      assertThat(duration, lessThan(2000));

    } finally {
      driver.manage().timeouts().pageLoadTimeout(-1, SECONDS);
    }
  }

  @Ignore(value = {ANDROID, CHROME, HTMLUNIT, IPHONE, OPERA, SAFARI, OPERA_MOBILE, MARIONETTE},
          reason = "Not implemented; Safari: see issue 687, comment 41",
          issues = {687})
  @NeedsLocalEnvironment
  @Test
  public void testShouldNotStopLoadingPageAfterTimeout() {
    driver.manage().timeouts().pageLoadTimeout(2, SECONDS);

    // Get the sleeping servlet with a pause of 5 seconds
    String slowPage = appServer.whereIs("sleep?time=5");

    long start = System.currentTimeMillis();
    try {
      driver.get(slowPage);
      fail("I should have timed out");
    } catch (RuntimeException e) {
      long end = System.currentTimeMillis();

      assertThat(e, is(instanceOf(TimeoutException.class)));

      int duration = (int) (end - start);
      assertThat(duration, greaterThan(2000));
      assertThat(duration, lessThan(5000));

      new WebDriverWait(driver, 30)
          .ignoring(StaleElementReferenceException.class)
          .until(elementTextToEqual(By.tagName("body"), "Slept for 5s"));
      end = System.currentTimeMillis();
      duration = (int) (end - start);
      assertThat(duration, greaterThan(5000));

    } finally {
      driver.manage().timeouts().pageLoadTimeout(-1, SECONDS);
    }
  }

  @After
  public void quitDriver() {
    if (this.localDriver != null) {
      this.localDriver.quit();
      this.localDriver = null;
    }
  }

}
