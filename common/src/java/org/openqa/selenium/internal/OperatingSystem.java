// Copyright 2008 Google Inc. All Rights Reserved.

package org.openqa.selenium.internal;

import org.openqa.selenium.Platform;

/**
 * @deprecated Use {#link Platform} instead
 */
@Deprecated
public enum OperatingSystem {
  WINDOWS("win") {
    @Override
    public String getLineEnding() {
      return "\r\n";
    }

    public Platform getPlatform() {
      return Platform.WINDOWS;
    }},
  MAC("mac", "darwin") {
    @Override
    public String getLineEnding() {
      return "\r";
    }

    public Platform getPlatform() {
      return Platform.MAC;
    }},
  UNIX("x") {
    @Override
    public String getLineEnding() {
      return "\n";
    }

    public Platform getPlatform() {
      return Platform.UNIX;
    }},
  ANY("") {
    @Override
    public String getLineEnding() {
      throw new UnsupportedOperationException("getLineEnding");
    }

    public Platform getPlatform() {
      return Platform.ANY;
    }};

  private static OperatingSystem currentOs;
  private final String[] partOfOsName;

  private OperatingSystem(String... partOfOsName) {
    this.partOfOsName = partOfOsName;
  }

  public static OperatingSystem getCurrentPlatform() {
    if (currentOs != null) {
      return currentOs;
    }

    OperatingSystem mostLikely = UNIX;
    String previousMatch = null;
    for (OperatingSystem os : OperatingSystem.values()) {
      for (String matcher : os.partOfOsName) {
        if ("".equals(matcher))
          continue;

        if (os.isExactMatch(matcher)) {
          currentOs = os;
          return os;
        }
        if (os.isCurrentPlatform(matcher) && isBetterMatch(previousMatch, matcher)) {
          previousMatch = matcher;
          mostLikely = os;
        }
      }
    }

    // Default to assuming we're on a unix variant (including linux)
    currentOs = mostLikely;
    return mostLikely;
  }

  private static boolean isBetterMatch(String previous, String matcher) {
    if (previous == null)
      return true;

    return matcher.length() >= previous.length();
  }

  public abstract String getLineEnding();

  public abstract Platform getPlatform();

  private boolean isCurrentPlatform(String matchAgainst) {
    String osName = System.getProperty("os.name").toLowerCase();
    return osName.indexOf(matchAgainst) != -1;
  }

  private boolean isExactMatch(String matchAgainst) {
    String osName = System.getProperty("os.name").toLowerCase();
    return matchAgainst.equals(osName);
  }

}
