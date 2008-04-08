package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.RemoteControlConfiguration;

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

    public void launchRemoteSession(String browserURL, boolean multiWindow) {
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId, multiWindow, 0));
    }

    protected abstract void launch(String url);


    public RemoteControlConfiguration getConfiguration() {
        return configuration;
    }

    public int getPort() {
        return configuration.getPortDriversShouldContact();
    }

}
