/*
 * Created on Feb 26, 2006
 *
 */
package org.openqa.selenium.server.htmlrunner;

import java.io.*;

import org.openqa.selenium.server.*;
import org.openqa.selenium.server.browserlaunchers.*;

public class HTMLLauncher implements HTMLResultsListener {

    private SeleniumProxy server;
    private HTMLTestResults results;
    
    public HTMLLauncher(SeleniumProxy server) {
        this.server = server;
    }
    
    public String runHTMLSuite(String browser, String browserURL, String HTMLSuite, File outputFile, long timeout) throws IOException {
        server.handleHTMLRunnerResults(this);
        BrowserLauncherFactory blf = new BrowserLauncherFactory(server);
        BrowserLauncher launcher = blf.getBrowserLauncher(browser);
        launcher.launch(browserURL + "/selenium-server/TestRunner.html?auto=true&test=" + HTMLSuite);
        long now = System.currentTimeMillis();
        long end = now + timeout;
        while (results == null && System.currentTimeMillis() < end) {
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        launcher.close();
        if (results == null) {
            throw new SeleniumCommandTimedOutException();
        }
        if (outputFile != null) {
            handleResults(outputFile);
        }
        
        return results.getResult().toUpperCase();
    }
    
    public void handleResults(File output) throws IOException {
        if (output == null) return;
        FileWriter fw = new FileWriter(output);
        results.write(fw);
        fw.close();
    }
    
    public void processResults(HTMLTestResults results) {
        this.results = results;
    }

    

}
