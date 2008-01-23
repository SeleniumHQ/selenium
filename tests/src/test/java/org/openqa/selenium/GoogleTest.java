package org.openqa.selenium;

import org.testng.annotations.Test;
import org.testng.Assert;
import com.thoughtworks.selenium.DefaultSelenium;

public class GoogleTest extends AbstractTest {
    @Test(groups = {"skip-*safari"})
    public void simple() {
        s.open("http://www.google.com");
        s.type("q", "OpenQA");
        s.click("btnG");
        s.waitForPageToLoad("30000");
        Assert.assertTrue(s.getBodyText().contains("premier source for quality open source QA projects"));
    }
}
