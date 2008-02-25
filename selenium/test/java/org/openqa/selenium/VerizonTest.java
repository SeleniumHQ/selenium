package org.openqa.selenium;

import org.testng.annotations.Test;

public class VerizonTest extends AbstractTest {
    @Test
    public void signUp() {
        try {
            selenium.setTimeout("60000");
            selenium.open("http://www22.verizon.com/");
            selenium.click("link=Set Up New Phone Service");
            selenium.waitForPageToLoad("30000");
            selenium.click("//a[@href=\"/ForYourHome/NewConnect/OrderWelcomeSignin.aspx\"]");
            selenium.waitForPageToLoad("30000");
            selenium.type("txtSTREET_ADDRESS1", "49 Bonnie Lane");
            selenium.type("txtCITY", "Dedham");
            selenium.select("lstSTATE", "label=MA");
            selenium.type("txtZIP_CODE", "02026");
            selenium.click("imgNext");
            selenium.waitForPageToLoad("30000");
            selenium.click("//img[@alt='next']");
            selenium.waitForPageToLoad("30000");
            selenium.click("btnGetItNow");
            selenium.waitForPageToLoad("30000");
        } catch (Throwable t) {
            fail("VerizonTest.signUp", t);
        }

        pass("VerizonTest.signUp");
    }
}
