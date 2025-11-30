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

import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class V144AdapterTest {

  private final V144Adapter adapter = new V144Adapter("1.44");

  @Test
  void shouldReturnCorrectApiVersion() {
    assertThat(adapter.getApiVersion()).isEqualTo("1.44");
  }

  @Test
  void shouldSupportMultipleNetworks() {
    assertThat(adapter.supportsMultipleNetworks()).isTrue();
  }

  @Test
  void shouldNotHaveVirtualSizeField() {
    assertThat(adapter.hasVirtualSizeField()).isFalse();
  }

  @Test
  void shouldRemoveVirtualSizeField() {
    Map<String, Object> response = new HashMap<>();
    response.put("Id", "sha256:abc123");
    response.put("Size", 1234567890L);
    response.put("VirtualSize", 1234567890L); // Should be removed

    Map<String, Object> adapted = adapter.adaptImageResponse(response);

    assertThat(adapted.get("Size")).isEqualTo(1234567890L);
    assertThat(adapted.containsKey("VirtualSize")).isFalse();
  }

  @Test
  void shouldKeepSizeFieldOnly() {
    Map<String, Object> response = new HashMap<>();
    response.put("Id", "sha256:abc123");
    response.put("Size", 1234567890L);

    Map<String, Object> adapted = adapter.adaptImageResponse(response);

    assertThat(adapted.get("Size")).isEqualTo(1234567890L);
    assertThat(adapted.containsKey("VirtualSize")).isFalse();
  }

  @Test
  void shouldHandleNullImageResponse() {
    Map<String, Object> adapted = adapter.adaptImageResponse(null);
    assertThat(adapted).isNull();
  }

  @Test
  void shouldPassThroughContainerCreateRequest() {
    Map<String, Object> request = Map.of("Image", "selenium/standalone-chrome");

    Map<String, Object> adapted = adapter.adaptContainerCreateRequest(request);

    assertThat(adapted).isEqualTo(request);
  }

  @Test
  void shouldHandleNullContainerCreateRequest() {
    Map<String, Object> adapted = adapter.adaptContainerCreateRequest(null);
    assertThat(adapted).isNull();
  }

  @Test
  void shouldRemoveDeprecatedNetworkSettingsFields() {
    Map<String, Object> networkSettings = new HashMap<>();
    networkSettings.put("IPAddress", "172.17.0.2");
    networkSettings.put("HairpinMode", false); // Deprecated in 1.44
    networkSettings.put("LinkLocalIPv6Address", ""); // Deprecated in 1.44
    networkSettings.put("LinkLocalIPv6PrefixLen", 0); // Deprecated in 1.44

    Map<String, Object> response = new HashMap<>();
    response.put("Id", "abc123");
    response.put("NetworkSettings", networkSettings);

    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(response);

    @SuppressWarnings("unchecked")
    Map<String, Object> adaptedNetworkSettings =
        (Map<String, Object>) adapted.get("NetworkSettings");

    assertThat(adaptedNetworkSettings.get("IPAddress")).isEqualTo("172.17.0.2");
    assertThat(adaptedNetworkSettings.containsKey("HairpinMode")).isFalse();
    assertThat(adaptedNetworkSettings.containsKey("LinkLocalIPv6Address")).isFalse();
    assertThat(adaptedNetworkSettings.containsKey("LinkLocalIPv6PrefixLen")).isFalse();
  }

  @Test
  void shouldHandleContainerInspectResponseWithoutDeprecatedFields() {
    Map<String, Object> response =
        Map.of("Id", "abc123", "NetworkSettings", Map.of("IPAddress", "172.17.0.2"));

    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(response);

    @SuppressWarnings("unchecked")
    Map<String, Object> adaptedNetworkSettings =
        (Map<String, Object>) adapted.get("NetworkSettings");

    assertThat(adaptedNetworkSettings.get("IPAddress")).isEqualTo("172.17.0.2");
  }

  @Test
  void shouldHandleNullContainerInspectResponse() {
    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(null);
    assertThat(adapted).isNull();
  }

  @Test
  void shouldHandleContainerInspectResponseWithoutNetworkSettings() {
    Map<String, Object> response = Map.of("Id", "abc123");

    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(response);

    assertThat(adapted.get("Id")).isEqualTo("abc123");
    assertThat(adapted.containsKey("NetworkSettings")).isFalse();
  }

  @Test
  void shouldNotMutateOriginalResponseWhenRemovingDeprecatedFields() {
    // Create original response with deprecated fields
    Map<String, Object> originalNetworkSettings = new HashMap<>();
    originalNetworkSettings.put("IPAddress", "172.17.0.2");
    originalNetworkSettings.put("HairpinMode", false);
    originalNetworkSettings.put("LinkLocalIPv6Address", "fe80::1");

    Map<String, Object> originalResponse = new HashMap<>();
    originalResponse.put("Id", "container123");
    originalResponse.put("NetworkSettings", originalNetworkSettings);

    // Adapt the response
    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(originalResponse);

    // Verify original response is unchanged
    assertThat(originalResponse.get("NetworkSettings")).isEqualTo(originalNetworkSettings);
    assertThat(originalNetworkSettings).containsKey("HairpinMode");
    assertThat(originalNetworkSettings).containsKey("LinkLocalIPv6Address");

    // Verify adapted response has deprecated fields removed
    @SuppressWarnings("unchecked")
    Map<String, Object> adaptedNetworkSettings =
        (Map<String, Object>) adapted.get("NetworkSettings");
    assertThat(adaptedNetworkSettings).doesNotContainKey("HairpinMode");
    assertThat(adaptedNetworkSettings).doesNotContainKey("LinkLocalIPv6Address");
    assertThat(adaptedNetworkSettings).containsKey("IPAddress");
  }
}
