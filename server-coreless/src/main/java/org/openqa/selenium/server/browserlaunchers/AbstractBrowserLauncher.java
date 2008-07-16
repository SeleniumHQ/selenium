package org.openqa.selenium.server.browserlaunchers;


import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

import javax.naming.OperationNotSupportedException;

/**
 * Runs the specified command path to start the browser, and kills the process to quit.
 *
 * @author Paul Hammant
 * @version $Revision: 189 $
 */
public abstract class AbstractBrowserLauncher implements BrowserLauncher {

    protected String sessionId;
    private RemoteControlConfiguration configuration;

    public AbstractBrowserLauncher(String sessionId, RemoteControlConfiguration configuration) {
        this.sessionId = sessionId;
        this.configuration = configuration;
    }

    public void launchHTMLSuite(String suiteUrl, String browserURL, boolean multiWindow, String defaultLogLevel) {
        launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl, multiWindow, 0, defaultLogLevel));
    }

    public void launchRemoteSession(String browserURL, boolean multiWindow, BrowserConfigurationOptions browserConfigurationOptions) {
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId, multiWindow, 0), browserConfigurationOptions);
    }
    
    public void launchRemoteSession(String browserURL, boolean multiWindow) {
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId, multiWindow, 0));
    }

    protected abstract void launch(String url);
    
    /**
     * This is a default method and browser launchers should override this launch method to support per-test browserConfigurations
     * @param url The base url for starting selenium
     * @param browserConfigurationOptions The browser configuration object
     */
    protected void launch(String url, BrowserConfigurationOptions browserConfigurationOptions) {
        throw new IllegalArgumentException("This browser does not support overriding the default browser configuration");
    }
    
    public RemoteControlConfiguration getConfiguration() {
        return configuration;
    }

    public int getPort() {
        return configuration.getPortDriversShouldContact();
    }

}
