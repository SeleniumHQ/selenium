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

package org.openqa.selenium.bidi.protocol.network;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class CookieTest {

  private static final String BASE_FIELDS =
      "\"name\": \"sid\", \"value\": {\"type\": \"string\", \"value\": \"abc\"},"
          + " \"domain\": \"example.com\", \"path\": \"/\", \"size\": 6,"
          + " \"httpOnly\": false, \"secure\": true, \"sameSite\": \"strict\"";

  @Test
  void undeclaredWireFieldIsPreservedAsAnExtension() {
    // network.Cookie is extensible but receive-only (Selenium sets cookies through the
    // differently-typed storage.PartialCookie), so this confirms extras get kept regardless of
    // whether the type can also be sent back out.
    Cookie cookie = new Json().toType("{" + BASE_FIELDS + ", \"sameParty\": true}", Cookie.class);

    assertThat(cookie.getName()).isEqualTo("sid");
    assertThat(cookie.getExtensions()).containsExactly(Map.entry("sameParty", true));
  }

  @Test
  void multipleUndeclaredFieldsAreAllPreserved() {
    Cookie cookie =
        new Json()
            .toType(
                "{" + BASE_FIELDS + ", \"sameParty\": true, \"partitionKey\": \"top-level\"}",
                Cookie.class);

    assertThat(cookie.getExtensions())
        .containsExactly(Map.entry("sameParty", true), Map.entry("partitionKey", "top-level"));
  }

  @Test
  void noUndeclaredFieldsMeansAnEmptyExtensionsMap() {
    Cookie cookie = new Json().toType("{" + BASE_FIELDS + "}", Cookie.class);

    assertThat(cookie.getExtensions()).isEmpty();
  }

  @Test
  void extensionsMapIsUnmodifiable() {
    Cookie cookie = new Json().toType("{" + BASE_FIELDS + "}", Cookie.class);

    assertThatThrownBy(() -> cookie.getExtensions().put("x", "y"))
        .isInstanceOf(UnsupportedOperationException.class);
  }
}
