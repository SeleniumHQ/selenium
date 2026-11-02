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

package org.openqa.selenium.bidi.protocol.script;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class SharedReferenceTest {

  // script.SharedReference is both sent (as a script argument) and received (inside a
  // RemoteValue), so it is the bidirectional case: addExtension lives on the Builder, and
  // Builder.build() and the deserializer's fromJson both funnel through the same shared,
  // validated constructor.

  @Test
  void builderAddedExtensionAppearsOnTheBuiltInstanceAndOnTheWire() {
    SharedReference ref =
        SharedReference.builder("shared-1").addExtension("vendorHint", "chrome").build();

    assertThat(ref.getSharedId()).isEqualTo("shared-1");
    assertThat(ref.getExtensions()).containsExactly(Map.entry("vendorHint", "chrome"));
    assertThat(ref.toMap()).containsEntry("vendorHint", "chrome");
  }

  @Test
  void reusingTheBuilderAfterBuildDoesNotMutateThePreviouslyBuiltInstance() {
    SharedReference.Builder builder =
        SharedReference.builder("shared-1").addExtension("vendorHint", "chrome");

    SharedReference first = builder.build();
    builder.addExtension("secondHint", "firefox");

    assertThat(first.getExtensions()).containsExactly(Map.entry("vendorHint", "chrome"));
    assertThat(first.toMap()).containsEntry("vendorHint", "chrome").doesNotContainKey("secondHint");
  }

  @Test
  void builderRejectsAnExtensionThatShadowsADeclaredField() {
    SharedReference.Builder builder = SharedReference.builder("shared-1");

    assertThatThrownBy(() -> builder.addExtension("sharedId", "collides"))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("sharedId");
  }

  @Test
  void undeclaredWireFieldOnAReceivedInstanceIsPreservedAsAnExtension() {
    SharedReference ref =
        new Json()
            .toType(
                "{\"sharedId\": \"shared-2\", \"handle\": \"h1\", \"vendorHint\": \"firefox\"}",
                SharedReference.class);

    assertThat(ref.getHandle()).contains("h1");
    assertThat(ref.getExtensions()).containsExactly(Map.entry("vendorHint", "firefox"));
  }

  @Test
  void aReceivedInstanceWithNoUndeclaredFieldsHasEmptyExtensions() {
    SharedReference ref = new Json().toType("{\"sharedId\": \"shared-3\"}", SharedReference.class);

    assertThat(ref.getExtensions()).isEmpty();
  }
}
