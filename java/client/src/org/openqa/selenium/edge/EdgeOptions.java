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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.chromium.ChromiumOptions;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

/**
 * Class to manage options specific to {@link EdgeDriver}.
 *
 * <p>Example usage:
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
 *     new URL("http://localhost:4444/wd/hub"),
 *     new EdgeOptions());
 * </code></pre>
 *
 */
public class EdgeOptions extends ChromiumOptions<EdgeOptions> {

  /**
   * Key used to store a set of ChromeOptions in a {@link Capabilities}
   * object.
   */
  public static final String CAPABILITY = "ms:edgeOptions";

  /**
   * Key used to indicate whether to use an Edge Chromium or Edge Legacy driver.
   */
  public static final String USE_CHROMIUM = "ms:edgeChromium";

  private boolean useChromium;

  public EdgeOptions() {
    super(CapabilityType.BROWSER_NAME, BrowserType.EDGE, CAPABILITY);

    String forceEdgeHtml = System.getProperty(EdgeDriver.DRIVER_USE_EDGE_EDGEHTML);
    if (forceEdgeHtml != null) {
      setChromium(!Boolean.getBoolean(EdgeDriver.DRIVER_USE_EDGE_EDGEHTML));
    } else {
      // If no system property is provided, default to legacy for now.
      setChromium(false);
    }
  }

  /**
   * Sets whether to launch Edge Chromium. If false, Edge Legacy (EdgeHTML) will be used.
   *
   * @param useChromium boolean Whether to launch Edge Chromium.
   */
  public EdgeOptions setChromium(boolean useChromium) {
    setCapability(USE_CHROMIUM, useChromium);
    return this;
  }

  /**
   * Whether this instance is configured to launch Edge Chromium.
   *
   * @return Boolean indicating if Edge Chromium will be used.
   */
  public boolean isUsingChromium() { return useChromium; }

  @Override
  public void setCapability(String key, Object value) {
    switch (key) {
      case USE_CHROMIUM:
        if (value instanceof Boolean) {
          useChromium = (Boolean)value;
        }
        break;
      default:
        // Do nothing
    }
    super.setCapability(key, value);
  }
}
