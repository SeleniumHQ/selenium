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
 * @version $Revision: 1.7 $
 */
public class SeleniumIntegrationTest extends TestCase {
    public void testShouldStartServerAndCreateBrowser() {
        String browserName = System.getProperty("browser");
        if (browserName == null) {
            fail("You must specify the browser name as a VM variable. Example: -Dbrowser=explorer");
        }
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
}
