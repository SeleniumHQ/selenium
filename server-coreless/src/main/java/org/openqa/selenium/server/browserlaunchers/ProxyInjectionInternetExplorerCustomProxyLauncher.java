package org.openqa.selenium.server.browserlaunchers;

import java.io.IOException;

import org.openqa.selenium.server.SeleniumServer;


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
    public ProxyInjectionInternetExplorerCustomProxyLauncher(int port, String sessionId) {
        super(port, sessionId);
    }
    
    public ProxyInjectionInternetExplorerCustomProxyLauncher(int port, String sessionId, String browserLaunchLocation) {
        super(port, sessionId, browserLaunchLocation);
    }    
    
    @Override
    protected void changeRegistrySettings() throws IOException {
        customPACappropriate = false;
        super.changeRegistrySettings();
        WindowsUtils.writeBooleanRegistryValue(REG_KEY_BASE + REG_KEY_PROXY_ENABLE, true);
        WindowsUtils.writeStringRegistryValue(REG_KEY_BASE + REG_KEY_PROXY_SERVER, "127.0.0.1:" + SeleniumServer.getPortDriversShouldContact());
    }
}
