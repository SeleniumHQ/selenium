import junit.framework.TestCase;
import com.thoughtworks.selenium.*;
import com.thoughtworks.selenium.condition.*;


public class ExampleUsingConditionsTest extends TestCase {
	
	private Selenium browser;
	    public void setUp() {
	        browser = new DefaultSelenium("localhost",
	            4444, "*firefox", "http://www.google.com");
	        browser.start();
	    }

		/*	
			Conditional Runner can be used to wait for conditions 
			to be true before continuing on. In the example below, 
			the runner is waiting for text to be present from the AJAX control 
			on the given webpage.
		*/
					
		public void testWaitForAJAXToLoad() throws InterruptedException {
			JUnitConditionRunner conditionRunner = new JUnitConditionRunner(browser);
			browser.open("http://www.ajax.org");
			
			assertTrue(browser.isVisible("loadscreen"));
			conditionRunner.waitFor(new Text("Ajax stands for Asynchronous Javascript And XML"));
			assertFalse(browser.isVisible("loadscreen"));
			}


	    public void tearDown() {
	        browser.stop();
	    }
}
