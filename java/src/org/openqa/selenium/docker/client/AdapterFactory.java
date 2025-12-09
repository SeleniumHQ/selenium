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

package org.openqa.selenium.docker.client;

import java.util.logging.Logger;

/**
 * Factory for creating API version-specific adapters.
 *
 * <p>This factory selects the appropriate adapter based on the Docker API version:
 *
 * <ul>
 *   <li>API v1.40-1.43: Uses {@link V140Adapter}
 *   <li>API v1.44-1.47: Uses {@link V144Adapter}
 *   <li>API v1.48+: Uses {@link V148Adapter}
 * </ul>
 *
 * <p>The factory uses version comparison to determine which adapter to use, ensuring that future
 * API versions automatically use the most appropriate adapter.
 */
class AdapterFactory {

  private static final Logger LOG = Logger.getLogger(AdapterFactory.class.getName());

  /**
   * Creates an appropriate adapter for the given API version.
   *
   * @param apiVersion The Docker API version (e.g., "1.40", "1.44", "1.48")
   * @return An adapter suitable for the specified API version
   * @throws IllegalArgumentException if apiVersion is null or empty
   */
  public static ApiVersionAdapter createAdapter(String apiVersion) {
    if (apiVersion == null || apiVersion.trim().isEmpty()) {
      throw new IllegalArgumentException("API version cannot be null or empty");
    }

    // API v1.48+ uses the latest adapter with multi-platform and gateway priority support
    if (compareVersions(apiVersion, "1.48") >= 0) {
      LOG.fine("Using V148Adapter for API version " + apiVersion);
      return new V148Adapter(apiVersion);
    }

    // API v1.44-1.47 uses the v1.44 adapter
    if (compareVersions(apiVersion, "1.44") >= 0) {
      LOG.fine("Using V144Adapter for API version " + apiVersion);
      return new V144Adapter(apiVersion);
    }

    // API v1.40-1.43 uses the legacy adapter
    LOG.fine("Using V140Adapter for API version " + apiVersion);
    return new V140Adapter(apiVersion);
  }

  /**
   * Compares two version strings in the format "major.minor".
   *
   * @param version1 First version string (e.g., "1.44")
   * @param version2 Second version string (e.g., "1.44")
   * @return negative if version1 < version2, zero if equal, positive if version1 > version2
   */
  private static int compareVersions(String version1, String version2) {
    String[] parts1 = version1.split("\\.");
    String[] parts2 = version2.split("\\.");

    int major1 = Integer.parseInt(parts1[0]);
    int minor1 = parts1.length > 1 ? Integer.parseInt(parts1[1]) : 0;

    int major2 = Integer.parseInt(parts2[0]);
    int minor2 = parts2.length > 1 ? Integer.parseInt(parts2[1]) : 0;

    if (major1 != major2) {
      return major1 - major2;
    }
    return minor1 - minor2;
  }

  /**
   * Determines if the given API version supports multiple network endpoints.
   *
   * @param apiVersion The Docker API version
   * @return true if multiple networks are supported, false otherwise
   */
  public static boolean supportsMultipleNetworks(String apiVersion) {
    return createAdapter(apiVersion).supportsMultipleNetworks();
  }

  /**
   * Determines if the given API version includes the VirtualSize field.
   *
   * @param apiVersion The Docker API version
   * @return true if VirtualSize field is present, false otherwise
   */
  public static boolean hasVirtualSizeField(String apiVersion) {
    return createAdapter(apiVersion).hasVirtualSizeField();
  }
}
