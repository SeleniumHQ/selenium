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

    assertThat(adapted.get("Size")).isEqualTo(1234567890L);
    assertThat(adapted.get("VirtualSize")).isEqualTo(1234567890L);
  }

  @Test
  void shouldKeepExistingSizeField() {
    Map<String, Object> response = new HashMap<>();
    response.put("Id", "sha256:abc123");
    response.put("Size", 1234567890L);
    response.put("VirtualSize", 1234567890L);

    Map<String, Object> adapted = adapter.adaptImageResponse(response);

    assertThat(adapted.get("Size")).isEqualTo(1234567890L);
    assertThat(adapted.get("VirtualSize")).isEqualTo(1234567890L);
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
  void shouldPassThroughContainerInspectResponse() {
    Map<String, Object> response =
        Map.of("Id", "abc123", "NetworkSettings", Map.of("IPAddress", "172.17.0.2"));

    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(response);

    assertThat(adapted).isEqualTo(response);
  }

  @Test
  void shouldHandleNullContainerInspectResponse() {
    Map<String, Object> adapted = adapter.adaptContainerInspectResponse(null);
    assertThat(adapted).isNull();
  }
}
