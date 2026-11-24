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

package org.openqa.selenium.bidi.protocol.webextension;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class MozListExtensionsResultTest {

  @Test
  void decodesTheVendorTypesAddedForTheCommand() {
    String raw =
        "{\"extensions\": [{\"id\": \"ext@example.com\", \"name\": \"ext\", \"version\": \"1.0\","
            + " \"manifestVersion\": 3, \"isActive\": true, \"isSystem\": false, \"hidden\": false,"
            + " \"temporarilyInstalled\": true}]}";

    MozListExtensionsResult result = new Json().toType(raw, MozListExtensionsResult.class);

    assertThat(result.getExtensions()).hasSize(1);
    assertThat(result.getExtensions().get(0).getId()).isEqualTo("ext@example.com");
    assertThat(result.getExtensions().get(0).getManifestVersion()).isEqualTo(3L);
  }
}
