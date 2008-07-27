package com.thoughtworks.selenium.thirdparty;

import junit.framework.*;

import org.openqa.selenium.server.*;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class AttachFileTest extends TestCase {
    private Selenium selenium;

    public void setUp() throws Exception {
        String url = "http://www.snipshot.com";
        selenium = new DefaultSelenium("localhost", RemoteControlConfiguration.getDefaultPort(), "*chrome", url);
        selenium.start();
    }

    protected void tearDown() throws Exception {
        selenium.stop();
    }

    public void testAttachfile() throws Throwable {
		selenium.open("/");
		assertEquals("Snipshot: Edit pictures online", selenium.getTitle());
		
		selenium.attachFile("file", "http://www.google.com/intl/en_ALL/images/logo.gif");
		
		for (int second = 0;; second++) {
			if (second >= 60) fail("timeout");
			try { if (selenium.isElementPresent("save")) break; } catch (Exception e) {}
			Thread.sleep(1000);
		}
		assertTrue(selenium.isElementPresent("resize"));
		assertTrue(selenium.isElementPresent("crop"));
        
        
    }

}
