/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


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

  public AbstractBrowserLauncher(String sessionId, RemoteControlConfiguration configuration,
      Capabilities browserOptions) {
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

  @Deprecated
  protected String getCommandLineFlags() {
    String cmdLineFlags = BrowserOptions
        .getCommandLineFlags(browserConfigurationOptions);
    if (cmdLineFlags != null) {
      return cmdLineFlags;
    } else {
      return "";
    }
  }

  protected String[] getCommandLineFlagsAsArray() {
    String cmdLineFlags = BrowserOptions
        .getCommandLineFlags(browserConfigurationOptions);
    if (cmdLineFlags != null) {
      return cmdLineFlags.split("\\s+");
    } else {
      return new String[] {};
    }
  }
}
