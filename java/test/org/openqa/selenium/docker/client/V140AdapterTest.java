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
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class V140AdapterTest {

  private final V140Adapter adapter = new V140Adapter("1.40");

  @Test
  void shouldReturnCorrectApiVersion() {
    assertThat(adapter.getApiVersion()).isEqualTo("1.40");
  }

  @Test
  void shouldNotSupportMultipleNetworks() {
    assertThat(adapter.supportsMultipleNetworks()).isFalse();
  }

  @Test
  void shouldHaveVirtualSizeField() {
    assertThat(adapter.hasVirtualSizeField()).isTrue();
  }

  @Test
  void shouldEnsureSizeFieldFromVirtualSize() {
    Map<String, Object> response = new HashMap<>();
    response.put("Id", "sha256:abc123");
    response.put("VirtualSize", 1234567890L);

    Map<String, Object> adapted = adapter.adaptImageResponse(response);

    assertThat(adapted)
        .hasSize(3)
        .containsEntry("Id", "sha256:abc123")
        .containsEntry("Size", 1234567890L)
        .containsEntry("VirtualSize", 1234567890L);
  }

  @Test
  void shouldKeepExistingSizeField() {
    Map<String, Object> response = new HashMap<>();
    response.put("Id", "sha256:abc123");
    response.put("Size", 1111111111L);
    response.put("VirtualSize", 1234567890L);

    Map<String, Object> adapted = adapter.adaptImageResponse(response);

    assertThat(adapted)
        .hasSize(3)
        .containsEntry("Id", "sha256:abc123")
        .containsEntry("Size", 1111111111L)
        .containsEntry("VirtualSize", 1234567890L);
  }

  @Test
  @SuppressWarnings("DataFlowIssue")
  void nullImageResponseNotAllowed() {
    assertThatThrownBy(() -> adapter.adaptImageResponse(null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Image response must be set");
  }

  @Test
  void shouldPassThroughContainerCreateRequest() {
    Map<String, Object> request = Map.of("Image", "selenium/standalone-chrome");

    Map<String, Object> adapted = adapter.adaptContainerCreateRequest(request);

    assertThat(adapted).isEqualTo(request);
  }

  @Test
  @SuppressWarnings("DataFlowIssue")
  void nullContainerCreateRequestNotAllowed() {
    assertThatThrownBy(() -> adapter.adaptContainerCreateRequest(null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Container Create Request must be set");
  }

  @Test
  void shouldPassThroughContainerInspectResponse() {
    Map<String, Object> response =
        Map.of("Id", "abc123", "NetworkSettings", Map.of("IPAddress", "172.17.0.2"));

    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(response);

    assertThat(adapted).isEqualTo(response);
  }

  @Test
  void nullContainerInspectResponseNotAllowed() {
    assertThatThrownBy(() -> adapter.adaptContainerInspectResponse(null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Container Inspect Response must be set");
  }
}
