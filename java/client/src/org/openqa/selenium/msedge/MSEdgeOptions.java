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

package org.openqa.selenium.msedge;

import org.openqa.selenium.chromium.ChromiumOptions;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

/**
 * Class to manage options specific to {@link MSEdgeDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * MSEdgeOptions options = new MSEdgeOptions()
 * options.addExtensions(new File("/path/to/extension.crx"))
 * options.setBinary(new File("/path/to/msedge"));
 *
 * // For use with MSEdgeDriver:
 * MSEdgeDriver driver = new MSEdgeDriver(options);
 *
 * // For use with RemoteWebDriver:
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/wd/hub"),
 *     new MSEdgeOptions());
 * </code></pre>
 *
 * @since Since msedgedriver v17.0.963.0
 */
public class MSEdgeOptions extends ChromiumOptions {

  public MSEdgeOptions() {
    setCapability(CapabilityType.BROWSER_NAME, BrowserType.MSEDGE);
  }

}
