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

package org.openqa.selenium.grid.data;

import static org.openqa.selenium.remote.CapabilityType.ENABLE_DOWNLOADS;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import org.openqa.selenium.Capabilities;

/**
 * Default matching implementation for slots, loosely based on the requirements for capability
 * matching from the WebDriver spec. A match is made if the following are all true:
 *
 * <ul>
 *   <li>All non-extension capabilities from the {@code stereotype} match those in the {@link
 *       Capabilities} being considered.
 *   <li>If the {@link Capabilities} being considered contain any of:
 *       <ul>
 *         <li>browserName
 *         <li>browserVersion
 *         <li>platformName
 *       </ul>
 *       Then the {@code stereotype} must contain the same values.
 * </ul>
 *
 * <p>One thing to note is that extension capabilities are not considered when matching slots, since
 * the matching of these is implementation-specific to each driver.
 */
public class DefaultSlotMatcher implements SlotMatcher, Serializable {

  /*
   List of prefixed extension capabilities we never should try to match, they should be
   matched in the Node or in the browser driver.
  */
  private static final List<String> EXTENSION_CAPABILITIES_PREFIXES =
      Arrays.asList("goog:", "moz:", "ms:", "safari:", "se:");
  public static final List<String> SPECIFIC_RELAY_CAPABILITIES_APP =
      Arrays.asList("appium:app", "appium:appPackage", "appium:bundleId");
  public static final List<String> MANDATORY_CAPABILITIES =
      Arrays.asList("platformName", "browserName", "browserVersion");

  @Override
  public boolean matches(Capabilities stereotype, Capabilities capabilities) {

    if (capabilities.asMap().isEmpty()) {
      return false;
    }

    if (!initialMatch(stereotype, capabilities)) {
      return false;
    }

    if (!managedDownloadsEnabled(stereotype, capabilities)) {
      return false;
    }

    if (!extensionCapabilitiesMatch(stereotype, capabilities)) {
      return false;
    }

    if (!platformVersionMatch(stereotype, capabilities)) {
      return false;
    }

    // At the end, a simple browser, browserVersion and platformName match
    boolean browserNameMatch =
        (capabilities.getBrowserName() == null || capabilities.getBrowserName().isEmpty())
            || Objects.equals(stereotype.getBrowserName(), capabilities.getBrowserName())
            || matchConditionToRemoveCapability(capabilities);
    boolean browserVersionMatch =
        (capabilities.getBrowserVersion() == null
                || capabilities.getBrowserVersion().isEmpty()
                || Objects.equals(capabilities.getBrowserVersion(), "stable"))
            || browserVersionMatch(stereotype.getBrowserVersion(), capabilities.getBrowserVersion())
            || matchConditionToRemoveCapability(capabilities);
    boolean platformNameMatch =
        capabilities.getPlatformName() == null
            || Objects.equals(stereotype.getPlatformName(), capabilities.getPlatformName())
            || (stereotype.getPlatformName() != null
                && stereotype.getPlatformName().is(capabilities.getPlatformName()));
    return browserNameMatch && browserVersionMatch && platformNameMatch;
  }

  private boolean browserVersionMatch(String stereotype, String capabilities) {
    return new SemanticVersionComparator().compare(stereotype, capabilities) == 0;
  }

  private Boolean initialMatch(Capabilities stereotype, Capabilities capabilities) {
    return stereotype.getCapabilityNames().stream()
        // Matching of extension capabilities is implementation independent. Skip them
        .filter(name -> !name.contains(":"))
        // Mandatory capabilities match is done at the end
        .filter(
            name ->
                MANDATORY_CAPABILITIES.stream()
                    .noneMatch(mandatory -> mandatory.equalsIgnoreCase(name)))
        .map(
            name -> {
              if (capabilities.getCapability(name) instanceof String) {
                return stereotype
                    .getCapability(name)
                    .toString()
                    .equalsIgnoreCase(capabilities.getCapability(name).toString());
              } else {
                return capabilities.getCapability(name) == null
                    || Objects.equals(
                        stereotype.getCapability(name), capabilities.getCapability(name));
              }
            })
        .reduce(Boolean::logicalAnd)
        .orElse(true);
  }

  private Boolean managedDownloadsEnabled(Capabilities stereotype, Capabilities capabilities) {
    // First lets check if user wanted a Node with managed downloads enabled
    Object raw = capabilities.getCapability(ENABLE_DOWNLOADS);
    if (raw == null || !Boolean.parseBoolean(raw.toString())) {
      // User didn't ask. So lets move on to the next matching criteria
      return true;
    }
    // User wants managed downloads enabled to be done on this Node, let's check the stereotype
    raw = stereotype.getCapability(ENABLE_DOWNLOADS);
    // Try to match what the user requested
    return raw != null && Boolean.parseBoolean(raw.toString());
  }

  private Boolean platformVersionMatch(Capabilities stereotype, Capabilities capabilities) {
    /*
     This platform version match is not W3C compliant but users can add Appium servers as
     Nodes, so we avoid delaying the match until the Slot, which makes the whole matching
     process faster.
    */
    return capabilities.getCapabilityNames().stream()
        .filter(name -> name.contains("platformVersion"))
        .map(
            platformVersionCapName ->
                Objects.equals(
                    stereotype.getCapability(platformVersionCapName),
                    capabilities.getCapability(platformVersionCapName)))
        .reduce(Boolean::logicalAnd)
        .orElse(true);
  }

  private Boolean extensionCapabilitiesMatch(Capabilities stereotype, Capabilities capabilities) {
    /*
     We match extension capabilities when they are not prefixed with any of the
     EXTENSION_CAPABILITIES_PREFIXES items. Also, we match them only when the capabilities
     of the new session request contains that specific extension capability.
     We are also filtering "options" extension capabilities, as they should be handled
     by the remote endpoint.
    */
    return stereotype.getCapabilityNames().stream()
        .filter(name -> name.contains(":"))
        .filter(name -> !name.toLowerCase().contains("options"))
        .filter(name -> capabilities.asMap().containsKey(name))
        .filter(name -> EXTENSION_CAPABILITIES_PREFIXES.stream().noneMatch(name::contains))
        .map(
            name -> {
              if (capabilities.getCapability(name) instanceof String) {
                return stereotype
                    .getCapability(name)
                    .toString()
                    .equalsIgnoreCase(capabilities.getCapability(name).toString());
              } else {
                return capabilities.getCapability(name) == null
                    || Objects.equals(
                        stereotype.getCapability(name), capabilities.getCapability(name));
              }
            })
        .reduce(Boolean::logicalAnd)
        .orElse(true);
  }

  public static Boolean matchConditionToRemoveCapability(Capabilities capabilities) {
    /*
    This match is specific for the Relay capabilities that are related to the Appium server for native application.
    - If browserName is defined then we always assume it’s a hybrid browser session, so no app-related caps should be provided
    - If app is provided then the assumption is that app should be fetched from somewhere first and then installed on the destination device
    - If only appPackage is provided for uiautomator2 driver or bundleId for xcuitest then the assumption is we want to automate an app that is already installed on the device under test
    - If both (app and appPackage) or (app and bundleId). This will then save some small-time for the driver as by default it tries to autodetect these values anyway by analyzing the fetched package’s manifest
     */
    return SPECIFIC_RELAY_CAPABILITIES_APP.stream()
        .anyMatch(
            name ->
                capabilities.getCapability(name) != null
                    && !capabilities.getCapability(name).toString().isEmpty());
  }
}
