package com.thoughtworks.selenium;

import org.openqa.selenium.server.RemoteControlConfiguration;

import junit.framework.TestCase;

public class SessionExtensionJsTest extends TestCase {
    private static final String TEST_URL = "http://www.google.com";
    
    private Selenium getNewSelenium() {
        return new DefaultSelenium("localhost",
            RemoteControlConfiguration.getDefaultPort(), "*firefox", TEST_URL);
    }
    
    private void runCommands(Selenium selenium) {
        selenium.start();
        selenium.open(TEST_URL);
        selenium.type("q", "Klaatu barada nikto");
        selenium.click("javascript{ 'b' + comeGetSome + 'G' }");
        selenium.waitForPageToLoad("5000");
    }
    
    public void testLoadSimpleExtensionJs() {
        // expect failure when the extension isn't set
        Selenium selenium = getNewSelenium();
        try {
            runCommands(selenium);
            fail("Expected SeleniumException but none was encountered");
        }
        catch (SeleniumException se) {
            assertTrue(se.getMessage().endsWith("comeGetSome is not defined"));
        }
        finally {
            selenium.stop();
        }

        // everything is peachy when the extension is set
        selenium = getNewSelenium();
        selenium.setExtensionJs("var comeGetSome = 'tn';");
        runCommands(selenium);
        assertEquals("Klaatu barada nikto - Google Search",
            selenium.getTitle());
        selenium.stop();
        
        // reusing the session ... extension should still be available
        runCommands(selenium);
        assertEquals("Klaatu barada nikto - Google Search",
            selenium.getTitle());
        selenium.stop();
    }
}