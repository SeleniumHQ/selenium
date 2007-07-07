package com.thoughtworks.selenium;

import junit.framework.*;

import org.openqa.selenium.server.*;

public class SSLWellsFargoTest extends TestCase {
    private Selenium selenium;
    String url = "https://www.wellsfargo.com";

    protected void tearDown() throws Exception {
        selenium.stop();
    }

    public void testFirefox() throws Throwable {
        selenium = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*firefox", url);
        selenium.start();
        selenium.open("https://www.wellsfargo.com");

        assertEquals("Wells Fargo Home Page", selenium.getTitle());
    }
    
    public void testIexplore() throws Throwable {
        selenium = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*iexplore", url);
        selenium.start();
        selenium.open("https://www.wellsfargo.com");

        assertEquals("Wells Fargo Home Page", selenium.getTitle());
    }
    
    public void testOpera() throws Throwable {
        selenium = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*opera", url);
        selenium.start();
        selenium.open("https://www.wellsfargo.com");

        assertEquals("Wells Fargo Home Page", selenium.getTitle());
    }

}
