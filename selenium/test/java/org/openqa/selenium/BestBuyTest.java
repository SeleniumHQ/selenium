package org.openqa.selenium;

import org.testng.annotations.Test;
import static org.testng.Assert.*;

public class BestBuyTest extends AbstractTest {
    @Test
    public void searchAndSignup() {
        try {
            selenium.open("http://www.bestbuy.com/");
            selenium.click("st");
            selenium.click("link=Nintendo - Wii");
            selenium.waitForPageToLoad("30000");
            selenium.click("&lid=accessories");
            selenium.waitForPageToLoad("30000");
            selenium.click("addtowishlist");
            selenium.waitForPageToLoad("30000");
            selenium.click("link=create one now");
            selenium.type("TxtFirstName", "Patrick");
            selenium.type("TxtLastName", "Lightbody");
            selenium.click("CmdCreate");
            assertTrue(selenium.isTextPresent("Please enter your e-mail address"));
            assertTrue(selenium.isTextPresent("Please enter your password"));
            assertTrue(selenium.isTextPresent("Please enter a 5-digit ZIP code"));
        } catch (Throwable t) {
            fail("BestBuyTest.searchAndSignup", t);
        }

        pass("BestBuyTest.searchAndSignup");
    }
}
