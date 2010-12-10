package org.openqa.selenium.thirdparty;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.SkipException;
import org.testng.annotations.Test;

public class VerizonTest extends InternalSelenseTestNgBase {
    private static final String TIMEOUT = "60000";

    @Test(dataProvider = "system-properties")
    public void signUp() {
        if (true) throw new SkipException("This test is too slow!");
        selenium.setTimeout(TIMEOUT);
        selenium.open("http://www22.verizon.com/");
        selenium.click("link=Set Up New Phone Service");
        selenium.waitForPageToLoad(TIMEOUT);
        selenium.click("//a[@href=\"/ForYourHome/NewConnect/OrderWelcomeSignin.aspx\"]");
        selenium.waitForPageToLoad(TIMEOUT);
        selenium.type("txtSTREET_ADDRESS1", "49 Bonnie Lane");
        selenium.type("txtCITY", "Dedham");
        selenium.select("lstSTATE", "label=MA");
        selenium.type("txtZIP_CODE", "02026");
        selenium.click("imgNext");
        selenium.waitForPageToLoad(TIMEOUT);
        selenium.click("//img[@alt='next']");
        selenium.waitForPageToLoad(TIMEOUT);
        selenium.click("btnGetItNow");
        selenium.waitForPageToLoad(TIMEOUT);
    }
}
