package com.thoughtworks.selenium.thirdparty;

import junit.framework.TestCase;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class GoogleVideoTest extends TestCase {
    private Selenium sel;

    public void setUp() {
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
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
