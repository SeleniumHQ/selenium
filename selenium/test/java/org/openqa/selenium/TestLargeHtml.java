package org.openqa.selenium;

import org.testng.Assert;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class TestLargeHtml extends SeleneseTestNgHelper {
    @Test public void testLargeHtml() {
        selenium.open("/selenium-server/tests/html/test_large_html.html");
        String source = selenium.getHtmlSource().trim();
        String expectedEndsWith = "</body>";
        int index = source.length() - expectedEndsWith.length();
        String actualEndsWith = source.substring(index).toLowerCase();
        Assert.assertEquals(actualEndsWith, expectedEndsWith, "source doesn't end correctly");
    }
}
