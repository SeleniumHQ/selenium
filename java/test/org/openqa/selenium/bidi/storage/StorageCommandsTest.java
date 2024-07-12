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

package org.openqa.selenium.bidi.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.time.Instant;
import java.util.Date;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.module.Storage;
import org.openqa.selenium.bidi.network.BytesValue;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

class StorageCommandsTest extends JupiterTestBase {
  private String cookiePage;
  private static final Random random = ThreadLocalRandom.current();

  private Storage storage;

  @BeforeEach
  public void setUp() {
    cookiePage = appServer.whereIs("/common/cookie");

    deleteAllCookiesOnServerSide();

    try {
      driver.get(appServer.whereIs("/common/animals"));
    } catch (IllegalArgumentException e) {
      return;
    }

    driver.manage().deleteAllCookies();
    assertNoCookiesArePresent();

    storage = new Storage(driver);
  }

  @Test
  @NotYetImplemented(EDGE)
  public void canGetCookieByName() {
    String key = generateUniqueKey();
    String value = "set";
    assertCookieIsNotPresentWithName(key);

    addCookieOnServerSide(new Cookie(key, value));

    CookieFilter cookieFilter = new CookieFilter();
    cookieFilter.name(key);
    cookieFilter.value(new BytesValue(BytesValue.Type.STRING, "set"));

    GetCookiesParameters params = new GetCookiesParameters(cookieFilter);
    GetCookiesResult result = storage.getCookies(params);

    assertThat(result.getCookies().get(0).getValue().getValue()).isEqualTo(value);
  }

  @Test
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  public void canGetCookieInDefaultUserContext() {
    String windowHandle = driver.getWindowHandle();
    String key = generateUniqueKey();
    String value = "set";
    assertCookieIsNotPresentWithName(key);

    addCookieOnServerSide(new Cookie(key, value));

    CookieFilter cookieFilter = new CookieFilter();
    cookieFilter.name(key);
    cookieFilter.value(new BytesValue(BytesValue.Type.STRING, "set"));

    driver.switchTo().newWindow(WindowType.WINDOW);

    PartitionDescriptor descriptor =
        new BrowsingContextPartitionDescriptor(driver.getWindowHandle());

    GetCookiesParameters params = new GetCookiesParameters(cookieFilter, descriptor);
    GetCookiesResult resultAfterSwitchingContext = storage.getCookies(params);

    assertThat(resultAfterSwitchingContext.getCookies().get(0).getValue().getValue())
        .isEqualTo(value);

    driver.switchTo().window(windowHandle);

    descriptor = new BrowsingContextPartitionDescriptor(driver.getWindowHandle());

    GetCookiesParameters params1 = new GetCookiesParameters(cookieFilter, descriptor);

    GetCookiesResult result = storage.getCookies(params1);

    assertThat(result.getCookies().get(0).getValue().getValue()).isEqualTo(value);
    PartitionKey partitionKey = result.getPartitionKey();

    assertThat(partitionKey.getSourceOrigin()).isNotNull();
    assertThat(partitionKey.getUserContext()).isNotNull();
    assertThat(partitionKey.getUserContext()).isEqualTo("default");
  }

  @Test
  // TODO: Once Browser module is added this test needs to be added
  public void canGetCookieInAUserContext() {}

  @Test
  @NotYetImplemented(EDGE)
  public void canAddCookie() {
    String key = generateUniqueKey();
    String value = "foo";

    SetCookieParameters parameters =
        new SetCookieParameters(
            new PartialCookie(
                key, new BytesValue(BytesValue.Type.STRING, value), appServer.getHostName()));
    assertCookieIsNotPresentWithName(key);

    storage.setCookie(parameters);

    assertCookieHasValue(key, value);
    openAnotherPage();
    assertCookieHasValue(key, value);
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  public void canAddAndGetCookie() {
    driver.get(appServer.whereIs("/common/animals"));

    BytesValue value = new BytesValue(BytesValue.Type.STRING, "cod");
    String domain = appServer.getHostName();

    long expiry = Instant.now().toEpochMilli() + 3600 * 1000;

    String path = "/common/animals";

    PartialCookie cookie =
        new PartialCookie("fish", value, appServer.getHostName())
            .path("/common/animals")
            .size(7L)
            .httpOnly(true)
            .secure(false)
            .sameSite(org.openqa.selenium.bidi.network.Cookie.SameSite.LAX)
            .expiry(expiry);

    SetCookieParameters cookieParameters = new SetCookieParameters(cookie);

    storage.setCookie(cookieParameters);

    driver.get(appServer.whereIs(path));

    CookieFilter cookieFilter =
        new CookieFilter()
            .name("fish")
            .value(value)
            .domain(domain)
            .path(path)
            .size(7L)
            .httpOnly(true)
            .secure(false)
            .sameSite(org.openqa.selenium.bidi.network.Cookie.SameSite.LAX)
            .expiry(expiry);

    PartitionDescriptor descriptor =
        new BrowsingContextPartitionDescriptor(driver.getWindowHandle());

    GetCookiesParameters getCookiesParameters = new GetCookiesParameters(cookieFilter, descriptor);

    GetCookiesResult result = storage.getCookies(getCookiesParameters);
    PartitionKey key = result.getPartitionKey();

    org.openqa.selenium.bidi.network.Cookie resultCookie = result.getCookies().get(0);

    assertThat(resultCookie.getName()).isEqualTo("fish");
    assertThat(resultCookie.getValue().getValue()).isEqualTo(value.getValue());
    assertThat(resultCookie.getDomain()).isEqualTo(domain);
    assertThat(resultCookie.getPath()).isEqualTo(path);
    assertThat(resultCookie.getSize()).isEqualTo(7L);
    assertThat(resultCookie.isHttpOnly()).isEqualTo(true);
    assertThat(resultCookie.isSecure()).isEqualTo(false);
    assertThat(resultCookie.getSameSite())
        .isEqualTo(org.openqa.selenium.bidi.network.Cookie.SameSite.LAX);
    assertThat(resultCookie.getExpiry().get()).isEqualTo(expiry);
    assertThat(key.getSourceOrigin()).isNotNull();
    assertThat(key.getUserContext()).isNotNull();
    assertThat(key.getUserContext()).isEqualTo("default");
  }

  @Test
  @NotYetImplemented(EDGE)
  public void canGetAllCookies() {
    String key1 = generateUniqueKey();
    String key2 = generateUniqueKey();

    assertCookieIsNotPresentWithName(key1);
    assertCookieIsNotPresentWithName(key2);

    GetCookiesParameters params = new GetCookiesParameters(new CookieFilter());
    GetCookiesResult result = storage.getCookies(params);

    int countBefore = result.getCookies().size();

    Cookie one = new Cookie.Builder(key1, "value").build();
    Cookie two = new Cookie.Builder(key2, "value").build();

    driver.manage().addCookie(one);
    driver.manage().addCookie(two);

    openAnotherPage();
    result = storage.getCookies(params);
    assertThat(result.getCookies().size()).isEqualTo(countBefore + 2);

    assertThat(result.getCookies().get(0).getName().contains(key1)).isTrue();
    assertThat(result.getCookies().get(1).getName().contains(key2)).isTrue();
  }

  @Test
  @NotYetImplemented(EDGE)
  public void canDeleteAllCookies() {
    addCookieOnServerSide(new Cookie("foo", "set"));
    assertSomeCookiesArePresent();

    storage.deleteCookies(new DeleteCookiesParameters(new CookieFilter()));

    assertNoCookiesArePresent();

    openAnotherPage();
    assertNoCookiesArePresent();
  }

  @Test
  @NotYetImplemented(EDGE)
  public void canDeleteCookieWithName() {
    String key1 = generateUniqueKey();
    String key2 = generateUniqueKey();

    addCookieOnServerSide(new Cookie(key1, "set"));
    addCookieOnServerSide(new Cookie(key2, "set"));

    assertCookieIsPresentWithName(key1);
    assertCookieIsPresentWithName(key2);

    storage.deleteCookies(new DeleteCookiesParameters(new CookieFilter().name(key1)));

    assertCookieIsNotPresentWithName(key1);
    assertCookieIsPresentWithName(key2);

    openAnotherPage();
    assertCookieIsNotPresentWithName(key1);
    assertCookieIsPresentWithName(key2);
  }

  @Test
  @NotYetImplemented(EDGE)
  public void testAddCookiesWithDifferentPathsThatAreRelatedToOurs() {
    driver.get(appServer.whereIs("/common/animals"));

    PartialCookie cookie1 =
        new PartialCookie(
                "fish", new BytesValue(BytesValue.Type.STRING, "cod"), appServer.getHostName())
            .path("/common/animals");

    PartialCookie cookie2 =
        new PartialCookie(
                "planet", new BytesValue(BytesValue.Type.STRING, "earth"), appServer.getHostName())
            .path("/common/");

    SetCookieParameters cookie1Parameters = new SetCookieParameters(cookie1);
    SetCookieParameters cookie2Parameters = new SetCookieParameters(cookie2);

    storage.setCookie(cookie1Parameters);
    storage.setCookie(cookie2Parameters);

    driver.get(appServer.whereIs("/common/animals"));

    assertCookieIsPresentWithName("fish");
    assertCookieIsPresentWithName("planet");

    driver.get(appServer.whereIs("/common/simpleTest.html"));
    assertCookieIsNotPresentWithName("fish");
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
  }

  private String generateUniqueKey() {
    return String.format("key_%d", random.nextInt());
  }

  private void assertNoCookiesArePresent() {
    assertThat(driver.manage().getCookies()).isEmpty();
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat(documentCookie).isEmpty();
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
    driver.get(appServer.whereIs("simpleTest.html"));
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
}
