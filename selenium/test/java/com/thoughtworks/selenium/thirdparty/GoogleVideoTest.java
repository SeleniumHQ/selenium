package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class GoogleVideoTest extends SeleneseTestNgHelper {
    
    @Test
    public void testGoogle() {
        selenium.open("http://video.google.com");
        selenium.type("q", "hello world");
        selenium.click("search-button");
        selenium.waitForPageToLoad("5000");
    }
}
