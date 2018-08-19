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

package org.openqa.selenium.remote.server;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.NewSessionPayload;

import java.io.IOException;
import java.io.StringReader;
import java.util.List;
import java.util.Map;

public class NewSessionPayloadTest {

  @Test
  public void shouldIndicateDownstreamOssDialect() throws IOException {
    ImmutableMap<String, ImmutableMap<String, String>> caps = ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of("browserName", "cheese"));

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertEquals(ImmutableSet.of(Dialect.OSS), payload.getDownstreamDialects());
    }

    String json = new Json().toJson(caps);
    try (NewSessionPayload payload = NewSessionPayload.create(new StringReader(json))) {
      assertEquals(ImmutableSet.of(Dialect.OSS), payload.getDownstreamDialects());
    }
  }

  @Test
  public void shouldIndicateDownstreamW3cDialect() throws IOException {
    ImmutableMap<String, ImmutableMap<String, ImmutableMap<String, String>>> caps = ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "cheese")));

    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertEquals(ImmutableSet.of(Dialect.W3C), payload.getDownstreamDialects());
    }

    String json = new Json().toJson(caps);
    try (NewSessionPayload payload = NewSessionPayload.create(new StringReader(json))) {
      assertEquals(ImmutableSet.of(Dialect.W3C), payload.getDownstreamDialects());
    }
  }

  @Test
  public void shouldDefaultToAssumingADownstreamOssDialect() throws IOException {
    ImmutableMap<String, Object> caps = ImmutableMap.of();
    try (NewSessionPayload payload = NewSessionPayload.create(caps)) {
      assertEquals(ImmutableSet.of(Dialect.OSS), payload.getDownstreamDialects());
    }

    String json = new Json().toJson(caps);
    try (NewSessionPayload payload = NewSessionPayload.create(new StringReader(json))) {
      assertEquals(ImmutableSet.of(Dialect.OSS), payload.getDownstreamDialects());
    }
  }

  @Test
  public void shouldOfferStreamOfSingleOssCapabilitiesIfThatIsOnlyOption() throws IOException {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of("browserName", "cheese")));

    assertEquals(capabilities.toString(), 1, capabilities.size());
    assertEquals("cheese", capabilities.get(0).getBrowserName());
  }

  @Test
  public void shouldReturnAlwaysMatchIfNoFirstMatchIsPresent() throws IOException {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "cheese"))));

    assertEquals(capabilities.toString(), 1, capabilities.size());
    assertEquals("cheese", capabilities.get(0).getBrowserName());
  }

  @Test
  public void shouldReturnEachFirstMatchIfNoAlwaysMatchIsPresent() throws IOException {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "firstMatch", ImmutableList.of(
                ImmutableMap.of("browserName", "cheese"),
                ImmutableMap.of("browserName", "peas")))));

    assertEquals(capabilities.toString(), 2, capabilities.size());
    assertEquals("cheese", capabilities.get(0).getBrowserName());
    assertEquals("peas", capabilities.get(1).getBrowserName());
  }

  @Test
  public void shouldOfferStreamOfW3cCapabilitiesIfPresent() throws IOException {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of("browserName", "cheese"),
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "peas"))));

    // We expect a synthetic w3c capability for the mismatching OSS capabilities
    assertEquals(capabilities.toString(), 2, capabilities.size());
    assertEquals("peas", capabilities.get(1).getBrowserName());
  }

  @Test
  public void shouldMergeAlwaysAndFirstMatches() throws IOException {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("se:cake", "also cheese"),
            "firstMatch", ImmutableList.of(
                ImmutableMap.of("browserName", "cheese"),
                ImmutableMap.of("browserName", "peas")))));

    assertEquals(capabilities.toString(), 2, capabilities.size());
    assertEquals("cheese", capabilities.get(0).getBrowserName());
    assertEquals("also cheese", capabilities.get(0).getCapability("se:cake"));
    assertEquals("peas", capabilities.get(1).getBrowserName());
    assertEquals("also cheese", capabilities.get(1).getCapability("se:cake"));

  }

  // The name for the platform capability changed from "platform" to "platformName" in the spec.
  @Test
  public void shouldCorrectlyExtractPlatformNameFromOssCapabilities() throws IOException {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of("platform", "linux")));

    assertEquals(Platform.LINUX, capabilities.get(0).getPlatform());
    assertEquals(Platform.LINUX, capabilities.get(0).getCapability("platform"));
    assertEquals(null, capabilities.get(0).getCapability("platformName"));
  }

  @Test
  public void shouldCorrectlyExtractPlatformFromW3cCapabilities() throws IOException {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("platformName", "linux"))));

    assertEquals(Platform.LINUX, capabilities.get(0).getPlatform());
    assertEquals(null, capabilities.get(0).getCapability("platform"));
    assertEquals("linux", capabilities.get(0).getCapability("platformName"));
  }

  @Test(expected = IllegalArgumentException.class)
  public void shouldValidateW3cCapabilitiesByComplainingAboutKeysThatAreNotExtensions()
      throws IOException {
    create(ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("cake", "cheese"))));
    fail("We should never see this");
  }

  @Test(expected = IllegalArgumentException.class)
  public void shouldValidateW3cCapabilitiesByComplainingAboutDuplicateFirstAndAlwaysMatchKeys()
      throws IOException {
    create(ImmutableMap.of(
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("se:cake", "cheese"),
            "firstMatch", ImmutableList.of(ImmutableMap.of("se:cake", "sausages")))));
    fail("We should never see this");
  }

  @Test
  public void convertEverythingToFirstMatchOnlyifPayloadContainsAlwaysMatchSectionAndOssCapabilities()
      throws IOException {
    List<Capabilities> capabilities = create(ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of(
            "browserName", "firefox",
            "platform", "WINDOWS"),
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of(
                "platformName", "macos"),
            "firstMatch", ImmutableList.of(
                ImmutableMap.of("browserName", "foo"),
                ImmutableMap.of("browserName", "firefox")))));

    assertEquals(ImmutableList.of(
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
        "desiredCapabilities", ImmutableMap.of(),
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
    try (NewSessionPayload payload = NewSessionPayload.create(    ImmutableMap.of(
        "capabilities", ImmutableMap.of(),
        "requiredCapabilities", ImmutableMap.of("key", "so it's not empty")))) {
      StringBuilder toParse = new StringBuilder();
      payload.writeTo(toParse);
      Map<String, Object> seen = new Json().toType(toParse.toString(), MAP_TYPE);

      assertNull(seen.get("requiredCapabilities"));
    }
  }

  private List<Capabilities> create(Map<String, ?> source) {
    List<Capabilities> presumablyFromMemory;
    List<Capabilities> fromDisk;

    try (NewSessionPayload payload = NewSessionPayload.create(source)) {
      presumablyFromMemory = payload.stream().collect(ImmutableList.toImmutableList());
    }

    String json = new Json().toJson(source);
    try (NewSessionPayload payload = NewSessionPayload.create(new StringReader(json))) {
      fromDisk = payload.stream().collect(ImmutableList.toImmutableList());
    }

    assertEquals(presumablyFromMemory, fromDisk);

    return presumablyFromMemory;
  }
}
