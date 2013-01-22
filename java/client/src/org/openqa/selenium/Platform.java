/*
Copyright 2007-2011 Selenium committers
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

package org.openqa.selenium;

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

  /**
   * Never returned, but can be used to request a browser running on any version of Windows.
   */
  WINDOWS("") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == XP
          || compareWith == VISTA || compareWith == WIN8;
    }
  },

  /**
   * For versions of Windows that "feel like" Windows XP. These are ones that store files in
   * "\Program Files\" and documents under "\\documents and settings\\username"
   */
  XP("Windows Server 2003", "xp", "windows", "winnt") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == XP;
    }
  },

  /**
   * For versions of Windows that "feel like" Windows Vista.
   */
  VISTA("windows vista", "Windows Server 2008", "windows 7", "win7") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == VISTA;
    }
  },

  /**
   * For versions of Windows that "feel like" Windows 8.
   */
  WIN8("Windows Server 2012", "windows 8", "win8") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == WIN8;
    }
  },

  MAC("mac", "darwin") {},

  /**
   * Many platforms have UNIX traits, amongst them LINUX, Solaris and BSD.
   */
  UNIX("solaris", "bsd") {},

  LINUX("linux") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == UNIX || compareWith == LINUX;
    }
  },

  ANDROID("android", "dalvik") {
    public String getLineEnding() {
      return "\n";
    }

    @Override
    public boolean is(Platform compareWith) {
      return compareWith == LINUX || compareWith == ANDROID;
    }
  },

  /**
   * Never returned, but can be used to request a browser running on any operating system.
   */
  ANY("") {
    @Override
    public boolean is(Platform compareWith) {
      return true;
    }
  };

  private final String[] partOfOsName;
  private final int minorVersion;
  private final int majorVersion;

  private Platform(String... partOfOsName) {
    this.partOfOsName = partOfOsName;

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

    majorVersion = major;
    minorVersion = min;
  }

  public String[] getPartOfOsName() {
    return partOfOsName;
  }

  /**
   * Get current platform (not necessarily the same as operating system).
   *
   * @return current platform
   */
  public static Platform getCurrent() {
    return extractFromSysProperty(System.getProperty("os.name"));
  }

  /**
   * Extracts platforms based on system properties in Java and uses a heuristic to determine the
   * most likely operating system.  If unable to determine the operating system, it will default to
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
   * most likely operating system.  If unable to determine the operating system, it will default to
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
   * Decides whether the previous match is better or not than the current match.  If previous match
   * is null, the newer match is always better.
   *
   * @param previous the previous match
   * @param matcher the newer match
   * @return true if newer match is better, false otherwise
   */
  private static boolean isBetterMatch(String previous, String matcher) {
    return previous == null || matcher.length() >= previous.length();
  }

  /**
   * Heuristic for comparing two platforms.  If platforms (which is not the same thing as operating
   * systems) are found to be approximately similar in nature, this will return true.  For instance
   * the LINUX platform is similar to UNIX, and will give a positive result if compared.
   *
   * @param compareWith the platform to compare with
   * @return true if platforms are approximately similar, false otherwise
   */
  public boolean is(Platform compareWith) {
    return this.equals(compareWith);
  }

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
