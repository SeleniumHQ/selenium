package com.thoughtworks.selenium;

public class TestLargeHtml extends SeleneseTestCase {
    public void testLargeHtml() {
        selenium.open("/selenium-server/tests/html/test_large_html.html");
        String source = selenium.getHtmlSource().trim();
        String expectedEndsWith = "</body>";
        int index = source.length() - expectedEndsWith.length();
        String actualEndsWith = source.substring(index).toLowerCase();
        assertEquals("source doesn't end correctly", expectedEndsWith, actualEndsWith);
    }
}
