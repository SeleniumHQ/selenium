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
    
    public void setUp() throws Exception {
        // if/when a proxy injection browser launcher comes into being, its
        // default URL will need to be injected w/ appropriate js; i.e., 
        // 1. in jetty, load SeleneseRunner.html as a resource,
        // 2. inject js into it        
        //super.setUp("http://www.adyn.com", "*custom c:/PROGRA~1/MOZILL~1/firefox.exe");
        super.setUp("http://www.adyn.com", "*custom c:/PROGRA~1/INTERN~1/iexplore.exe");
    }
}
