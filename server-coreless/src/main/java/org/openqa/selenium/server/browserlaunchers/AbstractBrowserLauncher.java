package org.openqa.selenium.server.browserlaunchers;


import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Runs the specified command path to start the browser, and kills the process to quit.
 *
 * @author Paul Hammant
 * @version $Revision: 189 $
 */
public abstract class AbstractBrowserLauncher implements BrowserLauncher {

    protected String sessionId;
    private RemoteControlConfiguration configuration;
    protected BrowserConfigurationOptions browserConfigurationOptions;

    public AbstractBrowserLauncher(String sessionId, RemoteControlConfiguration configuration, BrowserConfigurationOptions browserOptions) {
        this.sessionId = sessionId;
        this.configuration = configuration;
        this.browserConfigurationOptions = browserOptions;
    }

    public void launchHTMLSuite(String suiteUrl, String browserURL) {
        launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl, (!browserConfigurationOptions.isSingleWindow()), 0));
    }

    public void launchRemoteSession(String browserURL) {
        boolean browserSideLog = browserConfigurationOptions.is("browserSideLog");
        if (browserSideLog) {
            configuration.getSeleniumServer().generateSSLCertsForLoggingHosts();
        }
        launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId, (!browserConfigurationOptions.isSingleWindow()), 0, browserSideLog));
    }

    protected abstract void launch(String url);
    
    public RemoteControlConfiguration getConfiguration() {
        return configuration;
    }

    public int getPort() {
        return configuration.getPortDriversShouldContact();
    }

    protected int getTimeout() {
        if (browserConfigurationOptions.isTimeoutSet()) {
            return browserConfigurationOptions.getTimeoutInSeconds();
        } else {
            return configuration.getTimeoutInSeconds();
        }
    }

    protected boolean isSnowLeopard() {
        boolean isSnowLeopard = false;
        String osName = System.getProperty("os.name", "unknown").toLowerCase();
        String osVersion = System.getProperty("os.version", "0.0.0");

        if (osName.contains("darwin")) {
            Pattern pattern = Pattern.compile("^\\d+\\.(\\d+).*");
            Matcher matcher = pattern.matcher(osVersion);
            if (matcher.matches()) {
                try {
                    int min = Integer.parseInt(matcher.group());
                    if (min == 6) {
                        isSnowLeopard = true;
                    }
                } catch (NumberFormatException e) {
                    // Not to worry
                }
            }

        }
        return isSnowLeopard;
    }
}
