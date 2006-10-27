package com.thoughtworks.selenium;

import junit.framework.*;

import org.openqa.selenium.server.*;
import org.openqa.selenium.server.browserlaunchers.*;

/**
 * A test of the Apache MyFaces JSF AJAX auto-suggest sandbox application at www.irian.at.
 *  
 * 
 *  @author danielf
 *
 */
public class ApacheMyFacesSuggestTest extends TestCase {

    DefaultSelenium selenium;
    boolean isProxyInjectionMode;
    private static final String updateId = "ac4update";
    private static final String inputId = "ac4";
    
    protected void setUp() throws Exception {
        isProxyInjectionMode = System.getProperty("selenium.proxyInjectionMode")!=null
            && System.getProperty("selenium.proxyInjectionMode").equals("true");
    }
    
    public void testAJAXFirefox() throws Throwable {
        String browserOverride = System.getProperty("selenium.forcedBrowserMode");
        if (browserOverride!=null && isProxyInjectionMode && !browserOverride.equals("*pifirefox")) {
            // in PI mode, this firefox-specific test will only succeed if the browser mode override is *pifirefox.  Otherwise, just give up.
            return;
        }
        selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*firefox", "http://www.irian.at");
        selenium.start();

        selenium.open("http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html");
        selenium.keyPress(inputId, "\\74");
        Thread.sleep(500);
        selenium.keyPress(inputId, "\\97");
        selenium.keyPress(inputId, "\\110");
        new Wait("Didn't find 'Jane Agnews' in updateId") {
            boolean until() {
                String text = selenium.getText(updateId);
                return "Jane Agnews".equals(text);
            }
        };
        selenium.keyPress(inputId, "\\9");
        new Wait("Didn't find 'Jane Agnews' in inputId") {
            boolean until() {
                return "Jane Agnews".equals(selenium.getValue(inputId));
            }
        };
    }
    
    public void testAJAXIExplore() throws Throwable {
        if (!WindowsUtils.thisIsWindows()) return;
        String browserOverride = System.getProperty("selenium.forcedBrowserMode");
        if (browserOverride!=null && isProxyInjectionMode && !browserOverride.equals("*piiexplore")) {
            // in PI mode, this firefox-specific test will only succeed if the browser mode override is *piiexplore.  Otherwise, just give up.
            return;
        }
        selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*iexplore", "http://www.irian.at");
        selenium.start();

        selenium.open("http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html");
        selenium.type(inputId, "J");
        selenium.keyDown(inputId, "\\74");
        Thread.sleep(500);
        selenium.type(inputId, "Jan");
        selenium.keyDown(inputId, "\\110");
        new Wait("Didn't find 'Jane Agnews' in updateId") {
            boolean until() {
                return "Jane Agnews".equals(selenium.getText(updateId));
            }
        };
        selenium.keyDown(inputId, "\\13");
        new Wait("Didn't find 'Jane Agnews' in inputId") {
            boolean until() {
                return "Jane Agnews".equals(selenium.getValue(inputId));
            }
        };
    }
    
    public void tearDown() {
        if (selenium == null) return;
        selenium.stop();
    }
}
