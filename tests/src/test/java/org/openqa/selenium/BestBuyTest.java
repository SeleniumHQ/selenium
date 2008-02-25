package org.openqa.selenium;

import org.testng.annotations.Test;
import static org.testng.Assert.*;

public class BestBuyTest extends AbstractTest {

    public static String TIMEOUT = "30000";

    @Test
    public void searchAndSignup() {
        try {
            selenium.open("http://www.bestbuy.com/");
            selenium.type("st", "Wii");
            selenium.click("goButton");
            selenium.waitForPageToLoad(TIMEOUT);
            selenium.click("link=Nintendo - Wii");
            selenium.waitForPageToLoad(TIMEOUT);
            selenium.click("&lid=accessories");
            selenium.waitForPageToLoad(TIMEOUT);
            selenium.click("addtowishlist");
            selenium.waitForPageToLoad(TIMEOUT);
            selenium.click("link=create one now");
            selenium.waitForPageToLoad(TIMEOUT);
            selenium.type("TxtFirstName", "Patrick");
            selenium.type("TxtLastName", "Lightbody");
            selenium.click("CmdCreate");
            selenium.waitForPageToLoad(TIMEOUT);
            assertTrue(selenium.isTextPresent("Please enter your e-mail address"));
            assertTrue(selenium.isTextPresent("Please enter your password"));
            assertTrue(selenium.isTextPresent("Please enter a 5-digit ZIP code"));
        } catch (Throwable t) {
            fail("BestBuyTest.searchAndSignup", t);
        }

        pass("BestBuyTest.searchAndSignup");
    }
}
