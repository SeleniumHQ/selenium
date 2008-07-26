package com.thoughtworks.selenium;

import java.awt.event.KeyEvent;

public class TestNativeKeys extends SeleneseTestCase {
    public void testKeyPressNative() {
        selenium.open("/selenium-server/tests/html/test_type_page1.html");
        selenium.focus("username");
        selenium.keyPressNative(Integer.toString(KeyEvent.VK_H));
        assertEquals("h", selenium.getValue("username"));
    }
}
