import junit.framework.TestCase;
import com.thoughtworks.selenium.*;

import java.lang.String;

public class YahooTest extends TestCase {

    private Selenium browser;

    public void setUp() {
        browser = new DefaultSelenium("localhost", 4444, "*firefox",
                "http://www.yahoo.com");
        browser.start();
    }

    public void testYahooRegistrationUIElements() throws InterruptedException {
        browser.showContextualBanner();
        browser.open("/");
        browser.waitForPageToLoad("5000");
        assertEquals("Yahoo!", browser.getTitle());

        browser.click("link=Sign In");
        browser.waitForPageToLoad("5000");
        assertEquals("Sign in to Yahoo!", browser.getTitle());

        browser.click("link=Sign Up");
        browser.waitForPageToLoad("5000");
        assertEquals("Yahoo! Registration", browser.getTitle());

        // verifying options in the gender dropdown list
        String[] genderOptions = browser.getSelectOptions("gender");
        assertEquals("- Select One -", genderOptions[0]);
        assertEquals("Male", genderOptions[1]);
        assertEquals("Female", genderOptions[2]);

        // verifying checkbox is unchecked, then checked for the terms of
        // service agreement checkbox
        assertFalse(browser.isChecked("tos_agreed_o_0"));
        browser.check("tos_agreed_o_0");
        assertTrue(browser.isChecked("tos_agreed_o_0"));

        // verifying that the given text is present on the page
        assertTrue(browser.isTextPresent("Create My Account"));

    }

    public void tearDown() {
        browser.stop();
    }
}