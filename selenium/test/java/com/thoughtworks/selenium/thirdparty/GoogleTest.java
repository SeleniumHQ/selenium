package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class GoogleTest extends SeleneseTestNgHelper {

    @Test
    public void testGoogle() throws Throwable {
        selenium.open("http://www.google.com/webhp?hl=en");

        assertEquals(selenium.getTitle(), "Google");
        selenium.type("q", "Selenium OpenQA");
        assertEquals(selenium.getValue("q"), "Selenium OpenQA");
        selenium.click("btnG");
        selenium.waitForPageToLoad("5000");
        assertEquals(selenium.getTitle(), "Selenium OpenQA - Google Search");
    }

}
