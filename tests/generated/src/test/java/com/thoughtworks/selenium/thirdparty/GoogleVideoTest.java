package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.SeleneseTestCase;

public class GoogleVideoTest extends SeleneseTestCase {
    
    public void testGoogle() {
        selenium.open("http://video.google.com");
        selenium.type("q", "hello world");
        selenium.click("search-button");
        selenium.waitForPageToLoad("5000");
    }
}
