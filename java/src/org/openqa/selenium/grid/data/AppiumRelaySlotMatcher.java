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

import java.io.Serializable;
import java.util.Objects;
import org.openqa.selenium.Capabilities;

/**
 * Opt-in matching implementation for Nodes that relay sessions to an Appium server. Unlike {@link
 * DefaultSlotMatcher}, a stereotype that advertises Appium-awareness (an {@code appium:}-prefixed
 * capability, or the non-W3C {@code platformVersion} signal) is treated as a wildcard for
 * automationName, and a request carrying app-relay capabilities ({@link
 * DefaultSlotMatcher#SPECIFIC_RELAY_CAPABILITIES_APP}) bypasses browserName/browserVersion
 * matching. This lets a single relay slot serve varied automation frameworks and hybrid
 * browser/native-app requests without the operator enumerating every client value in the
 * stereotype.
 *
 * <p>Configure a Node to use this matcher instead of the default with:
 *
 * <pre>
 * [distributor]
 * slot-matcher = "org.openqa.selenium.grid.data.AppiumRelaySlotMatcher"
 * </pre>
 */
public class AppiumRelaySlotMatcher implements SlotMatcher, Serializable {

  private final DefaultSlotMatcher strict = new DefaultSlotMatcher();

  @Override
  public boolean matches(Capabilities stereotype, Capabilities capabilities) {

    if (capabilities.asMap().isEmpty()) {
      return false;
    }

    if (!strict.initialMatch(stereotype, capabilities)) {
      return false;
    }

    if (!strict.managedDownloadsEnabled(stereotype, capabilities)) {
      return false;
    }

    if (!strict.extensionCapabilitiesMatch(stereotype, capabilities)) {
      return false;
    }

    if (!automationNameMatch(stereotype, capabilities)) {
      return false;
    }

    if (!strict.platformVersionMatch(stereotype, capabilities)) {
      return false;
    }

    boolean browserNameMatch =
        (capabilities.getBrowserName() == null || capabilities.getBrowserName().isEmpty())
            || Objects.equals(stereotype.getBrowserName(), capabilities.getBrowserName())
            || DefaultSlotMatcher.matchConditionToRemoveCapability(capabilities);
    boolean browserVersionMatch =
        (capabilities.getBrowserVersion() == null
                || capabilities.getBrowserVersion().isEmpty()
                || Objects.equals(capabilities.getBrowserVersion(), "stable"))
            || strict.browserVersionMatch(
                stereotype.getBrowserVersion(), capabilities.getBrowserVersion())
            || DefaultSlotMatcher.matchConditionToRemoveCapability(capabilities);
    boolean platformNameMatch =
        capabilities.getPlatformName() == null
            || Objects.equals(stereotype.getPlatformName(), capabilities.getPlatformName())
            || (stereotype.getPlatformName() != null
                && stereotype.getPlatformName().is(capabilities.getPlatformName()));
    return browserNameMatch && browserVersionMatch && platformNameMatch;
  }

  private boolean automationNameMatch(Capabilities stereotype, Capabilities capabilities) {
    /*
     A stereotype with no Appium-related capabilities at all has no relationship to a
     requested automationName, so it should not match. Otherwise, an Appium-aware
     stereotype is allowed to omit automationName and still match, since relay
     stereotypes intentionally do this to serve varied automation sessions.
    */
    boolean stereotypeIsAppiumAware =
        stereotype.getCapabilityNames().stream()
            .anyMatch(name -> name.contains("platformVersion") || name.startsWith("appium:"));
    return stereotypeIsAppiumAware || DefaultSlotMatcher.automationNameValue(capabilities) == null;
  }
}
