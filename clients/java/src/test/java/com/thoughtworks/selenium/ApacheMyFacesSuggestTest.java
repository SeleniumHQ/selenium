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
    
    protected void setUp() throws Exception {
    }
    
    public void testAJAXFirefox() throws Throwable {
        selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*firefox", "http://www.irian.at");
        selenium.start();
        ajaxTester();
    }
    
    public void testAJAXIExplore() throws Throwable {
        if (!WindowsUtils.thisIsWindows()) return;
        selenium = new DefaultSelenium("localhost", SeleniumServer.DEFAULT_PORT, "*iexplore", "http://www.irian.at");
        selenium.start();
        ajaxTester();
    }
    
    public void ajaxTester() throws Throwable {
        selenium.open("http://www.irian.at/myfaces-sandbox/inputSuggestAjax.jsf");
        assertTrue(selenium.isTextPresent("suggest"));
        String elementID = "document.forms[0].elements[2]";
            //"//input[@id='' and @type='text']";
        selenium.type(elementID, "foo");
        selenium.setCursorPosition(elementID, "-1");
        // DGF On Mozilla a keyPress is needed, and types a letter.
        // On IE6, a keyDown is needed, and no letter is typed. :-p
        // On firefox 1.0.6-1.5.0.1, keyPress needed, no letter typed;
        // On firefox 1.5.0.2 (and higher), keyPress needed, letter typed
        // That's due to Firefox bug 303713 https://bugzilla.mozilla.org/show_bug.cgi?id=303713
        
        String verificationText = "regexp:foox?1";
        selenium.keyDown(elementID, Integer.toString('x'));
        selenium.keyUp(elementID, Integer.toString('x'));
        Thread.sleep(2000);
        assertTrue(selenium.isTextPresent(verificationText));
    }
    
    public void tearDown() {
        if (selenium == null) return;
        selenium.stop();
    }
}
