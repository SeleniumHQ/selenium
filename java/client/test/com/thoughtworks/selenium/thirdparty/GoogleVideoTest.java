package com.thoughtworks.selenium.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.testng.annotations.Test;

public class GoogleVideoTest extends InternalSelenseTestBase {
    
    @Test(dataProvider = "system-properties")
    public void testGoogle() {
        selenium.open("http://video.google.com");
        selenium.type("q", "hello world");
        selenium.click("search-button");
        selenium.waitForPageToLoad("5000");
    }
}
