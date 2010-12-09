package org.openqa.selenium;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TestLargeHtml extends InternalSelenseTestNgBase {
    @Test public void testLargeHtml() {
        selenium.open("/selenium-server/tests/html/test_large_html.html");
        String source = selenium.getHtmlSource().trim();
        String expectedEndsWith = "</body>";
        int index = source.length() - expectedEndsWith.length();
        String actualEndsWith = source.substring(index).toLowerCase();
        Assert.assertEquals(actualEndsWith, expectedEndsWith, "source doesn't end correctly");
    }
}
