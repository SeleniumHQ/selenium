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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;

import java.net.URI;
import java.util.Date;
import java.util.Iterator;
import java.util.Random;
import java.util.Set;

public class CookieImplementationTest extends AbstractDriverTestCase {

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    driver.get(pages.simpleTestPage);
    driver.manage().deleteAllCookies();
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldGetCookieByName() {
    String key = String.format("key_%d", new Random().nextInt());
    ((JavascriptExecutor) driver).executeScript("document.cookie = arguments[0] + '=set';", key);

    Cookie cookie = driver.manage().getCookieNamed(key);
    assertEquals("set", cookie.getValue());
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testShouldBeAbleToAddCookie() {
    String key = String.format("key_%d", new Random().nextInt());
    Cookie cookie = new Cookie(key, "foo");

    ((JavascriptExecutor) driver).executeScript("return document.cookie");

    driver.manage().addCookie(cookie);

    String current = (String) ((JavascriptExecutor) driver).executeScript("return document.cookie");
    assertTrue(current.contains(key));
  }

  @Ignore(SELENESE)
  public void testGetAllCookies() {
    Random random = new Random();
    String key1 = String.format("key_%d", random.nextInt());
    String key2 = String.format("key_%d", random.nextInt());

    Set<Cookie> cookies = driver.manage().getCookies();
    int count = cookies.size();

    Cookie one = new Cookie(key1, "value");
    Cookie two = new Cookie(key2, "value");

    driver.manage().addCookie(one);
    driver.manage().addCookie(two);

    driver.get(pages.simpleTestPage);
    cookies = driver.manage().getCookies();
    assertEquals(count + 2, cookies.size());

    assertTrue(cookies.contains(one));
    assertTrue(cookies.contains(two));
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testDeleteAllCookies() {
    ((JavascriptExecutor) driver).executeScript("document.cookie = 'foo=set';");
    int count = driver.manage().getCookies().size();
    assertTrue(count > 0);

    driver.manage().deleteAllCookies();

    Set<Cookie> cookies = driver.manage().getCookies();
    count = cookies.size();
    assertTrue(cookies.toString(), count == 0);
  }

  @JavascriptEnabled
  @Ignore(SELENESE)
  public void testDeleteCookieWithName() {
    Random random = new Random();
    String key1 = String.format("key_%d", random.nextInt());
    String key2 = String.format("key_%d", random.nextInt());

    ((JavascriptExecutor) driver).executeScript("document.cookie = arguments[0] + '=set';", key1);
    ((JavascriptExecutor) driver).executeScript("document.cookie = arguments[0] + '=set';", key2);

    assertNotNull(driver.manage().getCookieNamed(key1));
    assertNotNull(driver.manage().getCookieNamed(key2));

    driver.manage().deleteCookieNamed(key1);

    Set<Cookie> cookies = driver.manage().getCookies();

    assertNull(cookies.toString(), driver.manage().getCookieNamed(key1));
    assertNotNull(cookies.toString(), driver.manage().getCookieNamed(key2));
  }

  @Ignore(SELENESE)
  public void testShouldNotDeleteCookiesWithASimilarName() {
    String cookieOneName = "fish";
    Cookie cookie1 = new Cookie(cookieOneName, "cod");
    Cookie cookie2 = new Cookie(cookieOneName + "x", "earth");
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);
    options.addCookie(cookie2);

    options.deleteCookieNamed(cookieOneName);
    Set<Cookie> cookies = options.getCookies();

    assertFalse(cookies.toString(), cookies.contains(cookie1));
    assertTrue(cookies.toString(), cookies.contains(cookie2));
  }

  @Ignore(SELENESE)
  public void testAddCookiesWithDifferentPathsThatAreRelatedToOurs() {
    driver.get(pages.simpleTestPage);
    driver.manage().deleteAllCookies();

    Cookie cookie1 = new Cookie("fish", "cod", "/common/animals");
    Cookie cookie2 = new Cookie("planet", "earth", "/common/");
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);
    options.addCookie(cookie2);

    AppServer appServer = GlobalTestEnvironment.get().getAppServer();
    driver.get(appServer.whereIs("animals"));

    Set<Cookie> cookies = options.getCookies();
    assertTrue(cookies.contains(cookie1));
    assertTrue(cookies.contains(cookie2));

    driver.get(appServer.whereIs(""));
    cookies = options.getCookies();
    assertFalse(cookies.toString(), cookies.contains(cookie1));
    assertTrue(cookies.toString(), cookies.contains(cookie2));
  }

  @Ignore(SELENESE)
  public void testCanSetCookiesOnADifferentPathOfTheSameHost() {
    Cookie cookie1 = new Cookie("fish", "cod", "/common/animals");
    Cookie cookie2 = new Cookie("planet", "earth", "/common/galaxy");

    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);
    options.addCookie(cookie2);

    AppServer appServer = GlobalTestEnvironment.get().getAppServer();
    driver.get(appServer.whereIs("animals"));
    Set<Cookie> cookies = options.getCookies();

    assertTrue(cookies.toString(), cookies.contains(cookie1));
    assertFalse(cookies.toString(), cookies.contains(cookie2));

    driver.get(appServer.whereIs("galaxy"));
    cookies = options.getCookies();
    assertFalse(cookies.contains(cookie1));
    assertTrue(cookies.contains(cookie2));
  }

  @Ignore(SELENESE)
  public void testShouldNotBeAbleToSetDomainToSomethingThatIsUnrelatedToTheCurrentDomain() {
    Cookie cookie1 = new Cookie("fish", "cod");
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);

    String url = GlobalTestEnvironment.get().getAppServer().whereElseIs("simpleTest.html");
    driver.get(url);

    Cookie cookie = options.getCookieNamed("fish");
    assertNull(String.valueOf(cookie), cookie);
  }

  @Ignore({SELENESE, IE})
  public void testShouldBeAbleToAddToADomainWhichIsRelatedToTheCurrentDomain() {
    String name = gotoValidDomainAndClearCookies();
    if (name == null || name.matches("\\d{1,3}(?:\\.\\d{1,3}){3}")) {
      System.out.println("Skipping test: unable to find domain name to use");
      return;
    }

    assertNull(driver.manage().getCookieNamed("name"));

    String shorter = name.replaceFirst(".*?\\.", "");
    Cookie cookie =
        new Cookie("name", "value", shorter, "/", new Date(System.currentTimeMillis() + 100000));

    driver.manage().addCookie(cookie);

    assertNotNull(driver.manage().getCookieNamed("name"));
  }

  @Ignore({REMOTE, SELENESE, IE})
  public void testShouldBeAbleToIncludeLeadingPeriodInDomainName() throws Exception {
    String name = gotoValidDomainAndClearCookies();
    if (name == null || name.matches("\\d{1,3}(?:\\.\\d{1,3}){3}")) {
      System.out.println("Skipping test: unable to find domain name to use");
      return;
    }
    driver.manage().deleteAllCookies();

    assertNull("Looks like delete all cookies doesn't", driver.manage().getCookieNamed("name"));

    // Replace the first part of the name with a period
    String shorter = name.replaceFirst(".*?\\.", ".");
    Cookie cookie =
        new Cookie("name", "value", shorter, "/", new Date(System.currentTimeMillis() + 100000));

    driver.manage().addCookie(cookie);

    assertNotNull(driver.manage().getCookieNamed("name"));
  }

  @Ignore(SELENESE)
  public void testGetCookieDoesNotRetriveBeyondCurrentDomain() {
    Cookie cookie1 = new Cookie("fish", "cod");
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);

    String url = GlobalTestEnvironment.get().getAppServer().whereElseIs("");
    driver.get(url);

    Set<Cookie> cookies = options.getCookies();
    assertFalse(cookies.contains(cookie1));
  }

  @Ignore({IE, SELENESE})
  public void testShouldBeAbleToSetDomainToTheCurrentDomain() throws Exception {
    URI url = new URI(driver.getCurrentUrl());
    String host = url.getHost() + ":" + url.getPort();

    Cookie cookie1 = new Cookie.Builder("fish", "cod").domain(host).build();
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);

    driver.get(pages.javascriptPage);
    Set<Cookie> cookies = options.getCookies();
    assertTrue(cookies.contains(cookie1));
  }

  @Ignore(SELENESE)
  public void testShouldWalkThePathToDeleteACookie() {
    Cookie cookie1 = new Cookie("fish", "cod");
    driver.manage().addCookie(cookie1);

    driver.get(pages.childPage);
    Cookie cookie2 = new Cookie("rodent", "hamster", "/common/child");
    driver.manage().addCookie(cookie2);

    driver.get(pages.grandchildPage);
    Cookie cookie3 = new Cookie("dog", "dalmation", "/common/child/grandchild/");
    driver.manage().addCookie(cookie3);

    driver.get(GlobalTestEnvironment.get().getAppServer().whereIs("child/grandchild"));
    driver.manage().deleteCookieNamed("rodent");

    assertNull(driver.manage().getCookies().toString(), driver.manage().getCookieNamed("rodent"));

    Set<Cookie> cookies = driver.manage().getCookies();
    assertEquals(2, cookies.size());
    assertTrue(cookies.contains(cookie1));
    assertTrue(cookies.contains(cookie3));

    driver.manage().deleteAllCookies();
    driver.get(pages.grandchildPage);

    cookies = driver.manage().getCookies();
    assertEquals(0, cookies.size());
  }

  @Ignore({IE, SELENESE})
  public void testShouldIgnoreThePortNumberOfTheHostWhenSettingTheCookie() throws Exception {
    URI uri = new URI(driver.getCurrentUrl());
    String host = String.format("%s:%d", uri.getHost(), uri.getPort());

    assertNull(driver.manage().getCookieNamed("name"));
    Cookie cookie = new Cookie.Builder("name", "value").domain(host).build();
    driver.manage().addCookie(cookie);

    assertNotNull(driver.manage().getCookieNamed("name"));
  }

  @Ignore({SELENESE, IE})
  public void testCookieIntegrity() {
    String url = GlobalTestEnvironment.get().getAppServer().whereElseIs("animals");

    driver.get(url);
    driver.manage().deleteAllCookies();

    long time = System.currentTimeMillis() + (60 * 60 * 24);
    Cookie cookie1 = new Cookie("fish", "cod", "/common/animals", new Date(time));
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);

    Set<Cookie> cookies = options.getCookies();
    Iterator<Cookie> iter = cookies.iterator();
    Cookie retrievedCookie = null;
    while (iter.hasNext()) {
      Cookie temp = iter.next();

      if (cookie1.equals(temp)) {
        retrievedCookie = temp;
        break;
      }
    }

    assertNotNull(retrievedCookie);
    //Cookie.equals only compares name, domain and path
    assertEquals(cookie1, retrievedCookie);
  }

  @Ignore(SELENESE)
  private String gotoValidDomainAndClearCookies() {
    AppServer appServer = GlobalTestEnvironment.get().getAppServer();

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

    return name;
  }
}
