package org.openqa.selenium;

import org.testng.annotations.Test;

public class FidelityTest extends AbstractTest {
    @Test
    public void stockSearch() {
        try {
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
            selenium.click("//img[contains(@src,'https://scs.fidelity.com/research/images/go.gif')]");
            selenium.waitForPageToLoad("30000");
            selenium.waitForPopUp("_top", "30000");
            Thread.sleep(5000);
            selenium.selectWindow("body");
            selenium.click("link=Advanced Chart");
            selenium.waitForPageToLoad("30000");
            selenium.click("trendline");
            selenium.click("//input[@value='Erase Trendlines']");
        } catch (Throwable t) {
            fail("FidelityTest.stockSearch", t);
        }

        pass("FidelityTest.stockSearch");
    }
}
