/*
 * Copyright 2006 ThoughtWorks, Inc.
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
package org.openqa.selenium.server;

import java.io.*;

import org.openqa.selenium.server.htmlrunner.*;

import junit.framework.*;

public class HTMLRunnerTest extends TestCase implements HTMLResultsListener {

    SeleniumServer server;
    HTMLLauncher launcher;
    HTMLTestResults results = null;
    File output;
    
    public void setUp() throws Exception {
        output = new File("results.html");
        server = new SeleniumServer(SeleniumServer.DEFAULT_PORT);
        launcher = new HTMLLauncher(server);
        server.start();
    }
    
    public void testFirefoxHTMLRunner() throws Exception {
        String browser = "*firefox";
        String browserURL = "http://localhost:" + server.getPort();
        String testURL = "tests/ShortTestSuite.html";
        long timeout = 1000 * 60 * 10; // ten minutes
        String result = launcher.runHTMLSuite(browser, browserURL, testURL, output, timeout);
        assertEquals("Tests didn't pass", "PASSED", result);
        assertTrue(output.exists());
        output.delete();
    }
    
    public void testFirefoxAgain() throws Exception {
        // For safety's sake
        testFirefoxHTMLRunner();
    }
    
    public void testIExploreHTMLRunner() throws Exception {
        String browser = "*iexplore";
        String browserURL = "http://localhost:" + server.getPort();
        String testURL = "tests/ShortTestSuite.html";
        long timeout = 1000 * 60 * 10; // ten minutes
        String result = launcher.runHTMLSuite(browser, browserURL, testURL, output, timeout);
        assertEquals("Tests didn't pass", "PASSED", result);
        assertTrue(output.exists());
        output.delete();
    }
    
    public void testIExploreAgain() throws Exception {
        // For safety's sake
        testIExploreHTMLRunner();
    }
    
    public void tearDown() throws Exception {
        if (server != null) server.stop();
    }

    public void processResults(HTMLTestResults results) {
        this.results = results;
    }
}
