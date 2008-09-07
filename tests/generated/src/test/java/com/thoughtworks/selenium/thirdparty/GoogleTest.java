package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.SeleneseTestCase;

public class GoogleTest extends SeleneseTestCase {

    public void testGoogle() throws Throwable {
        selenium.open("http://www.google.com/webhp?hl=en");

        assertEquals("Google", selenium.getTitle());
        selenium.type("q", "Selenium OpenQA");
        assertEquals("Selenium OpenQA", selenium.getValue("q"));
        selenium.click("btnG");
        selenium.waitForPageToLoad("5000");
        assertEquals("Selenium OpenQA - Google Search", selenium.getTitle());
    }

}
