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

package org.openqa.selenium.grid.node.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.assertj.core.api.InstanceOfAssertFactories.STRING;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;

public class SessionCapabilitiesMutatorTest {

  private SessionCapabilitiesMutator sessionCapabilitiesMutator;
  private Capabilities stereotype;
  private Capabilities capabilities;

  @Test
  void shouldMergeStereotypeWithoutOptionsWithCapsWithOptions() {
    stereotype =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "unhandledPromptBehavior", "accept");

    sessionCapabilitiesMutator = new SessionCapabilitiesMutator(stereotype);

    Map<String, Object> chromeOptions = new HashMap<>();
    chromeOptions.put("args", Arrays.asList("incognito", "window-size=500,500"));

    capabilities =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "goog:chromeOptions", chromeOptions,
            "pageLoadStrategy", "normal");

    Map<String, Object> modifiedCapabilities =
        sessionCapabilitiesMutator.apply(capabilities).asMap();

    assertThat(modifiedCapabilities.get("browserName")).isEqualTo("chrome");
    assertThat(modifiedCapabilities.get("unhandledPromptBehavior")).isEqualTo("accept");
    assertThat(modifiedCapabilities.get("pageLoadStrategy")).isEqualTo("normal");
    assertThat(modifiedCapabilities)
        .extractingByKey("goog:chromeOptions")
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .contains("incognito", "window-size=500,500");
  }

  @Test
  void shouldMergeStereotypeWithOptionsWithCapsWithoutOptions() {
    Map<String, Object> chromeOptions = new HashMap<>();
    chromeOptions.put("args", Arrays.asList("incognito", "window-size=500,500"));

    stereotype =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "goog:chromeOptions", chromeOptions,
            "unhandledPromptBehavior", "accept");

    sessionCapabilitiesMutator = new SessionCapabilitiesMutator(stereotype);

    capabilities =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "pageLoadStrategy", "normal");

    Map<String, Object> modifiedCapabilities =
        sessionCapabilitiesMutator.apply(capabilities).asMap();

    assertThat(modifiedCapabilities.get("browserName")).isEqualTo("chrome");
    assertThat(modifiedCapabilities.get("unhandledPromptBehavior")).isEqualTo("accept");
    assertThat(modifiedCapabilities.get("pageLoadStrategy")).isEqualTo("normal");
    assertThat(modifiedCapabilities)
        .extractingByKey("goog:chromeOptions")
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .contains("incognito", "window-size=500,500");
  }

  @Test
  void shouldMergeChromeSpecificOptionsFromStereotypeAndCaps() {
    String ext1 = Base64.getEncoder().encodeToString("ext1".getBytes());
    String ext2 = Base64.getEncoder().encodeToString("ext2".getBytes());

    Map<String, Object> stereotypeOptions = new HashMap<>();
    stereotypeOptions.put(
        "args", new ArrayList<>(Arrays.asList("incognito", "window-size=500,500")));
    stereotypeOptions.put("extensions", new ArrayList<>(Collections.singletonList(ext1)));
    stereotypeOptions.put("binary", "/path/to/binary");
    stereotypeOptions.put("opt1", "val1");
    stereotypeOptions.put("opt2", "val4");

    stereotype =
        new ImmutableCapabilities("browserName", "chrome", "goog:chromeOptions", stereotypeOptions);

    sessionCapabilitiesMutator = new SessionCapabilitiesMutator(stereotype);

    Map<String, Object> capabilityOptions = new HashMap<>();
    capabilityOptions.put("args", Arrays.asList("incognito", "--headless"));
    capabilityOptions.put("extensions", new ArrayList<>(Collections.singletonList(ext2)));
    capabilityOptions.put("binary", "/path/to/caps/binary");
    capabilityOptions.put("opt2", "val2");
    capabilityOptions.put("opt3", "val3");

    capabilities =
        new ImmutableCapabilities("browserName", "chrome", "goog:chromeOptions", capabilityOptions);

    Map<String, Object> modifiedCapabilities =
        sessionCapabilitiesMutator.apply(capabilities).asMap();

    assertThat(modifiedCapabilities)
        .extractingByKey("goog:chromeOptions")
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("incognito", "window-size=500,500", "--headless");

    assertThat(modifiedCapabilities)
        .extractingByKey("goog:chromeOptions")
        .asInstanceOf(MAP)
        .containsEntry("opt1", "val1")
        .containsEntry("opt2", "val2")
        .containsEntry("opt3", "val3");

    assertThat(modifiedCapabilities)
        .extractingByKey("goog:chromeOptions")
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1, ext2);

    assertThat(modifiedCapabilities)
        .extractingByKey("goog:chromeOptions")
        .asInstanceOf(MAP)
        .extractingByKey("binary")
        .asInstanceOf(STRING)
        .isEqualTo("/path/to/binary");
  }

  @Test
  void shouldMergeEdgeSpecificOptionsFromStereotypeAndCaps() {
    String ext1 = Base64.getEncoder().encodeToString("ext1".getBytes());
    String ext2 = Base64.getEncoder().encodeToString("ext2".getBytes());

    Map<String, Object> stereotypeOptions = new HashMap<>();
    stereotypeOptions.put(
        "args", new ArrayList<>(Arrays.asList("incognito", "window-size=500,500")));
    stereotypeOptions.put("extensions", new ArrayList<>(Collections.singletonList(ext1)));
    stereotypeOptions.put("opt1", "val1");
    stereotypeOptions.put("opt2", "val4");

    stereotype =
        new ImmutableCapabilities(
            "browserName", "microsoftedge", "ms:edgeOptions", stereotypeOptions);

    sessionCapabilitiesMutator = new SessionCapabilitiesMutator(stereotype);

    Map<String, Object> capabilityOptions = new HashMap<>();
    capabilityOptions.put("args", Arrays.asList("incognito", "--headless"));
    capabilityOptions.put("extensions", new ArrayList<>(Collections.singletonList(ext2)));
    capabilityOptions.put("binary", "/path/to/binary");
    capabilityOptions.put("opt2", "val2");
    capabilityOptions.put("opt3", "val3");

    capabilities =
        new ImmutableCapabilities(
            "browserName", "microsoftedge", "ms:edgeOptions", capabilityOptions);

    Map<String, Object> modifiedCapabilities =
        sessionCapabilitiesMutator.apply(capabilities).asMap();

    assertThat(modifiedCapabilities)
        .extractingByKey("ms:edgeOptions")
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("incognito", "window-size=500,500", "--headless");

    assertThat(modifiedCapabilities)
        .extractingByKey("ms:edgeOptions")
        .asInstanceOf(MAP)
        .containsEntry("opt1", "val1")
        .containsEntry("opt2", "val2")
        .containsEntry("opt3", "val3");

    assertThat(modifiedCapabilities)
        .extractingByKey("ms:edgeOptions")
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1, ext2);

    assertThat(modifiedCapabilities)
        .extractingByKey("ms:edgeOptions")
        .asInstanceOf(MAP)
        .extractingByKey("binary")
        .isEqualTo("/path/to/binary");
  }

  @Test
  void shouldMergeFirefoxSpecificOptionsFromStereotypeAndCaps() {
    Map<String, Object> stereotypeOptions = new HashMap<>();
    stereotypeOptions.put("args", new ArrayList<>(Arrays.asList("verbose", "silent")));

    Map<String, String> prefs = new HashMap<>();
    prefs.put("opt1", "val1");
    prefs.put("opt2", "val4");
    stereotypeOptions.put("prefs", prefs);
    stereotypeOptions.put("binary", "/path/to/binary");

    Map<String, String> debugLog = new HashMap<>();
    debugLog.put("level", "debug");
    stereotypeOptions.put("log", debugLog);

    stereotypeOptions.put("profile", "profile-string");

    stereotype =
        new ImmutableCapabilities(
            "browserName", "firefox", "moz:firefoxOptions", stereotypeOptions);

    sessionCapabilitiesMutator = new SessionCapabilitiesMutator(stereotype);

    Map<String, Object> capabilityOptions = new HashMap<>();
    capabilityOptions.put("args", Collections.singletonList("-headless"));

    Map<String, String> capabilityPrefs = new HashMap<>();
    capabilityPrefs.put("opt1", "val1");
    capabilityPrefs.put("opt2", "val2");
    capabilityPrefs.put("opt3", "val3");
    capabilityOptions.put("prefs", capabilityPrefs);

    Map<String, String> infoLog = new HashMap<>();
    infoLog.put("level", "info");
    capabilityOptions.put("log", infoLog);
    capabilityOptions.put("profile", "different-profile-string");

    capabilityOptions.put("binary", "/path/to/caps/binary");

    capabilities =
        new ImmutableCapabilities(
            "browserName", "firefox", "moz:firefoxOptions", capabilityOptions);

    Map<String, Object> modifiedCapabilities =
        sessionCapabilitiesMutator.apply(capabilities).asMap();

    assertThat(modifiedCapabilities)
        .extractingByKey("moz:firefoxOptions")
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("verbose", "silent", "-headless");

    assertThat(modifiedCapabilities)
        .extractingByKey("moz:firefoxOptions")
        .asInstanceOf(MAP)
        .extractingByKey("prefs")
        .asInstanceOf(MAP)
        .containsEntry("opt1", "val1")
        .containsEntry("opt2", "val2")
        .containsEntry("opt3", "val3");

    assertThat(modifiedCapabilities)
        .extractingByKey("moz:firefoxOptions")
        .asInstanceOf(MAP)
        .extractingByKey("log")
        .asInstanceOf(MAP)
        .containsEntry("level", "info");

    assertThat(modifiedCapabilities)
        .extractingByKey("moz:firefoxOptions")
        .asInstanceOf(MAP)
        .extractingByKey("binary")
        .asInstanceOf(STRING)
        .isEqualTo("/path/to/binary");

    assertThat(modifiedCapabilities)
        .extractingByKey("moz:firefoxOptions")
        .asInstanceOf(MAP)
        .extractingByKey("profile")
        .asInstanceOf(STRING)
        .isEqualTo("different-profile-string");
  }

  @Test
  void shouldMergeTopLevelStereotypeAndCaps() {
    stereotype =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "unhandledPromptBehavior", "accept",
            "pageLoadStrategy", "eager");

    sessionCapabilitiesMutator = new SessionCapabilitiesMutator(stereotype);

    capabilities =
        new ImmutableCapabilities(
            "browserName", "chrome",
            "pageLoadStrategy", "normal");

    Map<String, Object> modifiedCapabilities =
        sessionCapabilitiesMutator.apply(capabilities).asMap();

    assertThat(modifiedCapabilities.get("browserName")).isEqualTo("chrome");
    assertThat(modifiedCapabilities.get("unhandledPromptBehavior")).isEqualTo("accept");
    assertThat(modifiedCapabilities.get("pageLoadStrategy")).isEqualTo("normal");
  }

  @Test
  void shouldAllowUnknownBrowserNames() {
    stereotype = new ImmutableCapabilities("browserName", "safari");

    sessionCapabilitiesMutator = new SessionCapabilitiesMutator(stereotype);

    capabilities = new ImmutableCapabilities("browserName", "safari");

    Map<String, Object> modifiedCapabilities =
        sessionCapabilitiesMutator.apply(capabilities).asMap();

    assertThat(modifiedCapabilities.get("browserName")).isEqualTo("safari");
  }
}
