import com.thoughtworks.selenium.SeleneseTestCase;

/**
 * @author nelsons
 */
public class TestProxy extends SeleneseTestCase
{
	public void testProxy() throws Throwable {
		selenium.setContext("Test Proxy", "info");
		selenium.open("http://www.adyn.com");
		assertTrue(selenium.isTextPresent("Nelson Sproul"));
		selenium.open("http://www.google.com");
		assertTrue(selenium.isTextPresent("Advanced Search"));
	}
}
