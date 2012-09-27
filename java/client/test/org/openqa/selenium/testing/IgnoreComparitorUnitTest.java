/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.testing;

import com.google.common.collect.Sets;

import org.jmock.Expectations;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Platform;
import org.openqa.selenium.testing.Ignore.Driver;

import java.util.Set;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.IE;

public class IgnoreComparitorUnitTest extends MockTestBase {
  private static final Platform CURRENT_PLATFORM = Platform.MAC;
  private static final Platform OTHER_PLATFORM = Platform.WINDOWS;

  private static final Set<Platform> CURRENT_PLATFORM_SET = Sets.newHashSet(CURRENT_PLATFORM);
  private static final Set<Platform> OTHER_PLATFORM_SET = Sets.newHashSet(OTHER_PLATFORM);

  IgnoreComparator ignoreComparator = new IgnoreComparator();
  
  @Before
  public void setupComparator() {
    ignoreComparator.setCurrentPlatform(CURRENT_PLATFORM);
  }

  @Test
  public void shouldNotIgnoreIfNothingBeingIgnored() {
    assertFalse(new IgnoreComparator().shouldIgnore(null));
  }

  @Test
  public void shouldIgnoreOnlyDriverBeingIgnored() {
    ignoreComparator.addDriver(ANDROID);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET)));
  }

  @Test
  public void shouldIgnoreDriverAll() {
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(Ignore.Driver.ALL),
      CURRENT_PLATFORM_SET)));
  }

  @Test
  public void shouldNotIgnoreOtherPlatform() {
    ignoreComparator.addDriver(ANDROID);
    assertFalse(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      OTHER_PLATFORM_SET)));
  }

  @Test
  public void shouldNotIgnoreOtherBrowser() {
    ignoreComparator.addDriver(ANDROID);
    assertFalse(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(IE),
      CURRENT_PLATFORM_SET)));
  }

  @Test
  public void shouldIgnoreEnabledNativeEventsIfIgnoringEnabled() {
    ignoreComparator.addDriver(ANDROID);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET)));
  }

  @Test
  public void shouldIgnoreDisabledNativeEventsIfIgnoringDisabled() {
    ignoreComparator.addDriver(ANDROID);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET)));
  }

  @Test
  public void shouldIgnoreEnabledNativeEventsIfIgnoringAll() {
    ignoreComparator.addDriver(ANDROID);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET)));
  }

  @Test
  public void shouldIgnoreDisabledNativeEventsIfIgnoringAll() {
    ignoreComparator.addDriver(ANDROID);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET)));
  }

  private Ignore ignoreForDriver(final Set<Driver> drivers,
                                 final Set<Platform> platforms) {
    final Ignore ignore = mock(Ignore.class);
    
    checking(new Expectations() {{
      allowing(ignore).value() ; will(returnValue(drivers.toArray(new Driver[drivers.size()])));
      allowing(ignore).platforms() ; will(returnValue(platforms.toArray(new Platform[platforms.size()])));
    }});
    
    return ignore;
  }
}
