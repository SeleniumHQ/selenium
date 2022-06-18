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
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.openqa.selenium.testing.drivers.Browser.ALL;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.environment.DomainHelper;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

import java.net.URI;
import java.util.Date;
import java.util.Random;
import java.util.Set;

public class CookieImplementationTest extends JupiterTestBase {

  private DomainHelper domainHelper;
  private String cookiePage;
  private static final Random random = new Random();

  @BeforeEach
  public void setUp() {
    domainHelper = new DomainHelper(appServer);
    assumeTrue(domainHelper.checkIsOnValidHostname());
    cookiePage = domainHelper.getUrlForFirstValidHostname("/common/cookie");

    deleteAllCookiesOnServerSide();

    // This page is the deepest page we go to in the cookie tests
    // We go to it to ensure that cookies with /common/... paths are deleted
    // Do not write test in this class which use pages other than under /common
    // without ensuring that cookies are deleted on those pages as required
    try {
      driver.get(domainHelper.getUrlForFirstValidHostname("/common/animals"));
    } catch (IllegalArgumentException e) {
      // Ideally we would throw an IgnoredTestError or something here,
      // but our test runner doesn't pay attention to those.
      // Rely on the tests skipping themselves if they need to be on a useful page.
      return;
    }

    driver.manage().deleteAllCookies();
    assertNoCookiesArePresent();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldGetCookieByName() {
    String key = generateUniqueKey();
    String value = "set";
    assertCookieIsNotPresentWithName(key);

    addCookieOnServerSide(new Cookie(key, value));

    Cookie cookie = driver.manage().getCookieNamed(key);
    assertThat(cookie.getValue()).isEqualTo(value);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToAddCookie() {
    String key = generateUniqueKey();
    String value = "foo";
    Cookie cookie = new Cookie.Builder(key, value).domain(domainHelper.getHostName()).build();
    assertCookieIsNotPresentWithName(key);

    driver.manage().addCookie(cookie);

    assertCookieHasValue(key, value);

    openAnotherPage();
    assertCookieHasValue(key, value);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testGetAllCookies() {
    String key1 = generateUniqueKey();
    String key2 = generateUniqueKey();

    assertCookieIsNotPresentWithName(key1);
    assertCookieIsNotPresentWithName(key2);

    Set<Cookie> cookies = driver.manage().getCookies();
    int countBefore = cookies.size();

    Cookie one = new Cookie.Builder(key1, "value").build();
    Cookie two = new Cookie.Builder(key2, "value").build();

    driver.manage().addCookie(one);
    driver.manage().addCookie(two);

    openAnotherPage();
    cookies = driver.manage().getCookies();
    assertThat(cookies.size()).isEqualTo(countBefore + 2);

    assertThat(cookies.contains(one)).isTrue();
    assertThat(cookies.contains(two)).isTrue();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testDeleteAllCookies() {
    addCookieOnServerSide(new Cookie("foo", "set"));
    assertSomeCookiesArePresent();

    driver.manage().deleteAllCookies();

    assertNoCookiesArePresent();

    openAnotherPage();
    assertNoCookiesArePresent();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testDeleteCookieWithName() {
    String key1 = generateUniqueKey();
    String key2 = generateUniqueKey();

    addCookieOnServerSide(new Cookie(key1, "set"));
    addCookieOnServerSide(new Cookie(key2, "set"));

    assertCookieIsPresentWithName(key1);
    assertCookieIsPresentWithName(key2);

    driver.manage().deleteCookieNamed(key1);

    assertCookieIsNotPresentWithName(key1);
    assertCookieIsPresentWithName(key2);

    openAnotherPage();
    assertCookieIsNotPresentWithName(key1);
    assertCookieIsPresentWithName(key2);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldNotDeleteCookiesWithASimilarName() {
    String cookieOneName = "fish";
    Cookie cookie1 = new Cookie.Builder(cookieOneName, "cod").build();
    Cookie cookie2 = new Cookie.Builder(cookieOneName + "x", "earth").build();
    WebDriver.Options options = driver.manage();
    assertCookieIsNotPresentWithName(cookie1.getName());

    options.addCookie(cookie1);
    options.addCookie(cookie2);

    assertCookieIsPresentWithName(cookie1.getName());

    options.deleteCookieNamed(cookieOneName);
    Set<Cookie> cookies = options.getCookies();

    assertThat(cookies).doesNotContain(cookie1);
    assertThat(cookies).contains(cookie2);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testAddCookiesWithDifferentPathsThatAreRelatedToOurs() {
    driver.get(domainHelper.getUrlForFirstValidHostname("/common/animals"));
    Cookie cookie1 = new Cookie.Builder("fish", "cod").path("/common/animals").build();
    Cookie cookie2 = new Cookie.Builder("planet", "earth").path("/common/").build();
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);
    options.addCookie(cookie2);

    driver.get(domainHelper.getUrlForFirstValidHostname("/common/animals"));

    assertCookieIsPresentWithName(cookie1.getName());
    assertCookieIsPresentWithName(cookie2.getName());

    driver.get(domainHelper.getUrlForFirstValidHostname("/common/simpleTest.html"));
    assertCookieIsNotPresentWithName(cookie1.getName());
  }

  @SwitchToTopAfterTest
  @Test
  @NotYetImplemented(value = CHROME, reason = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=3153")
  @NotYetImplemented(value = EDGE, reason = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=3153")
  @Ignore(SAFARI)
  @NotYetImplemented(value = FIREFOX, reason = "https://github.com/mozilla/geckodriver/issues/1104")
  public void testGetCookiesInAFrame() {
    driver.get(domainHelper.getUrlForFirstValidHostname("/common/animals"));
    Cookie cookie1 = new Cookie.Builder("fish", "cod").path("/common/animals").build();
    driver.manage().addCookie(cookie1);

    driver.get(domainHelper.getUrlForFirstValidHostname("frameWithAnimals.html"));
    assertCookieIsNotPresentWithName(cookie1.getName());

    driver.switchTo().frame("iframe1");
    assertCookieIsPresentWithName(cookie1.getName());
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testCannotGetCookiesWithPathDifferingOnlyInCase() {
    String cookieName = "fish";
    Cookie cookie = new Cookie.Builder(cookieName, "cod").path("/Common/animals").build();
    driver.manage().addCookie(cookie);

    driver.get(domainHelper.getUrlForFirstValidHostname("/common/animals"));
    assertThat(driver.manage().getCookieNamed(cookieName)).isNull();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldNotGetCookieOnDifferentDomain() {
    assumeTrue(domainHelper.checkHasValidAlternateHostname());

    String cookieName = "fish";
    driver.manage().addCookie(new Cookie.Builder(cookieName, "cod").build());
    assertCookieIsPresentWithName(cookieName);

    driver.get(domainHelper.getUrlForSecondValidHostname("simpleTest.html"));

    assertCookieIsNotPresentWithName(cookieName);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToAddToADomainWhichIsRelatedToTheCurrentDomain() {
    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    String shorter = domainHelper.getHostName().replaceFirst(".*?\\.", ".");
    Cookie cookie = new Cookie.Builder(cookieName, "value").domain(shorter).build();
    driver.manage().addCookie(cookie);

    assertCookieIsPresentWithName(cookieName);
  }

  @Test
  @Ignore(ALL)
  public void testsShouldNotGetCookiesRelatedToCurrentDomainWithoutLeadingPeriod() {
    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    String shorter = domainHelper.getHostName().replaceFirst(".*?\\.", "");
    Cookie cookie = new Cookie.Builder(cookieName, "value").domain(shorter).build();
    driver.manage().addCookie(cookie);
    assertCookieIsNotPresentWithName(cookieName);
  }

  @Test
  public void testShouldBeAbleToIncludeLeadingPeriodInDomainName() {
    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    String shorter = domainHelper.getHostName().replaceFirst(".*?\\.", ".");
    Cookie cookie = new Cookie.Builder("name", "value").domain(shorter).build();

    driver.manage().addCookie(cookie);

    assertCookieIsPresentWithName(cookieName);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldBeAbleToSetDomainToTheCurrentDomain() throws Exception {
    URI url = new URI(driver.getCurrentUrl());
    String host = url.getHost() + ":" + url.getPort();

    Cookie cookie = new Cookie.Builder("fish", "cod").domain(host).build();
    driver.manage().addCookie(cookie);

    driver.get(domainHelper.getUrlForFirstValidHostname("javascriptPage.html"));
    Set<Cookie> cookies = driver.manage().getCookies();
    assertThat(cookies).contains(cookie);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldWalkThePathToDeleteACookie() {
    Cookie cookie1 = new Cookie.Builder("fish", "cod").build();
    driver.manage().addCookie(cookie1);

    driver.get(domainHelper.getUrlForFirstValidHostname("child/childPage.html"));
    Cookie cookie2 = new Cookie("rodent", "hamster", "/common/child");
    driver.manage().addCookie(cookie2);

    driver.get(domainHelper.getUrlForFirstValidHostname("child/grandchild/grandchildPage.html"));
    Cookie cookie3 = new Cookie("dog", "dalmatian", "/common/child/grandchild/");
    driver.manage().addCookie(cookie3);

    driver.get(domainHelper.getUrlForFirstValidHostname("child/grandchild/grandchildPage.html"));
    driver.manage().deleteCookieNamed("rodent");

    assertThat(driver.manage().getCookieNamed("rodent")).isNull();

    Set<Cookie> cookies = driver.manage().getCookies();
    assertThat(cookies).hasSize(2);
    assertThat(cookies).contains(cookie1);
    assertThat(cookies).contains(cookie3);

    driver.manage().deleteAllCookies();
    driver.get(domainHelper.getUrlForFirstValidHostname("child/grandchild/grandchildPage.html"));
    assertNoCookiesArePresent();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldIgnoreThePortNumberOfTheHostWhenSettingTheCookie() throws Exception {
    URI uri = new URI(driver.getCurrentUrl());
    String host = String.format("%s:%d", uri.getHost(), uri.getPort());

    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    Cookie cookie = new Cookie.Builder(cookieName, "value").domain(host).build();
    driver.manage().addCookie(cookie);

    assertCookieIsPresentWithName(cookieName);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testCookieEqualityAfterSetAndGet() {
    driver.get(domainHelper.getUrlForFirstValidHostname("animals"));

    driver.manage().deleteAllCookies();

    Cookie addedCookie =
        new Cookie.Builder("fish", "cod")
            .path("/common/animals")
            .expiresOn(someTimeInTheFuture())
            .build();
    driver.manage().addCookie(addedCookie);

    Set<Cookie> cookies = driver.manage().getCookies();
    Cookie retrievedCookie = null;
    for (Cookie temp : cookies) {
      if (addedCookie.equals(temp)) {
        retrievedCookie = temp;
        break;
      }
    }

    assertThat(retrievedCookie).isNotNull();
    // Cookie.equals only compares name, domain and path
    assertThat(retrievedCookie).isEqualTo(addedCookie);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testRetainsCookieExpiry() {
    Cookie addedCookie =
        new Cookie.Builder("fish", "cod")
            .path("/common/animals")
            .expiresOn(someTimeInTheFuture())
            .build();
    driver.manage().addCookie(addedCookie);

    Cookie retrieved = driver.manage().getCookieNamed("fish");
    assertThat(retrieved).isNotNull();
    assertThat(retrieved.getExpiry()).isEqualTo(addedCookie.getExpiry());
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  public void canHandleSecureCookie() {
    driver.get(domainHelper.getSecureUrlForFirstValidHostname("animals"));

    Cookie addedCookie =
      new Cookie.Builder("fish", "cod")
        .path("/common/animals")
        .isSecure(true)
        .build();
    driver.manage().addCookie(addedCookie);

    driver.navigate().refresh();

    Cookie retrieved = driver.manage().getCookieNamed("fish");
    assertThat(retrieved).isNotNull();
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  public void testRetainsCookieSecure() {
    driver.get(domainHelper.getSecureUrlForFirstValidHostname("animals"));

    Cookie addedCookie =
        new Cookie.Builder("fish", "cod")
            .path("/common/animals")
            .isSecure(true)
            .build();
    driver.manage().addCookie(addedCookie);

    driver.navigate().refresh();

    Cookie retrieved = driver.manage().getCookieNamed("fish");
    assertThat(retrieved).isNotNull();
    assertThat(retrieved.isSecure()).isTrue();
  }

  @Test
  @Ignore(SAFARI)
  @NotYetImplemented(CHROME)
  public void canHandleHttpOnlyCookie() {
    Cookie addedCookie =
      new Cookie.Builder("fish", "cod")
        .path("/common/animals")
        .isHttpOnly(true)
        .build();

    addCookieOnServerSide(addedCookie);

    driver.get(domainHelper.getUrlForFirstValidHostname("animals"));
    Cookie retrieved = driver.manage().getCookieNamed("fish");
    assertThat(retrieved).isNotNull();
  }

  @Test
  @Ignore(SAFARI)
  public void testRetainsHttpOnlyFlag() {
    Cookie addedCookie =
        new Cookie.Builder("fish", "cod")
            .path("/common/animals")
            .isHttpOnly(true)
            .build();

    addCookieOnServerSide(addedCookie);

    driver.get(domainHelper.getUrlForFirstValidHostname("animals"));
    Cookie retrieved = driver.manage().getCookieNamed("fish");
    assertThat(retrieved).isNotNull();
    assertThat(retrieved.isHttpOnly()).isTrue();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testSettingACookieThatExpiredInThePast() {
    long expires = System.currentTimeMillis() - 1000;
    Cookie cookie = new Cookie.Builder("expired", "yes").expiresOn(new Date(expires)).build();
    driver.manage().addCookie(cookie);

    cookie = driver.manage().getCookieNamed("fish");
    assertThat(cookie).as("Cookie expired before it was set, so nothing should be returned").isNull();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testCanSetCookieWithoutOptionalFieldsSet() {
    String key = generateUniqueKey();
    String value = "foo";
    Cookie cookie = new Cookie(key, value);
    assertCookieIsNotPresentWithName(key);

    driver.manage().addCookie(cookie);

    assertCookieHasValue(key, value);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testDeleteNotExistedCookie() {
    String key = generateUniqueKey();
    assertCookieIsNotPresentWithName(key);

    driver.manage().deleteCookieNamed(key);
  }

  @Test
  @Ignore(value = ALL, reason = "Non W3C conformant")
  public void testShouldDeleteOneOfTheCookiesWithTheSameName() {
    driver.get(domainHelper.getUrlForFirstValidHostname("/common/animals"));
    Cookie cookie1 = new Cookie.Builder("fish", "cod")
        .domain(domainHelper.getHostName()).path("/common/animals").build();
    Cookie cookie2 = new Cookie.Builder("fish", "tune")
        .domain(domainHelper.getHostName()).path("/common/").build();
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);
    options.addCookie(cookie2);
    assertThat(driver.manage().getCookies()).hasSize(2);

    driver.manage().deleteCookie(cookie1);

    assertThat(driver.manage().getCookies()).hasSize(1);
    Cookie retrieved = driver.manage().getCookieNamed("fish");
    assertThat(retrieved).isEqualTo(cookie2);
  }

  private String generateUniqueKey() {
    return String.format("key_%d", random.nextInt());
  }

  private void assertNoCookiesArePresent() {
    assertThat(driver.manage().getCookies()).isEmpty();
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat(documentCookie).isEqualTo("");
    }
  }

  private void assertSomeCookiesArePresent() {
    assertThat(driver.manage().getCookies()).isNotEmpty();
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat(documentCookie).as("Cookies were empty").isNotEqualTo("");
    }
  }

  private void assertCookieIsNotPresentWithName(final String key) {
    assertThat(driver.manage().getCookieNamed(key)).as("Cookie with name " + key).isNull();
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat(documentCookie).as("Cookie with name " + key).doesNotContain((key + "="));
    }
  }

  private void assertCookieIsPresentWithName(final String key) {
    assertThat(driver.manage().getCookieNamed(key)).as("Cookie with name " + key).isNotNull();
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat(documentCookie)
          .as("Cookie was not present with name " + key + ", got: " + documentCookie)
          .contains(key + "=");
    }
  }

  private void assertCookieHasValue(final String key, final String value) {
    assertThat(driver.manage().getCookieNamed(key).getValue()).isEqualTo(value);
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat(documentCookie)
          .as("Cookie was present with name " + key)
          .contains(key + "=" + value);
    }
  }

  private String getDocumentCookieOrNull() {
    if (!(driver instanceof JavascriptExecutor)) {
      return null;
    }
    try {
      return (String) ((JavascriptExecutor) driver).executeScript("return document.cookie");
    } catch (UnsupportedOperationException e) {
      return null;
    }
  }

  private Date someTimeInTheFuture() {
    return new Date(System.currentTimeMillis() + 100000);
  }

  private void openAnotherPage() {
    driver.get(domainHelper.getUrlForFirstValidHostname("simpleTest.html"));
  }

  private void deleteAllCookiesOnServerSide() {
    driver.get(cookiePage + "?action=deleteAll");
  }

  private void addCookieOnServerSide(Cookie cookie) {
    StringBuilder url = new StringBuilder(cookiePage);
    url.append("?action=add");
    url.append("&name=").append(cookie.getName());
    url.append("&value=").append(cookie.getValue());
    if (cookie.getDomain() != null) {
      url.append("&domain=").append(cookie.getDomain());
    }
    if (cookie.getPath() != null) {
      url.append("&path=").append(cookie.getPath());
    }
    if (cookie.getExpiry() != null) {
      url.append("&expiry=").append(cookie.getExpiry().getTime());
    }
    if (cookie.isSecure()) {
      url.append("&secure=").append(cookie.isSecure());
    }
    if (cookie.isHttpOnly()) {
      url.append("&httpOnly=").append(cookie.isHttpOnly());
    }
    driver.get(url.toString());
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void deleteAllCookies() {
    assumeTrue(domainHelper.checkHasValidAlternateHostname());

    Cookie cookie1 = new Cookie.Builder("fish1", "cod")
        .domain(appServer.getHostName()).build();
    Cookie cookie2 = new Cookie.Builder("fish2", "tune")
        .domain(appServer.getAlternateHostName()).build();

    String url1 = domainHelper.getUrlForFirstValidHostname("/common");
    String url2 = domainHelper.getUrlForSecondValidHostname("/common");

    WebDriver.Options options = driver.manage();

    options.addCookie(cookie1);
    assertCookieIsPresentWithName(cookie1.getName());

    driver.get(url2);
    options.addCookie(cookie2);
    assertCookieIsNotPresentWithName(cookie1.getName());
    assertCookieIsPresentWithName(cookie2.getName());

    driver.get(url1);
    assertCookieIsPresentWithName(cookie1.getName());
    assertCookieIsNotPresentWithName(cookie2.getName());

    options.deleteAllCookies();
    assertCookieIsNotPresentWithName(cookie1.getName());

    driver.get(url2);
    assertCookieIsPresentWithName(cookie2.getName());
  }
}
