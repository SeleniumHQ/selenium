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

import org.junit.jupiter.api.Test;

class AdapterFactoryTest {

  @Test
  void shouldCreateV140AdapterForApi140() {
    ApiVersionAdapter adapter = AdapterFactory.createAdapter("1.40");
    assertThat(adapter).isInstanceOf(V140Adapter.class);
    assertThat(adapter.getApiVersion()).isEqualTo("1.40");
  }

  @Test
  void shouldCreateV140AdapterForApi141() {
    ApiVersionAdapter adapter = AdapterFactory.createAdapter("1.41");
    assertThat(adapter).isInstanceOf(V140Adapter.class);
    assertThat(adapter.getApiVersion()).isEqualTo("1.41");
  }

  @Test
  void shouldCreateV140AdapterForApi143() {
    ApiVersionAdapter adapter = AdapterFactory.createAdapter("1.43");
    assertThat(adapter).isInstanceOf(V140Adapter.class);
    assertThat(adapter.getApiVersion()).isEqualTo("1.43");
  }

  @Test
  void shouldCreateV144AdapterForApi144() {
    ApiVersionAdapter adapter = AdapterFactory.createAdapter("1.44");
    assertThat(adapter).isInstanceOf(V144Adapter.class);
    assertThat(adapter.getApiVersion()).isEqualTo("1.44");
  }

  @Test
  void shouldCreateV144AdapterForApi145() {
    ApiVersionAdapter adapter = AdapterFactory.createAdapter("1.45");
    assertThat(adapter).isInstanceOf(V144Adapter.class);
    assertThat(adapter.getApiVersion()).isEqualTo("1.45");
  }

  @Test
  void shouldThrowExceptionForNullVersion() {
    assertThatThrownBy(() -> AdapterFactory.createAdapter(null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("API version cannot be null or empty");
  }

  @Test
  void shouldThrowExceptionForEmptyVersion() {
    assertThatThrownBy(() -> AdapterFactory.createAdapter(""))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("API version cannot be null or empty");
  }

  @Test
  void shouldThrowExceptionForWhitespaceVersion() {
    assertThatThrownBy(() -> AdapterFactory.createAdapter("   "))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("API version cannot be null or empty");
  }

  @Test
  void shouldDetectMultipleNetworksSupportForApi140() {
    assertThat(AdapterFactory.supportsMultipleNetworks("1.40")).isFalse();
  }

  @Test
  void shouldDetectMultipleNetworksSupportForApi141() {
    assertThat(AdapterFactory.supportsMultipleNetworks("1.41")).isFalse();
  }

  @Test
  void shouldDetectMultipleNetworksSupportForApi144() {
    assertThat(AdapterFactory.supportsMultipleNetworks("1.44")).isTrue();
  }

  @Test
  void shouldDetectVirtualSizeFieldForApi140() {
    assertThat(AdapterFactory.hasVirtualSizeField("1.40")).isTrue();
  }

  @Test
  void shouldDetectVirtualSizeFieldForApi141() {
    assertThat(AdapterFactory.hasVirtualSizeField("1.41")).isTrue();
  }

  @Test
  void shouldDetectVirtualSizeFieldForApi144() {
    assertThat(AdapterFactory.hasVirtualSizeField("1.44")).isFalse();
  }
}
