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
import com.google.common.collect.Maps;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.Map;


public class DefaultCapabilityMatcherTest {

  private DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();


  @Test
  public void smokeTest() {
    Map<String, Object> firefox = ImmutableMap.of(CapabilityType.BROWSER_NAME, "B", CapabilityType.PLATFORM, "XP");
    Map<String, Object> tl = new HashMap<String, Object>() {{
      put(CapabilityType.APPLICATION_NAME, "A");
      put(CapabilityType.VERSION, null);
    }};

    Map<String, Object> firefox2 = ImmutableMap.of(CapabilityType.BROWSER_NAME, "B", CapabilityType.PLATFORM, "Vista", CapabilityType.VERSION, "3.6");
    Map<String, Object> tl2 = ImmutableMap.of(CapabilityType.APPLICATION_NAME, "A", CapabilityType.VERSION, "8.5.100.7");

    assertTrue(matcher.matches(tl, tl));
    assertFalse(matcher.matches(tl, tl2));
    assertTrue(matcher.matches(tl2, tl));
    assertTrue(matcher.matches(tl2, tl2));

    assertTrue(matcher.matches(firefox, firefox));
    assertFalse(matcher.matches(firefox, firefox2));
    assertFalse(matcher.matches(firefox2, firefox));
    assertFalse(matcher.matches(firefox, firefox2));

    assertFalse(matcher.matches(tl, null));
    assertFalse(matcher.matches(null, null));
    assertFalse(matcher.matches(tl, firefox));
    assertFalse(matcher.matches(firefox, tl2));
  }

  @Test
  public void platformMatchingTest() {
    Platform p = Platform.WINDOWS;

    assertTrue(matcher.extractPlatform("WINDOWS") == p);
    assertTrue(matcher.extractPlatform("xp").is(p));
    assertTrue(matcher.extractPlatform("windows VISTA").is(p));
    assertTrue(matcher.extractPlatform("windows 7").is(p));
  }


  @Test
  public void nullEmptyValues() {

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
  public void versionTests() {
    DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();

    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.VERSION, "50"), ImmutableMap.of(CapabilityType.VERSION, "50")));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.VERSION, "50"), ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50")));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50"), ImmutableMap.of(CapabilityType.VERSION, "50")));
    assertTrue(matcher.matches(ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50"), ImmutableMap.of(CapabilityType.BROWSER_VERSION, "50")));
  }
}
