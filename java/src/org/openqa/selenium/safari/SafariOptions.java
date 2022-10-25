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

package org.openqa.selenium.safari;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AbstractDriverOptions;

import java.util.Collections;
import java.util.Set;

import static org.openqa.selenium.remote.Browser.SAFARI;
import static org.openqa.selenium.remote.Browser.SAFARI_TECH_PREVIEW;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

/**
 * Class to manage options specific to {@link SafariDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * SafariOptions options = new SafariOptions()
 * options.setUseTechnologyPreview(true);
 *
 * // For use with SafariDriver:
 * SafariDriver driver = new SafariDriver(options);
 *
 * // For use with RemoteWebDriver:
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/"),
 *     options);
 * </code></pre>
 */
public class SafariOptions extends AbstractDriverOptions<SafariOptions> {

  public SafariOptions() {
    setUseTechnologyPreview(false);
    setCapability(BROWSER_NAME, SAFARI.browserName());
  }

  public SafariOptions(Capabilities source) {
    this();

    source.getCapabilityNames().forEach(name -> setCapability(name, source.getCapability(name)));
  }

  /**
   * Construct a {@link SafariOptions} instance from given capabilities.
   *
   * @param capabilities Desired capabilities from which the options are derived.
   * @return SafariOptions
   * @throws WebDriverException If an error occurred during the reconstruction of the options
   */
  public static SafariOptions fromCapabilities(Capabilities capabilities)
    throws WebDriverException {
    if (capabilities instanceof SafariOptions) {
      return (SafariOptions) capabilities;
    }
    return new SafariOptions(capabilities);
  }

  @Override
  public SafariOptions merge(Capabilities extraCapabilities) {
    Require.nonNull("Capabilities to merge", extraCapabilities);

    SafariOptions newInstance = new SafariOptions();

    getCapabilityNames().forEach(name -> newInstance.setCapability(name, getCapability(name)));
    extraCapabilities.getCapabilityNames()
      .forEach(name -> newInstance.setCapability(name, extraCapabilities.getCapability(name)));

    return newInstance;
  }

  public boolean getAutomaticInspection() {
    return Boolean.TRUE.equals(getCapability(Option.AUTOMATIC_INSPECTION));
  }

  /**
   * Instruct the SafariDriver to enable the Automatic Inspection if true, otherwise disable
   * the automatic inspection. Defaults to disabling the automatic inspection.
   *
   * @param automaticInspection If true, the SafariDriver will enable the Automation Inspection,
   *                            otherwise will disable.
   */
  public SafariOptions setAutomaticInspection(boolean automaticInspection) {
    setCapability(Option.AUTOMATIC_INSPECTION, automaticInspection);
    return this;
  }

  public boolean getAutomaticProfiling() {
    return Boolean.TRUE.equals(is(Option.AUTOMATIC_PROFILING));
  }

  /**
   * Instruct the SafariDriver to enable the Automatic profiling if true, otherwise disable
   * the automatic profiling. Defaults to disabling the automatic profiling.
   *
   * @param automaticProfiling If true, the SafariDriver will enable the Automation Profiling,
   *                           otherwise will disable.
   */
  public SafariOptions setAutomaticProfiling(boolean automaticProfiling) {
    setCapability(Option.AUTOMATIC_PROFILING, automaticProfiling);
    return this;
  }

  public boolean getUseTechnologyPreview() {
    return SAFARI_TECH_PREVIEW.browserName().equals(getBrowserName());
  }

  /**
   * Instruct the SafariDriver to use the Safari Technology Preview if true, otherwise use the
   * release version of Safari. Defaults to using the release version of Safari.
   *
   * @param useTechnologyPreview If true, the SafariDriver will use the Safari Technology Preview,
   *                             otherwise will use the release version of Safari.
   */
  public SafariOptions setUseTechnologyPreview(boolean useTechnologyPreview) {
    // Use an object here, rather than a boolean to avoid a stack overflow
    super.setCapability(BROWSER_NAME,
                        useTechnologyPreview ?
                        SAFARI_TECH_PREVIEW.browserName() : SAFARI.browserName());
    return this;
  }

  @Override
  protected Set<String> getExtraCapabilityNames() {
    return Collections.emptySet();
  }

  @Override
  protected Object getExtraCapability(String capabilityName) {
    return null;
  }

  private interface Option {

    // Defined by Apple
    String AUTOMATIC_INSPECTION = "safari:automaticInspection";
    String AUTOMATIC_PROFILING = "safari:automaticProfiling";
  }
}
