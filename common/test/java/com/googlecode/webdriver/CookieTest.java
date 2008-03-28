package com.googlecode.webdriver;

import junit.framework.TestCase;

import java.util.Date;

import com.googlecode.webdriver.internal.ReturnedCookie;

public class CookieTest extends TestCase {
    
    public void testCanCreateAWellFormedCookie() {
        new ReturnedCookie("Fish", "cod", "", "", null, false);
    }
    
    public void testShouldThrowAnExceptionWhenTheDomainIsBad() {
        try {
            new ReturnedCookie("Fish", "cod", "127.0.0.0.1", null, null, false);
            fail();
        } catch (IllegalArgumentException e) {
            // This is expected
        }
    }
    
    public void testShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute() {
        try {
            new ReturnedCookie("hi;hi", "value", null, null, null, false);
            fail();
        } catch (IllegalArgumentException e) {
            //Expected
        }
    }
    
    public void testShouldThrowAnExceptionTheNameIsNull() {
        try {
            new ReturnedCookie(null, "value", null, null, null, false);
            fail();
        } catch(IllegalArgumentException e) {
            //expected
        }
    }

    @Ignore(value = "all", reason = "Weakened constraints to allow IE driver to be implemented")
    public void testEquals() {
        Cookie cookie1 = new ReturnedCookie("Fish", "cod", "", "", null, false);
        Cookie cookie2 = new ReturnedCookie("Fish", "", "", "", new Date(0), true);
        assertEquals(cookie1, cookie2);

        cookie2 = new ReturnedCookie("Fish", "cod", "", "/", null, false);
        assertFalse(cookie1.equals(cookie2));

        cookie2 = new ReturnedCookie("fish", "cod", "", "", null, false);
        assertFalse(cookie1.equals(cookie2));

        cookie2 = new ReturnedCookie("Fish", "cod", "example.com", "", null, false);
        assertFalse(cookie1.equals(cookie2));
    }

    @Ignore(value = "all", reason = "Weakened constraints to allow IE driver to be implemented")
    public void testHashCode() {
        Cookie cookie1 = new ReturnedCookie("Fish", "cod", "", "", null, false);
        Cookie cookie2 = new ReturnedCookie("Fish", "", "", "", new Date(0), true);
        assertEquals(cookie1.hashCode(), cookie2.hashCode());

        cookie2 = new ReturnedCookie("Fish", "cod", "", "/", null, false);
        assertFalse(cookie1.hashCode() == cookie2.hashCode());

        cookie2 = new ReturnedCookie("fish", "cod", "", "", null, false);
        assertFalse(cookie1.hashCode() == cookie2.hashCode());

        cookie2 = new ReturnedCookie("Fish", "cod", "example.com", "", null, false);
        assertFalse(cookie1.hashCode() == cookie2.hashCode());
    }

    public void testCookiesShouldAllowSecureToBeSet() {
      Cookie cookie = new ReturnedCookie("name", "value", "", "/", new Date(), true);
      assertTrue(cookie.isSecure());
    }
}
