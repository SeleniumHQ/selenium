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

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.browserlaunchers.Proxies;
import org.openqa.selenium.server.BrowserConfigurationOptions;

public class ProxyUtilsTest {
  @Test public void modelExpectedProxyingBehavior() {
    // Imagine that the following is a truth table. The columns are:
    // "proxySeleniumTrafficOnly", "avoidProxy", "proxy_everything"
    // with the final column being whether selenium should proxy all traffic.

    boolean bigTableOfTruth[][] = new boolean[][]{
    /* proxySelTraffic, avoidProxy, proxy_everything, result */
        { true,         true,       true,             true },
        { false,        true,       true,             true },
        { true,         false,      true,             true },
        { false,        false,      true,             true },
        { true,         true,       false,            false },
        { false,        true,       false,            true },
        { true,         false,      false,            true },
        { false,        false,      false,            true },
    };

    for (int i = 0; i < bigTableOfTruth.length; i++) {
      boolean[] row = bigTableOfTruth[i];

      BrowserConfigurationOptions options = new BrowserConfigurationOptions();
      options.setOnlyProxySeleniumTraffic(row[0]);
      options.setAvoidProxy(row[1]);
      options.setProxyEverything(row[2]);

      Assert.assertEquals("Failure on row: " + i, row[3], Proxies.isProxyingAllTraffic(options.asCapabilities()));
    }

  }
}
