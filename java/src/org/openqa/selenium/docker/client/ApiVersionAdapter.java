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

import java.util.Map;

/**
 * Adapter interface for handling API version-specific differences in Docker Engine API.
 *
 * <p>Different Docker API versions may have subtle differences in request/response formats, field
 * names, or behavior. Adapters provide a way to normalize these differences and ensure consistent
 * behavior across API versions.
 *
 * <p>Key differences handled by adapters:
 *
 * <ul>
 *   <li>v1.40-1.43: Uses {@code VirtualSize} field in image responses
 *   <li>v1.44+: {@code VirtualSize} removed, use {@code Size} field instead
 *   <li>v1.44+: Support for multiple network endpoints in container creation
 *   <li>v1.44+: Enhanced validation for network creation
 * </ul>
 */
interface ApiVersionAdapter {

  /**
   * Adapts an image response from the Docker API to normalize field names and structure.
   *
   * <p>Example: In API v1.44+, {@code VirtualSize} was removed. This method ensures that {@code
   * Size} is always available regardless of API version.
   *
   * @param response The raw image response from Docker API
   * @return Adapted response with normalized field names
   */
  Map<String, Object> adaptImageResponse(Map<String, Object> response);

  /**
   * Adapts a container creation request to match the target API version's expectations.
   *
   * <p>Example: API v1.44+ supports multiple network endpoints, while earlier versions only support
   * a single network. This method ensures the request is formatted correctly.
   *
   * @param request The container creation request
   * @return Adapted request compatible with the target API version
   */
  Map<String, Object> adaptContainerCreateRequest(Map<String, Object> request);

  /**
   * Adapts a container inspection response to normalize field names and structure.
   *
   * <p>Example: Some fields may be deprecated or renamed across versions. This method ensures
   * consistent field names in the response.
   *
   * @param response The raw container inspection response from Docker API
   * @return Adapted response with normalized field names
   */
  Map<String, Object> adaptContainerInspectResponse(Map<String, Object> response);

  /**
   * Returns whether this API version supports multiple network endpoints in container creation.
   *
   * @return true if multiple networks are supported, false otherwise
   */
  boolean supportsMultipleNetworks();

  /**
   * Returns whether this API version includes the VirtualSize field in image responses.
   *
   * @return true if VirtualSize field is present, false otherwise
   */
  boolean hasVirtualSizeField();

  /**
   * Returns the API version this adapter is designed for.
   *
   * @return API version string (e.g., "1.40", "1.44")
   */
  String getApiVersion();
}
