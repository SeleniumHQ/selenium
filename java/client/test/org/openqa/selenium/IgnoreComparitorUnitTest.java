package org.openqa.selenium;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.IE;

import java.util.HashSet;
import java.util.Set;

import org.jmock.Expectations;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Ignore.Driver;

import com.google.common.collect.Sets;

public class IgnoreComparitorUnitTest extends MockTestBase {
  private static final Platform CURRENT_PLATFORM = Platform.MAC;
  private static final Platform OTHER_PLATFORM = Platform.WINDOWS;

  private static final HashSet<Platform> CURRENT_PLATFORM_SET = Sets.<Platform>newHashSet(CURRENT_PLATFORM);
  private static final HashSet<Platform> OTHER_PLATFORM_SET = Sets.<Platform>newHashSet(OTHER_PLATFORM);

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
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.ALL)));
  }

  @Test
  public void shouldIgnoreDriverAll() {
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(Ignore.Driver.ALL),
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.ALL)));
  }

  @Test
  public void shouldNotIgnoreOtherPlatform() {
    ignoreComparator.addDriver(ANDROID);
    assertFalse(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      OTHER_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.ALL)));
  }

  @Test
  public void shouldNotIgnoreOtherBrowser() {
    ignoreComparator.addDriver(ANDROID);
    assertFalse(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(IE),
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.ALL)));
  }

  @Test
  public void shouldIgnoreEnabledNativeEventsIfIgnoringEnabled() {
    ignoreComparator.addDriver(ANDROID);
    ignoreComparator.setNativeEventsIgnoreState(Ignore.NativeEventsEnabledState.ENABLED);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.ENABLED)));
  }

  @Test
  public void shouldIgnoreDisabledNativeEventsIfIgnoringDisabled() {
    ignoreComparator.addDriver(ANDROID);
    ignoreComparator.setNativeEventsIgnoreState(Ignore.NativeEventsEnabledState.DISABLED);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.DISABLED)));
  }

  @Test
  public void shouldIgnoreEnabledNativeEventsIfIgnoringAll() {
    ignoreComparator.addDriver(ANDROID);
    ignoreComparator.setNativeEventsIgnoreState(Ignore.NativeEventsEnabledState.ALL);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.ENABLED)));
  }

  @Test
  public void shouldIgnoreDisabledNativeEventsIfIgnoringAll() {
    ignoreComparator.addDriver(ANDROID);
    ignoreComparator.setNativeEventsIgnoreState(Ignore.NativeEventsEnabledState.ALL);
    assertTrue(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.DISABLED)));
  }

  @Test
  public void shouldNotIgnoreEnabledNativeEventsIfIgnoringDisabled() {
    ignoreComparator.addDriver(ANDROID);
    ignoreComparator.setNativeEventsIgnoreState(Ignore.NativeEventsEnabledState.DISABLED);
    assertFalse(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.ENABLED)));
  }

  @Test
  public void shouldNotIgnoreDisabledNativeEventsIfIgnoringEnabled() {
    ignoreComparator.addDriver(ANDROID);
    ignoreComparator.setNativeEventsIgnoreState(Ignore.NativeEventsEnabledState.ENABLED);
    assertFalse(ignoreComparator.shouldIgnore(ignoreForDriver(
      Sets.newHashSet(ANDROID),
      CURRENT_PLATFORM_SET,
      Ignore.NativeEventsEnabledState.DISABLED)));
  }

  private Ignore ignoreForDriver(final Set<Driver> drivers,
                                 final Set<Platform> platforms,
                                 final Ignore.NativeEventsEnabledState nativeEvents) {
    final Ignore ignore = mock(Ignore.class);
    
    checking(new Expectations() {{
      allowing(ignore).value() ; will(returnValue(drivers.toArray(new Driver[drivers.size()])));
      allowing(ignore).platforms() ; will(returnValue(platforms.toArray(new Platform[platforms.size()])));
      allowing(ignore).nativeEvents() ; will(returnValue(nativeEvents));
    }});
    
    return ignore;
  };
}
