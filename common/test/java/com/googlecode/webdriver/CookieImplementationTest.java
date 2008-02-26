package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.core.IsNot.not;

import java.util.Calendar;
import java.util.Iterator;
import java.util.Set;

public class CookieImplementationTest extends AbstractDriverTestCase {
    public void testAddCookiesWithDifferentPaths() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();

        Cookie cookie1 = new Cookie("fish", "cod", hostName, "/animals", null, false);
        Cookie cookie2 = new Cookie("planet", "earth", hostName, "/galaxy", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        driver.get(baseUrl + "animals");
        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies.contains(cookie1), is(true));
        assertThat(cookies.contains(cookie2), is(false));

        driver.get(baseUrl + "galaxy");
        cookies = options.getCookies();
        assertThat(cookies.contains(cookie1), is(false));
        assertThat(cookies.contains(cookie2), is(true));
    }

    public void testGetAllCookies() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();
        
        Calendar c = Calendar.getInstance();
        c.set(2009, 0, 1);
        Cookie cookie1 = new Cookie("fish", "cod", hostName, "", c.getTime(), false);
        Cookie cookie2 = new Cookie("planet", "earth", hostName, "", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies.contains(cookie1), is(true));
        assertThat(cookies.contains(cookie2), is(true));
    }
	
	@Ignore("ie")
    public void testCookieIntegrity() {
        driver.get(alternateBaseUrl + "animals");
        driver.manage().deleteAllCookies();
        
        Calendar c = Calendar.getInstance();
        c.set(2009, 0, 1);
        Cookie cookie1 = new Cookie("fish", "cod", alternateHostName, "/animals", c.getTime(), false);
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

    @Ignore("safari")
    public void testDeleteAllCookies() {
        driver.get(simpleTestPage);
        Cookie cookie1 = new Cookie("fish", "cod", hostName, "", null, false);
        Cookie cookie2 = new Cookie("planet", "earth", hostName, "", null, false);
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

    @Ignore("safari")
    public void testDeleteCookie() {
        driver.get(simpleTestPage);
        Cookie cookie1 = new Cookie("fish", "cod", hostName, "", null, false);
        Cookie cookie2 = new Cookie("planet", "earth", hostName, "", null, false);
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
        Cookie cookie1 = new Cookie(cookieOneName, "cod", hostName, "", null, false);
        Cookie cookie2 = new Cookie(cookieTwoName, "earth", hostName, "", null, false);
        Cookie cookie3 = new Cookie(cookieThreeName, "three", hostName, "", null, false);
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
        Cookie cookie1 = new Cookie(cookieOneName, "cod", hostName, "", null, false);
        Cookie cookie2 = new Cookie(cookieOneName + "x", "earth", hostName, "", null, false);
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

        Cookie cookie1 = new Cookie("fish", "cod", hostName, "", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);

        driver.get(alternateBaseUrl);
        Set<Cookie> cookies = options.getCookies();
        assertThat(cookies, not(hasItem(cookie1)));
    }
}
