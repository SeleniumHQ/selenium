package org.openqa.selenium.thirdparty;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class BBCTest extends SeleneseTestNgHelper {
    @Test
    public void haveYourSaySignup() {
        selenium.open("http://www.bbc.co.uk/?ok");
        selenium.type("searchfield", "iraq");
        selenium.click("Search");
        selenium.waitForPageToLoad("30000");
        assertTrue(selenium.isTextPresent("Results from All of the BBC"));
        selenium.click("link=Home");
        selenium.waitForPageToLoad("30000");
        selenium.click("link=News");
        selenium.waitForPageToLoad("30000");
        selenium.click("link=Have Your Say");
        selenium.waitForPageToLoad("30000");
        selenium.click("link=exact:Have you got a good story? What do you want to talk about?");
        selenium.waitForPageToLoad("30000");
        selenium.click("link=Click here to participate in the debate");
        selenium.waitForPageToLoad("30000");
        selenium.click("//img[@alt='Create your membership']");
        selenium.waitForPageToLoad("30000");
        selenium.click("//input[@src='/newsandsportsso/haveyoursay/sso_resources/images/buttons/goto2_1.gif']");
        selenium.waitForPageToLoad("30000");
        assertTrue(selenium.isTextPresent("You left both passwords blank"));

    }
}
