package org.openqa.selenium;

import com.thoughtworks.selenium.Wait;
import org.testng.annotations.Test;

public class FidelityTest extends AbstractTest {
    @Test
    public void stockSearch() {
        selenium.open("https://www.fidelity.com/");
        selenium.click("link=Research");
        selenium.click("link=Quotes");
        selenium.waitForPageToLoad("30000");
        selenium.selectFrame("body");
        selenium.selectFrame("content");
        selenium.type("SID_VALUE_ID", "AAPL");
        selenium.click("submit");
        selenium.waitForPageToLoad("30000");
        selenium.select("research_option0", "label=Charts");
        new Wait() {
            @Override
            public boolean until() {
                return selenium.isElementPresent("//img[contains(@src,'https://scs.fidelity.com/research/images/go.gif')]");
            }
        }.wait("couldn't find go button");
        selenium.click("//img[contains(@src,'https://scs.fidelity.com/research/images/go.gif')]");
        selenium.waitForPageToLoad("30000");
    }
}
