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
        selenium.verifyTextPresent("suggest");
        String elementID = "_idJsp0:_idJsp3";
        selenium.type(elementID, "foo");
        // DGF On Mozilla a keyPress is needed, and types a letter.
        // On IE6, a keyDown is needed, and no letter is typed. :-p
        // NS On firefox, keyPress needed, no letter typed.
        
        boolean isIE = selenium.getEvalBool("isIE");
        boolean isFirefox = selenium.getEvalBool("isFirefox");
        boolean isNetscape = selenium.getEvalBool("isNetscape");
        String verificationText = null;
        if (isIE) {
            selenium.keyDown(elementID, 'x');
        } else {
            selenium.keyPress(elementID, 'x');
        }
        if (isNetscape) {
            verificationText = "foox1";
        } else if (isIE || isFirefox) {
            verificationText = "foo1";
        }
        else {
            fail("which browser is this?");
        }
        Thread.sleep(2000);
        selenium.verifyTextPresent(verificationText);
    }
    
    public void tearDown() {
        if (selenium == null) return;
        selenium.testComplete();
    }
}
