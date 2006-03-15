/*
 * Created on Jan 7, 2006
 *
 */
package org.openqa.selenium.server.browserlaunchers;


/**
 * Manually prompt the user to start a browser from the command line
 *  
 * 
 *  @author dfabulich
 *
 */
public class ManualPromptUserLauncher implements BrowserLauncher {

    /** Prints out a polite request on the console */
    public void launch(String url) {
        System.out.println("Hello!  This test run is now waiting for you to manually bring up a browser for testing:\nFrom this browser, request:\n" + url);

    }

    public void close() {

    }

}
