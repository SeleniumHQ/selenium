// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
package org.openqa.selenium.edge;

import static org.openqa.selenium.remote.Browser.EDGE;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.chromium.ChromiumOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.CapabilityType;

/**
 * Class to manage options specific to {@link EdgeDriver}.
 *
 * <p>Example usage:
 *
 * <pre><code>
 * EdgeOptions options = new EdgeOptions()
 * options.addExtensions(new File("/path/to/extension.crx"))
 * options.setBinary(new File("/path/to/edge"));
 *
 * // For use with EdgeDriver:
 * EdgeDriver driver = new EdgeDriver(options);
 *
 * // For use with RemoteWebDriver:
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/"),
 *     new EdgeOptions());
 * </code></pre>
 */
public class EdgeOptions extends ChromiumOptions<EdgeOptions> {

  /** Key used to store a set of EdgeOptions in a {@link Capabilities} object. */
  public static final String CAPABILITY = "ms:edgeOptions";

  public static final String LOGGING_PREFS = "ms:loggingPrefs";

  public static final String WEBVIEW2_BROWSER_NAME = "webview2";

  public EdgeOptions() {
    super(CapabilityType.BROWSER_NAME, EDGE.browserName(), CAPABILITY);
  }

  /**
   * Changes the browser name to 'webview2' to enable <a
   * href="https://learn.microsoft.com/en-us/microsoft-edge/webview2/how-to/webdriver">test
   * automation of WebView2 apps with Microsoft Edge WebDriver </a>
   *
   * @param enable boolean flag to enable or disable the 'webview2' usage
   */
  public void useWebView(boolean enable) {
    String browserName = enable ? WEBVIEW2_BROWSER_NAME : EDGE.browserName();
    setCapability(CapabilityType.BROWSER_NAME, browserName);
  }

  @Override
  public EdgeOptions merge(Capabilities extraCapabilities) {
    Require.nonNull("Capabilities to merge", extraCapabilities);

    EdgeOptions newInstance = new EdgeOptions();
    newInstance.mergeInPlace(this);
    newInstance.mergeInPlace(extraCapabilities);
    newInstance.mergeInOptionsFromCaps(CAPABILITY, extraCapabilities);

    return newInstance;
  }
}
