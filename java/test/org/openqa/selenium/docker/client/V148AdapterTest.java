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

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class V148AdapterTest {

  @Test
  void shouldReturnCorrectApiVersion() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.getApiVersion()).isEqualTo("1.48");
  }

  @Test
  void shouldSupportMultipleNetworks() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.supportsMultipleNetworks()).isTrue();
  }

  @Test
  void shouldNotHaveVirtualSizeField() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.hasVirtualSizeField()).isFalse();
  }

  @Test
  void shouldSupportMultiPlatform() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.supportsMultiPlatform()).isTrue();
  }

  @Test
  void shouldSupportImageMountType() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.supportsImageMountType()).isTrue();
  }

  @Test
  void shouldSupportGatewayPriority() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.supportsGatewayPriority()).isTrue();
  }

  @Test
  void shouldSupportIPv4Control() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.supportsIPv4Control()).isTrue();
  }

  @Test
  void shouldRemoveVirtualSizeFromImageResponse() {
    V148Adapter adapter = new V148Adapter("1.48");

    Map<String, Object> response = new HashMap<>();
    response.put("Id", "sha256:abc123");
    response.put("Size", 123456789L);
    response.put("VirtualSize", 987654321L); // Should be removed

    Map<String, Object> adapted = adapter.adaptImageResponse(response);

    assertThat(adapted).containsKey("Size");
    assertThat(adapted).doesNotContainKey("VirtualSize");
    assertThat(adapted.get("Size")).isEqualTo(123456789L);
  }

  @Test
  void shouldHandleImageManifestDescriptorInImageResponse() {
    V148Adapter adapter = new V148Adapter("1.48");

    Map<String, Object> platform = Map.of("architecture", "amd64", "os", "linux");
    Map<String, Object> descriptor = Map.of("digest", "sha256:xyz789", "platform", platform);

    Map<String, Object> response = new HashMap<>();
    response.put("Id", "sha256:abc123");
    response.put("Size", 123456789L);
    response.put("ImageManifestDescriptor", descriptor);
    response.put("Descriptor", Map.of("mediaType", "application/vnd.oci.image.manifest.v1+json"));

    Map<String, Object> adapted = adapter.adaptImageResponse(response);

    assertThat(adapted).containsKey("ImageManifestDescriptor");
    assertThat(adapted).containsKey("Descriptor");
  }

  @Test
  void shouldHandleImageMountTypeInContainerCreateRequest() {
    V148Adapter adapter = new V148Adapter("1.48");

    List<Map<String, Object>> mounts = new ArrayList<>();
    Map<String, Object> imageMount = new HashMap<>();
    imageMount.put("Type", "image");
    imageMount.put("Source", "myimage:latest");
    imageMount.put("Target", "/mnt/image");
    mounts.add(imageMount);

    Map<String, Object> hostConfig = Map.of("Mounts", mounts);
    Map<String, Object> request = Map.of("HostConfig", hostConfig);

    Map<String, Object> adapted = adapter.adaptContainerCreateRequest(request);

    assertThat(adapted).isNotNull();
    assertThat(adapted).containsKey("HostConfig");
  }

  @Test
  void shouldHandleGatewayPriorityInContainerCreateRequest() {
    V148Adapter adapter = new V148Adapter("1.48");

    Map<String, Object> endpoint1 = new HashMap<>();
    endpoint1.put("IPAMConfig", Map.of("IPv4Address", "172.20.0.2"));
    endpoint1.put("GwPriority", 100);

    Map<String, Object> endpoint2 = new HashMap<>();
    endpoint2.put("IPAMConfig", Map.of("IPv4Address", "172.21.0.2"));
    endpoint2.put("GwPriority", 200);

    Map<String, Object> endpointsConfig = new HashMap<>();
    endpointsConfig.put("network1", endpoint1);
    endpointsConfig.put("network2", endpoint2);

    Map<String, Object> networkingConfig = Map.of("EndpointsConfig", endpointsConfig);
    Map<String, Object> request = Map.of("NetworkingConfig", networkingConfig);

    Map<String, Object> adapted = adapter.adaptContainerCreateRequest(request);

    assertThat(adapted).isNotNull();
    assertThat(adapted).containsKey("NetworkingConfig");
  }

  @Test
  void shouldHandleImageManifestDescriptorInContainerInspectResponse() {
    V148Adapter adapter = new V148Adapter("1.48");

    Map<String, Object> descriptor =
        Map.of(
            "digest", "sha256:abc123", "platform", Map.of("architecture", "amd64", "os", "linux"));

    Map<String, Object> response = new HashMap<>();
    response.put("Id", "container123");
    response.put("ImageManifestDescriptor", descriptor);

    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(response);

    assertThat(adapted).containsKey("ImageManifestDescriptor");
    assertThat(adapted.get("ImageManifestDescriptor")).isEqualTo(descriptor);
  }

  @Test
  void shouldHandleGatewayPriorityInContainerInspectResponse() {
    V148Adapter adapter = new V148Adapter("1.48");

    Map<String, Object> network1 = new HashMap<>();
    network1.put("IPAddress", "172.20.0.2");
    network1.put("GwPriority", 100);

    Map<String, Object> network2 = new HashMap<>();
    network2.put("IPAddress", "172.21.0.2");
    network2.put("GwPriority", 200);

    Map<String, Object> networks = new HashMap<>();
    networks.put("network1", network1);
    networks.put("network2", network2);

    Map<String, Object> networkSettings = Map.of("Networks", networks);
    Map<String, Object> response = Map.of("NetworkSettings", networkSettings);

    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(response);

    assertThat(adapted).containsKey("NetworkSettings");
    @SuppressWarnings("unchecked")
    Map<String, Object> adaptedNetworkSettings =
        (Map<String, Object>) adapted.get("NetworkSettings");
    @SuppressWarnings("unchecked")
    Map<String, Object> adaptedNetworks =
        (Map<String, Object>) adaptedNetworkSettings.get("Networks");
    @SuppressWarnings("unchecked")
    Map<String, Object> adaptedNetwork1 = (Map<String, Object>) adaptedNetworks.get("network1");

    assertThat(adaptedNetwork1).containsKey("GwPriority");
    assertThat(adaptedNetwork1.get("GwPriority")).isEqualTo(100);
  }

  @Test
  void shouldRemoveDeprecatedFieldsFromContainerInspectResponse() {
    V148Adapter adapter = new V148Adapter("1.48");

    Map<String, Object> networkSettings = new HashMap<>();
    networkSettings.put("IPAddress", "172.17.0.2");
    networkSettings.put("HairpinMode", false); // Deprecated
    networkSettings.put("LinkLocalIPv6Address", "fe80::1"); // Deprecated
    networkSettings.put("Bridge", "docker0"); // Deprecated

    Map<String, Object> response = Map.of("NetworkSettings", networkSettings);

    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(response);

    @SuppressWarnings("unchecked")
    Map<String, Object> adaptedNetworkSettings =
        (Map<String, Object>) adapted.get("NetworkSettings");

    assertThat(adaptedNetworkSettings).containsKey("IPAddress");
    assertThat(adaptedNetworkSettings).doesNotContainKey("HairpinMode");
    assertThat(adaptedNetworkSettings).doesNotContainKey("LinkLocalIPv6Address");
    assertThat(adaptedNetworkSettings).doesNotContainKey("Bridge");
  }

  @Test
  void shouldHandleNullImageResponse() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.adaptImageResponse(null)).isNull();
  }

  @Test
  void shouldHandleNullContainerCreateRequest() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.adaptContainerCreateRequest(null)).isNull();
  }

  @Test
  void shouldHandleNullContainerInspectResponse() {
    V148Adapter adapter = new V148Adapter("1.48");
    assertThat(adapter.adaptContainerInspectResponse(null)).isNull();
  }

  @Test
  void shouldNotMutateOriginalResponseWhenRemovingDeprecatedFields() {
    V148Adapter adapter = new V148Adapter("1.48");

    // Create original response with deprecated fields
    Map<String, Object> originalNetworkSettings = new HashMap<>();
    originalNetworkSettings.put("IPAddress", "172.17.0.2");
    originalNetworkSettings.put("HairpinMode", false);
    originalNetworkSettings.put("Bridge", "docker0");

    Map<String, Object> originalResponse = new HashMap<>();
    originalResponse.put("Id", "container123");
    originalResponse.put("NetworkSettings", originalNetworkSettings);

    // Adapt the response
    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(originalResponse);

    // Verify original response is unchanged
    assertThat(originalResponse.get("NetworkSettings")).isEqualTo(originalNetworkSettings);
    assertThat(originalNetworkSettings).containsKey("HairpinMode");
    assertThat(originalNetworkSettings).containsKey("Bridge");

    // Verify adapted response has deprecated fields removed
    @SuppressWarnings("unchecked")
    Map<String, Object> adaptedNetworkSettings =
        (Map<String, Object>) adapted.get("NetworkSettings");
    assertThat(adaptedNetworkSettings).doesNotContainKey("HairpinMode");
    assertThat(adaptedNetworkSettings).doesNotContainKey("Bridge");
    assertThat(adaptedNetworkSettings).containsKey("IPAddress");
  }
}
