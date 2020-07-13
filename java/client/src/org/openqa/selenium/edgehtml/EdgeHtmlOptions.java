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
package org.openqa.selenium.edgehtml;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.AbstractDriverOptions;
import org.openqa.selenium.remote.BrowserType;

/**
 * Class to manage options specific to {@link EdgeHtmlDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * EdgeHtmlOptions options = new EdgeHtmlOptions()
 * options.setBinary(new File("/path/to/edge"));
 *
 * // For use with EdgeDriver:
 * EdgeHtmlDriver driver = new EdgeHtmlDriver(options);
 *
 * // For use with RemoteWebDriver:
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/"),
 *     new EdgeHtmlOptions());
 * </code></pre>
 *
 */
public class EdgeHtmlOptions extends AbstractDriverOptions<EdgeHtmlOptions> {

  /**
   * Key used to indicate whether to use an Edge Chromium or Edge Legacy driver.
   */
  public static final String USE_CHROMIUM = "ms:edgeChromium";

  /**
   * Key used to store a set of EdgeHtmlOptions in a {@link Capabilities} object.
   */
  public static final String CAPABILITY = "ms:edgeOptions";

  public EdgeHtmlOptions() {
    setCapability(BROWSER_NAME, BrowserType.EDGE);
    setCapability(USE_CHROMIUM, false);
  }

  @Override
  public EdgeHtmlOptions merge(Capabilities extraCapabilities) {
    super.merge(extraCapabilities);
    return this;
  }
}
