import junit.framework.TestCase;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class ExampleSeleniumTest extends TestCase {

    private Selenium browser;

    public void setUp() {
        browser = new DefaultSelenium("localhost", 4444, "*firefox",
                "http://bankofscotland.co.uk/");
        browser.start();
    }

    public void testGoogleImFeelingLucky() throws InterruptedException {
        browser.showContextualBanner();
        browser.open("/");
// Banking_HomePage_Signin
        browser.click("xpath=id('primaryarea-personal')//div[@class = \"login\"]/a");
        browser.waitForPageToLoad("5000");
Thread.sleep(10000);

        // are we at erlang.org ?
        assertEquals("Erlang", browser.getTitle());
    }

    public void tearDown() {
        browser.stop();
    }
}
