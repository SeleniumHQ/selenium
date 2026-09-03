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

package org.openqa.selenium.bidi.protocol.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.protocol.network.StringValue;

@Tag("UnitTests")
class PartialCookieTest {

  private static PartialCookie cookie() {
    return new PartialCookie("sid", new StringValue("string", "abc"), "example.com");
  }

  @Test
  void addedExtensionIsSerializedOntoTheWireAlongsideDeclaredFields() {
    // storage.PartialCookie is extensible and sendable, so an added extra field should reach the
    // wire alongside the declared ones.
    Map<String, Object> map = cookie().addExtension("sameParty", true).toMap();

    assertThat(map).containsEntry("name", "sid");
    assertThat(map).containsEntry("domain", "example.com");
    assertThat(map).containsEntry("sameParty", true);
  }

  @Test
  void addExtensionReturnsThisForFluentChaining() {
    PartialCookie built = cookie().addExtension("a", 1).addExtension("b", 2);

    assertThat(built.getExtensions()).containsExactly(Map.entry("a", 1), Map.entry("b", 2));
  }

  @Test
  void addingAnExtensionForAnAlreadyDeclaredFieldIsRejected() {
    // A caller-added extension must never shadow a declared field's wire key.
    assertThatThrownBy(() -> cookie().addExtension("name", "collides"))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("name");
  }

  @Test
  void noExtensionsAddedMeansNoExtraWireKeys() {
    Map<String, Object> map = cookie().toMap();

    assertThat(map).containsOnlyKeys("name", "value", "domain");
  }
}
