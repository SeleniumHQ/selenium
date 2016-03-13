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

import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.Map;


public class DefaultCapabilityMatcherTest {


  static Map<String, Object> firefox = new HashMap<>();
  static Map<String, Object> tl = new HashMap<>();

  static Map<String, Object> firefox2 = new HashMap<>();
  static Map<String, Object> tl2 = new HashMap<>();

  static Map<String, Object> exotic = new HashMap<>();


  CapabilityMatcher helper = new DefaultCapabilityMatcher();

  @BeforeClass
  public static void build() {
    tl.put(CapabilityType.APPLICATION_NAME, "A");
    tl.put(CapabilityType.VERSION, null);
    firefox.put(CapabilityType.BROWSER_NAME, "B");
    firefox.put(CapabilityType.PLATFORM, "XP");

    tl2.put(CapabilityType.APPLICATION_NAME, "A");
    tl2.put(CapabilityType.VERSION, "8.5.100.7");

    firefox2.put(CapabilityType.BROWSER_NAME, "B");
    firefox2.put(CapabilityType.PLATFORM, "Vista");
    firefox2.put(CapabilityType.VERSION, "3.6");

    exotic.put("numberOfHead", 2);
  }

  @Test
  public void smokeTest() {
    assertTrue(helper.matches(tl, tl));
    assertFalse(helper.matches(tl, tl2));
    assertTrue(helper.matches(tl2, tl));
    assertTrue(helper.matches(tl2, tl2));

    assertTrue(helper.matches(firefox, firefox));
    assertFalse(helper.matches(firefox, firefox2));
    assertFalse(helper.matches(firefox2, firefox));
    assertFalse(helper.matches(firefox, firefox2));

    assertFalse(helper.matches(tl, null));
    assertFalse(helper.matches(null, null));
    assertFalse(helper.matches(tl, firefox));
    assertFalse(helper.matches(firefox, tl2));
  }

  @Test
  public void platformMatchingTest() {
    DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();
    Platform p = Platform.WINDOWS;

    assertTrue(matcher.extractPlatform("WINDOWS") == p);
    assertTrue(matcher.extractPlatform("xp").is(p));
    assertTrue(matcher.extractPlatform("windows VISTA").is(p));
    assertTrue(matcher.extractPlatform("windows 7").is(p));
  }


  @Test
  public void nullEmptyValues() {
    DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();

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


}
