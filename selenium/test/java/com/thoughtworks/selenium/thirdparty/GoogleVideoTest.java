package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class GoogleVideoTest extends InternalSelenseTestNgBase {
    
    @Test
    public void testGoogle() {
        selenium.open("http://video.google.com");
        selenium.type("q", "hello world");
        selenium.click("search-button");
        selenium.waitForPageToLoad("5000");
    }
}
