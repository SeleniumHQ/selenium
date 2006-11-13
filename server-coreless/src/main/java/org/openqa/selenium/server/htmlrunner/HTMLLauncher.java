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
     * @param suiteURL - the relative URL to the HTML suite
     * @param outputFile - The file to which we'll output the HTML results
     * @param timeoutInMs - the amount of time (in milliseconds) to wait for the browser to finish
     * @param multiWindow TODO
     * @return PASS or FAIL
     * @throws IOException if we can't write the output file
     */
    public String runHTMLSuite(String browser, String browserURL, String suiteURL, File outputFile, int timeoutInSeconds, boolean multiWindow) throws IOException {
        outputFile.createNewFile();
        if (!outputFile.canWrite()) {
        	throw new IOException("Can't write to outputFile: " + outputFile.getAbsolutePath());
        }
    	long timeoutInMs = 1000l * timeoutInSeconds;
        if (timeoutInMs < 0) {
            System.err.println("Looks like the timeout overflowed, so resetting it to the maximum.");
            timeoutInMs = Long.MAX_VALUE;
        }
        server.handleHTMLRunnerResults(this);
        BrowserLauncherFactory blf = new BrowserLauncherFactory(server);
        String sessionId = Long.toString(System.currentTimeMillis() % 1000000);
        BrowserLauncher launcher = blf.getBrowserLauncher(browser, sessionId, null);
        server.registerBrowserLauncher(sessionId, launcher);
        launcher.launchHTMLSuite(suiteURL, browserURL, multiWindow);
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
    
    /** Launches a single HTML Selenium test suite.
     * 
     * @param browser - the browserString ("*firefox", "*iexplore" or an executable path)
     * @param browserURL - the start URL for the browser
     * @param suiteFile - a file containing the HTML suite to run
     * @param outputFile - The file to which we'll output the HTML results
     * @param timeoutInMs - the amount of time (in milliseconds) to wait for the browser to finish
     * @param multiWindow - whether to run the browser in multiWindow or else framed mode
     * @return PASSED or FAIL
     * @throws IOException if we can't write the output file
     */
    public String runHTMLSuite(String browser, String browserURL, File suiteFile, File outputFile, int timeoutInSeconds, boolean multiWindow) throws IOException {
    	if (!suiteFile.exists()) {
    		throw new IOException("Can't find HTML Suite file:" + suiteFile.getAbsolutePath());
    	}
    	if (!suiteFile.canRead()) {
    		throw new IOException("Can't read HTML Suite file: " + suiteFile.getAbsolutePath());
    	}
    	server.addNewStaticContent(suiteFile.getParentFile());
    	String suiteURL = browserURL + "/selenium-server/tests/" + suiteFile.getName();
    	return runHTMLSuite(browser, browserURL, suiteURL, outputFile, timeoutInSeconds, multiWindow);
    }
    
    
    /** Accepts HTMLTestResults for later asynchronous handling */
    public void processResults(HTMLTestResults resultsParm) {
        this.results = resultsParm;
    }

    

}
