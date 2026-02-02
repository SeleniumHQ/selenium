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

package org.openqa.selenium.testing;

import static java.util.Collections.singleton;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.testing.drivers.Browser.ALL;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.openqa.selenium.Platform;
import org.openqa.selenium.testing.drivers.Browser;

class IgnoreComparatorUnitTest {

  private static final Platform CURRENT_PLATFORM = Platform.MAC;
  private static final Platform OTHER_PLATFORM = Platform.WINDOWS;

  private static final Set<Platform> CURRENT_PLATFORM_SET = Collections.singleton(CURRENT_PLATFORM);
  private static final Set<Platform> OTHER_PLATFORM_SET = Collections.singleton(OTHER_PLATFORM);

  IgnoreComparator ignoreComparator = new IgnoreComparator();

  @Test
  void shouldNotIgnoreIfNothingBeingIgnored() {
    assertThat(new IgnoreComparator().shouldIgnore((Ignore) null)).isFalse();
    assertThat(new IgnoreComparator().shouldIgnore((IgnoreList) null)).isFalse();
  }

  @Test
  void shouldIgnoreOnlyDriverBeingIgnored() {
    ignoreComparator.addDriver(SAFARI);
    assertThat(
            ignoreComparator.shouldIgnore(ignoreForDriver(singleton(SAFARI), CURRENT_PLATFORM_SET)))
        .isTrue();
  }

  @Test
  void shouldIgnoreDriverAll() {
    assertThat(ignoreComparator.shouldIgnore(ignoreForDriver(singleton(ALL), CURRENT_PLATFORM_SET)))
        .isTrue();
  }

  @Test
  @Disabled
  public void shouldNotIgnoreOtherPlatform() {
    ignoreComparator.addDriver(SAFARI);
    assertThat(
            ignoreComparator.shouldIgnore(ignoreForDriver(singleton(SAFARI), OTHER_PLATFORM_SET)))
        .isFalse();
  }

  @Test
  void shouldNotIgnoreOtherBrowser() {
    ignoreComparator.addDriver(SAFARI);
    assertThat(ignoreComparator.shouldIgnore(ignoreForDriver(singleton(IE), CURRENT_PLATFORM_SET)))
        .isFalse();
  }

  @Test
  void shouldIgnoreEnabledNativeEventsIfIgnoringEnabled() {
    ignoreComparator.addDriver(SAFARI);
    assertThat(
            ignoreComparator.shouldIgnore(ignoreForDriver(singleton(SAFARI), CURRENT_PLATFORM_SET)))
        .isTrue();
  }

  @Test
  void shouldIgnoreDisabledNativeEventsIfIgnoringDisabled() {
    ignoreComparator.addDriver(SAFARI);
    assertThat(
            ignoreComparator.shouldIgnore(ignoreForDriver(singleton(SAFARI), CURRENT_PLATFORM_SET)))
        .isTrue();
  }

  @Test
  void shouldIgnoreEnabledNativeEventsIfIgnoringAll() {
    ignoreComparator.addDriver(SAFARI);
    assertThat(
            ignoreComparator.shouldIgnore(ignoreForDriver(singleton(SAFARI), CURRENT_PLATFORM_SET)))
        .isTrue();
  }

  @Test
  void shouldIgnoreDisabledNativeEventsIfIgnoringAll() {
    ignoreComparator.addDriver(SAFARI);
    assertThat(
            ignoreComparator.shouldIgnore(ignoreForDriver(singleton(SAFARI), CURRENT_PLATFORM_SET)))
        .isTrue();
  }

  private IgnoreList ignoreForDriver(final Set<Browser> drivers, final Set<Platform> platforms) {
    final IgnoreList ignore = mock(IgnoreList.class, Mockito.RETURNS_SMART_NULLS);
    final Ignore[] list =
        drivers.stream()
            .map(
                driver -> {
                  Ignore ig = mock(Ignore.class, Mockito.RETURNS_SMART_NULLS);
                  when(ig.value()).thenReturn(driver);
                  return ig;
                })
            .collect(Collectors.toList())
            .toArray(new Ignore[drivers.size()]);

    when(ignore.value()).thenReturn(list);
    // when(ignore.platforms()).thenReturn(platforms.toArray(new Platform[platforms.size()]));

    return ignore;
  }
}
