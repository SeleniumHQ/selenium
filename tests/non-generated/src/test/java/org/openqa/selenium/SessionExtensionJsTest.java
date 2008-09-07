package org.openqa.selenium;

import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.SeleneseTestNgHelper;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

public class SessionExtensionJsTest extends SeleneseTestNgHelper {

    private Selenium privateSelenium;
    private String host, browser;
    private int port;
    
    private static final String TEST_URL = "http://localhost:4444/selenium-server/tests/html/test_click_page1.html";

    @BeforeMethod
    @Parameters({"selenium.host", "selenium.port", "selenium.browser"})
    public void privateSetUp(@Optional("localhost") String host, @Optional("4444") String port, @Optional String browser) {
        if (browser == null) browser = runtimeBrowserString();
        this.host = host;
        this.port = Integer.parseInt(port);
        this.browser = browser;
        privateSelenium = getNewSelenium();
    }
    
    @AfterMethod(alwaysRun=true)
    public void privateTearDown(){
        if (privateSelenium != null) privateSelenium.stop();
    }

    @Test
    public void expectFailureWhenExtensionNotSet() {
        try {
            runCommands(privateSelenium);
            fail("Expected SeleniumException but none was encountered");
        }
        catch (SeleniumException se) {
            assertTrue(se.getMessage().endsWith("comeGetSome is not defined"));
        }
    }
    
    @Test
    public void loadSimpleExtensionJs() {
        // everything is peachy when the extension is set
        privateSelenium.setExtensionJs("var comeGetSome = 'in';");
        runCommands(privateSelenium);
        assertEquals("Click Page Target", privateSelenium.getTitle());
        privateSelenium.stop();
        
        // reusing the session ... extension should still be available
        runCommands(privateSelenium);
        assertEquals("Click Page Target", privateSelenium.getTitle());
    }

    private Selenium getNewSelenium() {
        return new DefaultSelenium(host, port, browser, TEST_URL);
    }

    private void runCommands(Selenium selenium) {
        selenium.start();
        selenium.open(TEST_URL);
        selenium.click("javascript{ 'l' + comeGetSome + 'k' }");
        selenium.waitForPageToLoad("5000");
    }

}