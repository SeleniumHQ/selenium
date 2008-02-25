package org.openqa.selenium;

import static org.testng.Assert.assertTrue;
import org.testng.annotations.Test;

public class BBCTest extends AbstractTest {
    @Test
    public void haveYourSaySignup() {
        try {
            selenium.open("http://www.bbc.co.uk/?ok");
            selenium.type("document.forms[2].q", "iraq");
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
        } catch (Throwable t) {
            fail("BBCTest.haveYourSaySignup", t);
        }

        pass("BBCTest.haveYourSaySignup");

    }
}
