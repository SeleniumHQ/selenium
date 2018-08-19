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
import static org.junit.Assert.assertTrue;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.NewSessionPayload;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;

/**
 * There's an interesting problem that appears relatively often with New Session and incorrectly
 * prepared payloads. The key problem manifests where something is added to the OSS payload, and
 * this is incorrectly reflected in the w3c payload. To work around this, we'll inspect the two sets
 * of data. If we can expand the W3C payloads (using the guidelines from the spec) into something
 * that matches the OSS payload, we'll just forward the blob unchanged. If, however, we can't then
 * we need to do some fancy foot work, in which we'll:
 *
 * <ol>
 *   <li>Create a new W3C "firstMatch" blob that matches the OSS payload</li>
 *   <li>Expand all W3C payloads, so that they are complete</li>
 *   <li>Forward a new New Session payload composed of the OSS payload and the combined list of
 *     "firstMatches", with the OSS equivalent first.</li>
 * </ol>
 * <p>
 * This test has been broken out to make this behaviour clearer, and to allow for this comment.
 */
public class SyntheticNewSessionPayloadTest {

  @Test
  public void shouldDoNothingIfOssAndW3CPayloadsAreBothEmpty() {
    Map<String, Object> empty = ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of(),
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of(),
            "firstMatch", ImmutableList.of(ImmutableMap.of())));

    List<Capabilities> allCaps = getCapabilities(empty);

    assertEquals(ImmutableList.of(new ImmutableCapabilities()), allCaps);
  }

  @Test
  public void shouldDoNothingIfCapabilitiesArePresentButLeftEmpty() {
    Map<String, Object> empty = ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of(),
        "capabilities", ImmutableMap.of());

    List<Capabilities> allCaps = getCapabilities(empty);

    assertEquals(ImmutableList.of(new ImmutableCapabilities()), allCaps);

  }

  @Test
  public void shouldDoNothingIfOssPayloadMatchesAlwaysMatchAndThereAreNoFirstMatches() {
    ImmutableMap<String, String> identicalCaps = ImmutableMap.of("browserName", "cheese");

    Map<String, Object> payload= ImmutableMap.of(
        "desiredCapabilities", identicalCaps,
        "capabilities", ImmutableMap.of(
            "alwaysMatch", identicalCaps));

    List<Capabilities> allCaps = getCapabilities(payload);

    assertEquals(ImmutableList.of(new ImmutableCapabilities(identicalCaps)), allCaps);
  }

  @Test
  public void shouldDoNothingIfOssPayloadMatchesAFirstMatchAndThereIsNoAlwaysMatch() {
    ImmutableMap<String, String> identicalCaps = ImmutableMap.of("browserName", "cheese");

    Map<String, Object> payload= ImmutableMap.of(
        "desiredCapabilities", identicalCaps,
        "capabilities", ImmutableMap.of(
            "firstMatch", ImmutableList.of(identicalCaps)));

    List<Capabilities> allCaps = getCapabilities(payload);

    assertEquals(ImmutableList.of(new ImmutableCapabilities(identicalCaps)), allCaps);
  }

  @Test
  public void shouldDoNothingIfOssPayloadMatchesAValidMergedW3CPayload() {
    ImmutableMap<String, String> caps = ImmutableMap.of(
        "browserName", "cheese",
        "se:cake", "more cheese");

    Map<String, Object> payload= ImmutableMap.of(
        "desiredCapabilities", caps,
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "cheese"),
            "firstMatch", ImmutableList.of(ImmutableMap.of("se:cake", "more cheese"))));

    List<Capabilities> allCaps = getCapabilities(payload);

    assertEquals(ImmutableList.of(new ImmutableCapabilities(caps)), allCaps);
  }

  @Test
  public void shouldExpandAllW3CMatchesToFirstMatchesAndRemoveAlwaysMatchIfSynthesizingAPayload() {
    Map<String, Object> payload = ImmutableMap.of(
      // OSS capabilities request a chrome webdriver
      "desiredCapabilities", ImmutableMap.of("browserName", "chrome"),
      // Yet the w3c ones ask for IE and edge
      "capabilities", ImmutableMap.of(
          "alwaysMatch", ImmutableMap.of("se:cake", "cheese"),
          "firstMatch", ImmutableList.of(
              ImmutableMap.of("browserName", "edge"),
              ImmutableMap.of("browserName", "cheese"))));

    try (NewSessionPayload newSession = NewSessionPayload.create(payload)) {
      List<Capabilities> allCaps = newSession.stream().collect(ImmutableList.toImmutableList());

      assertEquals(3, allCaps.size());
      assertTrue(allCaps.contains(new ImmutableCapabilities("browserName", "cheese", "se:cake", "cheese")));
      assertTrue(allCaps.contains(new ImmutableCapabilities("browserName", "chrome")));
      assertTrue(allCaps.contains(new ImmutableCapabilities("browserName", "edge", "se:cake", "cheese")));
    }
  }

  @Test
  public void ossPayloadWillBeFirstW3CPayload() {
    // This is one of the common cases --- asking for marionette to be false. There's no way to
    // encode this legally into the w3c payload (as it doesn't start with "se:"), yet it's a use-
    // case that needs to be properly supported.
    Map<String, Object> rawCapabilities = ImmutableMap.of(
        "desiredCapabilities", ImmutableMap.of("marionette", false),
        "capabilities", ImmutableMap.of(
            "alwaysMatch", ImmutableMap.of("browserName", "chrome")));

    List<Capabilities> allCaps = getCapabilities(rawCapabilities);

    assertEquals(3, allCaps.size());
    assertEquals(false, allCaps.get(0).getCapability("marionette"));
  }

  private List<Capabilities> getCapabilities(Map<String, Object> payload) {
    try (NewSessionPayload newSessionPayload = NewSessionPayload.create(payload)) {
      StringBuilder b = new StringBuilder();
      newSessionPayload.writeTo(b);
      return newSessionPayload.stream().collect(ImmutableList.toImmutableList());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

}
