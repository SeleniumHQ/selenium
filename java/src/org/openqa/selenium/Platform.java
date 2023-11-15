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

package org.openqa.selenium;

import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Represents the known and supported Platforms that WebDriver runs on. This is pretty close to the
 * Operating System, but differs slightly, because this class is used to extract information such as
 * program locations and line endings.
 */
// Useful URLs:
// http://hg.openjdk.java.net/jdk7/modules/jdk/file/a37326fa7f95/src/windows/native/java/lang/java_props_md.c
public enum Platform {

  /** Never returned, but can be used to request a browser running on any version of Windows. */
  WINDOWS("") {
    @Override
    public Platform family() {
      return null;
    }

    @Override
    public String toString() {
      return "windows";
    }
  },

  /**
   * For versions of Windows that "feel like" Windows XP. These are ones that store files in
   * "\Program Files\" and documents under "\\documents and settings\\username"
   */
  XP("Windows Server 2003", "xp", "windows", "winnt", "windows_nt", "windows nt") {
    @Override
    public Platform family() {
      return WINDOWS;
    }

    @Override
    public String toString() {
      return "Windows XP";
    }
  },

  /** For versions of Windows that "feel like" Windows Vista. */
  VISTA("windows vista", "Windows Server 2008") {
    @Override
    public Platform family() {
      return WINDOWS;
    }

    @Override
    public String toString() {
      return "Windows Vista";
    }
  },

  WIN7("windows 7", "win7") {
    @Override
    public Platform family() {
      return WINDOWS;
    }

    @Override
    public String toString() {
      return "Windows 7";
    }
  },

  /** For versions of Windows that "feel like" Windows 8. */
  WIN8("Windows Server 2012", "windows 8", "win8") {
    @Override
    public Platform family() {
      return WINDOWS;
    }

    @Override
    public String toString() {
      return "Windows 8";
    }
  },

  WIN8_1("windows 8.1", "win8.1") {
    @Override
    public Platform family() {
      return WINDOWS;
    }

    @Override
    public String toString() {
      return "Windows 8.1";
    }
  },

  WIN10("windows 10", "win10") {
    @Override
    public Platform family() {
      return WINDOWS;
    }

    @Override
    public String toString() {
      return "Windows 10";
    }
  },

  WIN11("windows 11", "win11") {
    @Override
    public Platform family() {
      return WINDOWS;
    }

    @Override
    public String toString() {
      return "Windows 11";
    }
  },

  MAC("mac", "darwin", "macOS", "mac os x", "os x") {
    @Override
    public Platform family() {
      return null;
    }

    @Override
    public String toString() {
      return "mac";
    }
  },

  SNOW_LEOPARD("snow leopard", "os x 10.6", "macos 10.6") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "OS X 10.6";
    }
  },

  MOUNTAIN_LION("mountain lion", "os x 10.8", "macos 10.8") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "OS X 10.8";
    }
  },

  MAVERICKS("mavericks", "os x 10.9", "macos 10.9") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "OS X 10.9";
    }
  },

  YOSEMITE("yosemite", "os x 10.10", "macos 10.10") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "OS X 10.10";
    }
  },

  EL_CAPITAN("el capitan", "os x 10.11", "macos 10.11") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "OS X 10.11";
    }
  },

  SIERRA("sierra", "os x 10.12", "macos 10.12") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "macOS 10.12";
    }
  },

  HIGH_SIERRA("high sierra", "os x 10.13", "macos 10.13") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "macOS 10.13";
    }
  },

  MOJAVE("mojave", "os x 10.14", "macos 10.14") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "macOS 10.14";
    }
  },

  CATALINA("catalina", "os x 10.15", "macos 10.15") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "macOS 10.15";
    }
  },

  BIG_SUR("big sur", "os x 11.0", "macos 11.0") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "macOS 11.0";
    }
  },

  MONTEREY("monterey", "os x 12.0", "macos 12.0") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "macOS 12.0";
    }
  },

  VENTURA("ventura", "os x 13.0", "macos 13.0") {
    @Override
    public Platform family() {
      return MAC;
    }

    @Override
    public String toString() {
      return "macOS 13.0";
    }
  },

  /** Many platforms have UNIX traits, amongst them LINUX, Solaris and BSD. */
  UNIX("solaris", "bsd") {
    @Override
    public Platform family() {
      return null;
    }
  },

  LINUX("linux") {
    @Override
    public Platform family() {
      return UNIX;
    }

    @Override
    public String toString() {
      return "linux";
    }
  },

  ANDROID("android", "dalvik") {
    @Override
    public Platform family() {
      return null;
    }
  },

  IOS("iOS") {
    @Override
    public Platform family() {
      return null;
    }
  },

  /** Never returned, but can be used to request a browser running on any operating system. */
  ANY("") {
    @Override
    public Platform family() {
      return ANY;
    }

    @Override
    public boolean is(Platform compareWith) {
      return this == compareWith;
    }

    @Override
    public String toString() {
      return "any";
    }
  };

  private static Platform current;
  private final String[] partOfOsName;
  private int minorVersion = 0;
  private int majorVersion = 0;

  Platform(String... partOfOsName) {
    this.partOfOsName = partOfOsName;
  }

  /**
   * Get current platform (not necessarily the same as operating system).
   *
   * @return current platform
   */
  public static Platform getCurrent() {
    if (current == null) {
      current = extractFromSysProperty(System.getProperty("os.name"));

      String version = System.getProperty("os.version", "0.0.0");
      int major = 0;
      int min = 0;

      Pattern pattern = Pattern.compile("^(\\d+)\\.(\\d+).*");
      Matcher matcher = pattern.matcher(version);
      if (matcher.matches()) {
        try {
          major = Integer.parseInt(matcher.group(1));
          min = Integer.parseInt(matcher.group(2));
        } catch (NumberFormatException e) {
          // These things happen
        }
      }

      current.majorVersion = major;
      current.minorVersion = min;
    }
    return current;
  }

  /**
   * Extracts platforms based on system properties in Java and uses a heuristic to determine the
   * most likely operating system. If unable to determine the operating system, it will default to
   * UNIX.
   *
   * @param osName the operating system name to determine the platform of
   * @return the most likely platform based on given operating system name
   */
  public static Platform extractFromSysProperty(String osName) {
    return extractFromSysProperty(osName, System.getProperty("os.version"));
  }

  /**
   * Extracts platforms based on system properties in Java and uses a heuristic to determine the
   * most likely operating system. If unable to determine the operating system, it will default to
   * UNIX.
   *
   * @param osName the operating system name to determine the platform of
   * @param osVersion the operating system version to determine the platform of
   * @return the most likely platform based on given operating system name and version
   */
  public static Platform extractFromSysProperty(String osName, String osVersion) {
    osName = osName.toLowerCase();
    // os.name for android is linux
    if ("dalvik".equalsIgnoreCase(System.getProperty("java.vm.name"))) {
      return Platform.ANDROID;
    }
    // Windows 8 can't be detected by osName alone
    if (osVersion.equals("6.2") && osName.startsWith("windows nt")) {
      return WIN8;
    }
    // Windows 8 can't be detected by osName alone
    if (osVersion.equals("6.3") && osName.startsWith("windows nt")) {
      return WIN8_1;
    }
    Platform mostLikely = UNIX;
    String previousMatch = null;
    for (Platform os : Platform.values()) {
      for (String matcher : os.partOfOsName) {
        if ("".equals(matcher)) {
          continue;
        }
        matcher = matcher.toLowerCase();
        if (os.isExactMatch(osName, matcher)) {
          return os;
        }
        if (os.isCurrentPlatform(osName, matcher) && isBetterMatch(previousMatch, matcher)) {
          previousMatch = matcher;
          mostLikely = os;
        }
      }
    }

    // Default to assuming we're on a UNIX variant (including LINUX)
    return mostLikely;
  }

  /**
   * Gets a platform with the name matching the parameter.
   *
   * @param name the platform name
   * @return the Platform enum value matching the parameter
   */
  public static Platform fromString(String name) {
    for (Platform platform : values()) {
      if (platform.toString().equalsIgnoreCase(name)) {
        return platform;
      }
    }

    for (Platform os : Platform.values()) {
      for (String matcher : os.partOfOsName) {
        if (name.equalsIgnoreCase(matcher)) {
          return os;
        }
      }
    }
    throw new WebDriverException("Unrecognized platform: " + name);
  }

  /**
   * Decides whether the previous match is better or not than the current match. If previous match
   * is null, the newer match is always better.
   *
   * @param previous the previous match
   * @param matcher the newer match
   * @return true if newer match is better, false otherwise
   */
  private static boolean isBetterMatch(String previous, String matcher) {
    return previous == null || matcher.length() >= previous.length();
  }

  public String[] getPartOfOsName() {
    return Arrays.copyOf(partOfOsName, partOfOsName.length);
  }

  /**
   * Heuristic for comparing two platforms. If platforms (which is not the same thing as operating
   * systems) are found to be approximately similar in nature, this will return true. For instance
   * the LINUX platform is similar to UNIX, and will give a positive result if compared.
   *
   * @param compareWith the platform to compare with
   * @return true if platforms are approximately similar, false otherwise
   */
  public boolean is(Platform compareWith) {
    return
    // Any platform is itself
    this == compareWith
        ||
        // Any platform is also ANY platform
        compareWith == ANY
        ||
        // And any Platform which is not a platform type belongs to the same family
        (this.family() != null && this.family().is(compareWith));
  }

  /**
   * Returns a platform that represents a family for the current platform. For instance the LINUX if
   * a part of the UNIX family, the XP is a part of the WINDOWS family.
   *
   * @return the family platform for the current one, or {@code null} if this {@code Platform}
   *     represents a platform family (such as Windows, or MacOS)
   */
  public abstract Platform family();

  private boolean isCurrentPlatform(String osName, String matchAgainst) {
    return osName.contains(matchAgainst);
  }

  private boolean isExactMatch(String osName, String matchAgainst) {
    return matchAgainst.equals(osName);
  }

  /**
   * Returns the major version of this platform.
   *
   * @return the major version of specified platform
   */
  public int getMajorVersion() {
    return majorVersion;
  }

  /**
   * Returns the minor version of this platform.
   *
   * @return the minor version of specified platform
   */
  public int getMinorVersion() {
    return minorVersion;
  }
}
