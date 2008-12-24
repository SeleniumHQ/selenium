import junit.framework.TestCase;
import com.thoughtworks.selenium.*;
import com.thoughtworks.selenium.condition.*;


public class ExampleUsingConditionsTest extends TestCase {

    private Selenium browser;
    private JUnitConditionRunner conditionRunner;

    public void setUp() {
        browser = new DefaultSelenium("localhost",
                4444, "*firefox", "http://www.ajax.org");
        browser.start();
        conditionRunner = new JUnitConditionRunner(browser);
    }

    /*
             Conditional Runner can be used to wait for conditions
             to be true before continuing on. In the example below,
             the runner is waiting for text to be present from the AJAX control
             on the given webpage.
         */

    public void testWaitForAJAXToLoad() throws InterruptedException {
        browser.showContextualBanner();
        browser.open("/");

        assertTrue(browser.isVisible("loadscreen"));
        conditionRunner.waitFor(new Text("Ajax stands for Asynchronous Javascript And XML"));
        assertFalse(browser.isVisible("loadscreen"));
    }


    public void tearDown() {
        browser.stop();
    }
}
