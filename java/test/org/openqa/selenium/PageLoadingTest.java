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
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.WaitingConditions.elementTextToContain;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

class PageLoadingTest extends JupiterTestBase {

  @Test
  @NeedsFreshDriver
  public void shouldSetAndGetPageLoadTimeout() {
    Duration timeout = driver.manage().timeouts().getPageLoadTimeout();
    assertThat(timeout).hasMillis(300000);
    driver.manage().timeouts().pageLoadTimeout(Duration.ofMillis(3000));
    Duration timeout2 = driver.manage().timeouts().getPageLoadTimeout();
    assertThat(timeout2).hasMillis(3000);
  }

  @Test
  void testShouldFollowRedirectsSentInTheHttpResponseHeaders() {
    driver.get(pages.redirectPage);
    assertThat(driver.getTitle()).isEqualTo("We Arrive Here");
  }

  @Test
  void testShouldFollowMetaRedirects() {
    driver.get(pages.metaRedirectPage);
    wait.until(titleIs("We Arrive Here"));
  }

  @Test
  void testShouldBeAbleToGetAFragmentOnTheCurrentPage() {
    driver.get(pages.xhtmlTestPage);
    driver.get(pages.xhtmlTestPage + "#text");
    wait.until(presenceOfElementLocated(By.id("id1")));
  }

  @Test
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(FIREFOX)
  public void testShouldReturnWhenGettingAUrlThatDoesNotResolve() {
    assertThatCode(() -> driver.get("http://www.thisurldoesnotexist.comx/"))
        .doesNotThrowAnyException();
  }

  @Test
  void testShouldThrowIfUrlIsMalformed() {
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> driver.get("www.test.com"));
  }

  @Test
  @NotYetImplemented(value = SAFARI)
  public void testShouldThrowIfUrlIsMalformedInPortPart() {
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> driver.get("http://localhost:3001bla"));
  }

  @Test
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  @NotYetImplemented(FIREFOX)
  public void testShouldReturnWhenGettingAUrlThatDoesNotConnect() {
    // Here's hoping that there's nothing here. There shouldn't be
    driver.get("http://localhost:3001");
  }

  @Test
  void testShouldReturnURLOnNotExistedPage() {
    String url = appServer.whereIs("not_existed_page.html");
    driver.get(url);
    assertThat(driver.getCurrentUrl()).isEqualTo(url);
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded() {
    driver.get(pages.framesetPage);

    driver.switchTo().frame(0);
    WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
    assertThat(pageNumber.getText().trim()).isEqualTo("1");

    driver.switchTo().defaultContent().switchTo().frame(1);
    pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
    assertThat(pageNumber.getText().trim()).isEqualTo("2");
  }

  @Test
  @Ignore(IE)
  @NotYetImplemented(value = SAFARI, reason = "does not support insecure SSL")
  public void testShouldBeAbleToAccessPagesWithAnInsecureSslCertificate() {
    createNewDriver(new ImmutableCapabilities(CapabilityType.ACCEPT_INSECURE_CERTS, Boolean.TRUE));
    driver.get(appServer.whereIsSecure("simpleTest.html"));

    shortWait.until(titleIs("Hello WebDriver"));
  }

  @Test
  void testShouldBeAbleToRefreshAPage() {
    driver.get(pages.xhtmlTestPage);

    driver.navigate().refresh();

    assertThat(driver.getTitle()).isEqualTo("XHTML Test Page");
  }

  /**
   * See https://github.com/SeleniumHQ/selenium-google-code-issue-archive/issues/208
   *
   * <p>This test often causes the subsequent test to fail, in Firefox, on Linux, so we need a new
   * driver after it. See
   * https://github.com/SeleniumHQ/selenium-google-code-issue-archive/issues/2282
   */
  @NoDriverAfterTest
  @Test
  @Ignore(IE)
  @Ignore(FIREFOX)
  public void testShouldNotHangIfDocumentOpenCallIsNeverFollowedByDocumentCloseCall() {
    driver.get(pages.documentWrite);

    // If this command succeeds, then all is well.
    WebElement body = wait.until(visibilityOfElementLocated(By.tagName("body")));
    wait.until(elementTextToContain(body, "world"));
  }
}
