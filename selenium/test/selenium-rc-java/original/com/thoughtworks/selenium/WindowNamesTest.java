package com.thoughtworks.selenium;

import junit.framework.*;

import org.openqa.selenium.server.*;

public class WindowNamesTest extends TestCase
{
   private Selenium selenium;

   public void setUp() throws Exception {
        String url = "http://www.google.com";
       selenium = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*firefox", url);
       selenium.start();
    }
   
   protected void tearDown() throws Exception {
       selenium.stop();
   }
   
   public void testWindowNames() throws Throwable {
		selenium.open("http://www.google.com/webhp");
        
		assertEquals("Google", selenium.getTitle());
		String[] windowNames = selenium.getAllWindowNames();
        for (int i = 0; i < windowNames.length; i++) {
            String windowName = windowNames[i];
            System.out.println("Window Name: " + windowName);
        }
        selenium.selectWindow(null);
        String[] windowIds = selenium.getAllWindowNames();
        for (int i = 0; i < windowIds.length; i++) {
            String windowId = windowIds[i];
            System.out.println("Window Id: " + windowId);
        }
        String[] windowTitles = selenium.getAllWindowTitles();
        for (int i = 0; i < windowTitles.length; i++) {
            String windowTitle = windowTitles[i];
            System.out.println("Window Title: " + windowTitle);
        }
        //selenium.setSpeed("500");
        selenium.selectWindow("");
        selenium.selectWindow("Google");
        
		selenium.type("q", "Selenium OpenQA");
		assertEquals("Selenium OpenQA", selenium.getValue("q"));
        // TODO DGF pulling over the logs seems to be breaking the build
		// String s = selenium.getLogMessages();
        // System.out.println("The log messages are the following:\n" + s);
		selenium.click("btnG");
		selenium.waitForPageToLoad("5000");
		
		assertEquals("Selenium OpenQA - Google Search", selenium.getTitle());
	}
	
}
