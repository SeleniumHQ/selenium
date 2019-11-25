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

import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_JAVASCRIPT;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Strings;
import com.google.common.collect.Ordering;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;

import java.util.Arrays;
import java.util.Collection;
import java.util.Comparator;

/**
 * Compares two sets of {@link Capabilities} against a desired standard. Capabilities are compared
 * by...
 * <ol>
 *   <li>{@link Capabilities#getBrowserName() browser name},
 *   <li>{@link Capabilities#getVersion() browser version},
 *   <li>{@link Capabilities#is(String)} whether JavaScript is enabled},
 *   <li>and {@link Capabilities#getPlatform() platform}
 * </ol>
 * For all comparisons, if the capability is missing, that particular criteria shall not factor
 * into the comparison.
 *
 * <p>When comparing platforms, preference will be given to an exact platform match over a fuzzy
 * match (e.g. Platform.WINDOWS will match Platform.WINDOWS before it matches Platform.XP).
 * Furthermore, configurations matching the current system's platform will be given preference.
 * For example, when {@code Platform.getCurrent() == Platform.WINDOWS}, a set of Capabilities
 * with {@code Platform.WINDOWS} will score higher than one with {@code Platform.ANY}.
 */
class CapabilitiesComparator implements Comparator<Capabilities> {

  private final Comparator<Capabilities> compareWith;

  public CapabilitiesComparator(final Capabilities desiredCapabilities,
                                final Platform currentPlatform) {
    final CapabilityScorer<String> browserNameScorer =
        new CapabilityScorer<>(desiredCapabilities.getBrowserName());
    Comparator<Capabilities> byBrowserName =
        Comparator.comparingInt(c -> browserNameScorer.score(c.getBrowserName()));

    final CapabilityScorer<String> versionScorer =
        new VersionScorer(desiredCapabilities.getVersion());
    Comparator<Capabilities> byVersion =
        Comparator.comparingInt(c -> versionScorer.score(c.getVersion()));

    final CapabilityScorer<Boolean> jsScorer =
        new CapabilityScorer<>(desiredCapabilities.is(SUPPORTS_JAVASCRIPT));
    Comparator<Capabilities> byJavaScript =
        Comparator.comparingInt(c -> jsScorer.score(c.is(SUPPORTS_JAVASCRIPT)));

    Platform desiredPlatform = desiredCapabilities.getPlatform();
    if (desiredPlatform == null) {
      desiredPlatform = Platform.ANY;
    }

    final CapabilityScorer<Platform> currentPlatformScorer =
        new CurrentPlatformScorer(currentPlatform, desiredPlatform);
    Comparator<Capabilities> byCurrentPlatform =
        Comparator.comparingInt(c -> currentPlatformScorer.score(c.getPlatform()));

    final CapabilityScorer<Platform> strictPlatformScorer =
        new CapabilityScorer<>(desiredPlatform);
    Comparator<Capabilities> byStrictPlatform =
        Comparator.comparingInt(c -> strictPlatformScorer.score(c.getPlatform()));

    final CapabilityScorer<Platform> fuzzyPlatformScorer =
        new FuzzyPlatformScorer(desiredPlatform);
    Comparator<Capabilities> byFuzzyPlatform =
        Comparator.comparingInt(c -> fuzzyPlatformScorer.score(c.getPlatform()));

    compareWith = Ordering.compound(Arrays.asList(
        byBrowserName,
        byVersion,
        byJavaScript,
        byCurrentPlatform,
        byStrictPlatform,
        byFuzzyPlatform));
  }

  public static <T extends Capabilities> T getBestMatch(
      Capabilities against, Collection<T> toCompare) {
    return getBestMatch(against, toCompare, Platform.getCurrent());
  }

  @VisibleForTesting
  static <T extends Capabilities> T getBestMatch(
      Capabilities against, Collection<T> toCompare, Platform currentPlatform) {
    return Ordering.from(new CapabilitiesComparator(against, currentPlatform)).max(toCompare);
  }

  @Override
  public int compare(final Capabilities a, final Capabilities b) {
    return compareWith.compare(a, b);
  }

  private static boolean isNullOrAny(Platform platform) {
    return null == platform || Platform.ANY == platform;
  }

  private static class CapabilityScorer<T> {
    final T scoreAgainst;

    public CapabilityScorer(T scoreAgainst) {
      this.scoreAgainst = scoreAgainst;
    }

    public int score(T value) {
      if (value == null || scoreAgainst == null) {
        return 0;
      } else if (value.equals(scoreAgainst)) {
        return 1;
      }
      return -1;
    }
  }

  private static class CurrentPlatformScorer extends CapabilityScorer<Platform> {

    private final boolean currentIsDesired;

    private CurrentPlatformScorer(Platform currentPlatform, Platform desiredPlatform) {
      super(currentPlatform);
      currentIsDesired = !isNullOrAny(currentPlatform)
          && (currentPlatform.is(desiredPlatform) || desiredPlatform.is(currentPlatform));
    }

    @Override
    public int score(Platform value) {
      if (!currentIsDesired || isNullOrAny(value)) {
        return 0;
      }

      return scoreAgainst.is(value) || value.is(scoreAgainst) ? 1 : -1;
    }
  }

  private static class FuzzyPlatformScorer extends CapabilityScorer<Platform> {

    public FuzzyPlatformScorer(Platform scoreAgainst) {
      super(scoreAgainst);
    }

    @Override
    public int score(Platform value) {
      if (isNullOrAny(value)) {
        return 0;
      }

      return value.is(scoreAgainst) || scoreAgainst.is(value) ? 1 : -1;
    }
  }

  private static class VersionScorer extends CapabilityScorer<String> {

    public VersionScorer(String against) {
      super(Strings.nullToEmpty(against).trim());
    }

    @Override
    public int score(String other) {
      other = Strings.nullToEmpty(other).trim();
      if (other.isEmpty() || scoreAgainst.isEmpty()) {
        return 0;
      } else if (other.equals(scoreAgainst)) {
        return 1;
      }
      return -1;
    }
  }
}
