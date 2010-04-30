/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

import org.openqa.selenium.server.BrowserConfigurationOptions;

public class ProxyUtils {
  public static boolean isProxyingAllTraffic(BrowserConfigurationOptions options) {
    // According to the original logic of Selenium Server, the only time when
    // the selenium sever wouldn't be proxying all traffic was when it was
    // configured to only proxy selenium traffic, was avoid the proxy and had
    // not been asked to proxy everything. Modeling that first before tidying
    // up the logic.
    return !(options.isOnlyProxyingSeleniumTraffic() &&
             options.isAvoidingProxy() &&
             !options.isProxyingEverything());
  }

  public static boolean isOnlyProxyingSelenium(BrowserConfigurationOptions options) {
    return !isProxyingAllTraffic(options);
  }
}
