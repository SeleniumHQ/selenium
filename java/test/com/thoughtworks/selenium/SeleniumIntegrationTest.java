package com.thoughtworks.selenium;

import junit.framework.TestCase;

/**
 * This test must be run in conjunction with the JSUnit tests for
 * Selenium - http://localhost:9090/selenium-b-tests.html
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class SeleniumIntegrationTest extends TestCase {
    public void testShouldStartServerAndCreateBrowser() {
        String browserName = System.getProperty("browser");
        if (browserName == null) {
            fail("You must specify the browser name as a VM variable. Example: -Dbrowser=explorer");
        }
        // TODO: don't point to JsUnit but to a web page with Selenium B loaded,
        // and let Selenium B be the driver on the client side instead of JsUnit.
        String jsUnitUrl = "http://localhost:9090/jsunit/testRunner.html?testPage=http://localhost:9090/selenium-b-tests.html&autoRun=true";
        Selenium selenium = new Selenium(browserName, jsUnitUrl);
        Browser browser = selenium.getBrowser();

        assertEquals("OK", browser.open("/mypage"));
        try {
            browser.verifyTable("bla", 1, 2, "bonjour");
        } catch (SeleniumException e) {
            assertEquals("bla.1.2 was hello", e.getMessage());
        } finally {
            selenium.shutdown();
        }
    }
}
