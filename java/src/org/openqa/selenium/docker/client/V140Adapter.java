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
 * Adapter for Docker API versions 1.40 through 1.43.
 *
 * <p>These API versions share similar characteristics:
 *
 * <ul>
 *   <li>Use {@code VirtualSize} field in image responses
 *   <li>Support single network endpoint in container creation
 *   <li>Use {@code filter} parameter (deprecated in 1.40+, use {@code filters})
 * </ul>
 *
 * <p>This adapter normalizes responses to ensure compatibility with newer code that expects the
 * v1.44+ field names.
 */
class V140Adapter implements ApiVersionAdapter {

  private static final Logger LOG = Logger.getLogger(V140Adapter.class.getName());
  private final String apiVersion;

  public V140Adapter(String apiVersion) {
    this.apiVersion = apiVersion;
  }

  @Override
  public Map<String, Object> adaptImageResponse(Map<String, Object> response) {
    if (response == null) {
      return response;
    }

    Map<String, Object> adapted = new HashMap<>(response);

    // In v1.40-1.43, VirtualSize is present. Ensure Size is also available for consistency.
    // Size field exists in all versions, but we normalize here for clarity.
    if (adapted.containsKey("VirtualSize") && !adapted.containsKey("Size")) {
      adapted.put("Size", adapted.get("VirtualSize"));
      LOG.fine("Normalized VirtualSize to Size for API version " + apiVersion);
    }

    return adapted;
  }

  @Override
  public Map<String, Object> adaptContainerCreateRequest(Map<String, Object> request) {
    if (request == null) {
      return request;
    }

    // v1.40-1.43 supports single network endpoint
    // If multiple networks are specified, log a warning and use only the first one
    Map<String, Object> adapted = new HashMap<>(request);

    @SuppressWarnings("unchecked")
    Map<String, Object> networkingConfig = (Map<String, Object>) adapted.get("NetworkingConfig");

    if (networkingConfig != null) {
      @SuppressWarnings("unchecked")
      Map<String, Object> endpointsConfig =
          (Map<String, Object>) networkingConfig.get("EndpointsConfig");

      if (endpointsConfig != null && endpointsConfig.size() > 1) {
        LOG.warning(
            "API version "
                + apiVersion
                + " does not support multiple networks. "
                + "Only the first network will be used. Consider upgrading to API v1.44+");
      }
    }

    return adapted;
  }

  @Override
  public Map<String, Object> adaptContainerInspectResponse(Map<String, Object> response) {
    if (response == null) {
      return response;
    }

    // v1.40-1.43 responses are already in the expected format
    // No adaptation needed for container inspection
    return response;
  }

  @Override
  public boolean supportsMultipleNetworks() {
    return false; // v1.40-1.43 only support single network
  }

  @Override
  public boolean hasVirtualSizeField() {
    return true; // v1.40-1.43 include VirtualSize field
  }

  @Override
  public String getApiVersion() {
    return apiVersion;
  }
}
