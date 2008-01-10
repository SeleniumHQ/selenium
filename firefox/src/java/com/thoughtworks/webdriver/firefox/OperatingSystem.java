// Copyright 2008 Google Inc. All Rights Reserved.

package com.thoughtworks.webdriver.firefox;

/**
 * @author simonstewart@google.com (Simon Stewart)
 */
public enum OperatingSystem {
  WINDOWS("win"),
  MAC("mac"),
  UNIX("x");

  private final String partOfOsName;

  private OperatingSystem(String partOfOsName) {
    this.partOfOsName = partOfOsName;
  }


  public static OperatingSystem getCurrentPlatform() {
    for (OperatingSystem os : OperatingSystem.values()) {
      if (os.isCurrentPlatform()) {
        return os;
      }
    }
    
    // Default to assuming we're on a unix variant (including linux)
    return UNIX;
  }

  private boolean isCurrentPlatform() {
    String osName = System.getProperty("os.name").toLowerCase();
    return osName.indexOf(partOfOsName) != -1;
  }
}
