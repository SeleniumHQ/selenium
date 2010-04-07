/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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
 * Represents the known and supported Platforms that WebDriver runs on.
 * This is pretty close to the Operating System, but differs slightly,
 * because this class is used to extract information such as program
 * locations and line endings.
 *
 */
// Useful URLs:
// http://hg.openjdk.java.net/jdk7/modules/jdk/file/a37326fa7f95/src/windows/native/java/lang/java_props_md.c
public enum Platform {
  /**
   * Never returned, but can be used to request a browser running on
   * any version of Windows.
   */
  WINDOWS("") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == XP || compareWith == VISTA;
    }
  },
  /**
   * For versions of Windows that "feel like" Windows XP. These are
   * ones that store files in "\Program Files\" and documents under
   * "\\documents and settings\\username"
   */
  XP("xp", "windows", "winnt") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == XP;
    }
  },
  /**
   * For versions of Windows that "feel like" Windows Vista.
   */
  VISTA("windows vista", "Windows Server 2008", "windows 7") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == VISTA;
    }
  },
  MAC("mac", "darwin") {},
  UNIX("solaris", "bsd") {},
  LINUX("linux") {
    @Override
    public boolean is(Platform compareWith) {
      return compareWith == UNIX || compareWith == LINUX;
    }
  },
  /**
   * Never returned, but can be used to request a browser running on
   * any operating system
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

  public static Platform getCurrent() {
    return extractFromSysProperty(System.getProperty("os.name"));
  }

  public static Platform extractFromSysProperty(String osName) {
    osName = osName.toLowerCase();
    Platform mostLikely = UNIX;
    String previousMatch = null;
    for (Platform os : Platform.values()) {
      for (String matcher : os.partOfOsName) {
        if ("".equals(matcher))
          continue;

        if (os.isExactMatch(osName, matcher)) {
          return os;
        }
        if (os.isCurrentPlatform(osName, matcher) && isBetterMatch(previousMatch, matcher)) {
          previousMatch = matcher;
          mostLikely = os;
        }
      }
    }

    // Default to assuming we're on a unix variant (including linux)
    return mostLikely;
  }

  private static boolean isBetterMatch(String previous, String matcher) {
    if (previous == null)
      return true;

    return matcher.length() >= previous.length();
  }

  public boolean is(Platform compareWith) {
    return this.equals(compareWith);
  }

  private boolean isCurrentPlatform(String osName, String matchAgainst) {
    return osName.indexOf(matchAgainst) != -1;
  }

  private boolean isExactMatch(String osName, String matchAgainst) {
    return matchAgainst.equals(osName);
  }

  public int getMajorVersion() {
    return majorVersion;
  }
  
  public int getMinorVersion() {
    return minorVersion;
  }
}
