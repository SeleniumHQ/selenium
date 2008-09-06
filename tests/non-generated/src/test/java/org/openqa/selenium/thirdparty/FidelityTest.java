package org.openqa.selenium.thirdparty;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import com.thoughtworks.selenium.Wait;

public class FidelityTest extends SeleneseTestNgHelper {
    
    long timeout = 60000;
    
    @Test
    public void stockSearch() {
        selenium.open("https://www.fidelity.com/");
        selenium.click("link=Research");
        selenium.click("link=Quotes");
        selenium.waitForPageToLoad(Long.toString(timeout));
        selenium.selectFrame("body");
        selenium.selectFrame("content");
        selenium.type("SID_VALUE_ID", "AAPL");
        selenium.click("submit");
        selenium.waitForPageToLoad(Long.toString(timeout));
        selenium.select("research_option0", "label=Charts");
        new Wait() {
            @Override
            public boolean until() {
                return selenium.isElementPresent("//img[contains(@src,'https://scs.fidelity.com/research/images/go.gif')]");
            }
        }.wait("couldn't find go button", 60000);
        selenium.click("//img[contains(@src,'https://scs.fidelity.com/research/images/go.gif')]");
        selenium.waitForPageToLoad(Long.toString(timeout));
    }
}
