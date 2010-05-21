package org.openqa.selenium.server.browserlaunchers;

import org.openqa.selenium.server.BrowserConfigurationOptions;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.IOException;


/**
 * launcher for Safari under proxy injection mode
 * <p/>
 * In proxy injection mode, the selenium server is a proxy for all traffic from the browser,
 * not just traffic going to selenium-server URLs.  The incoming HTML is modified
 * to include selenium's JavaScript, which then controls the test page from within (as
 * opposed to controlling the test page from a different window, as selenium remote
 * control normally does).
 *
 * @author danielf
 */
public class ProxyInjectionSafariCustomProfileLauncher extends SafariCustomProfileLauncher {
  private static boolean alwaysChangeMaxConnections = true;

  public ProxyInjectionSafariCustomProfileLauncher(BrowserConfigurationOptions browserOptions,
                                                   RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {

    super(browserOptions, configuration, sessionId, browserLaunchLocation);
    browserOptions.setProxyEverything(true);
  }

  @Override
  protected void changeRegistrySettings() throws IOException {
    wpm.setChangeMaxConnections(alwaysChangeMaxConnections);
    wpm.changeRegistrySettings(browserConfigurationOptions.asCapabilities());
  }

  public static void setChangeMaxConnections(boolean changeMaxConnections) {
    ProxyInjectionSafariCustomProfileLauncher.alwaysChangeMaxConnections = changeMaxConnections;
  }
}
