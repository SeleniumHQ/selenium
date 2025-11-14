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

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Adapter for Docker API version 1.44 and later.
 *
 * <p>Key features of API v1.44+:
 *
 * <ul>
 *   <li>{@code VirtualSize} field removed from image responses (use {@code Size} instead)
 *   <li>Support for multiple network endpoints in container creation
 *   <li>Enhanced validation for network creation (CheckDuplicate deprecated)
 *   <li>New {@code DNSNames} field in container inspection
 *   <li>Read-only bind mounts can be recursively read-only (kernel >= 5.12)
 * </ul>
 *
 * <p>This adapter ensures responses are normalized and requests are formatted correctly for the
 * v1.44+ API.
 */
class V144Adapter implements ApiVersionAdapter {

  private static final Logger LOG = Logger.getLogger(V144Adapter.class.getName());
  private final String apiVersion;

  public V144Adapter(String apiVersion) {
    this.apiVersion = apiVersion;
  }

  @Override
  public Map<String, Object> adaptImageResponse(Map<String, Object> response) {
    if (response == null) {
      return response;
    }

    Map<String, Object> adapted = new HashMap<>(response);

    // In v1.44+, VirtualSize is removed. Ensure Size is present.
    // If for some reason VirtualSize exists (shouldn't in 1.44+), remove it to avoid confusion
    if (adapted.containsKey("VirtualSize")) {
      LOG.warning(
          "VirtualSize field found in API v"
              + apiVersion
              + " response, but this field was removed in v1.44. "
              + "This may indicate an API version mismatch.");
      adapted.remove("VirtualSize");
    }

    // Ensure Size field is present (it should be in all v1.44+ responses)
    if (!adapted.containsKey("Size")) {
      LOG.warning("Size field missing from image response in API v" + apiVersion);
    }

    return adapted;
  }

  @Override
  public Map<String, Object> adaptContainerCreateRequest(Map<String, Object> request) {
    if (request == null) {
      return request;
    }

    // v1.44+ supports multiple network endpoints
    // No adaptation needed, but we can log for debugging
    Map<String, Object> adapted = new HashMap<>(request);

    @SuppressWarnings("unchecked")
    Map<String, Object> networkingConfig = (Map<String, Object>) adapted.get("NetworkingConfig");

    if (networkingConfig != null) {
      @SuppressWarnings("unchecked")
      Map<String, Object> endpointsConfig =
          (Map<String, Object>) networkingConfig.get("EndpointsConfig");

      if (endpointsConfig != null && endpointsConfig.size() > 1) {
        LOG.fine(
            "Creating container with "
                + endpointsConfig.size()
                + " network endpoints (supported in API v"
                + apiVersion
                + "+)");
      }
    }

    return adapted;
  }

  @Override
  public Map<String, Object> adaptContainerInspectResponse(Map<String, Object> response) {
    if (response == null) {
      return response;
    }

    Map<String, Object> adapted = new HashMap<>(response);

    // v1.44+ includes DNSNames field
    // Ensure deprecated fields are handled if present
    @SuppressWarnings("unchecked")
    Map<String, Object> originalNetworkSettings =
        (Map<String, Object>) adapted.get("NetworkSettings");

    if (originalNetworkSettings != null) {
      // Create defensive copy to avoid mutating the original response
      Map<String, Object> networkSettings = new HashMap<>(originalNetworkSettings);
      adapted.put("NetworkSettings", networkSettings);

      // Remove deprecated fields if present (they shouldn't be in v1.44+)
      String[] deprecatedFields = {
        "HairpinMode",
        "LinkLocalIPv6Address",
        "LinkLocalIPv6PrefixLen",
        "SecondaryIPAddresses",
        "SecondaryIPv6Addresses"
      };

      for (String field : deprecatedFields) {
        if (networkSettings.containsKey(field)) {
          LOG.fine(
              "Removing deprecated field '"
                  + field
                  + "' from NetworkSettings (deprecated in API v1.44+)");
          networkSettings.remove(field);
        }
      }
    }

    return adapted;
  }

  @Override
  public boolean supportsMultipleNetworks() {
    return true; // v1.44+ supports multiple network endpoints
  }

  @Override
  public boolean hasVirtualSizeField() {
    return false; // v1.44+ removed VirtualSize field
  }

  @Override
  public String getApiVersion() {
    return apiVersion;
  }
}
