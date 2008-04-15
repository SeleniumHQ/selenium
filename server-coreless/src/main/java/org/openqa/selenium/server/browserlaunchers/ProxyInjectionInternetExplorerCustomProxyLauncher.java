package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.IOException;


/**
 * launcher for IE under proxy injection mode
 * 
 * In proxy injection mode, the selenium server is a proxy for all traffic from the browser, 
 * not just traffic going to selenium-server URLs.  The incoming HTML is modified 
 * to include selenium's JavaScript, which then controls the test page from within (as 
 * opposed to controlling the test page from a different window, as selenium remote 
 * control normally does).
 * 
 * @author nelsons
 *
 */
public class ProxyInjectionInternetExplorerCustomProxyLauncher extends InternetExplorerCustomProxyLauncher {
    private static boolean alwaysChangeMaxConnections = true;

	public ProxyInjectionInternetExplorerCustomProxyLauncher(RemoteControlConfiguration configuration, String sessionId) {
        super(configuration, sessionId);
    }
    
    public ProxyInjectionInternetExplorerCustomProxyLauncher(RemoteControlConfiguration configuration,
            String sessionId, String browserLaunchLocation) {
        
        super(configuration, sessionId, browserLaunchLocation);
    }
    
    @Override
    protected void changeRegistrySettings() throws IOException {
        wpm.setChangeMaxConnections(alwaysChangeMaxConnections);
        wpm.changeRegistrySettings();
    }
    
    public static void setChangeMaxConnections(boolean changeMaxConnections) {
    	ProxyInjectionInternetExplorerCustomProxyLauncher.alwaysChangeMaxConnections = changeMaxConnections;
    }
}
