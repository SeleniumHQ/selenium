package org.openqa.selenium.server.browserlaunchers;

import java.io.IOException;


/**
 * launcher for Safari under proxy injection mode
 * 
 * In proxy injection mode, the selenium server is a proxy for all traffic from the browser, 
 * not just traffic going to selenium-server URLs.  The incoming HTML is modified 
 * to include selenium's JavaScript, which then controls the test page from within (as 
 * opposed to controlling the test page from a different window, as selenium remote 
 * control normally does).
 * 
 * @author danielf
 *
 */
public class ProxyInjectionSafariCustomProfileLauncher extends SafariCustomProfileLauncher {
    private static boolean alwaysChangeMaxConnections = true;

	public ProxyInjectionSafariCustomProfileLauncher(int port, String sessionId, int portDriversShouldContact) {
        super(port, sessionId, portDriversShouldContact);
    }
    
    public ProxyInjectionSafariCustomProfileLauncher(int port, String sessionId, String browserLaunchLocation, int portDriversShouldContact) {
        super(port, sessionId, browserLaunchLocation, portDriversShouldContact);
    }
    
    @Override
    protected void changeRegistrySettings() throws IOException {
        wpm.setChangeMaxConnections(alwaysChangeMaxConnections);
        super.changeRegistrySettings();
    }
    
    public static void setChangeMaxConnections(boolean changeMaxConnections) {
    	ProxyInjectionSafariCustomProfileLauncher.alwaysChangeMaxConnections = changeMaxConnections;
    }
}
