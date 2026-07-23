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

package org.openqa.selenium.remote.codec.w3c;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;

import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;

@Tag("UnitTests")
class W3CHttpCommandCodecTest {

  private final W3CHttpCommandCodec codec = new W3CHttpCommandCodec();
  private final SessionId sessionId = new SessionId(UUID.randomUUID());
  private final Json json = new Json();

  @Test
  void ensureLeadingAsciiDigitClassNameIsEscapedAsCodePoint() {
    Map<String, Object> params = encodeFindElement("class name", "5foo");

    assertThat(params).containsEntry("using", "css selector").containsEntry("value", ".\\35 foo");
  }

  @Test
  void ensureLeadingAsciiDigitIdIsEscapedAsCodePoint() {
    Map<String, Object> params = encodeFindElement("id", "5foo");

    assertThat(params).containsEntry("using", "css selector").containsEntry("value", "#\\35 foo");
  }

  @Test
  void ensureLeadingNonAsciiDigitClassNameIsNotMisescapedAsADifferentAsciiDigit() {
    // U+0665 (Arabic-Indic digit five) has numeric value 5, but is not an ASCII digit.
    // It must be passed through as-is, not (mis)escaped to the same selector as an ASCII '5'.
    Map<String, Object> arabicIndicFive = encodeFindElement("class name", "٥foo");
    Map<String, Object> asciiFive = encodeFindElement("class name", "5foo");

    assertThat(arabicIndicFive)
        .containsEntry("using", "css selector")
        .containsEntry("value", ".٥foo");
    assertThat(arabicIndicFive.get("value")).isNotEqualTo(asciiFive.get("value"));
  }

  private Map<String, Object> encodeFindElement(String strategy, Object value) {
    HttpRequest request =
        codec.encode(new Command(sessionId, DriverCommand.FIND_ELEMENT(strategy, value)));
    return json.toType(string(request), MAP_TYPE);
  }
}
