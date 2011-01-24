package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.browserlaunchers.locators.BrowserInstallation;
import org.openqa.selenium.browserlaunchers.locators.Firefox2or3Locator;
import org.openqa.selenium.server.ApplicationRegistry;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * launcher for Firefox under proxy injection mode
 * <p/>
 * In proxy injection mode, the selenium server is a proxy for all traffic from the browser,
 * not just traffic going to selenium-server URLs.  The incoming HTML is modified
 * to include selenium's JavaScript, which then controls the test page from within (as
 * opposed to controlling the test page from a different window, as selenium remote
 * control normally does).
 *
 * @author nelsons
 */
public class ProxyInjectionFirefoxCustomProfileLauncher extends
    FirefoxCustomProfileLauncher {

  private static boolean alwaysChangeMaxConnections = true;

  public ProxyInjectionFirefoxCustomProfileLauncher(Capabilities browserOptions,
                                                    RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {
    this(browserOptions, configuration,
        sessionId,
        ApplicationRegistry.instance().browserInstallationCache().locateBrowserInstallation(
            "firefoxproxy", browserLaunchLocation, new Firefox2or3Locator()));
  }

  public ProxyInjectionFirefoxCustomProfileLauncher(Capabilities browserOptions, RemoteControlConfiguration configuration, String sessionId, BrowserInstallation browserInstallation) {
    super(browserOptions, configuration, sessionId, browserInstallation);
    browserConfigurationOptions = Proxies.setProxyEverything(browserConfigurationOptions, true);
  }

  @Override
  protected void init() {
    super.init();
    changeMaxConnections = alwaysChangeMaxConnections;
  }

  public static void setChangeMaxConnections(boolean changeMaxConnections) {
    ProxyInjectionFirefoxCustomProfileLauncher.alwaysChangeMaxConnections = changeMaxConnections;
  }
}
