/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.thoughtworks.selenium;

import junit.framework.TestCase;

/**
 * This test must be run in conjunction with the JSUnit tests for
 * Selenium - http://localhost:9090/selenium-b-tests.html
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.9 $
 */
public class SeleniumIntegrationTest extends TestCase {
    public void testShouldStartServerAndCreateBrowser() {
        // TODO: don't point to JsUnit but to a web page with Selenium B loaded,
        // and let Selenium B be the driver on the client side instead of JsUnit.
        String jsUnitUrl = "http://localhost:9090/jsunit/testRunner.html?testPage=http://localhost:9090/tests/rpcrunner/rpcrunner-integration-tests.html&autoRun=true";
        Selenium selenium = new Selenium(jsUnitUrl);
        Browser browser = selenium.getBrowser();

        assertEquals("OK", browser.open("/mypage"));
        try {
            browser.verifyTable("bla", 1, 2, "bonjour");
        } catch (SeleniumException e) {
            assertEquals("bla.1.2 was hello", e.getMessage());
        } finally {
//            selenium.shutdown();
        }
    }

    public void testDriveTheBrowserWithXmlRpc() {
        String jsUnitUrl = "http://localhost:9090/RpcRunner.html";
        Selenium selenium = new Selenium(jsUnitUrl);
        Browser browser = selenium.getBrowser();

        testClick(browser);
        testTextboxEvents(browser);
        testFailingVerification(browser);
    }

    private void testClick(Browser browser) {
        browser.open("/tests/html/test_click_page1.html");
        browser.verifyText("link", "Click here for next page");
        browser.click("link");
        browser.verifyLocation("/tests/html/test_click_page2.html");
        browser.click("previousPage");
        browser.verifyText("link", "Click here for next page");
    }

    private void testTextboxEvents(Browser browser) {
        browser.open("/tests/html/test_form_events.html");
        browser.verifyValue("theTextbox", "");
        browser.verifyValue("eventlog", "");

        browser.type("theTextbox", "first value");
        browser.verifyValue("theTextbox", "first value");
        browser.verifyValue("eventlog", "{focus(theTextbox)} {select(theTextbox)} {change(theTextbox)} {blur(theTextbox)}");

        browser.type("eventlog", "");
        browser.type("theTextbox", "changed value");
        browser.verifyValue("theTextbox", "changed value");
        browser.verifyValue("eventlog", "{focus(theTextbox)} {select(theTextbox)} {change(theTextbox)} {blur(theTextbox)}");
    }

    private void testFailingVerification(Browser browser) {

        browser.open("/tests/html/test_verifications.html");
        try {
            browser.verifyValue("theText", "not the text value");
            fail("verifyValue should have failed");
        } catch (Exception e) {
            // Expected
            // TODO Make this work.
//            assertEquals("Expected not the text value (string) but was the text value (string)",
//                         e.getMessage());
        }
    }
}
