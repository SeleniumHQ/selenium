import junit.framework.TestCase;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.condition.JUnitConditionRunner;
import com.thoughtworks.selenium.condition.Text;

public class ExampleUsingConditionsTest extends TestCase {

    private Selenium browser;
    private JUnitConditionRunner conditionRunner;

    public void setUp() {
        browser = new DefaultSelenium("localhost", 4444, "*firefox",
                "http://www.francisshanahan.com");
        browser.start();
        /*
         * Conditional Runner can be used to wait for conditions to be true
         * before continuing on. In the example below, the runner is waiting for
         * text to be present from the AJAX control on the given webpage.
         */
        conditionRunner = new JUnitConditionRunner(browser);
    }

    public void testWaitForAJAXToLoad() throws InterruptedException {
        browser.showContextualBanner();
        // relative URL is correct idiom for open()
        browser.open("/zuggest.aspx");
        browser.waitForPageToLoad("5000");
        browser.type("txtKeywords", "Neal Ford");
        browser.select("idx", "Books");
        conditionRunner.waitFor(new Text("The"));
    }

    public void tearDown() {
        browser.stop();
    }
}
