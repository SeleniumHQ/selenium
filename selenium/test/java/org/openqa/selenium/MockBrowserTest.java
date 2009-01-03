package org.openqa.selenium;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class MockBrowserTest {
    Selenium sel;
    public void setUp() {
        sel = new DefaultSelenium("localhost", 4444, "*mock", "http://x");
        sel.start();
    }
    
    public void tearDown() {
        sel.stop();
    }
    
    public void testMock() {
        sel.open("/");
        sel.click("foo");
        assertEquals(sel.getTitle(), "x", "Incorrect title");
        assertTrue(sel.isAlertPresent(), "alert wasn't present");
        assertEquals(sel.getAllButtons(), (new String[]{""}), "getAllButtons should return one empty string");
        assertEquals(sel.getAllLinks(), (new String[]{"1"}), "getAllLinks was incorrect");
        assertEquals(sel.getAllFields(), (new String[]{"1", "2", "3"}), "getAllFields was incorrect");
        
    }
    
}
