package org.openqa.selenium.thirdparty;

import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

import com.thoughtworks.selenium.SeleneseTestNgHelper;

public class BestBuyTest extends SeleneseTestNgHelper {

    public static String TIMEOUT = "30000";

    @Test
    public void searchAndSignup() {
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
    }
}
