package org.openqa.selenium.server.browserlaunchers;


import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.BrowserLauncher;
import org.openqa.selenium.browserlaunchers.LauncherUtils;
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
  protected Capabilities browserConfigurationOptions;

  public AbstractBrowserLauncher(String sessionId, RemoteControlConfiguration configuration, Capabilities browserOptions) {
    this.sessionId = sessionId;
    this.configuration = configuration;
    this.browserConfigurationOptions = configuration.copySettingsIntoBrowserOptions(browserOptions);
  }

  public void launchHTMLSuite(String suiteUrl, String browserURL) {
    launch(LauncherUtils.getDefaultHTMLSuiteUrl(browserURL, suiteUrl,
        (!BrowserOptions.isSingleWindow(browserConfigurationOptions)), 0));
  }

  public void launchRemoteSession(String browserURL) {
    boolean browserSideLog = browserConfigurationOptions.is("browserSideLog");
    if (browserSideLog) {
      configuration.getSslCertificateGenerator().generateSSLCertsForLoggingHosts();
    }
    launch(LauncherUtils.getDefaultRemoteSessionUrl(browserURL, sessionId,
        (!BrowserOptions.isSingleWindow(browserConfigurationOptions)), 0, browserSideLog));
  }

  protected abstract void launch(String url);

  public RemoteControlConfiguration getConfiguration() {
    return configuration;
  }

  public int getPort() {
    return configuration.getPortDriversShouldContact();
  }

  protected long getTimeout() {
    if (BrowserOptions.isTimeoutSet(browserConfigurationOptions)) {
      return BrowserOptions.getTimeoutInSeconds(browserConfigurationOptions);
    } else {
      return configuration.getTimeoutInSeconds();
    }
  }

  protected String getCommandLineFlags() {
    String cmdLineFlags = BrowserOptions
        .getCommandLineFlags(browserConfigurationOptions);
    if (cmdLineFlags != null) {
      return cmdLineFlags;
    } else {
      return "";
    }
  }
}
