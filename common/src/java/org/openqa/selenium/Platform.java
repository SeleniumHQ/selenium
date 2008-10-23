package org.openqa.selenium;

public enum Platform {
  WINDOWS("") {
    @Override
    public String getLineEnding() {
      return "\r\n";
    }

    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == XP || compareWith == VISTA;
    }
  },
  XP("xp") {
    public String getLineEnding() {
      return "\r\n";
    }

    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == XP;
    }
  },
  VISTA("vista") {
    public String getLineEnding() {
      return "\r\n";
    }

    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == VISTA;
    }
  },
  MAC("mac", "darwin") {
    public String getLineEnding() {
      return "\r";
    }
  },
  UNIX("linux", "solaris", "bsd") {
    public String getLineEnding() {
      return "\n";
    }
  },
  ANY("") {
    public String getLineEnding() {
      throw new UnsupportedOperationException("getLineEnding");
    }
  };

  private static Platform currentOs;
  private final String[] partOfOsName;

  private Platform(String... partOfOsName) {
    this.partOfOsName = partOfOsName;
  }

  public static Platform getCurrent() {
    if (currentOs != null) {
      return currentOs;
    }

    Platform mostLikely = UNIX;
    String previousMatch = null;
    for (Platform os : Platform.values()) {
      for (String matcher : os.partOfOsName) {
        if ("".equals(matcher))
          continue;

        if (os.isExactMatch(matcher)) {
          System.out.println("Exect match: " + matcher);
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

  public boolean is(Platform compareWith) {
    return this.equals(compareWith);
  }

  public abstract String getLineEnding();

  private boolean isCurrentPlatform(String matchAgainst) {
    String osName = System.getProperty("os.name").toLowerCase();
    return osName.indexOf(matchAgainst) != -1;
  }

  private boolean isExactMatch(String matchAgainst) {
    String osName = System.getProperty("os.name").toLowerCase();
    return matchAgainst.equals(osName);
  }

}
