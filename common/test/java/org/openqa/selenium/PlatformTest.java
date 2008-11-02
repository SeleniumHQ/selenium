package org.openqa.selenium;

import junit.framework.TestCase;

public class PlatformTest extends TestCase {
  public void testShouldIdentifyWindowsVariants() {
    assertAllAre(Platform.WINDOWS, "Windows 2003");
  }

  public void testShouldIdentifyMacVariants() {
    assertAllAre(Platform.MAC, "Darwin", "Mac OS X");
  }

  private void assertAllAre(Platform platform, String... osNames) {
    for (String osName : osNames) {
      Platform seen = Platform.extractFromSysProperty(osName);
      assertTrue(String.format("Expected %s, but got %s from %s", platform, seen, osName),
          seen.is(platform));
    }
  }
}
