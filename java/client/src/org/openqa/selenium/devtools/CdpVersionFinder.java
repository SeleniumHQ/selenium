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

package org.openqa.selenium.devtools;

import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.internal.Require;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

public class CdpVersionFinder {
  private static final Logger LOG = Logger.getLogger(CdpVersionFinder.class.getName());
  private final int fudgeFactor;
  private final Set<CdpInfo> infos;
  private static final Pattern MAJOR_VERSION_EXTRACTOR = Pattern.compile(".*/(\\d+)\\..*");
  private static final Pattern BROWSER_NAME_VERSION = Pattern.compile("(\\d+)\\..*");

  public CdpVersionFinder() {
    this(
      5,
      StreamSupport.stream(ServiceLoader.load(CdpInfo.class).spliterator(), false).collect(Collectors.toSet()));
  }

  public CdpVersionFinder(int versionFudgeFactor, Collection<CdpInfo> infos) {
    this.fudgeFactor = Require.nonNegative("Version fudge factor", versionFudgeFactor);

    Require.nonNull("CDP versions", infos);

    this.infos = ImmutableSet.copyOf(infos);
  }

  /**
   * Take the output of `/json/version` from a CDP-enabled tool and uses
   * that information to find a match.
   */
  public Optional<CdpInfo> match(Map<String, Object> versionJson) {
    /* The json may look like:
      {
        "Browser": "Chrome/85.0.4183.69",
        "Protocol-Version": "1.3",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.69 Safari/537.36",
        "V8-Version": "8.5.210.19",
        "WebKit-Version": "537.36 (@4554ea1a1171bd8d06951a4b7d9336afe6c59967)",
        "webSocketDebuggerUrl": "ws://localhost:9222/devtools/browser/c0ef43a1-7bb0-48e3-9cec-d6bb048cb720"
      }

      {
        "Browser": "Edg/84.0.522.59",
        "Protocol-Version": "1.3",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59",
        "V8-Version": "8.4.371.23",
        "WebKit-Version": "537.36 (@52ea6e40afcc988eef78d29d50f9077893fa1a12)",
        "webSocketDebuggerUrl": "ws://localhost:9222/devtools/browser/c7922624-12e8-4301-8b08-fa446944c5cc"
      }
     */
    Require.nonNull("JSON", versionJson);

    // We are assured by MS and Google that the `Browser` major version
    // should match the version of chromium used, so let's grab that.

    Object rawBrowser = versionJson.get("Browser");
    if (!(rawBrowser instanceof String)) {
      return Optional.empty();
    }

    Matcher matcher = MAJOR_VERSION_EXTRACTOR.matcher(rawBrowser.toString());
    return fromMatcher(matcher);
  }

  /**
   * Takes a `browserVersion` from a {@link org.openqa.selenium.Capabilities}
   * instance and returns the matching CDP version.
   */
  public Optional<CdpInfo> match(String browserVersion) {
    Require.nonNull("Browser version", browserVersion);

    Matcher matcher = BROWSER_NAME_VERSION.matcher(browserVersion);
    return fromMatcher(matcher);
  }

  private Optional<CdpInfo> fromMatcher(Matcher matcher) {
    if (matcher.matches()) {
      String major = matcher.group(1);
      try {
        int version = Integer.parseInt(major);

        return findNearestMatch(version);
      } catch (NumberFormatException e) {
        return Optional.empty();
      }
    }

    return Optional.empty();
  }

  private Optional<CdpInfo> findNearestMatch(int version) {
    CdpInfo nearestMatch = null;

    for (CdpInfo info : infos) {
      if (info.getMajorVersion() == version) {
        LOG.info(String.format("Found exact CDP implementation for version %d", version));
        return Optional.of(info);
      }

      // Never return a higher version
      if (info.getMajorVersion() > version) {
        continue;
      }

      if (version - info.getMajorVersion() < fudgeFactor) {
        if (nearestMatch == null || info.getMajorVersion() > nearestMatch.getMajorVersion()) {
          nearestMatch = info;
        }
      }
    }

    LOG.warning(String.format(
      "Unable to find an exact match for CDP version %d, so returning the closest version found: %s",
      version,
      nearestMatch == null ? "a no-op implementation" : nearestMatch.getMajorVersion()));

    if (nearestMatch == null) {
      LOG.info(String.format("Unable to find CDP implementation matching %d.", version));
    } else {
      LOG.info(String.format("Found CDP implementation for version %d of %d", version, nearestMatch.getMajorVersion()));
    }

    return Optional.ofNullable(nearestMatch);
  }
}
