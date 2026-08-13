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

import java.io.File;
import java.util.Map;
import java.util.Objects;
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
 * ElectronOptions options = new ElectronOptions(new File("/path/to/electron/app"));
 * options.setBrowserVersion("29.0.0");
 *
 * ElectronDriver driver = new ElectronDriver(options);
 * </code></pre>
 *
 * <p>The binary must point to your Electron application's executable file. On macOS, this means the
 * binary inside the {@code .app} not the bundle directory itself. The browser version, when set,
 * should match your bundled Electron version.
 */
public class ElectronOptions extends ChromiumOptions<ElectronOptions> {

  public static final String CAPABILITY = "goog:chromeOptions";

  public ElectronOptions(File binary) {
    super(CapabilityType.BROWSER_NAME, CHROME.browserName(), CAPABILITY);
    setCapability("se:browserName", "electron");
    setBinary(Require.nonNull("Path to the Electron executable", binary));
  }

  @Override
  public ElectronOptions merge(Capabilities extraCapabilities) {
    Require.nonNull("Capabilities to merge", extraCapabilities);
    ElectronOptions newInstance = new ElectronOptions(getBinary(this));
    newInstance.mergeInPlace(this);
    newInstance.mergeInPlace(extraCapabilities);
    newInstance.mergeInOptionsFromCaps(CAPABILITY, extraCapabilities);
    Require.nonNull("Path to the Electron executable", getBinary(newInstance));
    return newInstance;
  }

  @SuppressWarnings("unchecked")
  private static File getBinary(Capabilities options) {
    Map<String, Object> goog = (Map<String, Object>) options.getCapability(CAPABILITY);
    return new File((String) Objects.requireNonNull(goog).get("binary"));
  }
}
