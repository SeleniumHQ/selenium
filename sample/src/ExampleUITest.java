import junit.framework.TestCase;
import com.thoughtworks.selenium.*;

import java.lang.String;

public class ExampleUITest extends TestCase {

    private Selenium browser;

    public void setUp() {
        browser = new DefaultSelenium("localhost",
                4444, "*firefox", "http://www.google.com");
        browser.start();
    }

    public void testBrowsingGmailHelp() throws Exception {
        browser.showContextualBanner();
        browser.open("/");
        browser.click("link=Gmail");
        browser.waitForPageToLoad("30000");
        browser.click("link=I cannot access my account");
        browser.waitForPageToLoad("30000");
        browser.click("//input[@name='LoginProblem']");

        //check if hidden div "Username" is visible on the page
        assertTrue(browser.isVisible("//div[@id='Username']/table/tbody/tr/td/p/strong"));

        browser.click("//input[@name='Username']");

        //check if hidden div "YesUsername" is visible on the page
        assertTrue(browser.isVisible("//div[@id='YesUsername']/table/tbody/tr/td/p/strong"));
    }

    public void tearDown() {
        browser.stop();
    }
}
