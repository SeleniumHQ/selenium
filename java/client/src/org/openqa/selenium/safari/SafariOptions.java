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

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.common.collect.ImmutableSortedMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.CapabilityType;

import java.util.Map;
import java.util.TreeMap;

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
 *     new URL("http://localhost:4444/wd/hub"),
 *     options);
 * </code></pre>
 */
public class SafariOptions extends MutableCapabilities {

  static final String SAFARI_TECH_PREVIEW = "Safari Technology Preview";

  /**
   * Key used to store SafariOptions in a {@link Capabilities} object.
   * @deprecated No replacement. Use the methods on this class
   */
  @Deprecated
  public static final String CAPABILITY = "safari.options";

  private interface Option {
    @Deprecated
    String TECHNOLOGY_PREVIEW = "technologyPreview";

    // Defined by Apple
    String AUTOMATIC_INSPECTION  = "safari:automaticInspection";
    String AUTOMATIC_PROFILING = "safari:automaticProfiling";
  }

  private Map<String, Object> options = new TreeMap<>();

  public SafariOptions() {
    setUseTechnologyPreview(false);
    setCapability(BROWSER_NAME, "safari");
  }

  public SafariOptions(Capabilities source) {
    this();

    source.asMap().forEach((key, value)-> {
      if (CAPABILITY.equals(key) && value instanceof Map) {

        @SuppressWarnings("unchecked")
        Map<? extends String, ?> map = (Map<? extends String, ?>) value;
        options.putAll(map);
      } else if (value != null) {
        setCapability(key, value);
      }
    });
  }

  @Override
  public SafariOptions merge(Capabilities extraCapabilities) {
    super.merge(extraCapabilities);
    return this;
  }

  /**
   * Construct a {@link SafariOptions} instance from given capabilites.
   * When the {@link #CAPABILITY} capability is set, all other capabilities will be ignored!
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
    Object cap = capabilities.getCapability(SafariOptions.CAPABILITY);
    if (cap instanceof SafariOptions) {
      return (SafariOptions) cap;
    } else if (cap instanceof Map) {
      return SafariOptions.fromJsonMap((Map<?, ?>) cap);
    } else {
      return new SafariOptions();
    }
  }

  // Setters
  
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

  /**
   * Instruct the SafariDriver to enable the Automatic profiling if true, otherwise disable
   * the automatic profiling. Defaults to disabling the automatic profiling.
   *
   * @param automaticProfiling If true, the SafariDriver will enable the Automation Profiling,
   *                            otherwise will disable.
   */
  public SafariOptions setAutomaticProfiling(boolean automaticProfiling) {
    setCapability(Option.AUTOMATIC_PROFILING, automaticProfiling);
    return this;
  }

  /**
   * Instruct the SafariDriver to use the Safari Technology Preview if true, otherwise use the
   * release version of Safari. Defaults to using the release version of Safari.
   *
   * @param useTechnologyPreview If true, the SafariDriver will use the Safari Technology Preview,
   *     otherwise will use the release version of Safari.
   */
  public SafariOptions setUseTechnologyPreview(boolean useTechnologyPreview) {
    options.put(Option.TECHNOLOGY_PREVIEW, useTechnologyPreview);
    // Use an object here, rather than a boolean to avoid a stack overflow
    super.setCapability(BROWSER_NAME, useTechnologyPreview ? SAFARI_TECH_PREVIEW : "safari");
    return this;
  }

  @Override
  public void setCapability(String key, Object value) {
    if (Option.TECHNOLOGY_PREVIEW.equals(key)) {
      setUseTechnologyPreview(Boolean.valueOf(value.toString()));
    } else {
      super.setCapability(key, value);
    }
  }

  @Override
  public void setCapability(String key, boolean value) {
    if (Option.TECHNOLOGY_PREVIEW.equals(key)) {
      setUseTechnologyPreview(value);
    } else {
      super.setCapability(key, value);
    }
  }

  public SafariOptions setProxy(Proxy proxy) {
    setCapability(CapabilityType.PROXY, proxy);
    return this;
  }

  // Getters

  public boolean getAutomaticInspection() {
    return Boolean.TRUE.equals(getCapability(Option.AUTOMATIC_INSPECTION));
  }

  public boolean getAutomaticProfiling() {
    return Boolean.TRUE.equals(is(Option.AUTOMATIC_PROFILING));
  }

  public boolean getUseTechnologyPreview() {
    return SAFARI_TECH_PREVIEW.equals(getBrowserName()) ||
           options.get(Option.TECHNOLOGY_PREVIEW) == Boolean.TRUE;
  }

  // (De)serialization of the options

  /**
   * Parse a Map and reconstruct the {@link SafariOptions}.
   *
   * @return A {@link SafariOptions} instance associated with these extensions.
   */
  private static SafariOptions fromJsonMap(Map<?, ?> options)  {
    SafariOptions safariOptions = new SafariOptions();

    Object useTechnologyPreview = options.get(Option.TECHNOLOGY_PREVIEW);
    if (useTechnologyPreview instanceof Boolean) {
      safariOptions.setUseTechnologyPreview((Boolean) useTechnologyPreview);
    }

    return safariOptions;
  }

  @Override
  protected int amendHashCode() {
    return options.hashCode();
  }

  @Override
  public Map<String, Object> asMap() {
    return ImmutableSortedMap.<String, Object>naturalOrder()
        .putAll(super.asMap())
        .put(CAPABILITY, options)
        .build();
  }
}
