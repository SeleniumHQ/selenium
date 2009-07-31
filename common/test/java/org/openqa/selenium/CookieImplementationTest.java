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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.core.IsNot.not;
import static org.openqa.selenium.Ignore.Driver.IE;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;

import java.net.URL;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.Set;

public class CookieImplementationTest extends AbstractDriverTestCase {
    public void testAddCookiesWithDifferentPaths() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();

        Cookie cookie1 = new Cookie("fish", "cod", "/animals");
        Cookie cookie2 = new Cookie("planet", "earth", "/galaxy");
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        AppServer appServer = GlobalTestEnvironment.get().getAppServer();
        driver.get(appServer.whereIs("animals"));
        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies.contains(cookie1), is(true));
        assertThat(cookies.contains(cookie2), is(false));

        driver.get(appServer.whereIs("galaxy"));
        cookies = options.getCookies();
        assertThat(cookies.contains(cookie1), is(false));
        assertThat(cookies.contains(cookie2), is(true));
    }

    public void testGetAllCookies() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();
        
        long time = System.currentTimeMillis() + (60 * 60 * 24);
        Cookie cookie1 = new Cookie("fish", "cod", "", new Date(time));
        Cookie cookie2 = new Cookie("planet", "earth");
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies.contains(cookie1), is(true));
        assertThat(cookies.contains(cookie2), is(true));
    }

    @Ignore(IE)
    public void testCookieIntegrity() {
        String url = GlobalTestEnvironment.get().getAppServer().whereElseIs("animals");

        driver.get(url);
        driver.manage().deleteAllCookies();
        
        Calendar c = Calendar.getInstance();
        long time = System.currentTimeMillis() + (60 * 60 * 24);
        Cookie cookie1 = new Cookie("fish", "cod", "/animals", new Date(time));
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);

        Set<Cookie> cookies = options.getCookies();
        Iterator<Cookie> iter = cookies.iterator();
        Cookie retrievedCookie = null;
        while(iter.hasNext()) {
            Cookie temp = iter.next();

            if (cookie1.equals(temp)) {
              retrievedCookie = temp;
              break;
            }
        }

        assertThat(retrievedCookie, is(notNullValue()));
        //Cookie.equals only compares name, domain and path
        assertThat(retrievedCookie, equalTo(cookie1));
        assertThat(retrievedCookie.getValue(), equalTo(cookie1.getValue()));
//        assertThat(retrievedCookie.getExpiry(), equalTo(cookie1.getExpiry()));
        assertThat(retrievedCookie.isSecure(), equalTo(cookie1.isSecure()));
    }

    public void testDeleteAllCookies() {
        driver.get(simpleTestPage);
        Cookie cookie1 = new Cookie("fish", "cod");
        Cookie cookie2 = new Cookie("planet", "earth");
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);
        Set<Cookie> cookies = options.getCookies();
        assertThat(cookies.contains(cookie1), is(true));
        assertThat(cookies.contains(cookie2), is(true));
        options.deleteAllCookies();
        driver.get(simpleTestPage);

        cookies = options.getCookies();
        assertThat(cookies.contains(cookie1), is(false));
        assertThat(cookies.contains(cookie2), is(false));
    }

    public void testDeleteCookie() {
        driver.get(simpleTestPage);
        Cookie cookie1 = new Cookie("fish", "cod");
        Cookie cookie2 = new Cookie("planet", "earth");
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        options.deleteCookie(cookie1);
        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies.size(), equalTo(1));
        assertThat(cookies, hasItem(cookie2));
    }

    public void testDeleteCookieWithName() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();
        
        String cookieOneName = "fish";
        String cookieTwoName = "planet";
        String cookieThreeName = "three";
        Cookie cookie1 = new Cookie(cookieOneName, "cod");
        Cookie cookie2 = new Cookie(cookieTwoName, "earth");
        Cookie cookie3 = new Cookie(cookieThreeName, "three");
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);
        options.addCookie(cookie3);

        options.deleteCookieNamed(cookieOneName);
        options.deleteCookieNamed(cookieTwoName);
        Set<Cookie> cookies = options.getCookies();
        //cookie without domain gets deleted
        assertThat(cookies, not(hasItem(cookie1)));
        //cookie with domain gets deleted
        assertThat(cookies, not(hasItem(cookie2)));
        //cookie not deleted
        assertThat(cookies, hasItem(cookie3));
    }

    public void testShouldNotDeleteCookiesWithASimilarName() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();
        
        String cookieOneName = "fish";
        Cookie cookie1 = new Cookie(cookieOneName, "cod");
        Cookie cookie2 = new Cookie(cookieOneName + "x", "earth");
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        options.deleteCookieNamed(cookieOneName);
        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies, not(hasItem(cookie1)));
        assertThat(cookies, hasItem(cookie2));
    }

  public void testGetCookieDoesNotRetriveBeyondCurrentDomain() {
    driver.get(simpleTestPage);
    driver.manage().deleteAllCookies();

    Cookie cookie1 = new Cookie("fish", "cod");
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);

    String url = GlobalTestEnvironment.get().getAppServer().whereElseIs("");
    try {
      driver.get(url);
    } catch (IllegalStateException e) {
      if (isIeDriverTimedOutException(e)) {
        System.err.println("Looks like IE timed out. Is the site accessible?");
        return;
      }
    }    
    Set<Cookie> cookies = options.getCookies();
    assertThat(cookies, not(hasItem(cookie1)));
  }

  @Ignore(IE)
  public void testShouldBeAbleToSetDomainToTheCurrentDomain() throws Exception {
    driver.get(simpleTestPage);
    driver.manage().deleteAllCookies();

    URL url = new URL(driver.getCurrentUrl());
    String host = url.getHost() + ":" + url.getPort();

    Cookie cookie1 = new Cookie.Builder("fish", "cod").domain(host).build();
    WebDriver.Options options = driver.manage();
    options.addCookie(cookie1);

    driver.get(javascriptPage);
    Set<Cookie> cookies = options.getCookies();
    assertThat(cookies, hasItem(cookie1));
  }

  @Ignore(IE)
  public void testShouldNotBeAbleToSetDomainToSomethingThatIsNotTheCurrentDomain() {
    driver.get(simpleTestPage);
    driver.manage().deleteAllCookies();

    Cookie cookie1 = new Cookie.Builder("fish", "cod").domain("example.com").build();
    WebDriver.Options options = driver.manage();
    try {
      options.addCookie(cookie1);
      fail("Should not be able to set cookie on another domain");
    } catch (WebDriverException e) {
      // This is expected
    }
  }
}
