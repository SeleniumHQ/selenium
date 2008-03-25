import junit.framework.TestCase;
import com.thoughtworks.selenium.*;

public class ExampleSeleniumTest extends TestCase {
	
	private Selenium browser;
	    public void setUp() {
	        browser = new DefaultSelenium("localhost",
	            4444, "*firefox", "http://www.google.com");
	        browser.start();
	    }

	    public void testGoogle() {
	        browser.open("/webhp?hl=en");
	        browser.type("q", "hello world");
	        browser.click("btnG");
	        browser.waitForPageToLoad("5000");
	        assertEquals("hello world - Google Search", browser.getTitle());
	    }

	    public void tearDown() {
	        browser.stop();
	    }
}
