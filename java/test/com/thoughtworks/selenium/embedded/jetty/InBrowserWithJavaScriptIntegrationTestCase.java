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

package com.thoughtworks.selenium.embedded.jetty;

import junit.framework.TestCase;

import java.io.File;

import com.thoughtworks.selenium.launchers.WindowsDefaultBrowserLauncher;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.DefaultSelenium;

/**
 * @author Paul Hammant
 * @version $Revision: 1.2 $
 */
public class InBrowserWithJavaScriptIntegrationTestCase extends TestCase {

    Selenium selenium;

    protected void setUp() throws Exception {
        super.setUp();
        selenium = new DefaultSelenium(
                new JettyCommandProcessor(null, DefaultSelenium.SELENIUM_CONTEXT,
                        new TestIngPurposesStaticContentHandler()),
                new WindowsDefaultBrowserLauncher()
        );
        selenium.start();
    }

    protected void tearDown() throws Exception {
        Thread.sleep(2 * 1000);
        selenium.stop();
    }

    public void testWithJavaScript() {
        boolean result1 = selenium.open("Apple");
        boolean result2 = selenium.click("Orange");
        boolean result3 = selenium.setTextField("Pear", "Bartlet");
        selenium.endOfRun();
        assertEquals(true, result1);
        assertEquals(true, result2);
        assertEquals(true, result3);
    }
}
