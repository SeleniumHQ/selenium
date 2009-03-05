package org.openqa.selenium.server.mock;

import org.openqa.selenium.server.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

/** Unlike the MockBrowserLauncher which acts like a real canned browser,
 * the DummyBrowserLauncher does nothing at all.  Someone else should issue
 * HTTP requests to the server in order to impersonate the browser when using
 * DummyBrowserLauncher.
 * 
 * @author Dan Fabulich
 *
 */
public class DummyBrowserLauncher implements BrowserLauncher {

    private static String sessionId;
    
    public DummyBrowserLauncher(BrowserConfigurationOptions browserOptions, RemoteControlConfiguration configuration, String sessionId, String command) {
        DummyBrowserLauncher.sessionId = sessionId;
    }
   
    /** Returns the sessionId used to create this browser */
    public static String getSessionId() {
        return sessionId;
    }
    
    /** Clears the sessionId, since it's static */
    public static void clearSessionId() {
        sessionId = null;
    }
    
    /** noop */
    public void close() {

    }

    /** noop */
    public Process getProcess() {
        return null;
    }

    /** noop */
    public void launchHTMLSuite(String startURL, String suiteUrl) {

    }

    /** noop */
    public void launchRemoteSession(String url) {
        
    }

}
