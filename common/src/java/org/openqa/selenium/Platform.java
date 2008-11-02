package org.openqa.selenium;

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
    public String getLineEnding() {
      return "\r\n";
    }

    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == XP || compareWith == VISTA;
    }
  },
  /**
   * For versions of Windows that "feel like" Windows XP. These are
   * ones that store files in "\Program Files\" and documents under
   * "\\documents and settings\\username"
   */
  XP("xp", "windows") {
    public String getLineEnding() {
      return "\r\n";
    }

    public boolean is(Platform compareWith) {
      return compareWith == WINDOWS || compareWith == XP;
    }
  },
  /**
   * For versions of Windows that "feel like" Windows Vista.
   */
  VISTA("windows vista", "Windows Server 2008") {
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
  /**
   * Never returned, but can be used to request a browser running on
   * any operating system
   */
  ANY("") {
    public String getLineEnding() {
      throw new UnsupportedOperationException("getLineEnding");
    }

    public boolean is(Platform compareWith) {
      return true;
    }
  };

  private final String[] partOfOsName;

  private Platform(String... partOfOsName) {
    this.partOfOsName = partOfOsName;
  }

  public static Platform getCurrent() {
    return extractFromSysProperty(System.getProperty("os.name"));

  }

  protected static Platform extractFromSysProperty(String osName) {
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

  public abstract String getLineEnding();

  private boolean isCurrentPlatform(String osName, String matchAgainst) {
    return osName.indexOf(matchAgainst) != -1;
  }

  private boolean isExactMatch(String osName, String matchAgainst) {
    return matchAgainst.equals(osName);
  }

}
