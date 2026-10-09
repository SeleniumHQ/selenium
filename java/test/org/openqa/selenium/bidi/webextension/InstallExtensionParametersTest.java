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

package org.openqa.selenium.bidi.webextension;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

class InstallExtensionParametersTest {

  @Test
  void emitsJustTheExtensionDataWhenNoVendorOptions() {
    Map<String, Object> map = new InstallExtensionParameters(new ExtensionPath("/tmp/ext")).toMap();

    assertThat(map)
        .containsOnlyKeys("extensionData")
        .extractingByKey("extensionData")
        .isEqualTo(Map.of("type", "path", "path", "/tmp/ext"));
  }

  @Test
  void mergesVendorOptionsAsSiblingsOfExtensionData() {
    Map<String, Object> map =
        new InstallExtensionParameters(
                new ExtensionPath("/tmp/ext"),
                Map.of("moz:permanent", true, "moz:allowPrivateBrowsing", false))
            .toMap();

    assertThat(map)
        .containsEntry("moz:permanent", true)
        .containsEntry("moz:allowPrivateBrowsing", false);
    assertThat(map).containsKey("extensionData");
  }

  @Test
  void doesNotLetVendorOptionsClobberExtensionData() {
    Map<String, Object> map =
        new InstallExtensionParameters(
                new ExtensionPath("/tmp/ext"), Map.of("extensionData", "hijacked"))
            .toMap();

    assertThat(map.get("extensionData")).isNotEqualTo("hijacked");
  }
}
