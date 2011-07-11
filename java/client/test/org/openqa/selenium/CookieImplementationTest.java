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

import java.net.URI;
import java.util.Date;
import java.util.Iterator;
import java.util.Random;
import java.util.Set;

import org.junit.internal.AssumptionViolatedException;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertThat;
import static org.junit.Assume.assumeNotNull;
import static org.junit.Assume.assumeTrue;

import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

@Ignore(value = {SELENESE, CHROME, IE}, reason = "Chrome: bug in implemenation; IE: Nukes the JVM")
public class CookieImplementationTest extends AbstractDriverTestCase {

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    //This page is the deepest page we go to in the cookie tests
    //We go to it to ensure that cookies with /common/... paths are deleted
    //Do not write test in this class which use pages other than under /common
    //without ensuring that cookies are deleted on those pages as required
    driver.get(appServer.whereIs("/common/animals"));
    driver.manage().deleteAllCookies();
    assertNoCookiesArePresent();
  }

  @JavascriptEnabled
  public void testShouldGetCookieByName() {
    String key = generateUniqueKey();
    String value = "set";
    assertCookieIsNotPresentWithName(key);
    
    ((JavascriptExecutor) driver).executeScript("document.cookie = arguments[0] + '=' + arguments[1];", key, value);
    
    Cookie cookie = driver.manage().getCookieNamed(key);
    assertEquals(value, cookie.getValue());
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldBeAbleToAddCookie() {
    String key = generateUniqueKey();
    String value = "foo";
    Cookie cookie = new Cookie(key, value);
    assertCookieIsNotPresentWithName(key);

    driver.manage().addCookie(cookie);

    assertCookieHasValue(key, value);
  }

  public void testGetAllCookies() {
    String key1 = generateUniqueKey();
    String key2 = generateUniqueKey();

    assertCookieIsNotPresentWithName(key1);
    assertCookieIsNotPresentWithName(key2);
    
    Set<Cookie> cookies = driver.manage().getCookies();
    int countBefore = cookies.size();

    Cookie one = new Cookie(key1, "value");
    Cookie two = new Cookie(key2, "value");

    driver.manage().addCookie(one);
    driver.manage().addCookie(two);

    driver.get(pages.simpleTestPage);
    cookies = driver.manage().getCookies();
    assertEquals(countBefore + 2, cookies.size());

    assertTrue(cookies.contains(one));
    assertTrue(cookies.contains(two));
  }

  @JavascriptEnabled
  public void testDeleteAllCookies() {
    ((JavascriptExecutor) driver).executeScript("document.cookie = 'foo=set';");
    assertSomeCookiesArePresent();

    driver.manage().deleteAllCookies();

    assertNoCookiesArePresent();
  }

  @JavascriptEnabled
  public void testDeleteCookieWithName() {
    String key1 = generateUniqueKey();
    String key2 = generateUniqueKey();
    
    ((JavascriptExecutor) driver).executeScript("document.cookie = arguments[0] + '=set';", key1);
    ((JavascriptExecutor) driver).executeScript("document.cookie = arguments[0] + '=set';", key2);
    
    assertCookieIsPresentWithName(key1);
    assertCookieIsPresentWithName(key2);
    
    driver.manage().deleteCookieNamed(key1);
    
    Set<Cookie> cookies = driver.manage().getCookies();
    
    assertCookieIsNotPresentWithName(key1);
    assertCookieIsPresentWithName(key2);
  }

  public void testShouldNotDeleteCookiesWithASimilarName() {
    String cookieOneName = "fish";
    Cookie cookie1 = new Cookie(cookieOneName, "cod");
    Cookie cookie2 = new Cookie(cookieOneName + "x", "earth");
    WebDriver.Options options = driver.manage();
    assertCookieIsNotPresentWithName(cookie1.getName());
    
    options.addCookie(cookie1);
    options.addCookie(cookie2);
    
    assertCookieIsPresentWithName(cookie1.getName());

    options.deleteCookieNamed(cookieOneName);
    Set<Cookie> cookies = options.getCookies();

    assertFalse(cookies.toString(), cookies.contains(cookie1));
    assertTrue(cookies.toString(), cookies.contains(cookie2));
  }

  @Ignore(OPERA)
  public void testAddCookiesWithDifferentPathsThatAreRelatedToOurs() {
    Cookie cookie1 = new Cookie("fish", "cod", "/common/animals");
    Cookie cookie2 = new Cookie("planet", "earth", "/common/");
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);
    options.addCookie(cookie2);

    driver.get(appServer.whereIs("/common/animals"));

    Set<Cookie> cookies = options.getCookies();
    assertCookieIsPresentWithName(cookie1.getName());
    assertCookieIsPresentWithName(cookie2.getName());

    driver.get(appServer.whereIs(""));
    assertCookieIsNotPresentWithName(cookie1.getName());
  }

  @Ignore(OPERA)
  public void testCannotGetCookiesWithPathDifferingOnlyInCase() {
    String cookieName = "fish";
    driver.manage().addCookie(new Cookie(cookieName, "cod", "/Common/animals"));
    
    driver.get(appServer.whereIs("animals"));
    assertNull(driver.manage().getCookieNamed(cookieName));
  }

  public void testShouldNotGetCookieOnDifferentDomain() {
    String cookieName = "fish";
    driver.manage().addCookie(new Cookie(cookieName, "cod"));
    assertCookieIsPresentWithName(cookieName);

    driver.get(appServer.whereElseIs("simpleTest.html"));

    assertCookieIsNotPresentWithName(cookieName);
  }

  @Ignore(IE)
  public void testShouldBeAbleToAddToADomainWhichIsRelatedToTheCurrentDomain() {
    String domain;
    try {
      domain = gotoValidDomainAndClearCookies();
    } catch (AssumptionViolatedException e) {
      System.out.println("Skipping test: unable to find domain name to use");
      return;
    }

    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    String shorter = domain.replaceFirst(".*?\\.", "");
    Cookie cookie =
        new Cookie("name", "value", shorter, "/", someTimeInTheFuture());

    driver.manage().addCookie(cookie);

    assertCookieIsPresentWithName(cookieName);
  }

  @Ignore({REMOTE, IE})
  public void testShouldBeAbleToIncludeLeadingPeriodInDomainName() throws Exception {
    String domain;
    try {
      domain = gotoValidDomainAndClearCookies();
    } catch (AssumptionViolatedException e) {
      System.out.println("Skipping test: unable to find domain name to use");
      return;
    }

    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    String shorter = domain.replaceFirst(".*?\\.", ".");
    Cookie cookie =
        new Cookie("name", "value", shorter, "/", someTimeInTheFuture());

    driver.manage().addCookie(cookie);

    assertCookieIsPresentWithName(cookieName);
  }

  @Ignore(IE)
  public void testShouldBeAbleToSetDomainToTheCurrentDomain() throws Exception {
    URI url = new URI(driver.getCurrentUrl());
    String host = url.getHost() + ":" + url.getPort();

    Cookie cookie = new Cookie.Builder("fish", "cod").domain(host).build();
    driver.manage().addCookie(cookie);

    driver.get(pages.javascriptPage);
    Set<Cookie> cookies = driver.manage().getCookies();
    assertTrue(cookies.contains(cookie));
  }

  public void testShouldWalkThePathToDeleteACookie() {
    Cookie cookie1 = new Cookie("fish", "cod");
    driver.manage().addCookie(cookie1);

    driver.get(pages.childPage);
    Cookie cookie2 = new Cookie("rodent", "hamster", "/common/child");
    driver.manage().addCookie(cookie2);

    driver.get(pages.grandchildPage);
    Cookie cookie3 = new Cookie("dog", "dalmation", "/common/child/grandchild/");
    driver.manage().addCookie(cookie3);

    driver.get(appServer.whereIs("child/grandchild"));
    driver.manage().deleteCookieNamed("rodent");

    assertNull(driver.manage().getCookies().toString(), driver.manage().getCookieNamed("rodent"));

    Set<Cookie> cookies = driver.manage().getCookies();
    assertEquals(2, cookies.size());
    assertTrue(cookies.contains(cookie1));
    assertTrue(cookies.contains(cookie3));

    driver.manage().deleteAllCookies();
    driver.get(pages.grandchildPage);
    assertNoCookiesArePresent();
  }

  @Ignore(IE)
  public void testShouldIgnoreThePortNumberOfTheHostWhenSettingTheCookie() throws Exception {
    URI uri = new URI(driver.getCurrentUrl());
    String host = String.format("%s:%d", uri.getHost(), uri.getPort());
    
    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);
    
    Cookie cookie = new Cookie.Builder(cookieName, "value").domain(host).build();
    driver.manage().addCookie(cookie);

    assertCookieIsPresentWithName(cookieName);
  }

  @Ignore({IE, OPERA})
  public void testCookieEqualityAfterSetAndGet() {
    driver.get(appServer.whereElseIs("animals"));
    driver.manage().deleteAllCookies();

    Cookie addedCookie = new Cookie("fish", "cod", "/common/animals", someTimeInTheFuture());
    driver.manage().addCookie(addedCookie);

    Set<Cookie> cookies = driver.manage().getCookies();
    Iterator<Cookie> iter = cookies.iterator();
    Cookie retrievedCookie = null;
    while (iter.hasNext()) {
      Cookie temp = iter.next();

      if (addedCookie.equals(temp)) {
        retrievedCookie = temp;
        break;
      }
    }

    assertNotNull(retrievedCookie);
    //Cookie.equals only compares name, domain and path
    assertEquals(addedCookie, retrievedCookie);
  }

  @Ignore(value = {ANDROID, IE, OPERA}, reason =
      "Chrome and Selenium, which use JavaScript to retrieve cookies, cannot return expiry info; " +
      "Other suppressed browsers have not been tested.")
  public void testRetainsCookieExpiry() {
    driver.get(appServer.whereElseIs("animals"));
    driver.manage().deleteAllCookies();

    Cookie addedCookie = new Cookie("fish", "cod", "/common/animals", someTimeInTheFuture());
    driver.manage().addCookie(addedCookie);

    Cookie retrieved = driver.manage().getCookieNamed("fish");
    assertNotNull(retrieved);
    assertEquals(addedCookie.getExpiry(), retrieved.getExpiry());
  }

  @Ignore(value = {ANDROID, IE}, reason = "Untested")
  public void testSettingACookieThatExpiredInThePast() {
    driver.get(appServer.whereElseIs("animals"));
    driver.manage().deleteAllCookies();

    long expires = System.currentTimeMillis() - 1000;
    Cookie cookie = new Cookie.Builder("expired", "yes").expiresOn(new Date(expires)).build();
    driver.manage().addCookie(cookie);

    cookie = driver.manage().getCookieNamed("fish");
    assertNull(
        "Cookie expired before it was set, so nothing should be returned: " + cookie, cookie);
  }

  private String gotoValidDomainAndClearCookies() {
    String name = null;
    String hostname = appServer.getHostName();
    if (hostname.matches("\\w+\\.\\w+.*")) {
      name = hostname;
      driver.get(appServer.whereIs("simpleTest.html"));
    }
    hostname = appServer.getAlternateHostName();
    if (name == null && hostname.matches("\\w+\\.\\w+.*")) {
      name = hostname;
      driver.get(appServer.whereElseIs("simpleTest.html"));
    }

    driver.manage().deleteAllCookies();

    assumeNotNull(name);
    assumeTrue(!name.matches("\\d{1,3}(?:\\.\\d{1,3}){3}"));
    
    return name;
  }
  
  private static final Random random = new Random();
  
  private String generateUniqueKey() {
    return String.format("key_%d", random.nextInt());
  }
  
  private void assertNoCookiesArePresent() {
    assertTrue("Cookies were not empty",
        driver.manage().getCookies().isEmpty());
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertEquals("Cookies were not empty", "", documentCookie);
    }
  }
  
  private void assertSomeCookiesArePresent() {
    assertFalse("Cookies were empty",
        driver.manage().getCookies().isEmpty());
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertNotSame("Cookies were empty", "", documentCookie);
    }
  }
  
  private void assertCookieIsNotPresentWithName(final String key) {
    assertNull("Cookie was present with name " + key, driver.manage().getCookieNamed(key));
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat("Cookie was present with name " + key,
        documentCookie,
        not(containsString(key + "=")));
    }
  }
  
  private void assertCookieIsPresentWithName(final String key) {
    assertNotNull("Cookie was not present with name " + key, driver.manage().getCookieNamed(key));
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat("Cookie was not present with name " + key,
        documentCookie,
        containsString(key + "="));
    }
  }
  
  private void assertCookieHasValue(final String key, final String value) {
    assertEquals("Cookie had wrong value",
      value,
      driver.manage().getCookieNamed(key).getValue());
    String documentCookie = getDocumentCookieOrNull();
    if (documentCookie != null) {
      assertThat("Cookie was present with name " + key,
        documentCookie,
        containsString(key + "=" + value));
    }
  }
  
  private String getDocumentCookieOrNull() {
    if (!(driver instanceof JavascriptExecutor)) {
      return null;
    }
    try {
      return (String)((JavascriptExecutor)driver).executeScript("return document.cookie");
    } catch (UnsupportedOperationException e) {
      return null;
    }
  }
  
  private Date someTimeInTheFuture() {
    return new Date(System.currentTimeMillis() + 100000);
  }
}
