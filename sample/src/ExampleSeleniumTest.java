import junit.framework.TestCase;
import com.thoughtworks.selenium.*;

public class ExampleSeleniumTest extends TestCase {
	
	private Selenium browser;
	    public void setUp() {
	        browser = new DefaultSelenium("localhost",
	            4444, "*firefox", "http://www.google.com");
	        browser.start();
	    }

	    public void testGoogleForSomeThings() throws InterruptedException {
	        browser.showContextualBanner();
	        browser.open("/webhp?hl=en");
	        browser.type("name=q", "hello world");
	        browser.click("btnG");
	        browser.waitForPageToLoad("5000");
	        assertEquals("hello world - Google Search", browser.getTitle());
	        browser.type("name=q", "two");
	        browser.click("btnG");
	        browser.type("name=q", "three");
	        browser.click("btnG");
	        browser.type("name=q", "four");
	        browser.click("btnG");
	        browser.type("name=q", "five");
	        browser.click("btnG");
	        browser.type("name=q", "six");
	        browser.click("btnG");
	        browser.type("name=q", "seven");
	        browser.click("btnG");
	
			// no need for you to keep this sleep. Delete it to speed things up
			Thread.sleep(10 * 1000);
	    }

	    public void tearDown() {
	        browser.stop();
	    }
}
