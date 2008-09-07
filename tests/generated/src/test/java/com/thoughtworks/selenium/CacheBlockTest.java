package com.thoughtworks.selenium;

import static org.testng.Assert.*;

import org.testng.annotations.Test;

public class CacheBlockTest extends SeleneseTestNgHelper {

    @Test
    public void testCacheBlock() throws Exception {
        selenium.open("/selenium-server/cachedContentTest");
        String text = selenium.getBodyText();
        assertNotNull("body text should not be null", text);
        selenium.stop();
        
        selenium.start();
        selenium.open("/selenium-server/cachedContentTest");
        String text2 = selenium.getBodyText();
        assertFalse("content was cached: " + text, text.equals(text2));
    }
}
