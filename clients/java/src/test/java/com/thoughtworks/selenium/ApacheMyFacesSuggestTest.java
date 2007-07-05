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
    
    private boolean shouldSkip() {
        String browserOverride = System.getProperty("selenium.forcedBrowserMode");
        if (browserOverride == null) return false;
        String name = getName();
        if (name == null) throw new NullPointerException("Test name is null!");
        String browserName;
        if (name.endsWith("Firefox")) {
            browserName = "firefox";
        } else if (name.endsWith("IExplore")) {
            browserName = "iexplore";
        } else {
            throw new RuntimeException("Test name unexpected: " + getName());
        }
        if (isProxyInjectionMode) {
            browserName = "*pi" + browserName;
        } else {
            browserName = "*" + browserName;
        }
        
        if (!browserName.equals(browserOverride)) {
            System.err.println("WARNING!!! Skipping " + getName());
            return true;
        }
        return false;
    }
    
    public void testAJAXFirefox() throws Throwable {
        if (shouldSkip()) return;
        selenium = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*firefox", "http://www.irian.at");
        selenium.start();

        selenium.open("http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html");
        selenium.keyPress(inputId, "\\74");
        Thread.sleep(500);
        selenium.keyPress(inputId, "\\97");
        selenium.keyPress(inputId, "\\110");
        new Wait() {
            public boolean until() {
                String text = selenium.getText(updateId);
                return "Jane Agnews".equals(text);
            }
        }.wait("Didn't find 'Jane Agnews' in updateId");
        selenium.keyPress(inputId, "\\9");
        new Wait() {
            public boolean until() {
                return "Jane Agnews".equals(selenium.getValue(inputId));
            }
        }.wait("Didn't find 'Jane Agnews' in inputId");
    }
    
    public void testAJAXIExplore() throws Throwable {
        if (!WindowsUtils.thisIsWindows()) return;
        if (shouldSkip()) return;
        selenium = new DefaultSelenium("localhost", SeleniumServer.getDefaultPort(), "*iexplore", "http://www.irian.at");
        selenium.start();

        selenium.open("http://www.irian.at/selenium-server/tests/html/ajax/ajax_autocompleter2_test.html");
        selenium.type(inputId, "J");
        selenium.keyDown(inputId, "\\74");
        Thread.sleep(500);
        selenium.type(inputId, "Jan");
        selenium.keyDown(inputId, "\\110");
        new Wait() {
            public boolean until() {
                return "Jane Agnews".equals(selenium.getText(updateId));
            }
        }.wait("Didn't find 'Jane Agnews' in updateId");
        
        selenium.keyDown(inputId, "\\13");
        new Wait() {
            public boolean until() {
                return "Jane Agnews".equals(selenium.getValue(inputId));
            }
        }.wait("Didn't find 'Jane Agnews' in inputId");
    }
    
    public void tearDown() {
        if (selenium == null) return;
        selenium.stop();
    }
}
