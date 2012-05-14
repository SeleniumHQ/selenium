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
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.server.RemoteControlConfiguration;

/**
 * launcher for IE under proxy injection mode
 * <p/>
 * In proxy injection mode, the selenium server is a proxy for all traffic from the browser, not
 * just traffic going to selenium-server URLs. The incoming HTML is modified to include selenium's
 * JavaScript, which then controls the test page from within (as opposed to controlling the test
 * page from a different window, as selenium remote control normally does).
 * 
 * @author nelsons
 */
public class ProxyInjectionInternetExplorerCustomProxyLauncher
    extends InternetExplorerCustomProxyLauncher {
  private static boolean alwaysChangeMaxConnections = true;

  public ProxyInjectionInternetExplorerCustomProxyLauncher(Capabilities browserOptions,
      RemoteControlConfiguration configuration, String sessionId, String browserLaunchLocation) {

    super(browserOptions, configuration, sessionId, browserLaunchLocation);
    this.browserConfigurationOptions =
        Proxies.setProxyEverything(this.browserConfigurationOptions, true);
  }

  @Override
  protected void changeRegistrySettings() {
    wpm.setChangeMaxConnections(alwaysChangeMaxConnections);
    wpm.changeRegistrySettings(browserConfigurationOptions);
  }

  public static void setChangeMaxConnections(boolean changeMaxConnections) {
    ProxyInjectionInternetExplorerCustomProxyLauncher.alwaysChangeMaxConnections =
        changeMaxConnections;
  }
}
