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

import static java.util.Arrays.asList;
import static java.util.Collections.EMPTY_MAP;
import static java.util.Collections.emptyMap;
import static java.util.Collections.singleton;
import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static java.util.stream.Collectors.toList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.testing.UnitTests;

import java.io.IOException;
import java.io.StringReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Category(UnitTests.class)
public class NewSessionPayloadTest {

  @Test
  public void shouldIndicateDownstreamOssDialect() {
    Map<String, Map<String, String>> caps = singletonMap(
        "desiredCapabilities", singletonMap(
            "browserName", "cheese"));

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertEquals(singleton(Dialect.OSS), payload.getDownstreamDialects());
    }

    String json = new Json().toJson(caps);
    try (NewSessionPayload payload = NewSessionPayload.create(new StringReader(json))) {
      assertEquals(singleton(Dialect.OSS), payload.getDownstreamDialects());
    }
  }

  @Test
  public void shouldIndicateDownstreamW3cDialect() {
    Map<String, Map<String, Map<String, String>>> caps = singletonMap(
        "capabilities", singletonMap(
            "alwaysMatch", singletonMap(
                "browserName", "cheese")));

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertEquals(singleton(Dialect.W3C), payload.getDownstreamDialects());
    }

    String json = new Json().toJson(caps);
    try (NewSessionPayload payload = NewSessionPayload.create(new StringReader(json))) {
      assertEquals(singleton(Dialect.W3C), payload.getDownstreamDialects());
    }
  }

  @Test
  public void shouldDefaultToAssumingADownstreamOssDialect() {
    Map<String, Object> caps = emptyMap();
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertEquals(singleton(Dialect.OSS), payload.getDownstreamDialects());
    }

    String json = new Json().toJson(caps);
    try (NewSessionPayload payload = NewSessionPayload.create(new StringReader(json))) {
      assertEquals(singleton(Dialect.OSS), payload.getDownstreamDialects());
    }
  }

  @Test
  public void shouldOfferStreamOfSingleOssCapabilitiesIfThatIsOnlyOption() {
    List<Capabilities> capabilities = create(singletonMap(
        "desiredCapabilities", singletonMap(
            "browserName", "cheese")));

    assertEquals(capabilities.toString(), 1, capabilities.size());
    assertEquals("cheese", capabilities.get(0).getBrowserName());
  }

  @Test
  public void shouldReturnAlwaysMatchIfNoFirstMatchIsPresent() {
    List<Capabilities> capabilities = create(singletonMap(
        "capabilities", singletonMap(
            "alwaysMatch", singletonMap(
                "browserName", "cheese"))));

    assertEquals(capabilities.toString(), 1, capabilities.size());
    assertEquals("cheese", capabilities.get(0).getBrowserName());
  }

  @Test
  public void shouldReturnEachFirstMatchIfNoAlwaysMatchIsPresent() {
    List<Capabilities> capabilities = create(singletonMap(
        "capabilities", singletonMap(
            "firstMatch", asList(
                singletonMap("browserName", "cheese"),
                singletonMap("browserName", "peas")))));

    assertEquals(capabilities.toString(), 2, capabilities.size());
    assertEquals("cheese", capabilities.get(0).getBrowserName());
    assertEquals("peas", capabilities.get(1).getBrowserName());
  }

  @Test
  public void shouldOfferStreamOfW3cCapabilitiesIfPresent() {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "desiredCapabilities", singletonMap(
            "browserName", "cheese"),
        "capabilities", singletonMap(
            "alwaysMatch", singletonMap(
                "browserName", "peas"))));

    // We expect a synthetic w3c capability for the mismatching OSS capabilities
    assertEquals(capabilities.toString(), 2, capabilities.size());
    assertEquals("peas", capabilities.get(1).getBrowserName());
  }

  @Test
  public void shouldMergeAlwaysAndFirstMatches() {
    List<Capabilities> capabilities = create(singletonMap(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", singletonMap(
                "se:cake", "also cheese"),
            "firstMatch", asList(
                singletonMap("browserName", "cheese"),
                singletonMap("browserName", "peas")))));

    assertEquals(capabilities.toString(), 2, capabilities.size());
    assertEquals("cheese", capabilities.get(0).getBrowserName());
    assertEquals("also cheese", capabilities.get(0).getCapability("se:cake"));
    assertEquals("peas", capabilities.get(1).getBrowserName());
    assertEquals("also cheese", capabilities.get(1).getCapability("se:cake"));

  }

  // The name for the platform capability changed from "platform" to "platformName" in the spec.
  @Test
  public void shouldCorrectlyExtractPlatformNameFromOssCapabilities() {
    List<Capabilities> capabilities = create(singletonMap(
        "desiredCapabilities", singletonMap(
            "platform", "linux")));

    assertEquals(Platform.LINUX, capabilities.get(0).getPlatformName());
    assertEquals(Platform.LINUX, capabilities.get(0).getCapability("platform"));
    assertNull(capabilities.get(0).getCapability("platformName"));
  }

  @Test
  public void shouldCorrectlyExtractPlatformFromW3cCapabilities() {
    List<Capabilities> capabilities = create(singletonMap(
        "capabilities", singletonMap(
            "alwaysMatch", singletonMap(
                "platformName", "linux"))));

    assertEquals(Platform.LINUX, capabilities.get(0).getPlatformName());
    assertNull(capabilities.get(0).getCapability("platform"));
    assertEquals("linux", capabilities.get(0).getCapability("platformName"));
  }

  @Test
  public void shouldValidateW3cCapabilitiesByComplainingAboutKeysThatAreNotExtensions() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> create(singletonMap(
            "capabilities", singletonMap(
                "alwaysMatch", singletonMap(
                    "cake", "cheese")))));
  }

  @Test
  public void shouldValidateW3cCapabilitiesByComplainingAboutDuplicateFirstAndAlwaysMatchKeys() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> create(singletonMap(
            "capabilities", ImmutableMap.of(
                "alwaysMatch", singletonMap(
                    "se:cake", "cheese"),
                "firstMatch", singletonList(
                    singletonMap("se:cake", "sausages"))))));
  }

  @Test
  public void convertEverythingToFirstMatchOnlyifPayloadContainsAlwaysMatchSectionAndOssCapabilities() {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of(
            "browserName", "firefox",
            "platform", "WINDOWS"),
        "capabilities", ImmutableMap.of(
            "alwaysMatch", singletonMap(
                "platformName", "macos"),
            "firstMatch", asList(
                singletonMap("browserName", "foo"),
                singletonMap("browserName", "firefox")))));

    assertEquals(asList(
        // From OSS
        new ImmutableCapabilities("browserName", "firefox", "platform", "WINDOWS"),
        // Generated from OSS
        new ImmutableCapabilities("browserName", "firefox", "platformName", "windows"),
        // From the actual W3C capabilities
        new ImmutableCapabilities("browserName", "foo", "platformName", "macos"),
        new ImmutableCapabilities("browserName", "firefox", "platformName", "macos")),
                 capabilities);
  }

  @Test
  public void forwardsMetaDataAssociatedWithARequest() throws IOException {
    try (NewSessionPayload payload = NewSessionPayload.create(    ImmutableMap.of(
        "desiredCapabilities", EMPTY_MAP,
        "cloud:user", "bob",
        "cloud:key", "there is no cake"))) {
      StringBuilder toParse = new StringBuilder();
      payload.writeTo(toParse);
      Map<String, Object> seen = new Json().toType(toParse.toString(), MAP_TYPE);

      assertEquals("bob", seen.get("cloud:user"));
      assertEquals("there is no cake", seen.get("cloud:key"));
    }
  }

  @Test
  public void doesNotForwardRequiredCapabilitiesAsTheseAreVeryLegacy() throws IOException {
    try (NewSessionPayload payload = NewSessionPayload.create(ImmutableMap.of(
        "capabilities", EMPTY_MAP,
        "requiredCapabilities", singletonMap("key", "so it's not empty")))) {
      StringBuilder toParse = new StringBuilder();
      payload.writeTo(toParse);
      Map<String, Object> seen = new Json().toType(toParse.toString(), MAP_TYPE);

      assertNull(seen.get("requiredCapabilities"));
    }
  }

  @Test
  public void shouldPreserveMetadata() throws IOException {
    Map<String, Object> raw = ImmutableMap.of(
      "capabilities", singletonMap("alwaysMatch", singletonMap("browserName", "cheese")),
      "se:meta", "cheese is good");

    try (NewSessionPayload payload = NewSessionPayload.create(raw)) {
      StringBuilder toParse = new StringBuilder();
      payload.writeTo(toParse);
      Map<String, Object> seen = new Json().toType(toParse.toString(), MAP_TYPE);

      assertThat(seen).containsEntry("se:meta", "cheese is good");
    }
  }

  @Test
  public void shouldExposeMetaData() {
    Map<String, Object> raw = ImmutableMap.of(
      "capabilities", singletonMap("alwaysMatch", singletonMap("browserName", "cheese")),
      "se:meta", "cheese is good");

    try (NewSessionPayload payload = NewSessionPayload.create(raw)) {
      Map<String, Object> seen = payload.getMetadata();
      assertThat(seen).isEqualTo(Map.of("se:meta", "cheese is good"));
    }
  }

  @Test
  public void nullValuesInMetaDataAreIgnored() {
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
  public void keysUsedForStoringCapabilitiesAreIgnoredFromMetadata() {
    Map<String, Object> raw = ImmutableMap.of(
      "capabilities", singletonMap("alwaysMatch", singletonMap("browserName", "cheese")),
      "desiredCapabilities", emptyMap());

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
    try (NewSessionPayload payload = NewSessionPayload.create(new StringReader(json))) {
      fromDisk = payload.stream().collect(toList());
    }

    assertEquals(presumablyFromMemory, fromDisk);

    return presumablyFromMemory;
  }
}
