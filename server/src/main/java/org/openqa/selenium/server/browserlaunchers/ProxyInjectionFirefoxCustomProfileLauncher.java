package org.openqa.selenium.server.browserlaunchers;

public class ProxyInjectionFirefoxCustomProfileLauncher extends
        FirefoxCustomProfileLauncher {

    public ProxyInjectionFirefoxCustomProfileLauncher(int port, String sessionId) {
        super(port, sessionId);
        throw new RuntimeException("not implemented");
    }

    public ProxyInjectionFirefoxCustomProfileLauncher(int port,
            String sessionId, String browserLaunchLocation) {
        super(port, sessionId, browserLaunchLocation);
        throw new RuntimeException("not implemented");
    }

}
