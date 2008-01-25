package com.googlecode.webdriver;

import junit.framework.TestCase;

import java.util.Date;

public class CookieTest extends TestCase {
    
    public void testCanCreateAWellFormedCookie() {
        new Cookie("Fish", "cod", "", "", null, false);
    }
    
    public void testShouldThrowAnExceptionWhenTheDomainIsBad() {
        try {
            new Cookie("Fish", "cod", "127.0.0.0.1", null, null, false);
            fail();
        } catch (IllegalArgumentException e) {
            // This is expected
        }
    }
    
    public void testShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute() {
        try {
            new Cookie("hi;hi", "value", null, null, null, false);
            fail();
        } catch (IllegalArgumentException e) {
            //Expected
        }
    }
    
    public void testShouldThrowAnExceptionTheNameIsNull() {
        try {
            new Cookie(null, "value", null, null, null, false);
            fail();
        } catch(IllegalArgumentException e) {
            //expected
        }
    }

    @Ignore(value = "all", reason = "Weakened constraints to allow IE driver to be implemented")
    public void testEquals() {
        Cookie cookie1 = new Cookie("Fish", "cod", "", "", null, false);
        Cookie cookie2 = new Cookie("Fish", "", "", "", new Date(0), true);
        assertEquals(cookie1, cookie2);

        cookie2 = new Cookie("Fish", "cod", "", "/", null, false);
        assertFalse(cookie1.equals(cookie2));

        cookie2 = new Cookie("fish", "cod", "", "", null, false);
        assertFalse(cookie1.equals(cookie2));

        cookie2 = new Cookie("Fish", "cod", "example.com", "", null, false);
        assertFalse(cookie1.equals(cookie2));
    }

    @Ignore(value = "all", reason = "Weakened constraints to allow IE driver to be implemented")
    public void testHashCode() {
        Cookie cookie1 = new Cookie("Fish", "cod", "", "", null, false);
        Cookie cookie2 = new Cookie("Fish", "", "", "", new Date(0), true);
        assertEquals(cookie1.hashCode(), cookie2.hashCode());

        cookie2 = new Cookie("Fish", "cod", "", "/", null, false);
        assertFalse(cookie1.hashCode() == cookie2.hashCode());

        cookie2 = new Cookie("fish", "cod", "", "", null, false);
        assertFalse(cookie1.hashCode() == cookie2.hashCode());

        cookie2 = new Cookie("Fish", "cod", "example.com", "", null, false);
        assertFalse(cookie1.hashCode() == cookie2.hashCode());
    }
}
