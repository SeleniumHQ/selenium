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

package org.openqa.selenium.chrome;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.chromium.ChromiumOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.CapabilityType;

import static org.openqa.selenium.remote.Browser.CHROME;

/**
 * Class to manage options specific to {@link ChromeDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * ChromeOptions options = new ChromeOptions()
 * options.addExtensions(new File("/path/to/extension.crx"))
 * options.setBinary(new File("/path/to/chrome"));
 *
 * // For use with ChromeDriver:
 * ChromeDriver driver = new ChromeDriver(options);
 *
 * // For use with RemoteWebDriver:
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/"),
 *     new ChromeOptions());
 * </code></pre>
 *
 * @since Since chromedriver v17.0.963.0
 */
public class ChromeOptions extends ChromiumOptions<ChromeOptions> {

  /**
   * Key used to store a set of ChromeOptions in a {@link Capabilities}
   * object.
   */
  public static final String CAPABILITY = "goog:chromeOptions";
  public static final String LOGGING_PREFS = "goog:loggingPrefs";
  private ChromeDriverLogLevel logLevel;

  public ChromeOptions() {
    super(CapabilityType.BROWSER_NAME, CHROME.browserName(), CAPABILITY);
  }

  public ChromeOptions setLogLevel(ChromeDriverLogLevel logLevel){
    this.logLevel = Require.nonNull("Log level", logLevel);
    return this;
  }

  @Override
  public ChromeOptions merge(Capabilities extraCapabilities) {
    Require.nonNull("Capabilities to merge", extraCapabilities);

    ChromeOptions newInstance = new ChromeOptions();
    newInstance.mergeInPlace(this);
    newInstance.mergeInPlace(extraCapabilities);
    return newInstance;
  }

  public ChromeDriverLogLevel getLogLevel(){
    return logLevel;
  }
}
