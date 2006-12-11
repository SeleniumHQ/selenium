package com.thoughtworks.selenium;

import junit.framework.*;

import org.openqa.selenium.server.*;

public class GoogleTest extends TestCase {
    private Selenium selenium;

    public void setUp() throws Exception {
        String url = "http://www.google.com";
        selenium = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*firefox", url);
        selenium.start();
    }

    protected void tearDown() throws Exception {
        selenium.stop();
    }

    public void testGoogleTestSearch() throws Throwable {
        selenium.open("http://www.google.com/webhp");

        assertEquals("Google", selenium.getTitle());
        selenium.type("q", "Selenium OpenQA");
        assertEquals("Selenium OpenQA", selenium.getValue("q"));
        selenium.click("btnG");
        selenium.waitForPageToLoad("5000");
        assertEquals("Selenium OpenQA - Google Search", selenium.getTitle());
    }

}
