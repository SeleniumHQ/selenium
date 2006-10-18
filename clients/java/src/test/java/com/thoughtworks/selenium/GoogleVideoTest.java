package com.thoughtworks.selenium;

import junit.framework.TestCase;
import org.openqa.selenium.server.SeleniumServer;

public class GoogleVideoTest extends TestCase {
    private Selenium sel;
    private SeleniumServer selServer;

    public void setUp() {
        try {
            selServer = new SeleniumServer();
            selServer.setProxyInjectionMode(true);
            SeleniumServer.setDebugMode(true);
            selServer.start();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        sel = new DefaultSelenium("localhost", 4444, "*pifirefox", " http://video.google.com");
        sel.start();
    }

    public void testGoogle() {
        sel.open("/");
        sel.type("q", "hello world");
        sel.click("button-search");
        sel.waitForPageToLoad("5000");
    }

    public void tearDown() {
        try {
            sel.stop();
            selServer.stop();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
