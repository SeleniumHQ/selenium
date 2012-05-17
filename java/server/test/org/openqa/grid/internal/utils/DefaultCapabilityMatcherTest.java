/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.grid.internal.utils;

import static org.openqa.grid.common.RegistrationRequest.BROWSER;
import static org.openqa.grid.common.RegistrationRequest.PLATFORM;
import static org.openqa.grid.common.RegistrationRequest.VERSION;

import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.CapabilityType;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;

import java.util.HashMap;
import java.util.Map;


public class DefaultCapabilityMatcherTest {


  static Map<String, Object> firefox = new HashMap<String, Object>();
  static Map<String, Object> tl = new HashMap<String, Object>();

  static Map<String, Object> firefox2 = new HashMap<String, Object>();
  static Map<String, Object> tl2 = new HashMap<String, Object>();

  static Map<String, Object> exotic = new HashMap<String, Object>();


  CapabilityMatcher helper = new DefaultCapabilityMatcher();

  @BeforeClass
  public static void build() {
    tl.put(RegistrationRequest.APP, "A");
    tl.put(RegistrationRequest.VERSION, null);
    firefox.put(BROWSER, "B");
    firefox.put(PLATFORM, "XP");

    tl2.put(RegistrationRequest.APP, "A");
    tl2.put(RegistrationRequest.VERSION, "8.5.100.7");

    firefox2.put(BROWSER, "B");
    firefox2.put(PLATFORM, "Vista");
    firefox2.put(VERSION, "3.6");

    exotic.put("numberOfHead", 2);
  }

  @Test
  public void smokeTest() {
    Assert.assertTrue(helper.matches(tl, tl));
    Assert.assertFalse(helper.matches(tl, tl2));
    Assert.assertTrue(helper.matches(tl2, tl));
    Assert.assertTrue(helper.matches(tl2, tl2));

    Assert.assertTrue(helper.matches(firefox, firefox));
    Assert.assertFalse(helper.matches(firefox, firefox2));
    Assert.assertFalse(helper.matches(firefox2, firefox));
    Assert.assertFalse(helper.matches(firefox, firefox2));

    Assert.assertFalse(helper.matches(tl, null));
    Assert.assertFalse(helper.matches(null, null));
    Assert.assertFalse(helper.matches(tl, firefox));
    Assert.assertFalse(helper.matches(firefox, tl2));
  }

  @Test
  public void platformMatchingTest() {
    DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();
    Platform p = Platform.WINDOWS;

    Assert.assertTrue(matcher.extractPlatform("WINDOWS") == p);
    Assert.assertTrue(matcher.extractPlatform("xp").is(p));
    Assert.assertTrue(matcher.extractPlatform("windows VISTA").is(p));
    Assert.assertTrue(matcher.extractPlatform("windows 7").is(p));
  }


  @Test
  public void nullEmptyValues() {
    DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();

    Map<String, Object> requested = new HashMap<String, Object>();
    requested.put(CapabilityType.BROWSER_NAME, "firefox");
    requested.put(CapabilityType.PLATFORM, null);
    requested.put(CapabilityType.VERSION, "");

    Map<String, Object> node = new HashMap<String, Object>();
    node.put(CapabilityType.BROWSER_NAME, "firefox");
    node.put(CapabilityType.PLATFORM, Platform.LINUX);
    node.put(CapabilityType.VERSION, "3.6");

    Assert.assertTrue(matcher.matches(node, requested));


  }


}
