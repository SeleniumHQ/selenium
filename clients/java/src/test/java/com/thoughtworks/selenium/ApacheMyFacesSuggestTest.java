package com.thoughtworks.selenium;

import junit.framework.*;

import org.openqa.selenium.server.*;
import org.openqa.selenium.server.browserlaunchers.*;

/**
 * A test of the Apache MyFaces JSF AJAX auto-suggest sandbox application at www.irian.at.
 *  
 * 
 *  @author danielf
 *
 */
public class ApacheMyFacesSuggestTest extends TestCase {

    DefaultSelenium selenium;
    
    protected void setUp() throws Exception {
    }
    
    public void testAJAXFirefox() throws Throwable {
        selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*firefox", "http://www.irian.at");
        selenium.start();

		String inputId = "ac4";
		String updateId = "ac4update";

        selenium.open("http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html");
		selenium.keyPress(inputId, "\\74");
		Thread.sleep(500);
		selenium.keyPress(inputId, "\\97");
		selenium.keyPress(inputId, "\\110");
		Thread.sleep(500);
		assertEquals("Jane Agnews", selenium.getText(updateId));
		selenium.keyPress(inputId, "\\9");
		Thread.sleep(500);
		assertEquals("Jane Agnews", selenium.getValue(inputId));
    }
    
    public void testAJAXIExplore() throws Throwable {
        if (!WindowsUtils.thisIsWindows()) return;
        selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*iexplore", "http://www.irian.at");
        selenium.start();

		String inputId = "ac4";
		String updateId = "ac4update";

        selenium.open("http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html");
		selenium.type(inputId, "J");
		selenium.keyDown(inputId, "\\74");
		Thread.sleep(500);
		selenium.type(inputId, "Jan");
		selenium.keyDown(inputId, "\\110");
		Thread.sleep(500);
		assertEquals("Jane Agnews", selenium.getText(updateId));
		selenium.keyDown(inputId, "\\13");
		Thread.sleep(500);
		assertEquals("Jane Agnews", selenium.getValue(inputId));
    }
    
	public void tearDown() {
        if (selenium == null) return;
        selenium.stop();
    }
}
