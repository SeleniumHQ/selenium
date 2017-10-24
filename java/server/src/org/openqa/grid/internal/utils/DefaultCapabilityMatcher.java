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

package org.openqa.grid.internal.utils;

import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Default (naive) implementation of the capability matcher.
 * <p>
 * The default capability matcher will look at all the key from the request do not start with _ and
 * will try to find a node that has at least those capabilities.
 */
public class DefaultCapabilityMatcher implements CapabilityMatcher {

  private static final Logger log = Logger.getLogger(DefaultCapabilityMatcher.class.getName());
  private static final String GRID_TOKEN = "_";

  protected final List<String> toConsider = new ArrayList<>();

  public DefaultCapabilityMatcher() {
    toConsider.add(CapabilityType.PLATFORM);
    toConsider.add(CapabilityType.BROWSER_NAME);
    toConsider.add(CapabilityType.VERSION);
    toConsider.add(CapabilityType.BROWSER_VERSION);
    toConsider.add(CapabilityType.APPLICATION_NAME);

  }

  /**
   * @param capabilityName capability name to have grid match requested with test slot
   */
  public void addToConsider(String capabilityName) {
    toConsider.add(capabilityName);
  }

  public boolean matches(Map<String, Object> nodeCapability, Map<String, Object> requestedCapability) {
    if (nodeCapability == null || requestedCapability == null) {
      return false;
    }
    for (String key : requestedCapability.keySet()) {
      // ignore capabilities that are targeted at grid internal for the
      // matching
      if (!key.startsWith(GRID_TOKEN) && toConsider.contains(key)) {
        if (requestedCapability.get(key) != null) {
          String value = requestedCapability.get(key).toString();
          // ignore matching 'ANY' or '*" or empty string cases
          if (!("ANY".equalsIgnoreCase(value) || "".equals(value) || "*".equals(value))) {
            switch (key) {
              case CapabilityType.PLATFORM:
                Platform requested = extractPlatform(requestedCapability.get(key));
                if (requested != null) {
                  Platform node = extractPlatform(nodeCapability.get(key));
                  if (node == null) {
                    return false;
                  }
                  if (!node.is(requested)) {
                    return false;
                  }
                }
                break;

              case CapabilityType.BROWSER_VERSION:
              case CapabilityType.VERSION:
                // w3c uses 'browserVersion' but 2.X / 3.X use 'version'
                // w3c name takes precedence
                Object nodeVersion = nodeCapability.getOrDefault(CapabilityType.BROWSER_VERSION, nodeCapability.get(CapabilityType.VERSION));
                if (!value.equals(nodeVersion)) {
                  return false;
                }
                break;

              default:
                if (!requestedCapability.get(key).equals(nodeCapability.get(key))) {
                  return false;
                }
            }
          }
        }
      }
    }
    return true;
  }

  Platform extractPlatform(Object o) {
    if (o == null) {
      return null;
    }
    if (o instanceof Platform) {
      return (Platform) o;
    } else if (o instanceof String) {
      String name = o.toString();
      try {
        return Platform.valueOf(name);
      } catch (IllegalArgumentException e) {
        // no exact match, continue to look for a partial match
      }
      for (Platform os : Platform.values()) {
        for (String matcher : os.getPartOfOsName()) {
          if ("".equals(matcher))
            continue;
          if (name.equalsIgnoreCase(matcher)) {
            return os;
          }
        }
      }
      return null;
    } else {
      return null;
    }
  }
}
