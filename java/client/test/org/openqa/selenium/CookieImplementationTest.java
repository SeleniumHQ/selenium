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

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertThat;

import static org.openqa.selenium.Ignore.Driver.ALL;
import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

@Ignore(SELENESE)
public class CookieImplementationTest extends AbstractDriverTestCase {

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    //This page is the deepest page we go to in the cookie tests
    //We go to it to ensure that cookies with /common/... paths are deleted
    //Do not write test in this class which use pages other than under /common
    //without ensuring that cookies are deleted on those pages as required
    gotoValidDomainAndClearCookies("/common/animals");
    assertNoCookiesArePresent();
  }

  @JavascriptEnabled
  public void testShouldGetCookieByName() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
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
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    String key = generateUniqueKey();
    String value = "foo";
    Cookie cookie = new Cookie.Builder(key, value).build();
    assertCookieIsNotPresentWithName(key);

    driver.manage().addCookie(cookie);

    assertCookieHasValue(key, value);
  }

  public void testGetAllCookies() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
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

    goToPage("simpleTest.html");
    cookies = driver.manage().getCookies();
    assertEquals(countBefore + 2, cookies.size());

    assertTrue(cookies.contains(one));
    assertTrue(cookies.contains(two));
  }

  @JavascriptEnabled
  public void testDeleteAllCookies() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    ((JavascriptExecutor) driver).executeScript("document.cookie = 'foo=set';");
    assertSomeCookiesArePresent();

    driver.manage().deleteAllCookies();

    assertNoCookiesArePresent();
  }

  @JavascriptEnabled
  public void testDeleteCookieWithName() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    String key1 = generateUniqueKey();
    String key2 = generateUniqueKey();
    
    ((JavascriptExecutor) driver).executeScript("document.cookie = arguments[0] + '=set';", key1);
    ((JavascriptExecutor) driver).executeScript("document.cookie = arguments[0] + '=set';", key2);
    
    assertCookieIsPresentWithName(key1);
    assertCookieIsPresentWithName(key2);
    
    driver.manage().deleteCookieNamed(key1);
    
    assertCookieIsNotPresentWithName(key1);
    assertCookieIsPresentWithName(key2);
  }

  public void testShouldNotDeleteCookiesWithASimilarName() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
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

    assertFalse(cookies.toString(), cookies.contains(cookie1));
    assertTrue(cookies.toString(), cookies.contains(cookie2));
  }

  @Ignore(OPERA)
  public void testAddCookiesWithDifferentPathsThatAreRelatedToOurs() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    goToPage("/common/animals");
    Cookie cookie1 = new Cookie.Builder("fish", "cod").path("/common/animals").build();
    Cookie cookie2 = new Cookie.Builder("planet", "earth").path("/common/").build();
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);
    options.addCookie(cookie2);

    goToPage("/common/animals");

    assertCookieIsPresentWithName(cookie1.getName());
    assertCookieIsPresentWithName(cookie2.getName());

    goToPage("/common/simplePage.html");
    assertCookieIsNotPresentWithName(cookie1.getName());
  }

  @Ignore({CHROME, OPERA})
  public void testCannotGetCookiesWithPathDifferingOnlyInCase() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    String cookieName = "fish";
    Cookie cookie = new Cookie.Builder(cookieName, "cod").path("/Common/animals").build();
    driver.manage().addCookie(cookie);
    
    goToPage("animals");
    assertNull(driver.manage().getCookieNamed(cookieName));
  }

  public void testShouldNotGetCookieOnDifferentDomain() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    String cookieName = "fish";
    driver.manage().addCookie(new Cookie.Builder(cookieName, "cod").build());
    assertCookieIsPresentWithName(cookieName);

    goToOtherPage("simpleTest.html");

    assertCookieIsNotPresentWithName(cookieName);
  }

  @Ignore(ALL)
  public void testShouldBeAbleToAddToADomainWhichIsRelatedToTheCurrentDomain() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }

    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    String shorter = hostname.replaceFirst(".*?\\.", "");
    Cookie cookie = new Cookie.Builder(cookieName, "value").domain(shorter).build();
    driver.manage().addCookie(cookie);
    fail("No way to test that the cookie exists without setting up subdomains on test environment");
  }
  
  @Ignore(ALL)
  public void testsShouldNotGetCookiesRelatedToCurrentDomainWithoutLeadingPeriod() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }

    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    String shorter = hostname.replaceFirst(".*?\\.", "");
    Cookie cookie = new Cookie.Builder(cookieName, "value").domain(shorter).build();
    driver.manage().addCookie(cookie);
    assertCookieIsNotPresentWithName(cookieName);
  }

  @Ignore({REMOTE, IE})
  public void testShouldBeAbleToIncludeLeadingPeriodInDomainName() throws Exception {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }

    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);

    String shorter = hostname.replaceFirst(".*?\\.", ".");
    Cookie cookie = new Cookie.Builder("name", "value").domain(shorter).build();

    driver.manage().addCookie(cookie);

    assertCookieIsPresentWithName(cookieName);
  }

  @Ignore(IE)
  public void testShouldBeAbleToSetDomainToTheCurrentDomain() throws Exception {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    
    URI url = new URI(driver.getCurrentUrl());
    String host = url.getHost() + ":" + url.getPort();

    Cookie cookie = new Cookie.Builder("fish", "cod").domain(host).build();
    driver.manage().addCookie(cookie);

    goToPage("javascriptPage.html");
    Set<Cookie> cookies = driver.manage().getCookies();
    assertTrue(cookies.contains(cookie));
  }

  public void testShouldWalkThePathToDeleteACookie() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    Cookie cookie1 = new Cookie.Builder("fish", "cod").build();
    driver.manage().addCookie(cookie1);

    goToPage("child/childPage.html");
    Cookie cookie2 = new Cookie("rodent", "hamster", "/common/child");
    driver.manage().addCookie(cookie2);

    goToPage("child/grandchild/grandchildPage.html");
    Cookie cookie3 = new Cookie("dog", "dalmation", "/common/child/grandchild/");
    driver.manage().addCookie(cookie3);

    goToPage("child/grandchild/grandchildPage.html");
    driver.manage().deleteCookieNamed("rodent");

    assertNull(driver.manage().getCookies().toString(), driver.manage().getCookieNamed("rodent"));

    Set<Cookie> cookies = driver.manage().getCookies();
    assertEquals(2, cookies.size());
    assertTrue(cookies.contains(cookie1));
    assertTrue(cookies.contains(cookie3));

    driver.manage().deleteAllCookies();
    goToPage("child/grandchild/grandchildPage.html");
    assertNoCookiesArePresent();
  }

  @Ignore(IE)
  public void testShouldIgnoreThePortNumberOfTheHostWhenSettingTheCookie() throws Exception {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    
    URI uri = new URI(driver.getCurrentUrl());
    String host = String.format("%s:%d", uri.getHost(), uri.getPort());
    
    String cookieName = "name";
    assertCookieIsNotPresentWithName(cookieName);
    
    Cookie cookie = new Cookie.Builder(cookieName, "value").domain(host).build();
    driver.manage().addCookie(cookie);

    assertCookieIsPresentWithName(cookieName);
  }

  @Ignore(value = {CHROME, OPERA}, reason = "Chrome: Setting cookies with expiry fails")
  public void testCookieEqualityAfterSetAndGet() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    goToOtherPage("animals");
    driver.manage().deleteAllCookies();

    Cookie addedCookie =
        new Cookie.Builder("fish", "cod")
        .path("/common/animals")
        .expiresOn(someTimeInTheFuture())
        .build();
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

  @Ignore(value = {ANDROID, CHROME, IE, OPERA}, reason =
      "Chrome: Setting cookies with expiry date fails; " + 
      "Selenium, which use JavaScript to retrieve cookies, cannot return expiry info; " +
      "Other suppressed browsers have not been tested.")
  public void testRetainsCookieExpiry() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    goToOtherPage("animals");
    driver.manage().deleteAllCookies();

    Cookie addedCookie =
        new Cookie.Builder("fish", "cod")
        .path("/common/animals")
        .expiresOn(someTimeInTheFuture())
        .build();
    driver.manage().addCookie(addedCookie);

    Cookie retrieved = driver.manage().getCookieNamed("fish");
    assertNotNull(retrieved);
    assertEquals(addedCookie.getExpiry(), retrieved.getExpiry());
  }

  @Ignore(value = {ANDROID, CHROME}, reason = "Chrome: Setting expiry time fails. Others: Untested")
  public void testSettingACookieThatExpiredInThePast() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    goToOtherPage("animals");
    driver.manage().deleteAllCookies();

    long expires = System.currentTimeMillis() - 1000;
    Cookie cookie = new Cookie.Builder("expired", "yes").expiresOn(new Date(expires)).build();
    driver.manage().addCookie(cookie);

    cookie = driver.manage().getCookieNamed("fish");
    assertNull(
        "Cookie expired before it was set, so nothing should be returned: " + cookie, cookie);
  }
  
  public void testCanSetCookieWithoutOptionalFieldsSet() {
    if (!checkIsOnValidHostnameForCookieTests()) {
      return;
    }
    String key = generateUniqueKey();
    String value = "foo";
    Cookie cookie = new Cookie(key, value);
    assertCookieIsNotPresentWithName(key);

    driver.manage().addCookie(cookie);

    assertCookieHasValue(key, value);
  }

  private void gotoValidDomainAndClearCookies(String page) {
    this.hostname = null;
    String hostname = appServer.getHostName();
    if (isValidHostnameForCookieTests(hostname)) {
      isOnAlternativeHostName = false;
      this.hostname = hostname;
    }
    hostname = appServer.getAlternateHostName();
    if (this.hostname == null && isValidHostnameForCookieTests(hostname)) {
      isOnAlternativeHostName = true;
      this.hostname = hostname;
    }
    goToPage(page);

    driver.manage().deleteAllCookies();
  }
  
  private boolean isOnAlternativeHostName = false;
  private String hostname;
  
  private boolean checkIsOnValidHostnameForCookieTests() {
    boolean correct = hostname != null && isValidHostnameForCookieTests(hostname);
    if (!correct) {
      System.out.println("Skipping test: unable to find domain name to use");
    }
    return correct;
  }
  
  private boolean isValidHostnameForCookieTests(String hostname) {
    return !isIpv4Address(hostname) && !"localhost".equals(hostname);
  }
  
  private static boolean isIpv4Address(String string) {
    return string.matches("\\d{1,3}(?:\\.\\d{1,3}){3}");
  }
  
  private void goToPage(String pageName) {
    driver.get(
        isOnAlternativeHostName ? appServer.whereElseIs(pageName) : appServer.whereIs(pageName));
  }
  
  private void goToOtherPage(String pageName) {
    driver.get(
        isOnAlternativeHostName ? appServer.whereIs(pageName) : appServer.whereElseIs(pageName));
  }
  
  private static final Random random = new Random();
  
  private String generateUniqueKey() {
    return String.format("key_%d", random.nextInt());
  }
  
  private void assertNoCookiesArePresent() {
    Set<Cookie> cookies = driver.manage().getCookies();
    assertTrue("Cookies were not empty, present: " + cookies,
        cookies.isEmpty());
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
