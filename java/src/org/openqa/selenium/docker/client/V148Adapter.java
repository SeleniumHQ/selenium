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
 * Adapter for Docker API version 1.48 and later.
 *
 * <p>Key features of API v1.48+:
 *
 * <ul>
 *   <li>Multi-platform image support with {@code platform} parameter
 *   <li>Image mount type support ({@code Mount.Type = "image"})
 *   <li>Gateway priority ({@code GwPriority}) for network endpoints
 *   <li>Enhanced image manifest descriptors ({@code ImageManifestDescriptor})
 *   <li>IPv4 IPAM control ({@code EnableIPv4} for networks)
 *   <li>Improved progress reporting (deprecated {@code error} and {@code progress} fields)
 * </ul>
 *
 * <p>This adapter extends v1.44 functionality with v1.48-specific enhancements for better
 * multi-platform support and network control.
 */
class V148Adapter implements ApiVersionAdapter {

  private static final Logger LOG = Logger.getLogger(V148Adapter.class.getName());
  private final String apiVersion;

  public V148Adapter(String apiVersion) {
    this.apiVersion = apiVersion;
  }

  @Override
  public Map<String, Object> adaptImageResponse(Map<String, Object> response) {
    if (response == null) {
      return response;
    }

    Map<String, Object> adapted = new HashMap<>(response);

    // Ensure VirtualSize is not present (removed in v1.44)
    if (adapted.containsKey("VirtualSize")) {
      LOG.warning(
          "VirtualSize field found in API v"
              + apiVersion
              + " response. This field was removed in v1.44.");
      adapted.remove("VirtualSize");
    }

    // Ensure Size field is present (required in v1.44+)
    if (!adapted.containsKey("Size")) {
      LOG.warning("Size field missing from image response in API v" + apiVersion);
    }

    // v1.48+ includes ImageManifestDescriptor for multi-platform images
    // Extract platform information for better observability
    if (adapted.containsKey("ImageManifestDescriptor")) {
      @SuppressWarnings("unchecked")
      Map<String, Object> descriptor = (Map<String, Object>) adapted.get("ImageManifestDescriptor");
      if (descriptor != null && descriptor.containsKey("platform")) {
        Object platformObj = descriptor.get("platform");
        if (platformObj instanceof Map) {
          @SuppressWarnings("unchecked")
          Map<String, Object> platform = (Map<String, Object>) platformObj;
          String arch = (String) platform.get("architecture");
          String os = (String) platform.get("os");
          if (arch != null && os != null) {
            LOG.fine(
                String.format(
                    "Image is platform-specific: %s/%s (API v%s multi-platform support)",
                    os, arch, apiVersion));
          }
        }
      }
    }

    // v1.48+ includes Descriptor field (OCI descriptor)
    // Validate OCI descriptor structure
    if (adapted.containsKey("Descriptor")) {
      @SuppressWarnings("unchecked")
      Map<String, Object> descriptor = (Map<String, Object>) adapted.get("Descriptor");
      if (descriptor != null) {
        String mediaType = (String) descriptor.get("mediaType");
        if (mediaType != null) {
          LOG.fine("Image includes OCI descriptor with mediaType: " + mediaType);
        }
      }
    }

    return adapted;
  }

  @Override
  public Map<String, Object> adaptContainerCreateRequest(Map<String, Object> request) {
    if (request == null) {
      return request;
    }

    Map<String, Object> adapted = new HashMap<>(request);

    // v1.48+ supports Mount type "image" for mounting images inside containers
    // Validate image mount configurations
    @SuppressWarnings("unchecked")
    Map<String, Object> hostConfig = (Map<String, Object>) adapted.get("HostConfig");

    if (hostConfig != null) {
      @SuppressWarnings("unchecked")
      Object mounts = hostConfig.get("Mounts");

      if (mounts instanceof Iterable) {
        for (Object mount : (Iterable<?>) mounts) {
          if (mount instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> mountMap = (Map<String, Object>) mount;
            String type = (String) mountMap.get("Type");

            if ("image".equals(type)) {
              // Validate required fields for image mounts
              String source = (String) mountMap.get("Source");
              String target = (String) mountMap.get("Target");

              if (source == null || source.isEmpty()) {
                LOG.warning("Image mount missing required 'Source' field");
              }
              if (target == null || target.isEmpty()) {
                LOG.warning("Image mount missing required 'Target' field");
              }

              if (source != null && target != null) {
                LOG.fine(
                    String.format(
                        "Mounting image '%s' at '%s' (API v%s+ image mount support)",
                        source, target, apiVersion));
              }
            }
          }
        }
      }
    }

    // v1.48+ supports GwPriority in NetworkingConfig for gateway priority
    // Validate and log gateway priority configuration
    @SuppressWarnings("unchecked")
    Map<String, Object> networkingConfig = (Map<String, Object>) adapted.get("NetworkingConfig");

    if (networkingConfig != null) {
      @SuppressWarnings("unchecked")
      Map<String, Object> endpointsConfig =
          (Map<String, Object>) networkingConfig.get("EndpointsConfig");

      if (endpointsConfig != null && endpointsConfig.size() > 1) {
        // Track gateway priorities for multi-network containers
        int highestPriority = Integer.MIN_VALUE;
        String defaultGatewayNetwork = null;

        for (Map.Entry<String, Object> entry : endpointsConfig.entrySet()) {
          if (entry.getValue() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> endpointConfig = (Map<String, Object>) entry.getValue();

            if (endpointConfig.containsKey("GwPriority")) {
              Object priorityObj = endpointConfig.get("GwPriority");
              int priority = priorityObj instanceof Number ? ((Number) priorityObj).intValue() : 0;

              if (priority > highestPriority) {
                highestPriority = priority;
                defaultGatewayNetwork = entry.getKey();
              }
            }
          }
        }

        if (defaultGatewayNetwork != null) {
          LOG.fine(
              String.format(
                  "Container will use '%s' as default gateway (priority: %d, API v%s+)",
                  defaultGatewayNetwork, highestPriority, apiVersion));
        } else {
          LOG.fine(
              String.format(
                  "Creating container with %d networks, no explicit gateway priority set",
                  endpointsConfig.size()));
        }
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

    // v1.48+ includes ImageManifestDescriptor with platform information
    // Extract and expose platform details for better observability
    if (adapted.containsKey("ImageManifestDescriptor")) {
      @SuppressWarnings("unchecked")
      Map<String, Object> descriptor = (Map<String, Object>) adapted.get("ImageManifestDescriptor");
      if (descriptor != null && descriptor.containsKey("platform")) {
        Object platformObj = descriptor.get("platform");
        if (platformObj instanceof Map) {
          @SuppressWarnings("unchecked")
          Map<String, Object> platform = (Map<String, Object>) platformObj;
          String arch = (String) platform.get("architecture");
          String os = (String) platform.get("os");
          String digest = (String) descriptor.get("digest");

          if (arch != null && os != null) {
            LOG.fine(
                String.format(
                    "Container running on %s/%s platform (digest: %s, API v%s+)",
                    os,
                    arch,
                    digest != null ? digest.substring(0, Math.min(12, digest.length())) : "unknown",
                    apiVersion));
          }
        }
      }
    }

    // v1.48+ includes GwPriority in NetworkSettings
    // Identify which network is providing the default gateway
    @SuppressWarnings("unchecked")
    Map<String, Object> originalNetworkSettings =
        (Map<String, Object>) adapted.get("NetworkSettings");

    if (originalNetworkSettings != null) {
      // Create defensive copy to avoid mutating the original response
      Map<String, Object> networkSettings = new HashMap<>(originalNetworkSettings);
      adapted.put("NetworkSettings", networkSettings);

      @SuppressWarnings("unchecked")
      Map<String, Object> networks = (Map<String, Object>) networkSettings.get("Networks");

      if (networks != null && networks.size() > 1) {
        int highestPriority = Integer.MIN_VALUE;
        String defaultGatewayNetwork = null;

        for (Map.Entry<String, Object> entry : networks.entrySet()) {
          if (entry.getValue() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> network = (Map<String, Object>) entry.getValue();

            if (network.containsKey("GwPriority")) {
              Object priorityObj = network.get("GwPriority");
              int priority = priorityObj instanceof Number ? ((Number) priorityObj).intValue() : 0;

              if (priority > highestPriority) {
                highestPriority = priority;
                defaultGatewayNetwork = entry.getKey();
              }
            }
          }
        }

        if (defaultGatewayNetwork != null) {
          LOG.fine(
              String.format(
                  "Container using '%s' as default gateway (priority: %d)",
                  defaultGatewayNetwork, highestPriority));
        }
      }

      // Remove deprecated fields (should not be present in v1.48+)
      String[] deprecatedFields = {
        "HairpinMode",
        "LinkLocalIPv6Address",
        "LinkLocalIPv6PrefixLen",
        "SecondaryIPAddresses",
        "SecondaryIPv6Addresses",
        "Bridge" // Deprecated in v1.51, removed in v1.52
      };

      for (String field : deprecatedFields) {
        if (networkSettings.containsKey(field)) {
          LOG.fine(
              "Removing deprecated field '"
                  + field
                  + "' from NetworkSettings (deprecated in earlier API versions)");
          networkSettings.remove(field);
        }
      }
    }

    return adapted;
  }

  @Override
  public boolean supportsMultipleNetworks() {
    return true; // v1.48+ supports multiple network endpoints (inherited from v1.44)
  }

  @Override
  public boolean hasVirtualSizeField() {
    return false; // v1.48+ does not include VirtualSize (removed in v1.44)
  }

  @Override
  public String getApiVersion() {
    return apiVersion;
  }

  /**
   * Checks if this adapter supports multi-platform image operations.
   *
   * @return true for v1.48+ which supports platform-specific operations
   */
  public boolean supportsMultiPlatform() {
    return true;
  }

  /**
   * Checks if this adapter supports image mount type.
   *
   * @return true for v1.48+ which supports mounting images inside containers
   */
  public boolean supportsImageMountType() {
    return true;
  }

  /**
   * Checks if this adapter supports gateway priority for network endpoints.
   *
   * @return true for v1.48+ which supports GwPriority
   */
  public boolean supportsGatewayPriority() {
    return true;
  }

  /**
   * Checks if this adapter supports IPv4 IPAM control.
   *
   * @return true for v1.48+ which supports EnableIPv4 for networks
   */
  public boolean supportsIPv4Control() {
    return true;
  }
}
