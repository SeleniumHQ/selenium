package org.openqa.selenium.server.browserlaunchers;

import java.io.IOException;

import org.openqa.selenium.server.SeleniumServer;

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
        WindowsUtils.writeBooleanRegistryValue(REG_KEY_PROXY_ENABLE, true);
        WindowsUtils.writeStringRegistryValue(REG_KEY_PROXY_SERVER, "127.0.0.1:" + SeleniumServer.getProxyInjectionPort());
    }
    
    protected void initStatic() {
        super.initStatic();
        addRegistryKeyToBackupList(REG_KEY_PROXY_ENABLE, REG_KEY_BACKUP_PROXY_ENABLE, boolean.class);
        addRegistryKeyToBackupList(REG_KEY_PROXY_SERVER, REG_KEY_BACKUP_PROXY_SERVER, String.class);
    }
}
