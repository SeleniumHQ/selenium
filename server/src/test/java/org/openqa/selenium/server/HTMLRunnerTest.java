/*
 * Created on Feb 25, 2006
 *
 */
package org.openqa.selenium.server;

import java.io.*;

import org.openqa.selenium.server.htmlrunner.*;

import junit.framework.*;

public class HTMLRunnerTest extends TestCase implements HTMLResultsListener {

    SeleniumProxy server;
    HTMLLauncher launcher;
    HTMLTestResults results = null;
    File output;
    
    public void setUp() throws Exception {
        output = new File("results.html");
        server = new SeleniumProxy(SeleniumProxy.DEFAULT_PORT);
        launcher = new HTMLLauncher(server);
        server.start();
    }
    
    public void testHTMLRunner() throws Exception {
        String browser = "*firefox";
        String browserURL = "http://localhost:" + server.getPort();
        String testURL = "tests/ShortTestSuite.html";
        long timeout = 1000 * 60 * 10; // ten minutes
        String result = launcher.runHTMLSuite(browser, browserURL, testURL, output, timeout);
        assertEquals("Tests didn't pass", "PASSED", result);
        assertTrue(output.exists());
        output.delete();
    }
    
    public void testAgain() throws Exception {
        // For safety's sake
        testHTMLRunner();
    }
    
    public void tearDown() throws Exception {
        if (server != null) server.stop();
    }

    public void processResults(HTMLTestResults results) {
        this.results = results;
    }
}
