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

import org.openqa.selenium.Capabilities;

import java.io.Serializable;
import java.util.Objects;

/**
 * Default matching implementation for slots, loosely based on the
 * requirements for capability matching from the WebDriver spec. A match
 * is made if the following are all true:
 * <ul>
 *   <li>All non-extension capabilities from the {@code stereotype} match
 *       those in the {@link Capabilities} being considered.
 *   <li>If the {@link Capabilities} being considered contain any of:
 *       <ul>
 *         <li>browserName
 *         <li>browserVersion
 *         <li>platformName
 *       </ul>
 *       Then the {@code stereotype} must contain the same values.
 * </ul>
 * <p>
 * One thing to note is that extension capabilities are not considered when
 * matching slots, since the matching of these is implementation-specific
 * to each driver.
 */
public class DefaultSlotMatcher implements SlotMatcher, Serializable {

  @Override
  public boolean matches(Capabilities stereotype, Capabilities capabilities) {

    if (!initialMatch(stereotype, capabilities)) {
      return false;
    }

    if (!platformVersionMatch(stereotype, capabilities)) {
      return false;
    }

    // Simple browser, browserVersion and platformName match
    boolean browserNameMatch =
      (capabilities.getBrowserName() == null || capabilities.getBrowserName().isEmpty()) ||
      Objects.equals(stereotype.getBrowserName(), capabilities.getBrowserName());
    boolean browserVersionMatch =
      (capabilities.getBrowserVersion() == null || capabilities.getBrowserVersion().isEmpty()) ||
      Objects.equals(stereotype.getBrowserVersion(), capabilities.getBrowserVersion());
    boolean platformNameMatch =
      capabilities.getPlatformName() == null ||
      Objects.equals(stereotype.getPlatformName(), capabilities.getPlatformName()) ||
      (stereotype.getPlatformName() != null &&
       stereotype.getPlatformName().is(capabilities.getPlatformName()));
    return browserNameMatch && browserVersionMatch && platformNameMatch;
  }

  private Boolean initialMatch(Capabilities stereotype, Capabilities capabilities) {
    return stereotype.getCapabilityNames().stream()
      // Matching of extension capabilities is implementation independent. Skip them
      .filter(name -> !name.contains(":"))
      // Platform matching is special, we do later
      .filter(name -> !"platform".equalsIgnoreCase(name) && !"platformName".equalsIgnoreCase(name))
      .map(name -> {
        if (capabilities.getCapability(name) instanceof String) {
          return stereotype.getCapability(name).toString()
            .equalsIgnoreCase(capabilities.getCapability(name).toString());
        } else {
          return capabilities.getCapability(name) == null ||
                 Objects.equals(stereotype.getCapability(name), capabilities.getCapability(name));
        }
      })
      .reduce(Boolean::logicalAnd)
      .orElse(false);
  }

  private Boolean platformVersionMatch(Capabilities stereotype, Capabilities capabilities) {
    /*
      This platform version match is not W3C compliant but users can add Appium servers as
      Nodes, so we avoid delaying the match until the Slot, which makes the whole matching
      process faster.
     */
    return capabilities.getCapabilityNames()
      .stream()
      .filter(name -> name.contains("platformVersion"))
      .map(
        platformVersionCapName ->
          Objects.equals(stereotype.getCapability(platformVersionCapName),
                         capabilities.getCapability(platformVersionCapName)))
      .reduce(Boolean::logicalAnd)
      .orElse(true);
  }

}
