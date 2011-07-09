package org.openqa.grid.internal.utils;

import static org.openqa.grid.common.RegistrationRequest.BROWSER;
import static org.openqa.grid.common.RegistrationRequest.PLATFORM;
import static org.openqa.grid.common.RegistrationRequest.VERSION;

import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.selenium.Platform;


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

    Assert.assertTrue(matcher.exctractPlatform("xp").is(p));
    Assert.assertTrue(matcher.exctractPlatform("windows VISTA").is(p));
    Assert.assertTrue(matcher.exctractPlatform("windows 7").is(p));
  }


  @Test
  public void nullEmptyValues() {
    DefaultCapabilityMatcher matcher = new DefaultCapabilityMatcher();

    Map<String, Object> requested = new HashMap<String, Object>();
    requested.put("browserName", "firefox");
    requested.put("platform", null);
    requested.put("version", "");

    Map<String, Object> node = new HashMap<String, Object>();
    node.put("browserName", "firefox");
    node.put("platform", Platform.LINUX);
    node.put("version", "3.6");

    Assert.assertTrue(matcher.matches(node, requested));


  }


}
