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

package org.openqa.selenium.remote;

import static java.util.Collections.EMPTY_MAP;
import static java.util.Collections.emptyMap;
import static java.util.Collections.singleton;
import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static java.util.stream.Collectors.toList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.Platform.LINUX;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.Dialect.W3C;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;

@Tag("UnitTests")
class NewSessionPayloadTest {

  @Test
  void shouldIndicateDownstreamW3cDialect() {
    Map<String, Map<String, Map<String, String>>> caps =
        singletonMap(
            "capabilities", singletonMap("alwaysMatch", singletonMap("browserName", "cheese")));

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertThat(payload.getDownstreamDialects()).isEqualTo(singleton(W3C));
    }

    String json = new Json().toJson(caps);
    try (NewSessionPayload payload =
        NewSessionPayload.create(Contents.string(json, StandardCharsets.UTF_8))) {
      assertThat(payload.getDownstreamDialects()).isEqualTo(singleton(W3C));
    }
  }

  @Test
  void shouldReturnAlwaysMatchIfNoFirstMatchIsPresent() {
    List<Capabilities> capabilities =
        create(
            singletonMap(
                "capabilities",
                singletonMap("alwaysMatch", singletonMap("browserName", "cheese"))));

    assertThat(capabilities).as(() -> capabilities.toString()).hasSize(1);
    assertThat(capabilities.get(0).getBrowserName()).isEqualTo("cheese");
  }

  @Test
  void shouldReturnEachFirstMatchIfNoAlwaysMatchIsPresent() {
    List<Capabilities> capabilities =
        create(
            singletonMap(
                "capabilities",
                singletonMap(
                    "firstMatch",
                    List.of(
                        singletonMap("browserName", "cheese"),
                        singletonMap("browserName", "peas")))));

    assertThat(capabilities).as(() -> capabilities.toString()).hasSize(2);
    assertThat(capabilities.get(0).getBrowserName()).isEqualTo("cheese");
    assertThat(capabilities.get(1).getBrowserName()).isEqualTo("peas");
  }

  @Test
  void shouldOfferStreamOfW3cCapabilitiesIfPresent() {
    List<Capabilities> capabilities =
        create(
            Map.of(
                "capabilities", singletonMap("alwaysMatch", singletonMap("browserName", "peas"))));

    // We expect a synthetic w3c capability for the mismatching OSS capabilities
    assertThat(capabilities).as(() -> capabilities.toString()).hasSize(1);
    assertThat(capabilities.get(0).getBrowserName()).isEqualTo("peas");
  }

  @Test
  void shouldMergeAlwaysAndFirstMatches() {
    List<Capabilities> capabilities =
        create(
            singletonMap(
                "capabilities",
                Map.of(
                    "alwaysMatch",
                    singletonMap("se:cake", "also cheese"),
                    "firstMatch",
                    List.of(
                        singletonMap("browserName", "cheese"),
                        singletonMap("browserName", "peas")))));

    assertThat(capabilities).as(() -> capabilities.toString()).hasSize(2);
    assertThat(capabilities.get(0).getBrowserName()).isEqualTo("cheese");
    assertThat(capabilities.get(0).getCapability("se:cake")).isEqualTo("also cheese");
    assertThat(capabilities.get(1).getBrowserName()).isEqualTo("peas");
    assertThat(capabilities.get(1).getCapability("se:cake")).isEqualTo("also cheese");
  }

  @Test
  void shouldCorrectlyExtractPlatformFromW3cCapabilities() {
    List<Capabilities> capabilities =
        create(
            singletonMap(
                "capabilities",
                singletonMap("alwaysMatch", singletonMap("platformName", "linux"))));

    assertThat(capabilities.get(0).getPlatformName()).isEqualTo(LINUX);
  }

  @Test
  void shouldValidateW3cCapabilitiesByComplainingAboutKeysThatAreNotExtensions() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(
            () ->
                create(
                    singletonMap(
                        "capabilities",
                        singletonMap("alwaysMatch", singletonMap("cake", "cheese")))));
  }

  @Test
  void shouldValidateW3cCapabilitiesByComplainingAboutDuplicateFirstAndAlwaysMatchKeys() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(
            () ->
                create(
                    singletonMap(
                        "capabilities",
                        Map.of(
                            "alwaysMatch", singletonMap("se:cake", "cheese"),
                            "firstMatch", singletonList(singletonMap("se:cake", "sausages"))))));
  }

  @Test
  void convertEverythingToFirstMatchOnlyIfPayloadContainsAlwaysMatchSectionAndOssCapabilities() {
    List<Capabilities> capabilities =
        create(
            Map.of(
                "capabilities",
                Map.of(
                    "alwaysMatch",
                    singletonMap("platformName", "macos"),
                    "firstMatch",
                    List.of(
                        singletonMap("browserName", "foo"),
                        singletonMap("browserName", "firefox")))));

    assertThat(capabilities)
        .isEqualTo(
            List.of(
                new ImmutableCapabilities("browserName", "foo", "platformName", "macos"),
                new ImmutableCapabilities("browserName", "firefox", "platformName", "macos")));
  }

  @Test
  void forwardsMetaDataAssociatedWithARequest() throws IOException {
    try (NewSessionPayload payload =
        NewSessionPayload.create(
            Map.of(
                "capabilities", Map.of("alwaysMatch", EMPTY_MAP),
                "cloud:user", "bob",
                "cloud:key", "there is no cake"))) {
      StringBuilder toParse = new StringBuilder();
      payload.writeTo(toParse);
      Map<String, Object> seen = new Json().toType(toParse.toString(), MAP_TYPE);

      assertThat(seen.get("cloud:user")).isEqualTo("bob");
      assertThat(seen.get("cloud:key")).isEqualTo("there is no cake");
    }
  }

  @Test
  void shouldPreserveMetadata() throws IOException {
    Map<String, Object> raw =
        Map.of(
            "capabilities",
            singletonMap("alwaysMatch", singletonMap("browserName", "cheese")),
            "se:meta",
            "cheese is good");

    try (NewSessionPayload payload = NewSessionPayload.create(raw)) {
      StringBuilder toParse = new StringBuilder();
      payload.writeTo(toParse);
      Map<String, Object> seen = new Json().toType(toParse.toString(), MAP_TYPE);

      assertThat(seen).containsEntry("se:meta", "cheese is good");
    }
  }

  @Test
  void shouldExposeMetaData() {
    Map<String, Object> raw =
        Map.of(
            "capabilities",
            singletonMap("alwaysMatch", singletonMap("browserName", "cheese")),
            "se:meta",
            "cheese is good");

    try (NewSessionPayload payload = NewSessionPayload.create(raw)) {
      Map<String, Object> seen = payload.getMetadata();
      assertThat(seen).isEqualTo(Map.of("se:meta", "cheese is good"));
    }
  }

  @Test
  void nullValuesInMetaDataAreIgnored() {
    Map<String, Object> raw = new HashMap<>();
    raw.put("capabilities", singletonMap("alwaysMatch", singletonMap("browserName", "cheese")));
    raw.put("se:bad", null);
    raw.put("se:good", "cheese");

    try (NewSessionPayload payload = NewSessionPayload.create(raw)) {
      Map<String, Object> seen = payload.getMetadata();
      assertThat(seen).isEqualTo(Map.of("se:good", "cheese"));
    }
  }

  @Test
  void keysUsedForStoringCapabilitiesAreIgnoredFromMetadata() {
    Map<String, Object> raw =
        Map.of("capabilities", singletonMap("alwaysMatch", singletonMap("browserName", "cheese")));

    try (NewSessionPayload payload = NewSessionPayload.create(raw)) {
      Map<String, Object> seen = payload.getMetadata();
      assertThat(seen).isEqualTo(emptyMap());
    }
  }

  private List<Capabilities> create(Map<String, ?> source) {
    List<Capabilities> presumablyFromMemory;
    List<Capabilities> fromDisk;

    try (NewSessionPayload payload = NewSessionPayload.create(source)) {
      presumablyFromMemory = payload.stream().collect(toList());
    }

    String json = new Json().toJson(source);
    try (NewSessionPayload payload =
        NewSessionPayload.create(Contents.string(json, StandardCharsets.UTF_8))) {
      fromDisk = payload.stream().collect(toList());
    }

    assertThat(fromDisk).isEqualTo(presumablyFromMemory);

    return presumablyFromMemory;
  }
}
