package com.thoughtworks.selenium.thirdparty;

import junit.framework.TestCase;

import org.openqa.selenium.server.SeleniumServer;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class GoogleVideoTest extends TestCase {
    private Selenium sel;
    private SeleniumServer selServer;

    public void setUp() {
        try {
            selServer = new SeleniumServer();
            SeleniumServer.setProxyInjectionMode(true);
            SeleniumServer.setBrowserSideLogEnabled(true);
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
