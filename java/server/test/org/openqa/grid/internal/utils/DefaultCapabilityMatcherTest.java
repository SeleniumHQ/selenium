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

package org.openqa.grid.internal.utils;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.Platform;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.safari.SafariOptions;

import java.util.HashMap;
import java.util.Map;

public class DefaultCapabilityMatcherTest {

  private DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void smokeTestWithDeprecatedPlatformCapability() {
    Map<String, Object> firefox = ImmutableMap.of(
        CapabilityType.BROWSER_NAME, "B",
        CapabilityType.PLATFORM, "XP");
    Map<String, Object> tl = new HashMap<String, Object>() {{
      put(CapabilityType.APPLICATION_NAME, "A");
      put(CapabilityType.VERSION, null);
    }};

    Map<String, Object> firefox2 = ImmutableMap.of(
        CapabilityType.BROWSER_NAME, "B",
        CapabilityType.PLATFORM, "win7",
        CapabilityType.VERSION, "3.6");
    Map<String, Object> tl2 = ImmutableMap.of(
        CapabilityType.APPLICATION_NAME, "A",
        CapabilityType.VERSION, "8.5.100.7");

    assertTrue(matcher.matches(tl, tl));
    assertFalse(matcher.matches(tl, tl2));
    assertTrue(matcher.matches(tl2, tl));
    assertTrue(matcher.matches(tl2, tl2));

    assertTrue(matcher.matches(firefox, firefox));
    assertFalse(matcher.matches(firefox, firefox2));
    assertFalse(matcher.matches(firefox2, firefox));
    assertTrue(matcher.matches(firefox2, firefox2));

    assertFalse(matcher.matches(tl, null));
    assertFalse(matcher.matches(null, null));
    assertFalse(matcher.matches(tl, firefox));
    assertFalse(matcher.matches(firefox, tl2));
  }

  @Test
  public void smokeTest() {
    Map<String, Object> firefox = ImmutableMap.of(
        CapabilityType.BROWSER_NAME, "B",
        CapabilityType.PLATFORM_NAME, "XP");
    Map<String, Object> tl = new HashMap<String, Object>() {{
      put(CapabilityType.APPLICATION_NAME, "A");
      put(CapabilityType.VERSION, null);
    }};

    Map<String, Object> firefox2 = ImmutableMap.of(
        CapabilityType.BROWSER_NAME, "B",
        CapabilityType.PLATFORM_NAME, "win7",
        CapabilityType.VERSION, "3.6");
    Map<String, Object> tl2 = ImmutableMap.of(
        CapabilityType.APPLICATION_NAME, "A",
        CapabilityType.VERSION, "8.5.100.7");

    assertTrue(matcher.matches(tl, tl));
    assertFalse(matcher.matches(tl, tl2));
    assertTrue(matcher.matches(tl2, tl));
    assertTrue(matcher.matches(tl2, tl2));

    assertTrue(matcher.matches(firefox, firefox));
    assertFalse(matcher.matches(firefox, firefox2));
    assertFalse(matcher.matches(firefox2, firefox));
    assertTrue(matcher.matches(firefox2, firefox2));

    assertFalse(matcher.matches(tl, null));
    assertFalse(matcher.matches(null, null));
    assertFalse(matcher.matches(tl, firefox));
    assertFalse(matcher.matches(firefox, tl2));
  }

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void genericPlatformMatchingTestWithDeprecatedPlatformCapability() {
    Map<String, Object> requested = ImmutableMap.of(CapabilityType.PLATFORM, Platform.WINDOWS);

    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "WINDOWS"), requested));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "xp"), requested));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "windows VISTA"), requested));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "windows 7"), requested));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "linux"), requested));
  }

  @Test
  public void genericPlatformMatchingTest() {
    Map<String, Object> requested = ImmutableMap.of(CapabilityType.PLATFORM_NAME, Platform.WINDOWS);

    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "WINDOWS"), requested));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "xp"), requested));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "windows VISTA"), requested));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "windows 7"), requested));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "linux"), requested));
  }

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void specificPlatformMatchingTestWithDeprecatedPlatformCapability() {
    Map<String, Object> requested = ImmutableMap.of(CapabilityType.PLATFORM, Platform.XP);

    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "xp"), requested));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "WINDOWS"), requested));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "windows VISTA"), requested));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "windows 7"), requested));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "linux"), requested));
  }

  @Test
  public void specificPlatformMatchingTest() {
    Map<String, Object> requested = ImmutableMap.of(CapabilityType.PLATFORM_NAME, Platform.XP);

    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "xp"), requested));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "WINDOWS"), requested));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "windows VISTA"), requested));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "windows 7"), requested));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "linux"), requested));
  }

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void unknownPlatformMatchingTestWithDeprecatedPlatformCapability() {
    Map<String, Object> requested = ImmutableMap.of(CapabilityType.PLATFORM, "ms-dos");

    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "ms-dos"), requested));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "windows"), requested));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM, "PS/2"), requested));
  }

  @Test
  public void unknownPlatformMatchingTest() {
    Map<String, Object> requested = ImmutableMap.of(CapabilityType.PLATFORM_NAME, "ms-dos");

    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "ms-dos"), requested));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "windows"), requested));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.PLATFORM_NAME, "PS/2"), requested));
  }

  @Test
  public void canAddAttributeMatcher() {
    matcher.addToConsider("my:capability");
    Map<String, Object> requested = ImmutableMap.of("my:capability", "cheese");
    assertTrue(matcher.matches(ImmutableMap.of("my:capability", "cheese"), requested));
    assertFalse(matcher.matches(ImmutableMap.of("my:capability", "milk"), requested));
  }

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void nullEmptyValuesWithDeprecatedPlatformCapability() {
    Map<String, Object> requested = new HashMap<>();
    requested.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    requested.put(CapabilityType.PLATFORM, null);
    requested.put(CapabilityType.VERSION, "");

    Map<String, Object> node = new HashMap<>();
    node.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    node.put(CapabilityType.PLATFORM, Platform.LINUX);
    node.put(CapabilityType.VERSION, "3.6");

    assertTrue(matcher.matches(node, requested));
  }

  @Test
  public void nullEmptyValues() {
    Map<String, Object> requested = new HashMap<>();
    requested.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    requested.put(CapabilityType.PLATFORM_NAME, null);
    requested.put(CapabilityType.VERSION, "");

    Map<String, Object> node = new HashMap<>();
    node.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    node.put(CapabilityType.PLATFORM_NAME, Platform.LINUX);
    node.put(CapabilityType.VERSION, "3.6");

    assertTrue(matcher.matches(node, requested));
  }

  @Test
  public void versionTests() {
    DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();

    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.VERSION, "50"),
                               ImmutableMap.of(CapabilityType.VERSION, "50")));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.VERSION, "50"),
                               ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50")));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50"),
                               ImmutableMap.of(CapabilityType.VERSION, "50")));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50"),
                               ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50")));

    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.VERSION, "50"),
                                ImmutableMap.of(CapabilityType.VERSION, "45")));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.VERSION, "50"),
                                ImmutableMap.of(CapabilityType.BROWSER_VERSION, "45")));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.BROWSER_VERSION, "45"),
                                ImmutableMap.of(CapabilityType.VERSION, "50")));
    assertFalse(matcher.matches(ImmutableMap.of(CapabilityType.BROWSER_VERSION, "45"),
                                ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50")));
  }

  @Test
  public void shouldMatchLegacyFirefoxDriverOnly() {
    Map<String, Object> requested = new FirefoxOptions().setLegacy(true).asMap();

    Map<String, Object> legacyNode = new HashMap<>();
    legacyNode.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    legacyNode.put(FirefoxDriver.MARIONETTE, false);

    Map<String, Object> mNode = new HashMap<>();
    mNode.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);

    assertTrue(matcher.matches(legacyNode, requested));
    assertFalse(matcher.matches(mNode, requested));
  }

  @Test
  public void shouldMatchMarionetteFirefoxDriverOnly() {
    Map<String, Object> requested = new FirefoxOptions().asMap();

    Map<String, Object> legacyNode = new HashMap<>();
    legacyNode.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    legacyNode.put(FirefoxDriver.MARIONETTE, false);

    Map<String, Object> mNode = new HashMap<>();
    mNode.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);

    assertFalse(matcher.matches(legacyNode, requested));
    assertTrue(matcher.matches(mNode, requested));
  }

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void shouldMatchSafariTechnologyPreviewOnlyWithDeprecatedPlatformCapability() {
    Map<String, Object> requested = new SafariOptions().setUseTechnologyPreview(true).asMap();

    Map<String, Object> tpNode = new HashMap<>();
    tpNode.put(CapabilityType.BROWSER_NAME, "Safari Technology Preview");
    tpNode.put(CapabilityType.PLATFORM, Platform.MAC);
    tpNode.put("technologyPreview", true);

    Map<String, Object> regularNode = new HashMap<>();
    regularNode.put(CapabilityType.BROWSER_NAME, BrowserType.SAFARI);
    regularNode.put(CapabilityType.PLATFORM, Platform.MAC);

    assertTrue(matcher.matches(tpNode, requested));
    assertFalse(matcher.matches(regularNode, requested));
  }

  @Test
  public void shouldMatchSafariTechnologyPreviewOnly() {
    Map<String, Object> requested = new SafariOptions().setUseTechnologyPreview(true).asMap();

    Map<String, Object> tpNode = new HashMap<>();
    tpNode.put(CapabilityType.BROWSER_NAME, "Safari Technology Preview");
    tpNode.put(CapabilityType.PLATFORM_NAME, Platform.MAC);
    tpNode.put("technologyPreview", true);

    Map<String, Object> regularNode = new HashMap<>();
    regularNode.put(CapabilityType.BROWSER_NAME, BrowserType.SAFARI);
    regularNode.put(CapabilityType.PLATFORM_NAME, Platform.MAC);

    assertTrue(matcher.matches(tpNode, requested));
    assertFalse(matcher.matches(regularNode, requested));
  }

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void shouldMatchRegularSafariOnlyWithDeprecatedPlatformCapability() {
    Map<String, Object> requested = new SafariOptions().asMap();

    Map<String, Object> tpNode = new HashMap<>();
    tpNode.put(CapabilityType.BROWSER_NAME, "Safari Technology Preview");
    tpNode.put(CapabilityType.PLATFORM, Platform.MAC);

    Map<String, Object> regularNode = new HashMap<>();
    regularNode.put(CapabilityType.BROWSER_NAME, BrowserType.SAFARI);
    regularNode.put(CapabilityType.PLATFORM, Platform.MAC);

    assertFalse(matcher.matches(tpNode, requested));
    assertTrue(matcher.matches(regularNode, requested));
  }

  @Test
  public void shouldMatchRegularSafariOnly() {
    Map<String, Object> requested = new SafariOptions().asMap();

    Map<String, Object> tpNode = new HashMap<>();
    tpNode.put(CapabilityType.BROWSER_NAME, "Safari Technology Preview");
    tpNode.put(CapabilityType.PLATFORM_NAME, Platform.MAC);

    Map<String, Object> regularNode = new HashMap<>();
    regularNode.put(CapabilityType.BROWSER_NAME, BrowserType.SAFARI);
    regularNode.put(CapabilityType.PLATFORM_NAME, Platform.MAC);

    assertFalse(matcher.matches(tpNode, requested));
    assertTrue(matcher.matches(regularNode, requested));
  }

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void shouldMatchWhenRequestedHasDeprecatedPlatformCapability() {
    Map<String, Object> requested = new FirefoxOptions().asMap();
    requested.put(CapabilityType.PLATFORM, Platform.ANY);

    Map<String, Object> node = new HashMap<>();
    node.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    node.put(CapabilityType.PLATFORM_NAME, Platform.LINUX);

    assertTrue(matcher.matches(node, requested));
  }

  // TODO remove test when CapabilityType.PLATFORM is removed from code base
  @Test
  public void shouldMatchWhenNodeHasDeprecatedPlatformCapability() {
    Map<String, Object> requested = new FirefoxOptions().asMap();
    requested.put(CapabilityType.PLATFORM_NAME, Platform.ANY);

    Map<String, Object> node = new HashMap<>();
    node.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    node.put(CapabilityType.PLATFORM, Platform.LINUX);

    assertTrue(matcher.matches(node, requested));
  }

}
