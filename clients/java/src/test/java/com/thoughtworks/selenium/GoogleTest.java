package com.thoughtworks.selenium;

import junit.framework.*;

import org.openqa.selenium.server.*;

public class GoogleTest extends TestCase
{
   private Selenium selenium;

   public void setUp() throws Exception {
        String url = "http://www.google.com";
       selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*firefox", url);
       selenium.start();
    }
   
   protected void tearDown() throws Exception {
       selenium.stop();
   }
   
   public void testGoogleTestSearch() throws Throwable {
		selenium.open("http://www.google.com/webhp");
        String[] windowNames = selenium.getAllWindowNames();
        for (String windowName : windowNames) {
            System.out.println("Window Name: " + windowName);
        }
        String[] windowIds = selenium.getAllWindowIds();
        for (String windowId : windowIds) {
            System.out.println("Window Id: " + windowId);
        }
        String[] windowTitles = selenium.getAllWindowTitles();
        for (String windowTitle : windowTitles) {
            System.out.println("Window Title: " + windowTitle);
        }
        assertEquals("Google", selenium.getTitle());
		selenium.type("q", "Selenium OpenQA");
		assertEquals("Selenium OpenQA", selenium.getValue("q"));
        String s = selenium.getLogMessages();
        System.out.println("The log messages are the following:\n" + s);
		selenium.click("btnG");
		selenium.waitForPageToLoad("5000");
        assertTrue(selenium.isTextPresent("openqa.org"));
		assertEquals("Selenium OpenQA - Google Search", selenium.getTitle());
	}
	
}
