package com.thoughtworks.selenium;

import junit.framework.*;

public class MockBrowserTest extends TestCase {
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
        assertEquals("Incorrect title", "x", sel.getTitle());
        assertTrue("alert wasn't present", sel.isAlertPresent());
        assertArrayEquals("getAllButtons should return one empty string", new String[]{""}, sel.getAllButtons());
        assertArrayEquals("getAllLinks was incorrect", new String[]{"1"}, sel.getAllLinks());
        assertArrayEquals("getAllFields was incorrect", new String[]{"1", "2", "3"}, sel.getAllFields());
        
    }
    
    private void assertArrayEquals(String message, String[] expected, String[] actual) {
        if (expected == null && actual == null) {
            return;
        }
        assertEquals(message, arrayToString(expected), arrayToString(actual));
    }
    
    private String arrayToString(String[] array) {
        if (array == null) return "null";
        int lastIndex = array.length - 1;
        StringBuffer sb = new StringBuffer('[');
        for (int i = 0; i < array.length; i++) {
            sb.append(array[i]);
            if (i != lastIndex) {
                sb.append(';');
            }
        }
        sb.append("] length=");
        sb.append(array.length);
        return sb.toString();
    }
}
