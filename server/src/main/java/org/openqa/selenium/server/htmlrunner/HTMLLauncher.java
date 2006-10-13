/*
 * Created on Feb 26, 2006
 *
 */
package org.openqa.selenium.server.htmlrunner;

import java.io.*;

import org.openqa.selenium.server.*;
import org.openqa.selenium.server.browserlaunchers.*;

/**
 * Runs HTML Selenium test suites.
 *  
 * 
 *  @author dfabulich
 *
 */
public class HTMLLauncher implements HTMLResultsListener {

    private SeleniumServer server;
    private HTMLTestResults results;
    
    public HTMLLauncher(SeleniumServer server) {
        this.server = server;
    }
    
    /** Launches a single HTML Selenium test suite.
     * 
     * @param browser - the browserString ("*firefox", "*iexplore" or an executable path)
     * @param browserURL - the start URL for the browser
     * @param HTMLSuite - the relative URL to the HTML suite
     * @param outputFile - The file to which we'll output the HTML results
     * @param timeoutInMs - the amount of time (in milliseconds) to wait for the browser to finish
     * @param multiWindow TODO
     * @return PASS or FAIL
     * @throws IOException if we can't write the output file
     */
    public String runHTMLSuite(String browser, String browserURL, String HTMLSuite, File outputFile, int timeoutInSeconds, boolean multiWindow) throws IOException {
        long timeoutInMs = 1000 * timeoutInSeconds;
        if (timeoutInMs < 0) {
            System.err.println("Looks like the timeout overflowed, so resetting it to the maximum.");
            timeoutInMs = Long.MAX_VALUE;
        }
        server.handleHTMLRunnerResults(this);
        BrowserLauncherFactory blf = new BrowserLauncherFactory(server);
        String sessionId = Long.toString(System.currentTimeMillis() % 1000000);
        BrowserLauncher launcher = blf.getBrowserLauncher(browser, sessionId, null);
        launcher.launchHTMLSuite(HTMLSuite, browserURL, multiWindow);
        long now = System.currentTimeMillis();
        long end = now + timeoutInMs;
        while (results == null && System.currentTimeMillis() < end) {
            AsyncExecute.sleepTight(500);
        }
        launcher.close();
        if (results == null) {
            throw new SeleniumCommandTimedOutException();
        }
        if (outputFile != null) {
            FileWriter fw = new FileWriter(outputFile);
            results.write(fw);
            fw.close();
        }
        
        return results.getResult().toUpperCase();
    }
    
    /** Accepts HTMLTestResults for later asynchronous handling */
    public void processResults(HTMLTestResults resultsParm) {
        this.results = resultsParm;
    }

    

}
