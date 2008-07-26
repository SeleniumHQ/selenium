package com.thoughtworks.selenium;

public class CacheBlockTest extends SeleneseTestCase {

    public void testCacheBlock() throws Exception {
        selenium.open("/selenium-server/cachedContentTest");
        String text = selenium.getBodyText();
        assertNotNull("body text should not be null", text);
        selenium.stop();
        setUp();
        selenium.open("/selenium-server/cachedContentTest");
        String text2 = selenium.getBodyText();
        assertFalse("content was cached: " + text, text.equals(text2));
    }
}
