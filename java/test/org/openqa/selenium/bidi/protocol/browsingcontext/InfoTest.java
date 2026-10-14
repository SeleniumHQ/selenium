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

package org.openqa.selenium.bidi.protocol.browsingcontext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;

@Tag("UnitTests")
class InfoTest {

  private static final String BASE =
      "\"clientWindow\": \"w1\", \"context\": \"ctx1\", \"url\": \"https://example.com\","
          + " \"userContext\": \"default\"";

  @Test
  void requiredNullableFieldsAcceptAnExplicitNullValue() {
    String raw = "{" + BASE + ", \"children\": null, \"originalOpener\": null}";

    Info info = new Json().toType(raw, Info.class);

    assertThat(info.getChildren()).isNull();
    assertThat(info.getOriginalOpener()).isNull();
  }

  @Test
  void requiredNullableFieldsMustStillBePresentAsAKey() {
    // "originalOpener" is required + nullable — the value may be null, but the key may not be
    // missing entirely. Omitting it should still fail, exactly like any other required field.
    String raw = "{" + BASE + ", \"children\": null}";

    assertThatExceptionOfType(JsonException.class)
        .isThrownBy(() -> new Json().toType(raw, Info.class));
  }

  @Test
  void optionalNullableFieldDefaultsToEmptyWhenNeverSent() {
    String raw = "{" + BASE + ", \"children\": null, \"originalOpener\": null}";

    Info info = new Json().toType(raw, Info.class);

    assertThat(info.getParent()).isEmpty();
  }

  @Test
  void optionalNullableFieldAcceptsAnExplicitNullTheSameAsAbsence() {
    // Unlike the outbound xSet tracking used for toMap(), inbound deserialization has no way (and
    // no need) to distinguish "the browser sent an explicit null" from "the key was absent" for
    // an optional field — both collapse to Optional.empty(). Info is receiver-only (no toMap()),
    // so this asymmetry never needs to round-trip.
    String raw = "{" + BASE + ", \"children\": null, \"originalOpener\": null, \"parent\": null}";

    Info info = new Json().toType(raw, Info.class);

    assertThat(info.getParent()).isEmpty();
  }

  @Test
  void allFieldsPopulatedDeserializeCorrectly() {
    String raw =
        "{"
            + BASE
            + ", \"children\": [], \"originalOpener\": \"opener-ctx\", \"parent\": \"parent-ctx\"}";

    Info info = new Json().toType(raw, Info.class);

    assertThat(info.getChildren()).isEmpty();
    assertThat(info.getOriginalOpener()).isEqualTo("opener-ctx");
    assertThat(info.getParent()).contains("parent-ctx");
    assertThat(info.getClientWindow()).isEqualTo("w1");
    assertThat(info.getContext()).isEqualTo("ctx1");
    assertThat(info.getUrl()).isEqualTo("https://example.com");
    assertThat(info.getUserContext()).isEqualTo("default");
  }
}
