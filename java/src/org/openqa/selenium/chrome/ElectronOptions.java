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

import static org.openqa.selenium.remote.Browser.CHROME;

import java.nio.file.Path;
import java.util.Map;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.chromium.ChromiumOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.CapabilityType;

/**
 * Class to manage options specific to {@link ElectronDriver}.
 *
 * <p>Example usage:
 *
 * <pre><code>
 * ElectronOptions options = new ElectronOptions("/path/to/electron/app");
 * options.setBrowserVersion("29.0.0");
 *
 * ElectronDriver driver = new ElectronDriver(options);
 * </code></pre>
 *
 * <p>The binary must point to your Electron application (either the executable or, on macOS, the
 * {@code .app} bundle directory). The browser version should match your bundled Electron version
 */
public class ElectronOptions extends ChromiumOptions<ElectronOptions> {

  public static final String CAPABILITY = "goog:chromeOptions";

  public ElectronOptions(String binary) {
    super(CapabilityType.BROWSER_NAME, CHROME.browserName(), CAPABILITY);
    Require.argument(
            "Path to the Electron application",
            Path.of(Require.nonNull("Path to the Electron application", binary)))
        .exists();
    setBinary(binary);
  }

  @Override
  @SuppressWarnings("unchecked")
  public ElectronOptions merge(Capabilities extraCapabilities) {
    Require.nonNull("Capabilities to merge", extraCapabilities);
    Map<String, Object> goog = (Map<String, Object>) getCapability(CAPABILITY);
    ElectronOptions newInstance = new ElectronOptions((String) goog.get("binary"));
    newInstance.mergeInPlace(this);
    newInstance.mergeInPlace(extraCapabilities);
    newInstance.mergeInOptionsFromCaps(CAPABILITY, extraCapabilities);
    return newInstance;
  }
}
